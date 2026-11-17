"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useMemo, useRef, useState } from "react";
import type { GearLibraryQuery, GearLendingQuery } from "@/graphql";
import {
  ClearGearLoanHistoryDocument,
  CreateGearLoanDocument,
  GearLibraryDocument,
  GearLendingDocument,
  MarkGearLoanReturnedDocument,
  MoveGearItemClassToFolderDocument,
  MoveGearItemToFolderDocument,
} from "@/graphql";
import { FolderFormModal } from "@/components/folders/folder-form-modal";
import { useFolderNavigation } from "@/components/folders/use-folder-navigation";
import { GearActiveLoans } from "@/components/gear/gear-active-loans";
import { GearClassFormModal } from "@/components/gear/gear-class-form-modal";
import { GearClassRow } from "@/components/gear/gear-class-row";
import { GearVariantDragPreview } from "@/components/gear/gear-variant-table";
import { GearItemFormModal } from "@/components/gear/gear-item-form-modal";
import { GearItemRow } from "@/components/gear/gear-item-row";
import { GearLendStaging, type GearLoanDraft } from "@/components/gear/gear-lend-staging";
import { GearLibrarySection } from "@/components/gear/gear-library-section";
import { GearDeleteModal, type GearDeleteTarget } from "@/components/gear/gear-delete-modal";
import { GearLoanHistory } from "@/components/gear/gear-loan-history";
import type { GearItem, GearItemClass, GearVariant, StagedGearEntry } from "@/components/gear/types";
import { ModulePageLayout } from "@/components/shell/module-page-layout";
import { GEAR_PAGE_REFETCH } from "@/lib/refetch-queries";
import { createLibraryCollisionDetection } from "@/lib/folder-dnd";
import { filterItemsForFolder } from "@/lib/folder-utils";
import {
  GEAR_LEND_ZONE,
  canLendGearCondition,
  parseGearDragId,
  parseFolderDropId,
} from "@life/shared";

type DragPreview =
  | { kind: "item"; item: GearItem }
  | { kind: "variant"; variant: GearVariant }
  | { kind: "class"; itemClass: GearItemClass };

const GEAR_MUTATION_OPTIONS = {
  refetchQueries: [...GEAR_PAGE_REFETCH],
  awaitRefetchQueries: true,
};

export function GearManagementPage() {
  const libraryZoneRef = useRef<HTMLElement>(null);
  const lendZoneRef = useRef<HTMLElement>(null);

  const [expandedClassIds, setExpandedClassIds] = useState<Set<string>>(() => new Set());
  const [staged, setStaged] = useState<StagedGearEntry[]>([]);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState<{ item: GearItem | null } | null>(null);
  const [classForm, setClassForm] = useState<{ itemClass: GearItemClass | null } | null>(null);
  const [addingVariantClassId, setAddingVariantClassId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GearDeleteTarget | null>(null);

  const {
    data: libraryData,
    loading: libraryLoading,
    error: libraryError,
  } = useQuery<GearLibraryQuery>(GearLibraryDocument);
  const {
    data: lendingData,
    loading: lendingLoading,
    error: lendingError,
  } = useQuery<GearLendingQuery>(GearLendingDocument);

  const [moveGearItemToFolder] = useMutation(MoveGearItemToFolderDocument, GEAR_MUTATION_OPTIONS);
  const [moveGearClassToFolder] = useMutation(MoveGearItemClassToFolderDocument, GEAR_MUTATION_OPTIONS);
  const [createGearLoan, { loading: creatingLoan }] = useMutation(CreateGearLoanDocument, GEAR_MUTATION_OPTIONS);
  const [markReturned] = useMutation(MarkGearLoanReturnedDocument, GEAR_MUTATION_OPTIONS);
  const [clearHistory, { loading: clearing }] = useMutation(ClearGearLoanHistoryDocument, GEAR_MUTATION_OPTIONS);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const collisionDetection = useMemo(
    () =>
      createLibraryCollisionDetection(
        "GEAR",
        () => libraryZoneRef.current?.getBoundingClientRect() ?? null,
        () => lendZoneRef.current?.getBoundingClientRect() ?? null,
        GEAR_LEND_ZONE,
      ),
    [],
  );

  const library = libraryData?.gearLibrary;
  const lendingInfo = lendingData?.gearLending;
  const { currentFolderId, setCurrentFolderId, breadcrumbPath, visibleFolders, handleFolderDeleted } =
    useFolderNavigation(library?.folders);

  const itemById = useMemo(
    () => new Map(library?.items.map((item) => [item.id, item]) ?? []),
    [library?.items],
  );

  const classById = useMemo(
    () => new Map(library?.classes.map((itemClass) => [itemClass.id, itemClass]) ?? []),
    [library?.classes],
  );

  const variantById = useMemo(() => {
    const map = new Map<string, { itemClass: GearItemClass; variant: GearVariant }>();
    for (const itemClass of library?.classes ?? []) {
      for (const variant of itemClass.variants) {
        map.set(variant.id, { itemClass, variant });
      }
    }
    return map;
  }, [library?.classes]);

  const visibleItems = useMemo(
    () => filterItemsForFolder(library?.items ?? [], currentFolderId),
    [library?.items, currentFolderId],
  );

  const visibleClasses = useMemo(
    () => filterItemsForFolder(library?.classes ?? [], currentFolderId),
    [library?.classes, currentFolderId],
  );

  const addToStaging = useCallback((entry: StagedGearEntry) => {
    setStaged((current) => {
      if (current.some((existing) => existing.kind === entry.kind && existing.id === entry.id)) {
        return current;
      }
      return [...current, entry];
    });
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const parsed = parseGearDragId(String(event.active.id));
      if (parsed?.kind === "item") {
        const item = itemById.get(parsed.id);
        if (item) {
          setDragPreview({ kind: "item", item });
        }
      } else if (parsed?.kind === "variant") {
        const variant = variantById.get(parsed.id)?.variant;
        if (variant) {
          setDragPreview({ kind: "variant", variant });
        }
      } else if (parsed) {
        const itemClass = classById.get(parsed.id);
        if (itemClass) {
          setDragPreview({ kind: "class", itemClass });
        }
      }
    },
    [classById, itemById, variantById],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setDragPreview(null);

      const parsed = parseGearDragId(String(active.id));
      if (!over || !parsed) {
        return;
      }

      const overZone = over.data.current?.zone as string | undefined;
      if (over.id === GEAR_LEND_ZONE || overZone === GEAR_LEND_ZONE) {
        if (parsed.kind === "item") {
          const item = itemById.get(parsed.id);
          if (item && !item.isOnLoan && canLendGearCondition(item.condition)) {
            addToStaging({
              kind: "item",
              id: item.id,
              name: item.name,
              hasPhoto: item.hasPhoto,
              condition: item.condition,
            });
          }
        } else if (parsed.kind === "variant") {
          const match = variantById.get(parsed.id);
          if (match && !match.variant.isOnLoan && canLendGearCondition(match.variant.condition)) {
            addToStaging({
              kind: "variant",
              id: match.variant.id,
              name: match.variant.name,
              hasPhoto: match.variant.hasPhoto,
              condition: match.variant.condition,
              className: match.itemClass.name,
            });
          }
        }
        return;
      }

      const folderTarget = parseFolderDropId(String(over.id));
      if (folderTarget?.namespace !== "GEAR") {
        return;
      }

      const { folderId } = folderTarget;
      if (parsed.kind === "item" && (itemById.get(parsed.id)?.folderId ?? null) !== folderId) {
        void moveGearItemToFolder({ variables: { gearItemId: parsed.id, folderId } });
      } else if (parsed.kind === "class" && (classById.get(parsed.id)?.folderId ?? null) !== folderId) {
        void moveGearClassToFolder({ variables: { classId: parsed.id, folderId } });
      }
    },
    [
      addToStaging,
      classById,
      itemById,
      moveGearClassToFolder,
      moveGearItemToFolder,
      variantById,
    ],
  );

  const handleLend = useCallback(
    async (draft: GearLoanDraft) => {
      const stagedIds = (kind: StagedGearEntry["kind"]) =>
        staged.filter((entry) => entry.kind === kind).map((entry) => entry.id);

      await createGearLoan({
        variables: {
          input: { ...draft, gearItemIds: stagedIds("item"), gearVariantIds: stagedIds("variant") },
        },
      });

      setStaged([]);
    },
    [createGearLoan, staged],
  );

  const loading = libraryLoading || lendingLoading;
  const error = libraryError ?? lendingError;
  const editItem = itemForm?.item ?? null;
  const editClass = classForm?.itemClass ?? null;

  return (
    <ModulePageLayout title="Gear Inventory">
      {loading && <p className="text-sm text-text-muted">Loading gear…</p>}
      {error && <p className="text-sm text-error">Could not load gear: {error.message}</p>}

      {!loading && !error && library && lendingInfo && (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDragPreview(null)}
        >
          <div className="space-y-4">
            <GearLibrarySection
              ref={libraryZoneRef}
              folders={visibleFolders}
              items={visibleItems}
              classes={visibleClasses}
              breadcrumbPath={breadcrumbPath}
              expandedClassIds={expandedClassIds}
              onNavigateFolder={setCurrentFolderId}
              onCreateFolder={() => setFolderModalOpen(true)}
              onCreateItem={() => setItemForm({ item: null })}
              onCreateClass={() => setClassForm({ itemClass: null })}
              onEditItem={(item) => setItemForm({ item })}
              onDeleteItem={(item) => setDeleteTarget({ kind: "item", item })}
              onToggleClassExpand={(classId) => {
                setExpandedClassIds((current) => {
                  const next = new Set(current);
                  if (!next.delete(classId)) {
                    next.add(classId);
                  }
                  return next;
                });
              }}
              onEditClass={(itemClass) => setClassForm({ itemClass })}
              onDeleteClass={(itemClass) => setDeleteTarget({ kind: "class", itemClass })}
              onAddVariant={(itemClass) => {
                setExpandedClassIds((current) => new Set(current).add(itemClass.id));
                setAddingVariantClassId(itemClass.id);
              }}
              addingVariantClassId={addingVariantClassId}
              onCancelAddVariant={() => setAddingVariantClassId(null)}
              onDeleteVariant={(variant) => setDeleteTarget({ kind: "variant", variant })}
              onFolderDeleted={handleFolderDeleted}
            />

            <GearLendStaging
              ref={lendZoneRef}
              staged={staged}
              lending={creatingLoan}
              onRemove={(entry) =>
                setStaged((current) =>
                  current.filter(
                    (existing) => !(existing.kind === entry.kind && existing.id === entry.id),
                  ),
                )
              }
              onLend={handleLend}
            />

            <GearActiveLoans
              loans={lendingInfo.activeLoans}
              returningId={returningId}
              onReturn={(loanId) => {
                setReturningId(loanId);
                void markReturned({ variables: { id: loanId } }).finally(() => setReturningId(null));
              }}
            />

            <GearLoanHistory
              loans={lendingInfo.loanHistory}
              clearing={clearing}
              onClearHistory={async () => {
                await clearHistory();
              }}
            />
          </div>

          <DragOverlay dropAnimation={null}>
            {dragPreview?.kind === "item" ? (
              <GearItemRow
                item={dragPreview.item}
                onEdit={() => undefined}
                onDelete={() => undefined}
                overlay
              />
            ) : null}
            {dragPreview?.kind === "variant" ? (
              <GearVariantDragPreview variant={dragPreview.variant} />
            ) : null}
            {dragPreview?.kind === "class" ? (
              <GearClassRow
                itemClass={dragPreview.itemClass}
                expanded={false}
                isAddingVariant={false}
                onToggleExpand={() => undefined}
                onEdit={() => undefined}
                onDelete={() => undefined}
                onAddVariant={() => undefined}
                onCancelAddVariant={() => undefined}
                onDeleteVariant={() => undefined}
                overlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <FolderFormModal
        open={folderModalOpen}
        onOpenChange={setFolderModalOpen}
        namespace="GEAR"
        parentId={currentFolderId}
        refetchQueries={[...GEAR_PAGE_REFETCH]}
      />

      <GearItemFormModal
        open={Boolean(itemForm)}
        onOpenChange={(open) => !open && setItemForm(null)}
        item={editItem}
        folderId={editItem ? editItem.folderId : currentFolderId}
      />

      <GearClassFormModal
        open={Boolean(classForm)}
        onOpenChange={(open) => !open && setClassForm(null)}
        itemClass={editClass}
        folderId={editClass ? editClass.folderId : currentFolderId}
      />

      <GearDeleteModal target={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </ModulePageLayout>
  );
}
