// src/main.tsx — Entry point do VidaFlor v2.
// Inicializa o app, restaura sessão Supabase e renderiza a árvore React.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/global.css";
import "./index.css";
import { App } from "./App";
import { ThemeProvider } from "./app/theme-provider";
import { boot } from "./app/boot";
import { getSession } from "@/features/auth/api/supabase";
import { useAuthStore } from "@/features/auth/store";

(async () => {
  boot();

  const session = await getSession();
  if (session) {
    useAuthStore.getState().hydrateFromSession(session);
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>
  );
})();
