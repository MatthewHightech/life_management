const STORAGE_KEY = "life-sidebar-collapsed";

export function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export function writeSidebarCollapsed(collapsed: boolean) {
  window.localStorage.setItem(STORAGE_KEY, String(collapsed));
}
