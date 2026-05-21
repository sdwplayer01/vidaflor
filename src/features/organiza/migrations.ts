// src/features/organiza/migrations.ts
export const ORGANIZA_VERSION = 1;

export function migrate(state: any, fromVersion: number): any {
  let s = state;

  // v0 -> v1: unifica arrays soltos em slices tipadas
  if (fromVersion < 1) {
    // Dados legados tinham arrays diretos no root
    const legacyItems = s?.shopping ?? s?.items ?? [];
    const legacyNotes = s?.notes ?? s?.list ?? [];
    const legacyReminders = s?.reminders ?? [];

    s = {
      ...s,
      shopping: {
        items: Array.isArray(legacyItems)
          ? legacyItems.map((i: any, idx: number) => ({
              id:        i.id ? String(i.id) : `shop_legacy_${idx}`,
              name:      i.name ?? i.item ?? "",
              category:  i.category ?? "Geral",
              quantity:  i.quantity,
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
              color:     n.color ?? "#FFFFFF",
              createdAt: n.createdAt ?? n.date ?? "",
              updatedAt: n.updatedAt ?? n.date ?? "",
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

  return s;
}
