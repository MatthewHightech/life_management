/** Task list column widths — keep table colgroup and quick-add grid in sync. */
export const TASK_LIST_TABLE_COLUMNS = [
  { id: "title", className: "w-[31%]" },
  { id: "status", className: "w-[12%]" },
  { id: "priority", className: "w-[8%]" },
  { id: "assignees", className: "w-[12%]" },
  { id: "dueDate", className: "w-[10%]" },
] as const;

export const TASK_LIST_COLUMN_GRID =
  "grid w-full min-w-full grid-cols-[31%_12%_8%_12%_10%_minmax(9rem,1fr)] text-left text-sm";
