/** Kinship design tokens — light mode only for MVP. */
export const theme = {
  background: "#f8f9fa",
  surface: "#ffffff",
  surfaceContainer: "#edeeef",
  surfaceContainerLow: "#f3f4f5",
  text: "#191c1d",
  textMuted: "#6C757D",
  primary: "#16342d",
  onPrimary: "#ffffff",
  secondary: "#126876",
  outline: "#c1c8c4",
  borderSubtle: "#E9ECEF",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  sage: "#E9F0EE",
  tabIconDefault: "#717976",
  tabIconSelected: "#16342d",
} as const;

export type Theme = typeof theme;
