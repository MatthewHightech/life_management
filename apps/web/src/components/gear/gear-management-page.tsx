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
  CLEAR_GEAR_LOAN_HISTORY_MUTATION,
  CREATE_GEAR_LOAN_MUTATION,
  DELETE_GEAR_CLASS_MUTATION,
  DELETE_GEAR_ITEM_MUTATION,
  DELETE_GEAR_VARIANT_MUTATION,
  GEAR_LIBRARY_QUERY,
  GEAR_LENDING_QUERY,
  MARK_GEAR_LOAN_RETURNED_MUTATION,
  MOVE_GEAR_CLASS_TO_FOLDER_MUTATION,
  MOVE_GEAR_ITEM_TO_FOLDER_MUTATION,
} from "@/graphql";
import { FolderFormModal } from "@/components/folders/folder-form-modal";
import { GearActiveLoans } from "@/components/gear/gear-active-loans";
import { GearClassFormModal } from "@/components/gear/gear-class-form-modal";
import { GearClassRow } from "@/components/gear/gear-class-row";
import { GearItemFormModal } from "@/components/gear/gear-item-form-modal";
import { GearItemRow } from "@/components/gear/gear-item-row";
import { GearLendStaging } from "@/components/gear/gear-lend-staging";
import { GearLibrarySection } from "@/components/gear/gear-library-section";
import { GearLoanHistory } from "@/components/gear/gear-loan-history";
import { GearVariantFormModal } from "@/components/gear/gear-variant-form-modal";
import type { GearItem, GearItemClass, StagedGearEntry } from "@/components/gear/types";
import { ModulePageLayout } from "@/components/shell/module-page-layout";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { GEAR_PAGE_REFETCH } from "@/lib/gear-queries";
import { createLibraryCollisionDetection } from "@/lib/folder-dnd";
import {
  buildFolderPath,
  filterFoldersForParent,
  filterItemsForFolder,
  folderIdAfterDelete,
} from "@/lib/folder-utils";
import {
  GEAR_LEND_ZONE,
  canLendGearCondition,
  parseGearDragId,
  parseFolderDropId,
} from "@life/shared";

type GearLibraryData = GearLibraryQuery["gearLibrary"];
type GearLendingData = GearLendingQuery["gearLending"];

type DragPreview =
  | { kind: "item"; item: GearItem }
  | { kind: "variant"; itemClass: GearItemClass; variantId: string }
  | { kind: "class"; itemClass: GearItemClass };

export function GearManagementPage() {
  const libraryZoneRef = useRef<HTMLElement>(null);
  const lendZoneRef = useRef<HTMLElement>(null);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [expandedClassIds, setExpandedClassIds] = useState<Set<string>>(() => new Set());
  const [staged, setStaged] = useState<StagedGearEntry[]>([]);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [variantModalOpen, setVariantModalOpen] = useState(false);

  const [editItem, setEditItem] = useState<GearItem | null>(null);
  const [editClass, setEditClass] = useState<GearItemClass | null>(null);
  const [variantClass, setVariantClass] = useState<GearItemClass | null>(null);
  const [editVariant, setEditVariant] = useState<GearItemClass["variants"][number] | null>(null);

  const [deleteItem, setDeleteItem] = useState<GearItem | null>(null);
  const [deleteClass, setDeleteClass] = useState<GearItemClass | null>(null);
  const [deleteVariant, setDeleteVariant] = useState<{
    itemClass: GearItemClass;
    variant: GearItemClass["variants"][number];
  } | null>(null);

  const {
    data: libraryData,
    loading: libraryLoading,
    error: libraryError,
  } = useQuery<GearLibraryQuery>(GEAR_LIBRARY_QUERY);
  const {
    data: lendingData,
    loading: lendingLoading,
    error: lendingError,
  } = useQuery<GearLendingQuery>(GEAR_LENDING_QUERY);

  const [moveGearItemToFolder] = useMutation(MOVE_GEAR_ITEM_TO_FOLDER_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    awaitRefetchQueries: true,
  });
  const [moveGearClassToFolder] = useMutation(MOVE_GEAR_CLASS_TO_FOLDER_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    awaitRefetchQueries: true,
  });
  const [createGearLoan, { loading: creatingLoan }] = useMutation(CREATE_GEAR_LOAN_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    awaitRefetchQueries: true,
  });
  const [markReturned] = useMutation(MARK_GEAR_LOAN_RETURNED_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    awaitRefetchQueries: true,
  });
  const [clearHistory, { loading: clearing }] = useMutation(CLEAR_GEAR_LOAN_HISTORY_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    awaitRefetchQueries: true,
  });
  const [deleteGearItem, { loading: deletingItem }] = useMutation(DELETE_GEAR_ITEM_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    awaitRefetchQueries: true,
    onCompleted: () => setDeleteItem(null),
  });
  const [deleteGearClass, { loading: deletingClass }] = useMutation(DELETE_GEAR_CLASS_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    awaitRefetchQueries: true,
    onCompleted: () => setDeleteClass(null),
  });
  const [deleteGearVariant, { loading: deletingVariant }] = useMutation(DELETE_GEAR_VARIANT_MUTATION, {
    refetchQueries: [...GEAR_PAGE_REFETCH],
    awaitRefetchQueries: true,
    onCompleted: () => setDeleteVariant(null),
  });

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

  const library: GearLibraryData | undefined = libraryData?.gearLibrary;
  const lendingInfo: GearLendingData | undefined = lendingData?.gearLending;

  const itemById = useMemo(
    () => new Map(library?.items.map((item) => [item.id, item]) ?? []),
    [library?.items],
  );

  const classById = useMemo(
    () => new Map(library?.classes.map((itemClass) => [itemClass.id, itemClass]) ?? []),
    [library?.classes],
  );

  const variantById = useMemo(() => {
    const map = new Map<string, { itemClass: GearItemClass; variant: GearItemClass["variants"][number] }>();
    for (const itemClass of library?.classes ?? []) {
      for (const variant of itemClass.variants) {
        map.set(variant.id, { itemClass, variant });
      }
    }
    return map;
  }, [library?.classes]);

  const breadcrumbPath = useMemo(
    () => buildFolderPath(library?.folders ?? [], currentFolderId),
    [library?.folders, currentFolderId],
  );

  const visibleFolders = useMemo(
    () => filterFoldersForParent(library?.folders ?? [], currentFolderId),
    [library?.folders, currentFolderId],
  );

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
      const dragId = String(event.active.id);
      const parsed = parseGearDragId(dragId);
      if (!parsed) {
        return;
      }

      if (parsed.kind === "item") {
        const item = itemById.get(parsed.id);
        if (item) {
          setDragPreview({ kind: "item", item });
        }
        return;
      }

      if (parsed.kind === "variant") {
        const match = variantById.get(parsed.id);
        if (match) {
          setDragPreview({
            kind: "variant",
            itemClass: match.itemClass,
            variantId: match.variant.id,
          });
        }
        return;
      }

      const itemClass = classById.get(parsed.id);
      if (itemClass) {
        setDragPreview({ kind: "class", itemClass });
      }
    },
    [classById, itemById, variantById],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setDragPreview(null);

      if (!over) {
        return;
      }

      const parsed = parseGearDragId(String(active.id));
      if (!parsed) {
        return;
      }

      const overZone = over.data.current?.zone as string | undefined;
      if (over.id === GEAR_LEND_ZONE || overZone === GEAR_LEND_ZONE) {
        if (parsed.kind === "class") {
          return;
        }

        if (parsed.kind === "item") {
          const item = itemById.get(parsed.id);
          if (
            !item ||
            item.isOnLoan ||
            !canLendGearCondition(item.condition)
          ) {
            return;
          }
          addToStaging({
            kind: "item",
            id: item.id,
            name: item.name,
            hasPhoto: item.hasPhoto,
            condition: item.condition,
          });
          return;
        }

        const match = variantById.get(parsed.id);
        if (
          !match ||
          match.variant.isOnLoan ||
          !canLendGearCondition(match.variant.condition)
        ) {
          return;
        }
        addToStaging({
          kind: "variant",
          id: match.variant.id,
          name: match.variant.name,
          hasPhoto: match.variant.hasPhoto,
          condition: match.variant.condition,
          className: match.itemClass.name,
        });
        return;
      }

      const folderTarget = parseFolderDropId(String(over.id));
      if (!folderTarget || folderTarget.namespace !== "GEAR") {
        return;
      }

      if (parsed.kind === "item") {
        const item = itemById.get(parsed.id);
        if ((item?.folderId ?? null) === folderTarget.folderId) {
          return;
        }
        void moveGearItemToFolder({
          variables: { gearItemId: parsed.id, folderId: folderTarget.folderId },
        });
        return;
      }

      if (parsed.kind === "class") {
        const itemClass = classById.get(parsed.id);
        if ((itemClass?.folderId ?? null) === folderTarget.folderId) {
          return;
        }
        void moveGearClassToFolder({
          variables: { classId: parsed.id, folderId: folderTarget.folderId },
        });
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
    async (input: {
      borrowerName: string;
      borrowerEmail: string;
      lentAt: string;
      returnBy: string;
    }) => {
      const gearItemIds = staged.filter((entry) => entry.kind === "item").map((entry) => entry.id);
      const gearVariantIds = staged.filter((entry) => entry.kind === "variant").map((entry) => entry.id);

      await createGearLoan({
        variables: {
          input: {
            borrowerName: input.borrowerName,
            borrowerEmail: input.borrowerEmail,
            lentAt: input.lentAt,
            returnBy: input.returnBy,
            gearItemIds,
            gearVariantIds,
          },
        },
      });

      setStaged([]);
    },
    [createGearLoan, staged],
  );

  const loading = libraryLoading || lendingLoading;
  const error = libraryError ?? lendingError;

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
              currentFolderId={currentFolderId}
              expandedClassIds={expandedClassIds}
              onNavigateFolder={setCurrentFolderId}
              onCreateFolder={() => setFolderModalOpen(true)}
              onCreateItem={() => {
                setEditItem(null);
                setItemModalOpen(true);
              }}
              onCreateClass={() => {
                setEditClass(null);
                setClassModalOpen(true);
              }}
              onEditItem={(item) => {
                setEditItem(item);
                setItemModalOpen(true);
              }}
              onDeleteItem={setDeleteItem}
              onToggleClassExpand={(classId) => {
                setExpandedClassIds((current) => {
                  const next = new Set(current);
                  if (next.has(classId)) {
                    next.delete(classId);
                  } else {
                    next.add(classId);
                  }
                  return next;
                });
              }}
              onEditClass={(itemClass) => {
                setEditClass(itemClass);
                setClassModalOpen(true);
              }}
              onDeleteClass={setDeleteClass}
              onAddVariant={(itemClass) => {
                setVariantClass(itemClass);
                setEditVariant(null);
                setVariantModalOpen(true);
              }}
              onEditVariant={(itemClass, variantId) => {
                const variant = itemClass.variants.find((entry) => entry.id === variantId);
                if (!variant) {
                  return;
                }
                setVariantClass(itemClass);
                setEditVariant(variant);
                setVariantModalOpen(true);
              }}
              onDeleteVariant={(itemClass, variantId) => {
                const variant = itemClass.variants.find((entry) => entry.id === variantId);
                if (!variant) {
                  return;
                }
                setDeleteVariant({ itemClass, variant });
              }}
              onFolderDeleted={(deletedFolderId) => {
                setCurrentFolderId((currentId) =>
                  folderIdAfterDelete(library.folders, currentId, deletedFolderId),
                );
              }}
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
            {dragPreview?.kind === "class" ? (
              <GearClassRow
                itemClass={dragPreview.itemClass}
                expanded={false}
                onToggleExpand={() => undefined}
                onEdit={() => undefined}
                onDelete={() => undefined}
                onAddVariant={() => undefined}
                onEditVariant={() => undefined}
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
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
        item={editItem}
        folderId={editItem ? editItem.folderId : currentFolderId}
      />

      <GearClassFormModal
        open={classModalOpen}
        onOpenChange={setClassModalOpen}
        itemClass={editClass}
        folderId={editClass ? editClass.folderId : currentFolderId}
      />

      <GearVariantFormModal
        open={variantModalOpen}
        onOpenChange={setVariantModalOpen}
        itemClass={variantClass}
        variant={editVariant}
      />

      <Modal
        open={Boolean(deleteItem)}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="Delete gear item?"
        description={deleteItem ? `"${deleteItem.name}" will be permanently deleted.` : undefined}
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setDeleteItem(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-error text-white hover:bg-error/90"
            disabled={deletingItem}
            onClick={() => deleteItem && void deleteGearItem({ variables: { id: deleteItem.id } })}
          >
            {deletingItem ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteClass)}
        onOpenChange={(open) => !open && setDeleteClass(null)}
        title="Delete item class?"
        description={
          deleteClass
            ? `"${deleteClass.name}" and all ${deleteClass.variants.length} variant(s) will be permanently deleted.`
            : undefined
        }
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setDeleteClass(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-error text-white hover:bg-error/90"
            disabled={deletingClass}
            onClick={() => deleteClass && void deleteGearClass({ variables: { id: deleteClass.id } })}
          >
            {deletingClass ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteVariant)}
        onOpenChange={(open) => !open && setDeleteVariant(null)}
        title="Delete variant?"
        description={
          deleteVariant ? `"${deleteVariant.variant.name}" will be permanently deleted.` : undefined
        }
      >
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setDeleteVariant(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-error text-white hover:bg-error/90"
            disabled={deletingVariant}
            onClick={() =>
              deleteVariant &&
              void deleteGearVariant({ variables: { id: deleteVariant.variant.id } })
            }
          >
            {deletingVariant ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>
    </ModulePageLayout>
  );
}
