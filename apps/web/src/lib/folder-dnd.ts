import { closestCenter, pointerWithin, type CollisionDetection } from "@dnd-kit/core";
import type { FolderNamespace } from "@life/shared";
import { parseFolderDropId } from "@life/shared";

export const LIBRARY_DROP_ZONE = "library";

export type LibraryDropZone = typeof LIBRARY_DROP_ZONE;

type Point = { x: number; y: number };

function isPointInRect(point: Point, rect: DOMRect): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

export function createLibraryCollisionDetection(
  namespace: FolderNamespace,
  getLibraryZoneRect: () => DOMRect | null,
  getSecondaryZoneRect?: () => DOMRect | null,
  secondaryZoneId?: string,
): CollisionDetection {
  return (args) => {
    const { pointerCoordinates, droppableContainers } = args;

    if (!pointerCoordinates) {
      return [];
    }

    const point = { x: pointerCoordinates.x, y: pointerCoordinates.y };
    const libraryRect = getLibraryZoneRect();
    const secondaryRect = getSecondaryZoneRect?.() ?? null;
    const inLibraryZone = libraryRect ? isPointInRect(point, libraryRect) : false;
    const inSecondaryZone = secondaryRect ? isPointInRect(point, secondaryRect) : false;

    if (!inLibraryZone && !inSecondaryZone) {
      return [];
    }

    if (inLibraryZone) {
      const libraryDroppables = droppableContainers.filter((container) => {
        const parsed = parseFolderDropId(String(container.id));
        return parsed?.namespace === namespace;
      });

      return pointerWithin({
        ...args,
        droppableContainers: libraryDroppables,
      });
    }

    if (secondaryZoneId) {
      const secondaryDroppables = droppableContainers.filter(
        (container) => container.data.current?.zone === secondaryZoneId,
      );

      const pointerCollisions = pointerWithin({
        ...args,
        droppableContainers: secondaryDroppables,
      });

      if (pointerCollisions.length > 0) {
        return pointerCollisions;
      }

      return closestCenter({
        ...args,
        droppableContainers: secondaryDroppables,
      });
    }

    return [];
  };
}
