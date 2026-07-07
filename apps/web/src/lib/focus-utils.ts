/** True when focus moves outside the given row element. */
export function focusLeavesRow(event: React.FocusEvent, row: HTMLElement | null): boolean {
  const next = event.relatedTarget;
  if (row && next instanceof Node && row.contains(next)) {
    return false;
  }
  return true;
}
