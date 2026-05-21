// src/main.tsx — Entry point do VidaFlor v2.
// Inicializa o app, carrega estilos globais e renderiza a árvore React.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/global.css";
import "./index.css";
import { App } from "./App";
import { ThemeProvider } from "./app/theme-provider";
import { boot } from "./app/boot";

// 1. Inicializa o aplicativo e roda as migrações necessárias de dados legados
boot();

// 2. Renderiza a aplicação com o ThemeProvider v2
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
