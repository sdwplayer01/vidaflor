// src/App.tsx — v4
// Gate de autenticação + gate central de sync (CAMADA 1).

import { useNavStore }              from "./features/nav/store";
import { AppShell, BottomNav }      from "./shared/layout";
import { ROUTES }                   from "./app/routes";
import { useAuthStore }             from "./features/auth/store";
import { AuthGate }                 from "./features/auth/AuthGate";
import { SyncBoot }                 from "./features/auth/SyncBoot";
import { useSyncReady }             from "./shared/sync/sync-ready-store";

function SplashSincronizando() {
  return (
    <div
      style={{
        minHeight:       "100vh",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        background:      "var(--vf-bg)",
        color:           "var(--vf-tx-soft)",
        fontSize:        14,
        letterSpacing:   0.2,
      }}
    >
      Sincronizando...
    </div>
  );
}

export function App() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const _hydrated  = useAuthStore((s) => s._hydrated);
  const currentTab = useNavStore((s) => s.currentTab);
  const irPara     = useNavStore((s) => s.irPara);
  const syncReady  = useSyncReady((s) => s.ready);

  if (!_hydrated) return null;

  if (!isLoggedIn) {
    return <AuthGate />;
  }

  const routeDef       = ROUTES[currentTab] ?? ROUTES.home;
  const RouteComponent = routeDef.component;

  return (
    <>
      <SyncBoot />
      {syncReady ? (
        <AppShell>
          {currentTab === "home" ? (
            <RouteComponent setTab={irPara} />
          ) : (
            <RouteComponent />
          )}
          <BottomNav />
        </AppShell>
      ) : (
        <SplashSincronizando />
      )}
    </>
  );
}
