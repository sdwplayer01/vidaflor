// src/App.tsx — Root do VidaFlor v2
// Sem prop drilling de tema — lido via useConfigStore / ThemeProvider.
// Layout limpo baseado no AppShell, Header e BottomNav v2.

import { useNavStore } from "./features/nav/store";
import { AppShell, Header, BottomNav } from "./shared/layout";
import { ROUTES } from "./app/routes";

export function App() {
  const currentTab = useNavStore((s) => s.currentTab);
  const irPara = useNavStore((s) => s.irPara);

  // Resolve o componente da rota ativa
  const routeDef = ROUTES[currentTab] || ROUTES.home;
  const RouteComponent = routeDef.component;

  return (
    <AppShell>
      <Header />

      {/* Conteúdo com scroll e margem inferior para a BottomNav */}
      <div style={{ paddingBottom: 90, minHeight: "calc(100vh - 64px)" }}>
        {currentTab === "home" ? (
          <RouteComponent setTab={irPara} />
        ) : (
          <RouteComponent />
        )}
      </div>

      <BottomNav />
    </AppShell>
  );
}
