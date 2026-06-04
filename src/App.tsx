// src/App.tsx — v3
// Gate de autenticação real via useAuthStore.

import { useNavStore }              from "./features/nav/store";
import { AppShell, BottomNav }      from "./shared/layout";
import { ROUTES }                   from "./app/routes";
import { useAuthStore }             from "./features/auth/store";
import { AuthGate }                 from "./features/auth/AuthGate";
import { SyncBoot }                 from "./features/auth/SyncBoot";

export function App() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const _hydrated  = useAuthStore((s) => s._hydrated);
  const currentTab = useNavStore((s) => s.currentTab);
  const irPara     = useNavStore((s) => s.irPara);

  // Aguarda hidratação do storage antes de decidir qual view mostrar.
  // Sem esse gate, o app pode piscar entre AuthGate e app principal
  // enquanto o store async carrega dados do localStorage/window.storage.
  if (!_hydrated) return null;

  if (!isLoggedIn) {
    return <AuthGate />;
  }

  const routeDef       = ROUTES[currentTab] ?? ROUTES.home;
  const RouteComponent = routeDef.component;

  return (
    <>
      <SyncBoot />
      <AppShell>
        {currentTab === "home" ? (
          <RouteComponent setTab={irPara} />
        ) : (
          <RouteComponent />
        )}
        <BottomNav />
      </AppShell>
    </>
  );
}
