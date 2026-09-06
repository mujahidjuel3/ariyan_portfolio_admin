"use client";

/** Admin stays light-only. Frontend theme is controlled from Site settings. */
export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
