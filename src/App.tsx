// src/App.tsx — v2
// No separate Header — each screen renders its own header.
// AppShell provides ambient gradient background + BottomNav padding.

import { useNavStore } from "./features/nav/store";
import { AppShell, BottomNav } from "./shared/layout";
import { ROUTES } from "./app/routes";

export function App() {
  const currentTab = useNavStore((s) => s.currentTab);
  const irPara     = useNavStore((s) => s.irPara);

  const routeDef       = ROUTES[currentTab] ?? ROUTES.home;
  const RouteComponent = routeDef.component;

  return (
    <AppShell>
      {currentTab === "home" ? (
        <RouteComponent setTab={irPara} />
      ) : (
        <RouteComponent />
      )}
      <BottomNav />
    </AppShell>
  );
}
