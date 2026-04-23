// src/__tests__/cycle.test.ts
// Testes mínimos para calcCycleState — pode rodar com node diretamente.
// Cobre: dia 0, período fértil, TPM, menstrual, e wrap-around.

// Inline da função para rodar sem path alias
interface CycleState {
  dc:       number;
  dl:       number;
  isTPM:    boolean;
  isFertil: boolean;
  isMenses: boolean;
  phase:    "Menstrual" | "Folicular" | "Lútea";
}

function calcCycleState(
  day:    string,
  start:  string,
  len:    number,
  menses: number
): CycleState {
  const ds = Math.floor(
    (new Date(day).getTime() - new Date(start).getTime()) / 86_400_000
  );
  const dc = ((ds % len) + len) % len;
  const dl = len - dc;

  return {
    dc,
    dl,
    isTPM:    dl <= 7,
    isFertil: dc >= 10 && dc <= 16,
    isMenses: dc < menses,
    phase:    dc < menses ? "Menstrual" : dc < 14 ? "Folicular" : "Lútea",
  };
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

// ── Testes ────────────────────────────────────────────────────────────────────

console.log("\n🩺 Testes: calcCycleState\n");

const start  = "2026-04-01";
const len    = 28;
const menses = 5;

// 1. Dia 0 (mesmo dia do início) → Menstrual
{
  const s = calcCycleState("2026-04-01", start, len, menses);
  assert(`Dia 0: dc=${s.dc}, phase=${s.phase}`, s.dc === 0 && s.isMenses && s.phase === "Menstrual");
}

// 2. Dia 4 (último dia menstrual) → ainda Menstrual
{
  const s = calcCycleState("2026-04-05", start, len, menses);
  assert(`Dia 4: dc=${s.dc}, isMenses=${s.isMenses}`, s.dc === 4 && s.isMenses);
}

// 3. Dia 5 → Folicular (pós-menstrual)
{
  const s = calcCycleState("2026-04-06", start, len, menses);
  assert(`Dia 5: phase=${s.phase}, isMenses=${s.isMenses}`, s.dc === 5 && !s.isMenses && s.phase === "Folicular");
}

// 4. Dia 10 → Início do período fértil
{
  const s = calcCycleState("2026-04-11", start, len, menses);
  assert(`Dia 10: isFertil=${s.isFertil}`, s.dc === 10 && s.isFertil);
}

// 5. Dia 13 → Pico do período fértil
{
  const s = calcCycleState("2026-04-14", start, len, menses);
  assert(`Dia 13: isFertil=${s.isFertil}, phase=${s.phase}`, s.dc === 13 && s.isFertil && s.phase === "Folicular");
}

// 6. Dia 16 → Último dia fértil
{
  const s = calcCycleState("2026-04-17", start, len, menses);
  assert(`Dia 16: isFertil=${s.isFertil}`, s.dc === 16 && s.isFertil);
}

// 7. Dia 17 → Lútea, não fértil
{
  const s = calcCycleState("2026-04-18", start, len, menses);
  assert(`Dia 17: phase=${s.phase}, isFertil=${s.isFertil}`, s.dc === 17 && !s.isFertil && s.phase === "Lútea");
}

// 8. Dia 21 → TPM (dl <= 7)
{
  const s = calcCycleState("2026-04-22", start, len, menses);
  assert(`Dia 21: isTPM=${s.isTPM}, dl=${s.dl}`, s.dc === 21 && s.isTPM && s.dl === 7);
}

// 9. Dia 27 → Último dia do ciclo, TPM
{
  const s = calcCycleState("2026-04-28", start, len, menses);
  assert(`Dia 27: dc=${s.dc}, dl=${s.dl}, isTPM=${s.isTPM}`, s.dc === 27 && s.dl === 1 && s.isTPM);
}

// 10. Dia 28 → Wrap-around para dia 0 do próximo ciclo
{
  const s = calcCycleState("2026-04-29", start, len, menses);
  assert(`Dia 28 (wrap): dc=${s.dc}, isMenses=${s.isMenses}`, s.dc === 0 && s.isMenses);
}

// 11. Dia antes do start → módulo positivo (não crash)
{
  const s = calcCycleState("2026-03-25", start, len, menses);
  assert(`Dia antes do start (módulo positivo): dc=${s.dc} >= 0`, s.dc >= 0 && s.dc < len);
}

// ── Resultado ────────────────────────────────────────────────────────────────

console.log(`\n📊 Resultado: ${passed} passou, ${failed} falhou\n`);

if (failed > 0) {
  throw new Error(`${failed} test(s) failed`);
}
