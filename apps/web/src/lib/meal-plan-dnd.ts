import { closestCenter, pointerWithin, type CollisionDetection } from "@dnd-kit/core";

export const MEAL_PLAN_DROP_ZONE = {
  RECIPE: "recipe",
  SCHEDULE: "schedule",
} as const;

export type MealPlanDropZone = (typeof MEAL_PLAN_DROP_ZONE)[keyof typeof MEAL_PLAN_DROP_ZONE];

type Point = { x: number; y: number };

function isPointInRect(point: Point, rect: DOMRect): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

export function createMealPlanCollisionDetection(
  getRecipeZoneRect: () => DOMRect | null,
  getScheduleZoneRect: () => DOMRect | null,
): CollisionDetection {
  return (args) => {
    const { pointerCoordinates, droppableContainers } = args;

    if (!pointerCoordinates) {
      return [];
    }

    const point = { x: pointerCoordinates.x, y: pointerCoordinates.y };
    const recipeRect = getRecipeZoneRect();
    const scheduleRect = getScheduleZoneRect();
    const inRecipeZone = recipeRect ? isPointInRect(point, recipeRect) : false;
    const inScheduleZone = scheduleRect ? isPointInRect(point, scheduleRect) : false;

    if (!inRecipeZone && !inScheduleZone) {
      return [];
    }

    const zone = inRecipeZone ? MEAL_PLAN_DROP_ZONE.RECIPE : MEAL_PLAN_DROP_ZONE.SCHEDULE;
    const zoneDroppables = droppableContainers.filter(
      (container) => container.data.current?.zone === zone,
    );

    const pointerCollisions = pointerWithin({
      ...args,
      droppableContainers: zoneDroppables,
    });

    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    if (zone === MEAL_PLAN_DROP_ZONE.SCHEDULE) {
      return closestCenter({
        ...args,
        droppableContainers: zoneDroppables,
      });
    }

    return [];
  };
}
