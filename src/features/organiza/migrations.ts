// src/features/organiza/migrations.ts
import { NOTE_COLORS } from '@/shared/constants/colors';
import { today } from '@/shared/utils/date';
export const ORGANIZA_VERSION = 3;

// Mapeia categorias legadas para seções do mercado
const LEGACY_MAP: Record<string, string> = {
  Alimentacao: "Mercearia",
  Higiene:     "Higiene",
  Limpeza:     "Limpeza",
  Pet:         "Outros",
  Bebe:        "Outros",
  Outros:      "Outros",
  Geral:       "Mercearia",
};

export function migrate(state: unknown, fromVersion: number): unknown {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let s = state as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  // v0 -> v1: unifica arrays soltos em slices tipadas
  if (fromVersion < 1) {
    const legacyItems     = s?.shopping ?? s?.items ?? [];
    const legacyNotes     = s?.notes ?? s?.list ?? [];
    const legacyReminders = s?.reminders ?? [];

    s = {
      ...s,
      shopping: {
        items: Array.isArray(legacyItems)
          ? legacyItems.map((i: any, idx: number) => ({
              id:        i.id ? String(i.id) : `shop_legacy_${idx}`,
              name:      i.name ?? i.item ?? "",
              category:  i.category ?? "Mercearia",
              quantity:  i.quantity,
              price:     0,
              done:      Boolean(i.done ?? i.checked),
              createdAt: i.createdAt ?? i.date ?? "",
            }))
          : [],
      },
      notes: {
        list: Array.isArray(legacyNotes)
          ? legacyNotes.map((n: any, idx: number) => ({
              id:        n.id ? String(n.id) : `note_legacy_${idx}`,
              title:     n.title ?? "",
              content:   n.content ?? n.text ?? "",
              color:     n.color ?? NOTE_COLORS[0],
              createdAt: n.createdAt ?? n.date ?? today(),
              updatedAt: n.updatedAt ?? n.date ?? today(),
            }))
          : [],
      },
      reminders: {
        list: Array.isArray(legacyReminders)
          ? legacyReminders.map((r: any, idx: number) => ({
              id:       r.id ? String(r.id) : `rem_legacy_${idx}`,
              title:    r.title ?? r.text ?? "",
              date:     r.date ?? "",
              time:     r.time,
              category: r.category ?? "Geral",
              priority: r.priority ?? "media",
              done:     Boolean(r.done),
              notes:    r.notes,
            }))
          : [],
      },
    };

    delete s.items;
    delete s.list;
  }

  // v1 -> v2: adiciona price=0 e normaliza category para seção do mercado
  if (fromVersion < 2) {
    s = {
      ...s,
      shopping: {
        items: (s?.shopping?.items ?? []).map((i: any) => ({
          ...i,
          price:    i.price ?? 0,
          category: LEGACY_MAP[i.category] ?? i.category ?? "Outros",
        })),
      },
    };
  }

  // v2 -> v3: adiciona createdAt em reminders existentes
  if (fromVersion < 3) {
    const fallback = today();
    s = {
      ...s,
      reminders: {
        list: ((s?.reminders as any)?.list ?? []).map((r: any) => ({
          ...r,
          createdAt: r.createdAt ?? fallback,
        })),
      },
    };
  }

  return s;
}
