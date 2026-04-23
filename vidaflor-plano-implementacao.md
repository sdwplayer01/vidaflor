# 🌸 VidaFlor — Plano de Implementação v1.1 → v2.0
**Baseado na SKILL SCLC-G + análise do repositório `sdwplayer01/vidaflor`**
**Gerado em:** Abril 2026

---

## 1. DIAGNÓSTICO DO ESTADO ATUAL

### O que o repositório tem hoje

| Arquivo | Linhas | Papel | Problemas identificados |
|---|---|---|---|
| `src/main.jsx` | ~2.000+ | App monolítico + todas as screens | Acima do limite de 300 linhas por módulo |
| `FinancasScreen-v2.jsx` | 739 | Screen extraída (padrão correto) | JSX + inline styles + props drilling |
| `saude-v2.jsx` | ~600 est. | Screen extraída (padrão correto) | JSX + inline styles + props drilling |
| `clean_ui.js` / `clean_ui_pt3.js` | — | Scripts de migração ad-hoc | Indica tentativas manuais sem plano |
| `replace.js` / `replace.py` | — | Scripts de replace de strings | Solução paliativa sem arquitetura |
| `test.cjs` | — | Testes manuais sem framework | Sem cobertura sistematizada |
| `vite.config.js` | — | Build config | OK, base para CSS Modules |
| `package.json` | 24 | Deps | **Sem Zustand, sem TypeScript compiler** |

### Stack real vs. Stack declarada na SKILL

| Item | SKILL declara | Repositório hoje | Gap |
|---|---|---|---|
| TypeScript | React 18 + TS | JSX puro | ❌ Não iniciado |
| Zustand | Stores por módulo | `useState` monolítico | ❌ Não instalado |
| CSS Modules | `.module.css` | 100% inline styles | ❌ Não iniciado |
| CSS Variables | `tokens.css` | Objeto `T` direto no JSX | ❌ Não criado |
| `applyTheme()` | Troca via JS | Prop drilling de `T` | ❌ Não criado |
| Extração de screens | > 300 linhas → arquivo | Feito em 2 módulos | ⚠️ Parcial |
| CRUD completo | 10 módulos ✅ | 10 módulos ✅ | ✅ OK |
| Bloom integrado | calcBloom() | Implementado | ✅ OK |
| T_DESIGN 5 temas | Implementado | Implementado | ✅ OK |

### Bugs de arquitetura identificados no código

1. **Re-render global** — `setData` monolítico causa re-render de todos os módulos ao marcar uma única tarefa de rotina
2. **Props drilling de `T`** — tema repassado 3–4 níveis de profundidade em toda screen extraída
3. **IDs misturados** — seed data usa inteiros (`1, 2, 3`), dados do usuário usam `Date.now()` (13 dígitos); sem tipagem que impeça mistura
4. **Schema sem migração** — `DEF_DATA` evoluiu (`cycle` foi movido para `health.profiles[].cycle`) mas dados salvos antigos podem quebrar
5. **Scripts ad-hoc de replace** — `clean_ui.js`, `replace.py` indicam refatoração manual sem plano, risco de regressão silenciosa
6. **Ausência de touch feedback** — inline styles não suportam `:active`, `:hover`, `-webkit-tap-highlight-color`
7. **`cardId` desconectado** — campo existe na interface mas pode não estar ligado ao formulário em alguns fluxos

---

## 2. VISÃO DO ESTADO FINAL (v2.0)

```
vidaflor/
├── index.html
├── tsconfig.json                    ← NOVO
├── vite.config.ts                   ← renomear
├── package.json                     ← + zustand
├── src/
│   ├── main.tsx                     ← renomear
│   ├── App.tsx                      ← extraído de main
│   │
│   ├── types/
│   │   └── data.ts                  ← NOVO: todas as interfaces
│   │
│   ├── styles/
│   │   └── tokens.css               ← NOVO: CSS Variables
│   │
│   ├── utils/
│   │   ├── bloom.ts                 ← extraído + tipado
│   │   ├── cycle.ts                 ← extraído + tipado
│   │   ├── applyTheme.ts            ← NOVO
│   │   ├── date.ts                  ← helpers today(), fmtBRL()
│   │   └── storage.ts               ← wrapper window.storage
│   │
│   ├── stores/                      ← NOVO: Zustand
│   │   ├── rotinaStore.ts
│   │   ├── saudeStore.ts
│   │   ├── financasStore.ts
│   │   ├── espiritStore.ts
│   │   ├── organizaStore.ts
│   │   ├── bloomStore.ts            ← derived (lê 3 stores)
│   │   └── configStore.ts
│   │
│   ├── components/
│   │   ├── shared/
│   │   │   ├── Card.tsx + Card.module.css
│   │   │   ├── Sheet.tsx + Sheet.module.css
│   │   │   ├── Btn.tsx + Btn.module.css
│   │   │   ├── Toggle.tsx + Toggle.module.css
│   │   │   ├── Chip.tsx + Chip.module.css
│   │   │   ├── FInput.tsx + FInput.module.css
│   │   │   ├── ProgressBar.tsx + ProgressBar.module.css
│   │   │   └── ConfirmDel.tsx
│   │   │
│   │   ├── nav/
│   │   │   └── BottomNav.tsx + BottomNav.module.css
│   │   │
│   │   └── bloom/
│   │       └── BloomFlower.tsx + BloomFlower.module.css
│   │
│   └── screens/
│       ├── HomeScreen.tsx
│       ├── RotinaScreen.tsx
│       ├── SaudeScreen.tsx          ← migrar de saude-v2.jsx
│       ├── EspiritualScreen.tsx
│       ├── OrganizaScreen.tsx
│       ├── FinancasScreen.tsx       ← migrar de FinancasScreen-v2.jsx
│       └── ConfigScreen.tsx
│
└── .github/workflows/
    └── deploy.yml                   ← CI/CD GitHub Pages (existente)
```

---

## 3. ROADMAP DE FASES

### Critério de sequenciamento

As fases são ordenadas por **impacto vs. risco**: cada fase entrega valor independente e não bloqueia o app em produção. É uma **migração incremental**, não uma reescrita.

```
FASE 0 — Fundação (2–3 dias)        → sem mudar comportamento visível
FASE 1 — TypeScript base (3–5 dias) → tipos + funções puras
FASE 2 — CSS Tokens (2–3 dias)      → tokens.css + applyTheme
FASE 3 — Componentes base (3–4 dias)→ shared components com CSS Modules
FASE 4 — Zustand (5–7 dias)         → stores por módulo
FASE 5 — Screens (7–10 dias)        → migrar screens para .tsx + stores
FASE 6 — Polimento (2–3 dias)       → touch feedback, animações, testes
```

**Total estimado:** 24–35 dias em ritmo consultivo (não full-time)

---

## 4. FASE 0 — FUNDAÇÃO

**Objetivo:** Estruturar o projeto sem quebrar nada. Limpar scripts ad-hoc.

### 4.1 Instalar dependências

```bash
# Zustand
npm install zustand

# TypeScript (já tem @types, precisa do compilador)
npm install -D typescript

# Verificar versões
npx tsc --version   # deve ser 5.x
```

### 4.2 Criar tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "allowJs": true,
    "checkJs": false,
    "skipLibCheck": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

> **Nota:** `"allowJs": true` + `"checkJs": false` permite que `.jsx` antigos coexistam sem erros de compilação enquanto a migração acontece.

### 4.3 Atualizar vite.config.js para .ts

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  base: "/vidaflor/",
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
});
```

### 4.4 Criar estrutura de pastas

```bash
mkdir -p src/types
mkdir -p src/styles
mkdir -p src/utils
mkdir -p src/stores
mkdir -p src/components/shared
mkdir -p src/components/nav
mkdir -p src/components/bloom
mkdir -p src/screens
```

### 4.5 Mover/renomear arquivos existentes

```bash
# Mover screens extraídas para pasta correta
cp FinancasScreen-v2.jsx src/screens/FinancasScreen.jsx
cp saude-v2.jsx src/screens/SaudeScreen.jsx

# NÃO deletar os originais ainda — manter como fallback até migração completa
```

### 4.6 Limpar scripts ad-hoc

- Mover `clean_ui.js`, `clean_ui_pt3.js`, `replace.js`, `replace.py`, `test.cjs` para pasta `/scripts/legacy/`
- Documentar o que cada um fazia em `scripts/legacy/README.md`
- **Não executar mais esses scripts** — a migração passa a ser gerenciada pelas fases deste plano

### 4.7 Configurar GitHub Actions para build TypeScript

```yaml
# .github/workflows/deploy.yml — adicionar step de type-check
- name: Type check
  run: npx tsc --noEmit
```

---

## 5. FASE 1 — TYPESCRIPT BASE

**Objetivo:** Criar o contrato de dados. Eliminar a categoria de bugs de schema.

### 5.1 Criar src/types/data.ts

Este é o arquivo mais importante da migração. Define o contrato de todo `DEF_DATA`.

```typescript
// src/types/data.ts

// ── Enums e literais ──────────────────────────────────────────────────────────

export type ProfileType  = "adult_f" | "adult_m" | "child" | "pet";
export type TransType    = "income" | "expense";
export type TabKey       = "home" | "rotina" | "saude" | "espiritual" | "organiza" | "financas" | "config";
export type ThemeKey     = "pastel" | "terra" | "lilac" | "neutro" | "sage";
export type Priority     = "alta" | "media" | "baixa";

// ── Saúde ──────────────────────────────────────────────────────────────────

export interface WaterLog {
  goal: number;
  log:  Record<string, number>; // "YYYY-MM-DD" → ml
}

export interface CycleConfig {
  start:  string; // "YYYY-MM-DD"
  len:    number;
  menses: number;
}

export interface Medication {
  id:   string;
  name: string;
  dose: string;
  time: string;
  log:  Record<string, boolean>; // "YYYY-MM-DD" → tomado
}

export interface HealthProfile {
  id:     string;
  name:   string;
  av:     string;
  type:   ProfileType;
  color:  string;
  water:  WaterLog;
  cycle?: CycleConfig;   // undefined em non-adult_f
  meds:   Medication[];
  notes:  Record<string, string>; // "YYYY-MM-DD" → texto
}

export interface HealthData {
  activeProfile: string;
  profiles:      HealthProfile[];
}

// ── Rotina ────────────────────────────────────────────────────────────────

export interface RotinaTarefa {
  id:   number;
  task: string;
  time: string;
}

export interface RoutineData {
  morning:   RotinaTarefa[];
  afternoon: RotinaTarefa[];
  night:     RotinaTarefa[];
  essential: RotinaTarefa[];
  done:      Record<string, number[]>; // "YYYY-MM-DD" → [id1, id2...]
  essMode:   boolean;
}

// ── Finanças ─────────────────────────────────────────────────────────────

export interface Installment {
  total:   number;
  current: number;
  groupId: string;
}

export interface Transaction {
  id:          number;
  desc:        string;
  val:         number;
  type:        TransType;
  cat:         string;
  date:        string;
  due?:        string;
  paid:        boolean;
  cardId:      number | null;
  installment: Installment | null;
}

export interface Card {
  id:       number;
  name:     string;
  brand:    string;
  color:    string;
  closeDay: number;
  dueDay:   number;
}

export interface FinanceData {
  transactions: Transaction[];
  cards:        Card[];
  budget:       Record<string, number>; // "YYYY-MM" → valor
}

// ── Espiritual ────────────────────────────────────────────────────────────

export interface Reading {
  id:      number;
  book:    string;
  chapter: string;
  date:    string;
}

export interface Prayer {
  id:       number;
  person:   string;
  request:  string;
  answered: boolean;
}

export interface SpiritData {
  gratitude: Record<string, string[]>; // "YYYY-MM-DD" → lista
  readings:  Reading[];
  prayers:   Prayer[];
}

// ── Organização ───────────────────────────────────────────────────────────

export interface ShoppingItem {
  id:   number;
  name: string;
  cat:  string;
  done: boolean;
}

export interface Note {
  id:      number;
  title:   string;
  content: string;
  color:   string;
  date:    string;
}

export interface Reminder {
  id:       number;
  title:    string;
  time:     string;
  date:     string;
  cat:      string;
  priority: Priority;
  done:     boolean;
}

// ── Crianças ──────────────────────────────────────────────────────────────

export interface KidTask {
  id:   number;
  task: string;
  ic:   string; // emoji
}

export interface Kid {
  id:    number;
  name:  string;
  av:    string;
  age:   number;
  color: string;
  tasks: KidTask[];
}

export interface KidsData {
  children: Kid[];
  done:     Record<string, number[]>; // "YYYY-MM-DD" → [taskId...]
}

// ── Integrações ───────────────────────────────────────────────────────────

export interface GoogleCalEvent {
  id:    string;
  title: string;
  time:  string;
  date:  string;
  cal:   string;
}

export interface GoogleCalendar {
  id:     string;
  name:   string;
  active: boolean;
}

export interface IntegrationsData {
  google: {
    connected:  boolean;
    email:      string;
    calendars:  GoogleCalendar[];
    events:     GoogleCalEvent[];
  };
}

// ── Root ──────────────────────────────────────────────────────────────────

export interface AppData {
  _v:           number;
  routine:      RoutineData;
  health:       HealthData;
  finance:      FinanceData;
  spirit:       SpiritData;
  shopping:     { items: ShoppingItem[] };
  notes:        { list: Note[] };
  reminders:    { list: Reminder[] };
  bloom:        { points: Record<string, number> };
  kids:         KidsData;
  integrations: IntegrationsData;
}

// ── Config ────────────────────────────────────────────────────────────────

export interface DashConfig {
  bloom:     boolean;
  water:     boolean;
  routine:   boolean;
  finance:   boolean;
  cycle:     boolean;
  spirit:    boolean;
  reminders: boolean;
}

export interface AppConfig {
  theme: ThemeKey;
  name:  string;
  dash:  DashConfig;
}

// ── Tema ──────────────────────────────────────────────────────────────────

export interface Theme {
  key:  ThemeKey;
  name: string;
  e:    string;
  bg:   string;
  surf: string;
  alt:  string;
  bd:   string;
  p:    string;
  pl:   string;
  pd:   string;
  gh:   string;
  tx:   string;
  tm:   string;
  ok:   string;
  wn:   string;
  er:   string;
}
```

### 5.2 Criar src/utils/date.ts

```typescript
// src/utils/date.ts

export const today = (): string =>
  new Date().toISOString().slice(0, 10);

export const fmtBRL = (v: number): string =>
  v.toFixed(2).replace(".", ",");

export const fmtMonth = (m: string): string => {
  const [y, mo] = m.split("-");
  const names = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${names[parseInt(mo ?? "1") - 1]}/${(y ?? "00").slice(2)}`;
};
```

### 5.3 Criar src/utils/bloom.ts

```typescript
// src/utils/bloom.ts
import type { AppData } from "@/types/data";

export function calcBloom(data: AppData, day: string): number {
  const mainP = data.health.profiles.find(p => p.id === "eu")
             ?? data.health.profiles[0];

  const allT = data.routine.essMode
    ? data.routine.essential
    : [...data.routine.morning, ...data.routine.afternoon, ...data.routine.night];

  const doneIds   = data.routine.done[day] ?? [];
  const routinePct = allT.length > 0 ? (doneIds.length / allT.length) * 40 : 0;
  const wNow       = mainP?.water.log[day] ?? 0;
  const waterPct   = Math.min(1, wNow / (mainP?.water.goal ?? 2000)) * 30;
  const gratPct    = Math.min(1, (data.spirit.gratitude[day]?.length ?? 0) / 3) * 30;

  return Math.round(routinePct + waterPct + gratPct);
}
```

### 5.4 Criar src/utils/cycle.ts

```typescript
// src/utils/cycle.ts

export interface CycleState {
  dc:        number;
  dl:        number;
  isTPM:     boolean;
  isFertil:  boolean;
  isMenses:  boolean;
  phase:     "Menstrual" | "Folicular" | "Lútea";
}

export function calcCycleState(
  day:    string,
  start:  string,
  len:    number,
  menses: number
): CycleState {
  const ds = Math.floor((new Date(day).getTime() - new Date(start).getTime()) / 86_400_000);
  const dc = ((ds % len) + len) % len;
  const dl = len - dc;
  return {
    dc, dl,
    isTPM:    dl <= 7,
    isFertil: dc >= 10 && dc <= 16,
    isMenses: dc < menses,
    phase:    dc < menses ? "Menstrual" : dc < 14 ? "Folicular" : "Lútea",
  };
}
```

### 5.5 Criar src/utils/storage.ts

```typescript
// src/utils/storage.ts
// Wrapper sobre window.storage da plataforma Claude Artifacts

declare global {
  interface Window {
    storage: {
      get(key: string): Promise<{ key: string; value: string } | null>;
      set(key: string, value: string): Promise<void>;
      delete(key: string): Promise<void>;
      list(prefix?: string): Promise<{ keys: string[] }>;
    };
  }
}

export const STORAGE_DATA = "mvida_data_v2";
export const STORAGE_CFG  = "mvida_cfg_v2";

export async function loadFromStorage<T>(key: string, fallback: T): Promise<T> {
  try {
    const res = await window.storage.get(key);
    return res?.value ? (JSON.parse(res.value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key: string, value: unknown): void {
  try {
    window.storage.set(key, JSON.stringify(value));
  } catch {
    // silent fail — não quebrar a UI se storage falhar
  }
}
```

### 5.6 Adicionar migration no carregamento de dados

```typescript
// src/utils/migration.ts
import type { AppData } from "@/types/data";
import { DEF_DATA } from "@/data/defaults";

export function migrateData(raw: unknown): AppData {
  const loaded = raw as Partial<AppData> & { _v?: number };

  // Se _v < 2, dados têm cycle no root → mover para health.profiles[0].cycle
  if ((loaded._v ?? 0) < 2) {
    const legacy = loaded as AppData & { cycle?: { start: string; len: number; menses: number } };
    if (legacy.cycle && loaded.health?.profiles?.[0]) {
      loaded.health.profiles[0].cycle = legacy.cycle;
    }
  }

  // Fundir com DEF_DATA para garantir campos novos sem sobrescrever dados existentes
  return { ...DEF_DATA(), ...loaded, _v: 2 } as AppData;
}
```

---

## 6. FASE 2 — CSS TOKENS

**Objetivo:** Criar a camada de design system via CSS Variables. Habilitar troca de tema sem prop drilling de `T`.

### 6.1 Criar src/styles/tokens.css

```css
/* src/styles/tokens.css */

:root {
  /* ── Superfícies ── */
  --vf-bg:    #FFF0F4;
  --vf-surf:  #FFFFFF;
  --vf-alt:   #FFE4EE;
  --vf-bd:    #F9D0DB;

  /* ── Primárias ── */
  --vf-p:     #E8799A;
  --vf-pl:    #F9B8CC;
  --vf-pd:    #C4567A;
  --vf-gh:    linear-gradient(135deg, #E8799A, #F4B8CC);

  /* ── Texto ── */
  --vf-tx:    #3D2030;
  --vf-tm:    #9C7A83;

  /* ── Semânticas ── */
  --vf-ok:    #66BB6A;
  --vf-wn:    #FFA726;
  --vf-er:    #EF5350;

  /* ── Espaçamentos e raios ── */
  --vf-r-sm:  12px;
  --vf-r-md:  16px;
  --vf-r-lg:  20px;
  --vf-r-xl:  24px;
  --vf-r-full:9999px;

  /* ── Sombras ── */
  --vf-shadow-card: 0 4px 12px rgba(0,0,0,.03);
  --vf-shadow-btn:  0 4px 12px rgba(232,121,154,.27);

  /* ── Transições ── */
  --vf-trans-fast:   .15s ease;
  --vf-trans-normal: .2s ease;
  --vf-trans-slow:   .4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 6.2 Criar src/utils/applyTheme.ts

```typescript
// src/utils/applyTheme.ts
import type { Theme } from "@/types/data";

export function applyTheme(T: Theme): void {
  const r = document.documentElement.style;
  r.setProperty("--vf-bg",   T.bg);
  r.setProperty("--vf-surf", T.surf);
  r.setProperty("--vf-alt",  T.alt);
  r.setProperty("--vf-bd",   T.bd);
  r.setProperty("--vf-p",    T.p);
  r.setProperty("--vf-pl",   T.pl);
  r.setProperty("--vf-pd",   T.pd);
  r.setProperty("--vf-tx",   T.tx);
  r.setProperty("--vf-tm",   T.tm);
  r.setProperty("--vf-ok",   T.ok);
  r.setProperty("--vf-wn",   T.wn);
  r.setProperty("--vf-er",   T.er);
  // Gradiente exige update do shadow-btn também
  r.setProperty("--vf-shadow-btn", `0 4px 12px ${T.p}44`);
}
```

### 6.3 Importar tokens.css no main.tsx

```typescript
// src/main.tsx
import "@/styles/tokens.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### 6.4 Chamar applyTheme ao inicializar e ao trocar tema

```typescript
// No configStore.ts (Fase 4):
useEffect(() => {
  applyTheme(THEMES[cfg.theme]);
}, [cfg.theme]);

// Na inicialização do App, chamar uma vez:
applyTheme(THEMES[config.theme]);
```

---

## 7. FASE 3 — COMPONENTES BASE (CSS Modules)

**Objetivo:** Migrar os componentes compartilhados (usados em todos os módulos). Maior ROI: mudam 1 vez, beneficiam todos os screens.

### Ordem de migração dos componentes

```
1. Card          → maior frequência de uso, ganho imediato
2. Btn           → feedback de toque em todos os formulários
3. Sheet         → presente em todos os módulos
4. FInput        → inputs de formulário
5. Toggle        → configurações e formulários
6. Chip          → filtros, categorias
7. ProgressBar   → água, bloom, orçamento
8. ConfirmDel    → exclusões
9. BottomNav     → navegação global
```

### Padrão de cada componente (exemplo: Card)

**Card.module.css:**
```css
.card {
  background:    var(--vf-surf);
  border:        1px solid var(--vf-bd);
  border-radius: var(--vf-r-xl);
  padding:       18px;
  box-shadow:    var(--vf-shadow-card);
  transition:    transform var(--vf-trans-fast),
                 box-shadow var(--vf-trans-fast);
}

.clickable {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.clickable:hover  { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,.07); }
.clickable:active { transform: translateY(0);    box-shadow: var(--vf-shadow-card); }

.hero { background: var(--vf-gh); border: none; }
```

**Card.tsx:**
```typescript
import styles from "./Card.module.css";
import type { ReactNode, CSSProperties } from "react";

interface Props {
  onClick?:   () => void;
  hero?:      boolean;
  className?: string;
  style?:     CSSProperties;
  children:   ReactNode;
}

export function Card({ onClick, hero, className = "", style, children }: Props) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={[
        styles.card,
        onClick ? styles.clickable : "",
        hero    ? styles.hero      : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
```

> **Regra de coexistência durante migração:** enquanto um componente não foi migrado para CSS Modules, mantém inline styles. Componentes **novos** devem sempre usar CSS Modules desde o primeiro commit.

---

## 8. FASE 4 — ZUSTAND STORES

**Objetivo:** Eliminar re-renders globais. Remover prop drilling de `setData`. Centralizar computed values.

### 8.1 Instalar e configurar

```bash
npm install zustand
# Já feito na Fase 0
```

### 8.2 Ordem de criação dos stores

```
1. configStore    → tema e nome da usuária (menos dependências)
2. rotinaStore    → mais usado, bloom depende dele
3. saudeStore     → bloom depende da água
4. espiritStore   → bloom depende da gratidão
5. financasStore  → mais complexo (parcelas, cartões)
6. organizaStore  → shopping, notas, lembretes
7. kidsStore      → independente
8. bloomStore     → derived, lê os 3 stores acima
```

### 8.3 Padrão de store (exemplo: rotinaStore.ts)

```typescript
// src/stores/rotinaStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { RotinaTarefa, RoutineData } from "@/types/data";
import { saveToStorage, STORAGE_DATA } from "@/utils/storage";

// Storage adapter para window.storage
const windowStorage = {
  getItem: async (name: string) => {
    try {
      const res = await window.storage.get(name);
      return res?.value ?? null;
    } catch { return null; }
  },
  setItem: (_: string, value: string) => saveToStorage(STORAGE_DATA, value),
  removeItem: (name: string) => window.storage.delete(name),
};

type Turno = "morning" | "afternoon" | "night" | "essential";

interface RotinaStore extends RoutineData {
  // Actions
  toggleTarefa:    (day: string, id: number)                          => void;
  adicionarTarefa: (turno: Turno, tarefa: Omit<RotinaTarefa, "id">) => void;
  removerTarefa:   (turno: Turno, id: number)                         => void;
  toggleEssMode:   ()                                                  => void;
  resetDone:       (day: string)                                       => void;
}

export const useRotinaStore = create<RotinaStore>()(
  persist(
    (set) => ({
      morning:   [],
      afternoon: [],
      night:     [],
      essential: [],
      done:      {},
      essMode:   false,

      toggleTarefa: (day, id) => set(state => {
        const prev = state.done[day] ?? [];
        const next = prev.includes(id)
          ? prev.filter(x => x !== id)
          : [...prev, id];
        return { done: { ...state.done, [day]: next } };
      }),

      adicionarTarefa: (turno, tarefa) => set(state => ({
        [turno]: [...state[turno], { id: Date.now(), ...tarefa }],
      })),

      removerTarefa: (turno, id) => set(state => ({
        [turno]: state[turno].filter(t => t.id !== id),
      })),

      toggleEssMode: () => set(state => ({ essMode: !state.essMode })),

      resetDone: (day) => set(state => {
        const { [day]: _, ...rest } = state.done;
        return { done: rest };
      }),
    }),
    { name: "vidaflor-rotina" }
  )
);
```

### 8.4 Store derivado do Bloom

```typescript
// src/stores/bloomStore.ts
import { useRotinaStore }  from "./rotinaStore";
import { useSaudeStore }   from "./saudeStore";
import { useEspiritStore } from "./espiritStore";
import { today }           from "@/utils/date";

// Hook — re-renderiza apenas quando rotina, água ou gratidão muda
export function useBloomPct(): number {
  const day       = today();
  const { done, morning, afternoon, night, essential, essMode } = useRotinaStore();
  const { profileAtivo }  = useSaudeStore();
  const { gratitude }     = useEspiritStore();

  const allT       = essMode
    ? essential
    : [...morning, ...afternoon, ...night];
  const doneIds    = done[day] ?? [];
  const routinePct = allT.length > 0 ? (doneIds.length / allT.length) * 40 : 0;
  const wNow       = profileAtivo?.water.log[day] ?? 0;
  const waterPct   = Math.min(1, wNow / (profileAtivo?.water.goal ?? 2000)) * 30;
  const gratPct    = Math.min(1, (gratitude[day]?.length ?? 0) / 3) * 30;

  return Math.round(routinePct + waterPct + gratPct);
}
```

### 8.5 Migração de setData → stores (estratégia)

Durante a migração, manter compatibilidade:

```typescript
// Padrão de migração progressiva:
// 1. Criar o store com as actions
// 2. Na screen, trocar setData(d => {...d.routine...}) por useRotinaStore().toggleTarefa()
// 3. Quando a screen for 100% migrada para o store, remover o prop drilling de setData

// Exemplo antes:
const toggleDone = (id: number) => setData(d => ({
  ...d,
  routine: { ...d.routine, done: { ...d.routine.done, [day]: [...] } }
}));

// Depois:
const { toggleTarefa } = useRotinaStore();
// uso: toggleTarefa(day, id)
```

---

## 9. FASE 5 — MIGRAÇÃO DAS SCREENS

**Objetivo:** Converter screens de `.jsx` inline styles → `.tsx` + stores + CSS Modules.

### Ordem de migração (da mais simples para a mais complexa)

```
1. EspiritualScreen   → poucos componentes, sem computed complexo
2. OrganizaScreen     → 3 tabs simples (compras, notas, lembretes)
3. RotinaScreen       → CRUD + toggle, usa rotinaStore
4. ConfigScreen       → formulário simples
5. HomeScreen         → lê múltiplos stores (bloom, água, finanças)
6. SaudeScreen        → multi-perfil, ciclo, medicamentos
7. FinancasScreen     → mais complexo (parcelas, cartões, projeção)
```

### Checklist por screen

Para cada screen na migração:
- [ ] Renomear `.jsx` → `.tsx`
- [ ] Adicionar interfaces TypeScript para props e estado local
- [ ] Substituir `setData(d => {...d.modulo...})` pelo store correspondente
- [ ] Substituir `style={{ ... }}` por `className={styles.xxx}` nos componentes base
- [ ] Manter inline styles apenas onde não há componente base (estilos únicos/one-off)
- [ ] Verificar `calcBloom` sendo lido via `useBloomPct()` na HomeScreen
- [ ] Verificar que `setTab` está disponível para navegação cruzada
- [ ] Testar nos 5 temas (pastel + neutro como mínimo)

### FinancasScreen — plano específico (arquivo mais crítico)

O `FinancasScreen-v2.jsx` tem 739 linhas e é o mais complexo. Estratégia:

```
Passo 1: Extrair helpers para financasStore.ts
         → saldoMes(), faturasCartao(), parcelas computadas

Passo 2: Extrair SaidaForm para componente separado
         → src/components/financas/SaidaForm.tsx

Passo 3: Extrair ProjecaoCarrossel para componente separado
         → src/components/financas/ProjecaoCarrossel.tsx

Passo 4: Extrair CardDetail para componente separado
         → src/components/financas/CardDetail.tsx

Passo 5: FinancasScreen.tsx limpo → apenas composição dos componentes acima
         Meta: < 200 linhas no arquivo principal
```

---

## 10. FASE 6 — POLIMENTO E QUALIDADE

### 10.1 Touch feedback obrigatório

Adicionar nos CSS Modules de todos os elementos interativos:

```css
.item {
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  transition: opacity var(--vf-trans-fast);
}
.item:active { opacity: 0.7; }
```

### 10.2 Animações da Bloom Flower

```css
/* BloomFlower.module.css */
.flower {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

```typescript
// BloomFlower.tsx
const scale = 0.8 + (bloomPct / 200);
<div className={styles.flower} style={{ transform: `scale(${scale})` }}>
```

### 10.3 Schema migration guard

```typescript
// src/utils/migration.ts
// Verificar _v ao carregar e aplicar migrations automaticamente
// Versão atual: _v = 2
// Próxima mudança de schema: incrementar para _v = 3 e adicionar migration aqui
```

### 10.4 Testes mínimos (sem framework externo)

Criar `src/__tests__/` com funções puras:

```typescript
// src/__tests__/bloom.test.ts — pode rodar com node diretamente
import { calcBloom }     from "@/utils/bloom";
import { calcCycleState } from "@/utils/cycle";

// Testar casos limites:
// - Bloom com 0 tarefas
// - Bloom com 100% rotina + água + gratidão = 100
// - CycleState no dia 0, dia 13, dia 28
```

### 10.5 Badges na HomeScreen com navegação cruzada

```typescript
// HomeScreen.tsx — todo badge deve chamar setTab
<div onClick={() => setTab("saude")}>
  💊 badge de medicamento pendente
</div>

<div onClick={() => setTab("financas")}>
  ⚠️ badge de conta vencendo
</div>
```

---

## 11. FEATURES PENDENTES (SKILL define, repositório não implementou)

### P1 — Alta prioridade (impacto no bloom/UX central)

| Feature | Descrição | Módulo | Esforço est. |
|---|---|---|---|
| Badge de medicamentos | Mostrar na Home quando há med. para tomar hoje | Saúde → Home | 1–2h |
| Badge de conta vencendo | Mostrar na Home conta com vencimento ≤ 3 dias | Finanças → Home | 1–2h |
| Badges clicáveis | Todo badge navega para a tela correspondente | Home | 1h |
| Estado vazio padronizado | Todos os módulos com emoji + CTA | Todos | 3–4h |

### P2 — Média prioridade

| Feature | Descrição | Módulo | Esforço est. |
|---|---|---|---|
| HumorDiário | Card de humor (😊😐😔) na Home | Home | 2–3h |
| Histórico de Bloom | Gráfico recharts dos últimos 7 dias | Home/Bloom | 3–4h |
| Badge rotina crianças 100% | Celebração quando todas as tarefas feitas | Crianças | 1h |
| Export financeiro | CSV das transações do mês | Finanças | 2–3h |

### P3 — Baixa prioridade (roadmap futuro)

| Feature | Descrição | Módulo |
|---|---|---|
| Google Calendar real | OAuth + API (hoje é demo) | Integrações |
| Notificações PWA | Push para medicamentos e lembretes | PWA/ServiceWorker |
| Multi-usuário | Compartilhar app com cônjuge | Arquitetura |

---

## 12. REGRAS ABSOLUTAS DO PROJETO (não negociáveis)

1. **Nunca hardcode de cores** — sempre `var(--vf-*)` ou `T.*`
2. **Nunca `setDataRaw` direto** — sempre via store action
3. **Ações destrutivas sempre com `ConfirmDel`** — sem exceção
4. **Ações de toggle direto sem sheet** — 1 toque, sem confirmação
5. **Componente novo = CSS Module desde o primeiro commit**
6. **Screen nova = store desde o primeiro commit**
7. **Incrementar `_v` ao mudar schema** + adicionar migration
8. **Touch target mínimo 44×44px** em todo elemento interativo
9. **Estado vazio sempre tratado** — nunca lista vazia sem mensagem + CTA
10. **Microcopy em pt-BR, acolhedor** — nunca genérico ou frio

---

## 13. ORDEM DE EXECUÇÃO RESUMIDA

```
SEMANA 1
  Fase 0:  Setup TS + Zustand + pastas + vite.config.ts
  Fase 1a: src/types/data.ts completo
  Fase 1b: src/utils/ (date, bloom, cycle, storage, migration)

SEMANA 2
  Fase 2:  tokens.css + applyTheme.ts
  Fase 3a: Card + Btn + Sheet (componentes de maior impacto)
  Fase 3b: Toggle + Chip + FInput + ProgressBar + ConfirmDel

SEMANA 3
  Fase 4a: configStore + rotinaStore + saudeStore
  Fase 4b: espiritStore + financasStore + organizaStore + bloomStore

SEMANA 4–5
  Fase 5a: EspiritualScreen + OrganizaScreen + RotinaScreen
  Fase 5b: ConfigScreen + HomeScreen

SEMANA 6
  Fase 5c: SaudeScreen + FinancasScreen (os dois mais complexos)
  Fase 6:  Polimento, touch feedback, testes, badges completos
```

---

## 14. MÉTRICAS DE SUCESSO

| Métrica | Hoje | Meta v2.0 |
|---|---|---|
| TypeScript coverage | 0% | > 90% |
| Componentes com CSS Modules | 0% | 100% (novos) |
| Re-renders globais ao marcar tarefa | Sim | Não (Zustand isolado) |
| Linhas por arquivo (máximo) | ~2.000 | ≤ 300 |
| Touch feedback (`:active`) | Ausente | Presente em todos interativos |
| Schema migration guard | Ausente | Implementado (_v) |
| Bugs de `cardId` desconectado | Presente | Eliminado via TypeScript |
| Tempo para ação principal | 1–2 toques ✅ | 1–2 toques ✅ (manter) |
| Bloom reativo em tempo real | ✅ | ✅ (manter) |

---

*Documento gerado para o projeto VidaFlor · Versão 1.1 → 2.0*
*Baseado na SKILL SCLC-G e análise do repositório sdwplayer01/vidaflor*
*Abril 2026*
