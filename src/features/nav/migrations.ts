// src/features/nav/migrations.ts
import type { TabKey } from './store';

export const NAV_VERSION = 1;

export function migrateNav(state: unknown, fromVersion: number): unknown {
  let s = state as Record<string, unknown>;
  if (fromVersion < 1) {
    const remap = (t: unknown): TabKey =>
      t === 'rotina' ? 'dia' : (t as TabKey);
    s = {
      ...s,
      currentTab: remap(s?.['currentTab'] ?? 'home'),
      history:    Array.isArray(s?.['history'])
        ? (s['history'] as unknown[]).map(remap)
        : ['home'],
    };
  }
  return s;
}
