// src/features/nav/store.ts
import { create } from "zustand";
import { persistVidaFlor } from "@/shared/storage/persist-middleware";
import { STORAGE_KEYS } from "@/shared/storage/keys";
import { NAV_VERSION, migrateNav } from "./migrations";

export type TabKey = "home" | "dia" | "saude" | "espiritual" | "organiza" | "financas" | "familia" | "config";

interface NavState {
  currentTab: TabKey;
  history:    TabKey[];
}

interface NavActions {
  irPara: (tab: TabKey) => void;
  voltar: () => void;
  reset:  () => void;
}

export type NavStore = NavState & NavActions;

export const useNavStore = create<NavStore>()(
  persistVidaFlor(
    (set) => ({
      currentTab: "home",
      history:    ["home"],

      irPara: (tab) =>
        set((state) => {
          if (state.currentTab === tab) return {};
          return { currentTab: tab, history: [...state.history, tab] };
        }),

      voltar: () =>
        set((state) => {
          if (state.history.length <= 1) return {};
          const newHistory = state.history.slice(0, -1);
          const prevTab = newHistory[newHistory.length - 1] ?? "home";
          return { currentTab: prevTab, history: newHistory };
        }),

      reset: () => set({ currentTab: "home", history: ["home"] }),
    }),
    { name: STORAGE_KEYS.nav, version: NAV_VERSION, migrate: migrateNav }
  )
);
