// src/shared/layout/AppShell.tsx
import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--vf-bg)",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        transition: "background .5s, color .5s",
        boxShadow: "0 0 32px rgba(0, 0, 0, 0.04)",
      }}
    >
      {children}
    </div>
  );
}
