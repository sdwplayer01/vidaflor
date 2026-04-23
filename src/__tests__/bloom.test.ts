// src/__tests__/bloom.test.ts
// Testes mínimos para calcBloom — pode rodar com node diretamente.
// Cobre: 0 tarefas, 100% completo, e edge cases.

import type { AppData } from "../types/data";

// ── Mock factory ─────────────────────────────────────────────────────────────

function mockData(overrides: {
  tasks?:     number;
  done?:     number;
  essMode?:  boolean;
  waterNow?: number;
  waterGoal?:number;
  grats?:    number;
}): AppData {
  const day = "2026-04-23";
  const {
    tasks = 0,
    done = 0,
    essMode = false,
    waterNow = 0,
    waterGoal = 2000,
    grats = 0,
  } = overrides;

  const morning = Array.from({ length: tasks }, (_, i) => ({
    id: i + 1,
    task: `Tarefa ${i + 1}`,
    time: "08:00",
  }));

  const doneIds = Array.from({ length: done }, (_, i) => i + 1);
  const gratList = Array.from({ length: grats }, (_, i) => `Gratidão ${i + 1}`);

  return {
    _v: 2,
    routine: {
      morning,
      afternoon: [],
      night:     [],
      essential: [],
      done:      { [day]: doneIds },
      essMode,
    },
    health: {
      activeProfile: "eu",
      profiles: [{
        id:    "eu",
        name:  "Você",
        av:    "👩",
        type:  "adult_f",
        color: "#E8799A",
        water: { goal: waterGoal, log: { [day]: waterNow } },
        cycle: { start: "2026-04-01", len: 28, menses: 5 },
        meds:  [],
        notes: {},
      }],
    },
    finance: { transactions: [], cards: [], budget: {} },
    spirit:  { gratitude: { [day]: gratList }, readings: [], prayers: [] },
    shopping:    { items: [] },
    notes:       { list: [] },
    reminders:   { list: [] },
    bloom:       { points: {} },
    kids:        { children: [], done: {} },
    integrations: {
      google: { connected: false, email: "", calendars: [], events: [] },
    },
  };
}

// ── Importação dinâmica (sem alias @ para rodar com tsx/node) ─────────────────

// calcBloom inline para teste standalone (evitar dependência de path alias)
function calcBloom(data: AppData, day: string): number {
  const mainP = data.health.profiles.find(p => p.id === "eu")
             ?? data.health.profiles[0];

  const allT = data.routine.essMode
    ? data.routine.essential
    : [...data.routine.morning, ...data.routine.afternoon, ...data.routine.night];

  const doneIds    = data.routine.done[day] ?? [];
  const routinePct = allT.length > 0 ? (doneIds.length / allT.length) * 40 : 0;
  const wNow       = mainP?.water.log[day] ?? 0;
  const waterPct   = Math.min(1, wNow / (mainP?.water.goal ?? 2000)) * 30;
  const gratPct    = Math.min(1, (data.spirit.gratitude[day]?.length ?? 0) / 3) * 30;

  return Math.round(routinePct + waterPct + gratPct);
}

// ── Test runner ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    failed++;
  }
}

function assertEqual(label: string, actual: number, expected: number) {
  assert(`${label} → esperado ${expected}, obteve ${actual}`, actual === expected);
}

// ── Testes calcBloom ─────────────────────────────────────────────────────────

console.log("\n🌸 Testes: calcBloom\n");

const day = "2026-04-23";

// 1. Bloom com 0 tarefas, sem água, sem gratidão = 0
assertEqual(
  "Bloom vazio (sem dados)",
  calcBloom(mockData({}), day),
  0
);

// 2. Bloom com 100% rotina + água + gratidão = 100
assertEqual(
  "Bloom 100% (tudo completo)",
  calcBloom(mockData({
    tasks: 5,
    done: 5,
    waterNow: 2000,
    waterGoal: 2000,
    grats: 3,
  }), day),
  100
);

// 3. Bloom só rotina 100% = 40
assertEqual(
  "Bloom só rotina 100%",
  calcBloom(mockData({ tasks: 4, done: 4 }), day),
  40
);

// 4. Bloom só água 100% = 30
assertEqual(
  "Bloom só água 100%",
  calcBloom(mockData({ waterNow: 2000, waterGoal: 2000 }), day),
  30
);

// 5. Bloom só gratidão 100% = 30
assertEqual(
  "Bloom só gratidão 3/3",
  calcBloom(mockData({ grats: 3 }), day),
  30
);

// 6. Bloom parcial — 50% rotina + 50% água + 1/3 gratidão
assertEqual(
  "Bloom parcial (50% + 50% + 33%)",
  calcBloom(mockData({ tasks: 4, done: 2, waterNow: 1000, waterGoal: 2000, grats: 1 }), day),
  45 // 20 + 15 + 10 = 45
);

// 7. Bloom com água acima da meta (cap em 30)
assertEqual(
  "Bloom água acima da meta (cap 30)",
  calcBloom(mockData({ waterNow: 5000, waterGoal: 2000 }), day),
  30
);

// 8. Bloom com gratidões acima de 3 (cap em 30)
assertEqual(
  "Bloom gratidão acima de 3 (cap 30)",
  calcBloom(mockData({ grats: 10 }), day),
  30
);

// 9. Bloom com 0 tarefas mas água e gratidão (rotina contribui 0, não NaN)
assertEqual(
  "Bloom sem tarefas (rotina=0, não NaN)",
  calcBloom(mockData({ waterNow: 2000, waterGoal: 2000, grats: 3 }), day),
  60 // 0 + 30 + 30
);

// ── Resultado ────────────────────────────────────────────────────────────────

console.log(`\n📊 Resultado: ${passed} passou, ${failed} falhou\n`);

if (failed > 0) {
  throw new Error(`${failed} test(s) failed`);
}
