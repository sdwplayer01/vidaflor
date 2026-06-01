---
name: vidaflor-arch
description: >
  SKILL de arquitetura técnica para o VidaFlor v2.0. Use junto com a SKILL vidaflor-app
  (design/UX) sempre que for criar, modificar ou revisar código da migração v2.0.
  Cobre: feature folders, contratos de store, Money em centavos, migrations versionadas,
  selectors transversais, shared utils, naming conventions e anti-patterns.
  Consulte antes de escrever qualquer linha de código da nova arquitetura.
metadata:
  categories: [architecture, react, typescript, zustand, migration]
  stack: [React 18, TypeScript, Zustand, Vite, CSS Modules]
  companion: vidaflor-app
  domain: vidaflor
  version: 2.0
  status: active
---

# SKILL: VidaFlor — Arquitetura v2.0

> Companheira obrigatória da SKILL `vidaflor-app`. Enquela cobre design/UX/microcopy,
> esta cobre estrutura, contratos, padrões e o que nunca fazer.
>
> **Plano de execução completo:** `VIDAFLOR_MIGRATION_PLAN.md` na raiz do projeto.

---

## Princípios (não negociáveis)

1. **Feature folder vertical** — tudo de um domínio mora junto: `features/financas/{types,store,selectors,utils,seed,migrations,components/,api/}`
2. **Stores não se importam entre si** — dado cruzado é trabalho de `selectors.ts`
3. **App.tsx é burro** — nenhum dado, nenhum `useState` de domínio; só lê `useNavStore`
4. **`window.storage` isolado** — SOMENTE em `shared/storage/adapter.ts`. Zero acesso direto em stores
5. **Money = centavos** — `type Money = number` (int). Nunca float. Nunca armazenar reais.
6. **Migration sempre presente** — todo store tem `_version: number` e `migrations.ts`
7. **Actions em pt-BR, verbos no infinitivo** — `adicionarTarefa`, nunca `addTask` ou `setState`
8. **IDs via `genId()`** — nunca `Date.now()` direto. Nunca int sequencial para dados do usuário.

---

## Estrutura de uma feature

```
src/features/<modulo>/
├── types.ts          — interfaces e types do domínio (dono do contrato)
├── store.ts          — useStore com Zustand + persistVidaFlor
├── selectors.ts      — hooks que retornam dados derivados (leitura)
├── utils.ts          — funções puras (sem React, sem store)
├── seed.ts           — estado inicial válido
├── migrations.ts     — migrate(state, fromVersion) + VERSION constante
├── api/
│   └── index.ts      — placeholder de integração futura (pode estar vazio)
└── components/
    └── *.tsx
```

Toda feature segue exatamente esta anatomia. Sem exceções.

---

## Contrato de Store

Todo store segue esta estrutura exata:

```typescript
// Estado sempre tem estes metadados:
interface BaseState {
  _version:  number;   // versão atual do schema
  _hydrated: boolean;  // true após carregar do storage
}

// Actions: verbos pt-BR, infinitivo, nome do domínio
// ✅ adicionarTarefa, marcarComoPago, trocarPerfilAtivo
// ❌ addTask, setData, update, setState, handleXxx

// Store criado sempre assim:
export const use<Modulo>Store = create<State & Actions>()(
  persistVidaFlor(
    (set, get) => ({ ...seed, ...actions }),
    {
      name:    STORAGE_KEYS.<MODULO>,
      version: <MODULO>_VERSION,
      migrate: migrate,
    }
  )
);
```

`persistVidaFlor` é o middleware em `shared/storage/persist-middleware.ts` que:
- usa o `adapter.ts` (nunca `window.storage` direto)
- aplica `migrate()` antes de hidratar
- define `_hydrated = true` ao terminar
- debounce de 300ms entre saves

---

## Contrato de tipos base (shared)

```typescript
// shared/types/common.ts
type ID          = string;
type ISODate     = string;      // 'YYYY-MM-DD'
type ISODateTime = string;      // ISO 8601 completo
type Money       = number;      // CENTAVOS, sempre int
type HexColor    = string;      // '#RRGGBB'
type Emoji       = string;
type IsoMonth    = string;      // 'YYYY-MM'
```

---

## Regras de Money (crítico)

```typescript
// shared/utils/money.ts — ÚNICA fonte de verdade para dinheiro

// Armazenar: sempre em centavos (int)
const valor: Money = 125000;       // R$ 1.250,00

// Converter para exibição
formatBRL(125000)   // → 'R$ 1.250,00'
toReais(125000)     // → 1250.00

// Converter de input do usuário
parseBRL('1.250,00') // → 125000
toCents(1250)        // → 125000

// Somar com segurança
sumMoney([125000, 75000]) // → 200000  (nunca usar .reduce com floats)

// PARCELAMENTO — regra obrigatória de arredondamento
// parcela base = Math.floor(total / n)
// resto        = total - (base * n)
// última parcela recebe o resto
// garante: sum(parcelas) === total EXATO
```

**Nunca:**
```typescript
// ❌ float no storage
{ val: 1250.50 }

// ❌ cálculo com reais
const parcela = 1250.50 / 3;    // → 416.8333...

// ❌ formatação inline
`R$ ${(valor / 100).toFixed(2)}`  // duplicar lógica
```

---

## Contrato de Migrations

```typescript
// features/<modulo>/migrations.ts

export const <MODULO>_VERSION = N;

export function migrate(state: any, fromVersion: number): any {
  let s = state;

  if (fromVersion < 1) {
    // descrever o que mudou do schema original
    s = { ...s, novoCampo: valorDefault };
  }

  if (fromVersion < 2) {
    // descrever mudança v1 → v2
  }

  // fromVersion >= N: retorna sem alterar
  return s;
}
```

**Migration de Money (obrigatória na feature financas):**
```typescript
// v0 → v1: campo `val` (float, reais) vira `amount` (int, centavos)
transactions: s.transactions.map((t: any) => ({
  ...t,
  amount: Math.round((t.val ?? 0) * 100),   // float → centavos
}))

// budget (objeto de meses): mesma conversão
budget: Object.fromEntries(
  Object.entries(s.budget ?? {}).map(([m, v]) => [m, Math.round(Number(v) * 100)])
)
```

**Migration de Ciclo (obrigatória na feature saude):**
```typescript
// v0 → v1: data.cycle (raiz) → profiles[0].cycle
profiles: [{
  ...perfilBase,
  cycle: state.cycle ? {
    start:   state.cycle.start,
    lenDays: state.cycle.len ?? 28,
    menses:  state.cycle.menses ?? 5,
  } : undefined,
}]
```

---

## Contrato de Selectors

Selectors são hooks que leem de um ou mais stores e retornam dados derivados.
**Componentes nunca calculam. Stores nunca importam stores. Selectors são a ponte.**

```typescript
// Padrão de selector simples (mesma feature):
export function useTarefasDoTurno(turno: Turno): Tarefa[] {
  return useRotinaStore(s => s.tarefas[turno]);
}

// Padrão de selector derivado (cálculo via utils):
export function useProgressoDoDia(): { feitas: number; total: number; pct: number } {
  const state = useRotinaStore();
  return calcProgressoDoDia(state, today());
}

// Padrão transversal (múltiplos stores — só no bloom/):
export function useBloomDoDia(day?: ISODate): BloomBreakdown {
  const rotinaPct    = useRotinaStore(s => calcRotinaPct(s, day ?? today()));
  const waterPct     = useSaudeStore(s => calcAguaPctPerfilAtivo(s, day ?? today()));
  const espiritualPct= useEspiritualStore(s => calcEspiritualPct(s, day ?? today()));
  return calcBloom({ rotinaPct, waterPct, espiritualPct });
}
```

---

## Contrato de Utils

Funções puras. Zero React. Zero imports de store. Testáveis isoladamente.

```typescript
// features/<modulo>/utils.ts

// Sempre tipadas:
export function calcProgressoDoDia(state: RotinaState, day: ISODate): {
  feitas: number;
  total:  number;
  pct:    number;
}

// Nunca assim:
export function calcAlgumaCoisa(data: any) { ... }  // ❌ any proibido
```

---

## Stores das 4 Rotinas

A experiência de Rotina é unificada externamente, mas 4 features isoladas internamente:

```
features/rotina/    → Minha Rotina (adulto)    — STORAGE_KEYS.ROTINA
features/kids/      → Rotina Crianças           — STORAGE_KEYS.KIDS
features/casa/      → Rotina da Casa            — STORAGE_KEYS.CASA
features/pets/      → Rotina dos Pets           — STORAGE_KEYS.PETS
```

A screen `features/rotina-shell/RotinaScreen.tsx` orquestra as 4 views via sub-state local (`'eu' | 'kids' | 'casa' | 'pets'`). Ela **não importa stores** — cada View já lê os seus.

**Casa** tem `Recorrencia` tipada:
```typescript
type Recorrencia =
  | { tipo: 'diaria' }
  | { tipo: 'semanal'; diasSemana: number[] }
  | { tipo: 'mensal'; diaMes: number }
  | { tipo: 'avulsa' };
```

**Pets** têm `done` com contagem (não boolean) para cuidados com `frequenciaDia > 1`:
```typescript
done: Record<ISODate, Record<ID, number>>  // { day: { cuidadoId: countFeito } }
```

---

## Organiza — 1 store, 3 slices

```typescript
// 1 key no storage: STORAGE_KEYS.ORGANIZA
// Estado:
interface OrganizaState {
  shopping:  ShoppingSlice;
  notes:     NotesSlice;
  reminders: RemindersSlice;
  _version:  number;
  _hydrated: boolean;
}
// Slices são isolados LOGICAMENTE mas persistidos juntos.
// Selectors filtram por slice.
```

---

## Navegação

```typescript
// features/nav/store.ts
interface NavState {
  currentRoute: RouteKey;
  history:      RouteKey[];
  _hydrated:    boolean;
}
interface NavActions {
  irPara: (route: RouteKey) => void;
  voltar: () => void;
}

// Qualquer componente em qualquer profundidade:
const { irPara } = useNavStore();
irPara('financas');

// App.tsx apenas:
const { currentRoute } = useNavStore();
const { component: Screen } = ROUTES[currentRoute];
return <AppShell><Screen /></AppShell>;
```

---

## Shared hooks disponíveis

```typescript
// shared/hooks/
useDebounce<T>(value: T, delay: number): T
useDisclosure(initial?: boolean): { isOpen, open, close, toggle }
useMounted(): () => boolean         // retorna fn que diz se ainda está montado
usePrevious<T>(value: T): T | undefined
useIsMobile(breakpoint?: number): boolean
```

---

## Imports — regras estritas

```typescript
// ✅ Dentro da mesma feature:
import { Tarefa } from './types';
import { useRotinaStore } from './store';

// ✅ Shared via alias:
import { today } from '@/shared/utils/date';
import { formatBRL } from '@/shared/utils/money';
import { genId } from '@/shared/utils/id';
import type { Money, ISODate } from '@/shared/types/common';

// ✅ Cross-feature SOMENTE via types ou selectors:
import type { HealthProfile } from '@/features/saude/types';
import { useBloomDoDia } from '@/features/bloom/selectors';

// ❌ PROIBIDO — importar store de outra feature:
import { useSaudeStore } from '@/features/saude/store';  // só no bloom/selectors!

// ❌ PROIBIDO — window.storage fora do adapter:
window.storage.set('key', value);  // sempre via adapter.ts
```

---

## Naming conventions

| Item | Padrão | Exemplo |
|---|---|---|
| Componentes | PascalCase.tsx | `TaskItem.tsx` |
| Hooks | camelCase com `use` | `useBloomPct.ts` |
| Stores | `store.ts` | `features/rotina/store.ts` |
| Tipos | `types.ts` | `features/saude/types.ts` |
| Selectors | `selectors.ts` | `features/financas/selectors.ts` |
| Utils | `utils.ts` | `features/casa/utils.ts` |
| Seeds | `seed.ts` | `features/kids/seed.ts` |
| Migrations | `migrations.ts` | `features/espiritual/migrations.ts` |
| API stub | `api/index.ts` | `features/integrations/google/api/index.ts` |
| Actions | verbo pt-BR infinitivo | `adicionarCartao`, `marcarComoPago` |
| IDs | `genId(prefix?)` | `genId('grp')` → `'grp_abc123...'` |
| Storage keys | `STORAGE_NAMESPACE:modulo` | `'vidaflor:financas'` |

---

## Anti-patterns (o que NUNCA fazer)

```typescript
// ❌ Prop drilling de dados
<Screen data={data} setData={setData} />

// ❌ Store importando outro store
import { useSaudeStore } from '../saude/store';  // dentro de rotinaStore!

// ❌ window.storage fora do adapter
window.storage.get('vidaflor_data');

// ❌ Date.now() como ID
id: Date.now()

// ❌ float para dinheiro
amount: 150.75

// ❌ Cor hardcoded fora de themes.ts
background: '#E8799A'

// ❌ any fora de migrations
function calcAlgo(data: any) { }

// ❌ Lógica de cálculo dentro de componente
function MeuComponente() {
  const saldo = transactions.reduce((s, t) => s + t.amount, 0);  // isso é utils!
}

// ❌ Schema novo sem migration
const DEF_STATE = { ..., novoCampo: [] };  // sem incrementar _version e migrate()

// ❌ Action em inglês
adicionarCartao: (c) => ...   // ✅
addCard: (c) => ...            // ❌
```

---

## Critérios de aceite arquitetural (qualquer fase)

- [ ] `grep -r "window\.storage" src/` → só em `shared/storage/adapter.ts`
- [ ] `grep -r "setData" src/` → zero ocorrências
- [ ] `grep -r "Date\.now()" src/` → só em `shared/utils/id.ts` (fallback)
- [ ] `grep -r ": any" src/` → só em arquivos `migrations.ts`
- [ ] `grep -r "#[0-9A-Fa-f]\{6\}" src/` → só em `shared/constants/themes.ts`
- [ ] Build TypeScript sem erros (`npm run build`)
- [ ] Nenhum import de store cross-feature (exceto `bloom/selectors.ts`)

---

## Referência rápida de fases

| Fase | Escopo | Pré-requisito |
|---|---|---|
| 0 | Fundação (shared, nav, config, shell) | — |
| 1 | Espiritual | FASE 0 |
| 2 | Organiza (3 slices) | FASE 0 |
| 3 | Saúde + Bloom | FASE 0 |
| 4 | Rotina Unificada (4 features + shell) | FASE 3 |
| 5 | Finanças | FASE 0 |
| 6 | Limpeza final | FASES 1–5 |

Consultar `VIDAFLOR_MIGRATION_PLAN.md` para contratos completos de cada fase.

---

## Como usar junto com `vidaflor-app`

```
vidaflor-app  → define O QUÊ construir (design, UX, microcopy, SCLC-G, T_DESIGN)
vidaflor-arch → define COMO construir (estrutura, tipos, stores, migrations, regras)
```

Toda solicitação de código usa as duas SKILLs:

```
"Crie [feature/componente] seguindo as SKILLs vidaflor-app + vidaflor-arch:

1. Feature: [descrição]
2. Fase: [0-6]
3. Feature folder: features/<modulo>/
4. Contratos relevantes: [types a respeitar]
5. Referência no plano: seção [X] do VIDAFLOR_MIGRATION_PLAN.md"
```
