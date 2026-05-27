// src/shared/layout/AppShell.tsx -- v2
// Ambient gradient background, max-width container with subtle shadow.
// No separate Header -- each screen manages its own header.

import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      style={{
        minHeight:            "100vh",
        maxWidth:             480,
        margin:               "0 auto",
        position:             "relative",
        background:           "var(--vf-grad-ambient)",
        backgroundAttachment: "fixed",
        fontFamily:           "var(--vf-font-ui)",
        color:                "var(--vf-tx)",
        transition:           "background 0.6s cubic-bezier(0.22,1,0.36,1), color 0.4s cubic-bezier(0.22,1,0.36,1)",
        boxShadow:            "0 0 80px rgba(60,28,36,0.06)",
        paddingBottom:        96,
      }}
    >
      {children}
    </div>
  );
}
