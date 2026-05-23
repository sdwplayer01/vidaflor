// src/app/theme-provider.tsx
import React, { createContext, useContext, useEffect, useMemo, ReactNode } from "react";
import { useConfigStore } from "../features/config/store";
import { applyTheme, resolveTheme } from "../shared/constants/themes";
import { Theme, ThemeKey } from "../shared/types/theme";

interface ThemeContextType {
  themeKey: ThemeKey;
  theme: Theme;
  setTheme: (key: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeKey = useConfigStore((s) => s.theme);
  const setTheme = useConfigStore((s) => s.setTheme);

  useEffect(() => {
    applyTheme(resolveTheme(themeKey));
  }, [themeKey]);

  const value = useMemo(() => ({
    themeKey,
    theme: resolveTheme(themeKey),
    setTheme,
  }), [themeKey, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return context;
}
