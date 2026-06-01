// @ts-nocheck -- standalone test, run with: npx tsx <file>
export {};
// src/__tests__/money.test.ts
// Testes para parseBRL, formatBRL, toCents, toReais, arredondamento de parcelas.
// Pode rodar com: npx tsx src/__tests__/money.test.ts

// ── Inline das funções (sem path alias) ───────────────────────────────────────
function parseBRL(val: string): number {
  const clean = val.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : Math.round(n * 100);
}
function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function toCents(reais: number): number { return Math.round(reais * 100); }
function toReais(cents: number): number { return cents / 100; }

function gerarParcelas(total: number, n: number): number[] {
  const base  = Math.floor(total / n);
  const resto = total - base * n;
  return Array.from({ length: n }, (_, i) => (i === n - 1 ? base + resto : base));
}

// ── Runner ─────────────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
function assert(label: string, condition: boolean) {
  if (condition) { console.log(`  ✅ ${label}`); passed++; }
  else           { console.error(`  ❌ ${label}`); failed++; }
}
function assertEqual<T>(label: string, actual: T, expected: T) {
  assert(`${label} → esperado ${expected}, obteve ${actual}`, actual === expected);
}

console.log("\n💰 Testes: money\n");

// parseBRL
assertEqual("parseBRL '100,00'",   parseBRL("100,00"),   10000);
assertEqual("parseBRL '1.250,50'", parseBRL("1.250,50"), 125050);
assertEqual("parseBRL '0,99'",     parseBRL("0,99"),     99);
assertEqual("parseBRL ''",         parseBRL(""),         0);
assertEqual("parseBRL 'abc'",      parseBRL("abc"),      0);

// formatBRL
assertEqual("formatBRL 10000",  formatBRL(10000),  "100,00");
assertEqual("formatBRL 99",     formatBRL(99),     "0,99");
assertEqual("formatBRL 125050", formatBRL(125050), "1.250,50");

// toCents / toReais
assertEqual("toCents 10.5",  toCents(10.5),  1050);
assertEqual("toReais 1050",  toReais(1050),  10.5);
assertEqual("toCents 0",     toCents(0),     0);

// Arredondamento de parcelas: soma === total exato
{
  const total = 10000; // R$100,00
  const p3    = gerarParcelas(total, 3);
  const sum3  = p3.reduce((a, b) => a + b, 0);
  assert(`3x R$100 soma exata (${sum3} === ${total})`, sum3 === total);
  assert(`3x R$100 — última parcela absorve resto`, p3[2]! >= p3[0]!);
}
{
  const total = 100; // R$1,00
  const p3    = gerarParcelas(total, 3);
  assertEqual("1,00 ÷ 3 → soma exata", p3.reduce((a,b)=>a+b,0), total);
}
{
  const total = 999;
  const p4    = gerarParcelas(total, 4);
  assertEqual("999 ÷ 4 → soma exata", p4.reduce((a,b)=>a+b,0), total);
}

console.log(`\n📊 Resultado: ${passed} passou, ${failed} falhou\n`);
if (failed > 0) throw new Error(`${failed} test(s) failed`);
