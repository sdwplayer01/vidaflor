// src/features/financas/migrations.ts

export const FINANCAS_VERSION = 3;

export function migrate(state: any, fromVersion: number): any {
  let s = state;

  // v0 -> v1: val (float reais) -> amount (int centavos)
  if (fromVersion < 1) {
    s = {
      ...s,
      transactions: (s.transactions || []).map((t: any) => ({
        id:          String(t.id ?? Math.random()),
        desc:        t.desc ?? '',
        amount:      Math.round((t.val ?? 0) * 100),
        type:        t.type ?? 'expense',
        category:    t.cat ?? t.category ?? 'outros',
        date:        t.date ?? '2024-01-01',
        due:         t.due,
        paid:        !!t.paid,
        cardId:      t.cardId ? String(t.cardId) : null,
        installment: t.installment
          ? { ...t.installment, groupId: String(t.installment.groupId) }
          : null,
        createdAt:   t.createdAt ?? t.date ?? '2024-01-01',
      })),
      cards: (s.cards || []).map((c: any) => ({
        ...c,
        id:     String(c.id ?? Math.random()),
        active: c.active ?? true,
      })),
      budget: Object.fromEntries(
        Object.entries(s.budget ?? {}).map(([m, v]) => [m, Math.round(Number(v) * 100)])
      ),
    };
  }

  // v1 -> v2: campos opcionais (recorrencia, paidFaturaRef) — nenhuma acao necessaria
  // pois os campos sao opcionais e undefined e valido.

  // v2 -> v3: budget Record<IsoMonth, Money> -> Record<IsoMonth, BudgetEntry>
  if (fromVersion < 3) {
    const oldBudget: Record<string, any> = s.budget ?? {};
    const newBudget: Record<string, any> = {};
    for (const [mes, val] of Object.entries(oldBudget)) {
      if (typeof val === 'number') {
        // formato antigo: converte para BudgetEntry
        newBudget[mes] = { total: val, porCategoria: {} };
      } else if (val && typeof val === 'object' && 'total' in val) {
        // ja no novo formato
        newBudget[mes] = { total: val.total ?? 0, porCategoria: val.porCategoria ?? {} };
      }
    }
    s = { ...s, budget: newBudget };
  }

  return s;
}
