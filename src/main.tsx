// src/main.tsx — Entry point do VidaFlor v2.
// Inicializa o app, restaura sessão Supabase e renderiza a árvore React.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/global.css";
import "./index.css";
import { App } from "./App";
import { ThemeProvider } from "./app/theme-provider";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary/ErrorBoundary";
import { boot } from "./app/boot";
import { getSession } from "@/features/auth/api/supabase";
import { useAuthStore } from "@/features/auth/store";
import { registerSW } from "virtual:pwa-register";

(async () => {
  boot();

  try {
    const session = await getSession();
    if (session) {
      useAuthStore.getState().hydrateFromSession(session);
    }
  } catch {
    // Supabase não configurado ou falha de rede — app roda em modo offline
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </StrictMode>
  );

  // PWA: registrar service worker com prompt de atualização
  registerSW({
    onNeedRefresh() {
      if (confirm("Nova versão disponível. Atualizar agora?")) {
        // O callback de updateSW é retornado pelo registerSW
        window.location.reload();
      }
    },
    onOfflineReady() {
      console.log("[VidaFlor] App pronto para uso offline.");
    },
  });
})();
