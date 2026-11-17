export const TASK_LIST_TABLE_COLUMNS = [
  { id: "title", className: "w-[35%]" },
  { id: "status", className: "w-[12%]" },
  { id: "assignees", className: "w-[14%]" },
  { id: "dueDate", className: "w-[12%]" },
] as const;

export const TASK_LIST_COLUMN_GRID =
  "grid w-full min-w-full grid-cols-[35%_12%_14%_12%_minmax(9rem,1fr)] text-left text-sm";
