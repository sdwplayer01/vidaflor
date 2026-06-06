import { useAuthStore }        from '@/features/auth/store';
import { useSaudeStore }        from '@/features/saude/store';
import { useEspiritualStore }   from '@/features/espiritual/store';
import { useConfigStore }       from '@/features/config/store';
import { useFinancasStore }     from '@/features/financas/store';
import { useOrganizaStore }     from '@/features/organiza/store';
import { useAgendaStore }       from '@/features/agenda/store';
import { useRotinaStore }       from '@/features/rotina/store';
import { useCasaStore }         from '@/features/casa/store';
import { useKidsStore }         from '@/features/kids/store';
import { usePetsStore }         from '@/features/pets/store';

import { migrate as migrateSaude,     SAUDE_VERSION }         from '@/features/saude/migrations';
import { migrate as migrateEspiritual, ESPIRITUAL_VERSION }   from '@/features/espiritual/migrations';
import { migrateConfigState,           CONFIG_STORE_VERSION } from '@/features/config/migrations';
import { migrate as migrateFinancas,   FINANCAS_VERSION }     from '@/features/financas/migrations';
import { migrate as migrateOrganiza,   ORGANIZA_VERSION }     from '@/features/organiza/migrations';
import { migrate as migrateAgenda,     AGENDA_VERSION }       from '@/features/agenda/migrations';
import { migrate as migrateRotina,     ROTINA_VERSION }       from '@/features/rotina/migrations';
import { migrate as migrateCasa,       CASA_VERSION }         from '@/features/casa/migrations';
import { migrate as migrateKids,       KIDS_VERSION }         from '@/features/kids/migrations';
import { migrate as migratePets,       PETS_VERSION }         from '@/features/pets/migrations';

import { PROFILE_COLOR_DEFAULT } from '@/shared/constants/colors';
import { genId }  from '@/shared/utils/id';
import { today }  from '@/shared/utils/date';
import type { SaudeState } from '@/features/saude/types';
import type { AuthUser }   from '@/features/auth/types';

export interface SyncModule {
  feature:        string;
  getState:       () => unknown;
  setState:       (s: unknown) => void;
  subscribe:      (cb: () => void) => () => void;
  currentVersion: number;
  migrate:        (state: unknown, fromVersion: number) => unknown;
  getDefault:     () => unknown;
  isEmpty:        (state: unknown) => boolean;
}

// Retorna true se todos os itens têm IDs demo (seed local) — sem dado real do usuário.
function allDemoIds(arr: unknown[]): boolean {
  return arr.length === 0 || (arr as Array<{ id?: string }>).every((x) => x?.id?.startsWith('demo-'));
}

function defaultSaudeParaUsuario(user: AuthUser): SaudeState {
  const id = genId('prf');
  return {
    activeProfileId: id,
    profiles: [{
      id,
      name:       user.name,
      avatar:     '🌸',
      type:       'adult_f',
      color:      PROFILE_COLOR_DEFAULT,
      water:      { goalMl: 2000, logMl: {} },
      meds:       [],
      notes:      {},
      moodLog:    {},
      sleepLog:   {},
      stepsLog:   {},
      metaPassos: 8000,
      createdAt:  today(),
    }],
    _version:  SAUDE_VERSION,
    _hydrated: true,
  };
}

export const SYNC_MODULES: SyncModule[] = [

  // ── FASE A ──────────────────────────────────────────────────────────────

  {
    feature:        'saude',
    getState:       () => useSaudeStore.getState(),
    setState:       (d) => useSaudeStore.setState(d as Parameters<typeof useSaudeStore.setState>[0]),
    subscribe:      (cb) => useSaudeStore.subscribe(cb),
    currentVersion: SAUDE_VERSION,
    migrate:        migrateSaude,
    getDefault:     () => defaultSaudeParaUsuario(useAuthStore.getState().user!),
    isEmpty:        (s: unknown) => !((s as SaudeState)?.profiles?.length),
  },

  {
    feature:        'espiritual',
    getState:       () => useEspiritualStore.getState(),
    setState:       (d) => useEspiritualStore.setState(d as Parameters<typeof useEspiritualStore.setState>[0]),
    subscribe:      (cb) => useEspiritualStore.subscribe(cb),
    currentVersion: ESPIRITUAL_VERSION,
    migrate:        migrateEspiritual,
    getDefault:     () => ({
      gratidao:  {},
      oracoes:   [],
      leituras:  [],
      _version:  ESPIRITUAL_VERSION,
      _hydrated: true,
    }),
    isEmpty: (s: unknown) => {
      const e = s as { oracoes?: unknown[]; leituras?: unknown[]; gratidao?: Record<string, unknown> };
      return (
        !e?.oracoes?.length &&
        !e?.leituras?.length &&
        Object.keys(e?.gratidao ?? {}).length === 0
      );
    },
  },

  {
    feature:        'config',
    getState:       () => useConfigStore.getState(),
    setState:       (d) => useConfigStore.setState(d as Parameters<typeof useConfigStore.setState>[0]),
    subscribe:      (cb) => useConfigStore.subscribe(cb),
    currentVersion: CONFIG_STORE_VERSION,
    migrate:        migrateConfigState,
    getDefault:     () => ({ ...useConfigStore.getState(), _hydrated: true }),
    isEmpty:        (_s: unknown) => false, // config sempre tem estado válido
  },

  // ── FASE B1 ─────────────────────────────────────────────────────────────

  {
    feature:        'financas',
    getState:       () => useFinancasStore.getState(),
    setState:       (d) => useFinancasStore.setState(d as Parameters<typeof useFinancasStore.setState>[0]),
    subscribe:      (cb) => useFinancasStore.subscribe(cb),
    currentVersion: FINANCAS_VERSION,
    migrate:        migrateFinancas,
    getDefault:     () => ({
      cards:        [],
      transactions: [],
      budget:       {},
      _version:     FINANCAS_VERSION,
      _hydrated:    true,
    }),
    isEmpty: (s: unknown) => {
      const f = s as { transactions?: Array<{ id: string }>; cards?: Array<{ id: string }> };
      return allDemoIds(f?.transactions ?? []) && allDemoIds(f?.cards ?? []);
    },
  },

  {
    feature:        'organiza',
    getState:       () => useOrganizaStore.getState(),
    setState:       (d) => useOrganizaStore.setState(d as Parameters<typeof useOrganizaStore.setState>[0]),
    subscribe:      (cb) => useOrganizaStore.subscribe(cb),
    currentVersion: ORGANIZA_VERSION,
    migrate:        migrateOrganiza,
    getDefault:     () => ({
      shopping:  { items: [] },
      notes:     { list: [] },
      reminders: { list: [] },
      _version:  ORGANIZA_VERSION,
      _hydrated: true,
    }),
    isEmpty: (s: unknown) => {
      const o = s as {
        shopping?:  { items?: Array<{ id: string }> };
        notes?:     { list?: Array<{ id: string }> };
        reminders?: { list?: Array<{ id: string }> };
      };
      return (
        allDemoIds(o?.shopping?.items ?? []) &&
        allDemoIds(o?.notes?.list ?? []) &&
        allDemoIds(o?.reminders?.list ?? [])
      );
    },
  },

  // ── FASE B2 ─────────────────────────────────────────────────────────────

  {
    feature:        'agenda',
    getState:       () => useAgendaStore.getState(),
    setState:       (d) => useAgendaStore.setState(d as Parameters<typeof useAgendaStore.setState>[0]),
    subscribe:      (cb) => useAgendaStore.subscribe(cb),
    currentVersion: AGENDA_VERSION,
    migrate:        migrateAgenda,
    getDefault:     () => ({
      tarefas:   [],
      done:      {},
      captura:   [],
      _version:  AGENDA_VERSION,
      _hydrated: true,
    }),
    isEmpty: (s: unknown) => {
      const a = s as { tarefas?: Array<{ id: string }>; captura?: Array<{ id: string }> };
      return !a?.tarefas?.length && !a?.captura?.length;
    },
  },

  {
    feature:        'rotina',
    getState:       () => useRotinaStore.getState(),
    setState:       (d) => useRotinaStore.setState(d as Parameters<typeof useRotinaStore.setState>[0]),
    subscribe:      (cb) => useRotinaStore.subscribe(cb),
    currentVersion: ROTINA_VERSION,
    migrate:        migrateRotina,
    getDefault:     () => ({
      tarefas:   { manha: [], tarde: [], noite: [] },
      essential: [],
      done:      {},
      essMode:   false,
      _version:  ROTINA_VERSION,
      _hydrated: true,
    }),
    isEmpty: (s: unknown) => {
      const r = s as { tarefas?: { manha?: Array<{ id: string }>; tarde?: Array<{ id: string }>; noite?: Array<{ id: string }> }; essential?: Array<{ id: string }> };
      const all = [
        ...(r?.tarefas?.manha  ?? []),
        ...(r?.tarefas?.tarde  ?? []),
        ...(r?.tarefas?.noite  ?? []),
        ...(r?.essential       ?? []),
      ];
      return allDemoIds(all);
    },
  },

  // ── FASE B3 ─────────────────────────────────────────────────────────────

  {
    feature:        'casa',
    getState:       () => useCasaStore.getState(),
    setState:       (d) => useCasaStore.setState(d as Parameters<typeof useCasaStore.setState>[0]),
    subscribe:      (cb) => useCasaStore.subscribe(cb),
    currentVersion: CASA_VERSION,
    migrate:        migrateCasa,
    getDefault:     () => ({
      tarefas:   [],
      done:      {},
      _version:  CASA_VERSION,
      _hydrated: true,
    }),
    isEmpty: (s: unknown) => {
      const c = s as { tarefas?: Array<{ id: string }> };
      return allDemoIds(c?.tarefas ?? []);
    },
  },

  {
    feature:        'kids',
    getState:       () => useKidsStore.getState(),
    setState:       (d) => useKidsStore.setState(d as Parameters<typeof useKidsStore.setState>[0]),
    subscribe:      (cb) => useKidsStore.subscribe(cb),
    currentVersion: KIDS_VERSION,
    migrate:        migrateKids,
    getDefault:     () => ({
      criancas:    [],
      activeKidId: null,
      done:        {},
      _version:    KIDS_VERSION,
      _hydrated:   true,
    }),
    isEmpty: (s: unknown) => {
      const k = s as { criancas?: Array<{ id: string }> };
      return allDemoIds(k?.criancas ?? []);
    },
  },

  {
    feature:        'pets',
    getState:       () => usePetsStore.getState(),
    setState:       (d) => usePetsStore.setState(d as Parameters<typeof usePetsStore.setState>[0]),
    subscribe:      (cb) => usePetsStore.subscribe(cb),
    currentVersion: PETS_VERSION,
    migrate:        migratePets,
    getDefault:     () => ({
      pets:        [],
      activePetId: null,
      done:        {},
      _version:    PETS_VERSION,
      _hydrated:   true,
    }),
    isEmpty: (s: unknown) => {
      const p = s as { pets?: Array<{ id: string }> };
      return allDemoIds(p?.pets ?? []);
    },
  },
];
