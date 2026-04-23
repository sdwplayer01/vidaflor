---
name: vidaflor-app
description: SKILL definitiva para o desenvolvimento do VidaFlor — app de organização, saúde e bem-estar familiar. Baseada na metodologia SCLC-G (Simple, Loveable, Complete, Connected, Gamified) adaptada ao contexto de uma mulher cristã, mãe e gestora da vida doméstica. Use para criar, modificar, revisar ou auditar qualquer parte do sistema: screens, componentes, dados, fluxos e integrações. Consulte antes de escrever qualquer linha de código.
metadata:
  categories: [family-wellness, lifestyle-app, pwa, single-file-spa, react, offline-first]
  stack: [React 18, Vite, TypeScript, Zustand, CSS Modules, lucide-react, recharts, window.storage]
  domain: family-life-management
  platforms: [mobile-first-pwa, web]
  version: 1.1
  status: active-development
  evolution: migrating-from-jsx-inline-styles
---

# 🌸 SKILL: VidaFlor — Desenvolvimento SCLC-G

## Visão Geral

O **VidaFlor** é um app de gestão de vida pessoal e familiar posicionado como o "sistema operacional do lar". Cada decisão de código, design e UX deve reforçar carinho, clareza e leveza — nunca complexidade desnecessária ou frieza técnica.

Esta SKILL orienta todo o desenvolvimento. Consulte-a antes de escrever qualquer linha de código.

> **Princípio central:** "Um app que faz a mulher se sentir cuidada e organizada — não sobrecarregada."

---

## 📱 Contexto de Uso Real

### Quem usa

A usuária primária é uma mulher cristã, casada, mãe de filhos pequenos, que acumula papéis: cuidadora, gestora financeira do lar, responsável pela saúde da família, e pessoa que também precisa cuidar de si mesma.

| Perfil | Dispositivo | Necessidade principal |
|---|---|---|
| Mãe em casa | Celular (toque rápido) | Marcar rotina das crianças, verificar água |
| Gestora do lar | Celular | Lançar despesa, ver saldo, lista de compras |
| Cuidando de si | Celular (momentos tranquilos) | Registrar gratidão, ciclo, medicamentos |
| Família reunida | Celular compartilhado | Mostrar rotina da criança para ela mesma completar |

### Contexto de abertura do app

```
Cenário 1: Manhã — verificar se tomou os medicamentos
Cenário 2: Mercado — consultar lista de compras
Cenário 3: Fim do dia — registrar gratidão + checar bloom
Cenário 4: Cozinha — marcar refeição das crianças como feita
Cenário 5: Pagamento — lançar conta paga
```

**Conclusão de design:** Toda ação deve ser possível em **1–2 toques**. O app é aberto por momentos, não sessões longas.

---

## 🏗️ Arquitetura do Projeto

### Stack atual (v1.1 — evoluída)

```
React 18 + TypeScript       — tipagem estática (migração de JSX)
Vite 6                      — build tool
Zustand                     — gerenciamento de estado por módulo
CSS Modules + CSS Variables — estilos (migração de inline styles)
lucide-react                — ícones
recharts                    — gráficos
window.storage              — persistência (API Claude artifacts)
Inter (Google Fonts)        — tipografia
```

> **Contexto de migração:** O app nasceu em JSX puro com estilos inline e estado monolítico. As três evoluções abaixo foram incorporadas de forma incremental — não reescrita. Veja a seção **🔧 Três Evoluções Técnicas** para o plano e exemplos de migração.

### Estrutura de arquivos

```
vidaflor/
├── index.html                  # Shell: meta tags, fonts, div#root
├── src/
│   └── main.jsx               # Entry point React
├── FinancasScreen-v2.jsx       # Componente standalone (padrão de extração)
├── saude-v2.jsx               # Componente standalone (padrão de extração)
├── vite.config.js
├── package.json
└── .github/workflows/          # CI/CD (GitHub Pages)
```

### Filosofia de arquitetura: Single-File SPA por módulo

O app é uma SPA monolítica em `.jsx`. Cada screen é um componente React puro (sem router externo). A navegação é por estado `tab` no App root.

```jsx
// App.jsx — padrão de render
const common = { data, T, setData, setTab };

{tab === "home"       && <HomeScreen      {...common} cfg={cfg} />}
{tab === "rotina"     && <RotinaScreen    {...common} />}
{tab === "saude"      && <SaudeScreen     {...common} />}
{tab === "espiritual" && <EspiritualScreen {...common} />}
{tab === "organiza"   && <OrganizaScreen  {...common} />}
{tab === "financas"   && <FinancasScreen  {...common} />}
{tab === "config"     && <ConfigScreen    {...common} cfg={cfg} setCfg={setCfg} />}
```

**Regra:** Quando um screen superar ~300 linhas, extrair para arquivo `.jsx` separado (ver `FinancasScreen-v2.jsx` como referência). Importar no app principal.

---

## 🔧 Três Evoluções Técnicas

Esta seção documenta as três mudanças arquiteturais que elevam o VidaFlor de um protótipo funcional para um app sustentável a longo prazo. Cada evolução resolve um problema real já vivenciado no desenvolvimento.

---

### Evolução 1 — TypeScript (de JSX puro)

#### Por que importa no VidaFlor

Os bugs mais recorrentes no desenvolvimento atual têm causa-raiz na falta de tipagem:
- IDs misturados (numérico `1` convivendo com `Date.now()` de 13 dígitos)
- Campo `cardId` definido no estado mas nunca conectado ao formulário
- `data.cycle.start` acessado em screens após ter sido movido para `data.health.profiles[].cycle`
- Schema de `DEF_DATA` evoluindo sem migração, quebrando dados salvos

TypeScript elimina essas três categorias na compilação, antes de chegar na tela da usuária.

#### Configuração mínima (Vite já suporta)

```bash
# Renomear arquivos progressivamente:
# main.jsx → main.tsx
# FinancasScreen-v2.jsx → FinancasScreen-v2.tsx
# Não é necessário migrar tudo de uma vez
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

#### Exemplo 1: Tipando o DEF_DATA — erros de schema viram erros de compilação

```typescript
// src/types/data.ts

// ─── Entidades base ─────────────────────────────────────────────────────────

export type ProfileType = "adult_f" | "adult_m" | "child" | "pet";

export interface WaterLog {
  goal: number;
  log:  Record<string, number>; // { "YYYY-MM-DD": ml }
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
  log:  Record<string, boolean>; // { "YYYY-MM-DD": tomado }
}

export interface HealthProfile {
  id:     string;
  name:   string;
  av:     string;
  type:   ProfileType;
  color:  string;
  water:  WaterLog;
  cycle?: CycleConfig;     // ← "?" = só em adult_f — TypeScript força verificar antes de usar
  meds:   Medication[];
  notes:  Record<string, string>;
}

export interface Installment {
  total:   number;
  current: number;
  groupId: string;
}

export type TransactionType = "income" | "expense";

export interface Transaction {
  id:          number;
  desc:        string;
  val:         number;
  type:        TransactionType;
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

export interface AppData {
  _v:      number;
  routine: RoutineData;
  health:  HealthData;
  finance: FinanceData;
  spirit:  SpiritData;
  shopping:ShoppingData;
  notes:   NotesData;
  reminders:RemindersData;
  bloom:   BloomData;
  kids:    KidsData;
  integrations: IntegrationsData;
}
```

**Antes (JSX — bug silencioso):**
```jsx
// Acessa cycle.start sem verificar se existe — crash em runtime
const ds = Math.floor((new Date(day) - new Date(data.cycle.start)) / 86400000);
```

**Depois (TypeScript — erro em compilação):**
```typescript
// ✅ Compilador exige verificar antes de acessar
const profile = data.health.profiles.find(p => p.id === "eu");
if (profile?.cycle) {
  const ds = Math.floor((new Date(day) - new Date(profile.cycle.start)) / 86400000);
}
```

#### Exemplo 2: Tipando props de componentes — refatoração sem medo

```typescript
// src/components/shared/Card.tsx

interface CardProps {
  T:        Theme;
  onClick?: () => void;       // "?" = opcional — TypeScript avisa se passar onClick errado
  children: React.ReactNode;
  style?:   React.CSSProperties;
}

// ✅ Agora o compilador avisa se passar uma prop que não existe
// ✅ IDE autocompleta os tokens de T
export function Card({ T, onClick, children, style = {} }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{ background: T.surf, border: `1px solid ${T.bd}`, ...style }}
    >
      {children}
    </div>
  );
}
```

#### Exemplo 3: Tipando calcBloom — resultados previsíveis

```typescript
// src/utils/bloom.ts

export function calcBloom(data: AppData, day: string): number {
  const mainP = data.health.profiles.find(p => p.id === "eu")
             ?? data.health.profiles[0];  // ?? = fallback tipado

  const allT = data.routine.essMode
    ? data.routine.essential
    : [...data.routine.morning, ...data.routine.afternoon, ...data.routine.night];

  const doneIds    = data.routine.done[day] ?? [];
  const routinePct = allT.length > 0 ? (doneIds.length / allT.length) * 40 : 0;
  const wNow       = mainP?.water.log[day] ?? 0;
  const waterPct   = Math.min(1, wNow / (mainP?.water.goal ?? 2000)) * 30;
  const gratPct    = Math.min(1, (data.spirit.gratitude[day]?.length ?? 0) / 3) * 30;

  return Math.round(routinePct + waterPct + gratPct);
  // Retorno tipado como `number` — qualquer uso errado é erro de compilação
}
```

#### Estratégia de migração incremental

```
Semana 1: Criar src/types/data.ts com todas as interfaces
Semana 2: Tipar funções puras (calcBloom, calcCycleState, formatters)
Semana 3: Tipar componentes base (Card, Sheet, Btn, Toggle...)
Semana 4+: Tipar screens um a um — começar pelo mais simples (EspiritualScreen)
```

---

### Evolução 2 — Zustand (de setData monolítico)

#### Por que importa no VidaFlor

Hoje um único objeto `data` com 10 módulos dentro está num `useState` do App root. Cada `setData(d => ...)` causa re-render de **todos** os componentes filhos, mesmo quando só a água mudou. Com 10 módulos e screens complexas, isso é ineficiente e dificulta testar módulos isoladamente.

Zustand resolve com stores independentes por módulo:

```
useRotinaStore    → re-render só de RotinaScreen e HomeScreen (se usa rotina)
useFinancasStore  → re-render só de FinancasScreen
useSaudeStore     → re-render só de SaudeScreen e badge de água na Home
useBloomStore     → re-render só do card Bloom (subscribe em múltiplos stores)
```

#### Instalação

```bash
npm install zustand
```

#### Exemplo 1: Store da Rotina — isolamento completo

```typescript
// src/stores/rotinaStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RotinaTarefa {
  id:   number;
  task: string;
  time: string;
}

type Turno = "morning" | "afternoon" | "night";

interface RotinaStore {
  morning:   RotinaTarefa[];
  afternoon: RotinaTarefa[];
  night:     RotinaTarefa[];
  essential: RotinaTarefa[];
  done:      Record<string, number[]>;  // { "YYYY-MM-DD": [id1, id2] }
  essMode:   boolean;

  // Actions — nomes descritivos, nunca genéricos
  toggleTarefa:  (day: string, id: number) => void;
  adicionarTarefa: (turno: Turno, tarefa: Omit<RotinaTarefa, "id">) => void;
  removerTarefa:   (turno: Turno, id: number) => void;
  toggleEssMode:   () => void;
}

export const useRotinaStore = create<RotinaStore>()(
  persist(
    (set) => ({
      morning:   [...],
      afternoon: [...],
      night:     [...],
      essential: [...],
      done:      {},
      essMode:   false,

      toggleTarefa: (day, id) => set(state => {
        const prev = state.done[day] ?? [];
        const next = prev.includes(id)
          ? prev.filter(x => x !== id)
          : [...prev, id];
        return { done: { ...state.done, [day]: next } };
        // ✅ Só re-renderiza quem usa done — não o app inteiro
      }),

      adicionarTarefa: (turno, tarefa) => set(state => ({
        [turno]: [...state[turno], { id: Date.now(), ...tarefa }]
      })),

      removerTarefa: (turno, id) => set(state => ({
        [turno]: state[turno].filter(t => t.id !== id)
      })),

      toggleEssMode: () => set(state => ({ essMode: !state.essMode })),
    }),
    { name: "vidaflor-rotina" }
    // ✅ persist salva automaticamente no localStorage com key específica
    // Substituir pelo window.storage adapter quando necessário
  )
);
```

**Antes (monolítico — re-render global):**
```jsx
// Marcar uma tarefa re-renderiza TUDO — FinancasScreen, SaudeScreen, etc.
const toggleDone = id => setData(d => {
  const prev = d.routine.done[day] || [];
  const next = prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id];
  return { ...d, routine: { ...d.routine, done: { ...d.routine.done, [day]:next }}};
});
```

**Depois (Zustand — re-render cirúrgico):**
```tsx
// RotinaScreen.tsx — só este componente re-renderiza
function MinhaRotina() {
  const { done, morning, toggleTarefa, essMode } = useRotinaStore();
  const day = today();
  const doneIds = done[day] ?? [];

  return (
    <>
      {morning.map(t => (
        <TaskItem
          key={t.id}
          task={t}
          done={doneIds.includes(t.id)}
          onToggle={() => toggleTarefa(day, t.id)}  // ← direto no store
        />
      ))}
    </>
  );
}
```

#### Exemplo 2: Store de Finanças com computed values

```typescript
// src/stores/financasStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FinancasStore {
  transactions: Transaction[];
  cards:        Card[];
  budget:       Record<string, number>; // { "YYYY-MM": number }

  // Computed (não derivar inline em cada componente)
  saldoMes:     (mes: string) => number;
  faturasCartao:(cardId: number, mes: string) => number;

  // Actions
  adicionarTransacao:   (t: Omit<Transaction, "id">) => void;
  adicionarParcelada:   (dados: ParceladaInput) => void;
  togglePago:           (id: number) => void;
  removerTransacao:     (id: number) => void;
  adicionarCartao:      (c: Omit<Card, "id">) => void;
  removerCartao:        (id: number) => void;
  definirOrcamento:     (mes: string, valor: number) => void;
}

export const useFinancasStore = create<FinancasStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      cards:        [],
      budget:       {},

      // ✅ Computed centralizado — não duplicar em cada screen
      saldoMes: (mes) => {
        const ts = get().transactions.filter(t => t.date.slice(0,7) === mes);
        const ent = ts.filter(t => t.type === "income" ).reduce((s,t) => s + t.val, 0);
        const sai = ts.filter(t => t.type === "expense").reduce((s,t) => s + t.val, 0);
        return ent - sai;
      },

      faturasCartao: (cardId, mes) =>
        get().transactions
          .filter(t => t.cardId === cardId && t.date.slice(0,7) === mes)
          .reduce((s,t) => s + t.val, 0),

      adicionarParcelada: ({ desc, totalVal, totalParcelas, date, cat, cardId }) => {
        const parcVal = Math.round((totalVal / totalParcelas) * 100) / 100;
        const groupId = `grp_${Date.now()}`;
        const items: Transaction[] = Array.from({ length: totalParcelas }, (_, i) => {
          const d = new Date(date);
          d.setMonth(d.getMonth() + i);
          return {
            id: Date.now() + i,
            desc, cat, cardId, type: "expense",
            val:  parcVal,
            date: d.toISOString().slice(0,10),
            due:  d.toISOString().slice(0,10),
            paid: i === 0,
            installment: { total: totalParcelas, current: i + 1, groupId },
          };
        });
        set(s => ({ transactions: [...items, ...s.transactions] }));
      },

      // ... demais actions
    }),
    { name: "vidaflor-financas" }
  )
);
```

**Uso em componente — limpo, sem prop drilling:**
```tsx
// FinancasScreen.tsx
function FinancasScreen() {
  // ✅ Sem props! Store é acessado diretamente
  const { transactions, saldoMes, adicionarTransacao } = useFinancasStore();
  const curMonth = today().slice(0, 7);
  const saldo = saldoMes(curMonth); // computed centralizado

  // ...
}

// HomeScreen.tsx — acessa apenas o que precisa
function HomeScreen() {
  const saldo = useFinancasStore(s => s.saldoMes(today().slice(0,7)));
  // ✅ Só re-renderiza se o saldo mudar — não se outras partes de finanças mudarem
}
```

#### Exemplo 3: calcBloom reativo — subscribe em múltiplos stores

```typescript
// src/stores/bloomStore.ts
import { create } from "zustand";
import { useRotinaStore }  from "./rotinaStore";
import { useSaudeStore }   from "./saudeStore";
import { useEspiritStore } from "./espiritStore";

// Store derivado — recalcula quando qualquer dependência muda
export function useBloomPct(): number {
  const day     = today();
  const { done, morning, afternoon, night, essential, essMode } = useRotinaStore();
  const { profileAtivo } = useSaudeStore();
  const { gratitude }    = useEspiritStore();

  const allT     = essMode
    ? essential
    : [...morning, ...afternoon, ...night];
  const doneIds  = done[day] ?? [];
  const routinePct = allT.length > 0 ? (doneIds.length / allT.length) * 40 : 0;
  const wNow       = profileAtivo?.water.log[day] ?? 0;
  const waterPct   = Math.min(1, wNow / (profileAtivo?.water.goal ?? 2000)) * 30;
  const gratPct    = Math.min(1, (gratitude[day]?.length ?? 0) / 3) * 30;

  return Math.round(routinePct + waterPct + gratPct);
  // ✅ Re-renderiza apenas quando rotina, água ou gratidão muda
}
```

---

### Evolução 3 — CSS Modules + CSS Variables (de inline styles)

#### Por que importa no VidaFlor

Inline styles funcionam, mas cada `Card` com 8 propriedades repete 8 linhas em cada uso. Isso acontece 40+ vezes no app atual. Além disso:
- Não há pseudo-classes (`:hover`, `:active`, `:focus-visible`) — touch feedback ausente
- Não há media queries por componente
- Copiar um componente carrega junto todo o CSS inline
- Dificulta extrair para biblioteca compartilhada futura

CSS Modules + CSS Variables resolvem isso mantendo o T_DESIGN existente.

#### Configuração (zero setup — Vite suporta nativamente)

```typescript
// src/styles/tokens.css — T_DESIGN como CSS Variables
:root {
  /* As variáveis são atualizadas via JS quando o tema muda */
  --color-bg:    #FFF0F4;
  --color-surf:  #FFFFFF;
  --color-alt:   #FFE4EE;
  --color-p:     #E8799A;
  --color-tx:    #3D2030;
  --color-tm:    #9C7A83;
  --color-bd:    #F9D0DB;
  --color-ok:    #66BB6A;
  --color-wn:    #FFA726;
  --color-er:    #EF5350;
  --gradient-hero: linear-gradient(135deg, #E8799A, #F4B8CC);

  /* Espaçamentos e raios */
  --radius-sm:   12px;
  --radius-md:   16px;
  --radius-lg:   20px;
  --radius-xl:   24px;
  --radius-full: 9999px;
  --shadow-card: 0 4px 12px rgba(0,0,0,.03);
  --shadow-btn:  0 4px 12px rgba(232,121,154,.27);
}
```

```typescript
// src/utils/applyTheme.ts — troca de tema via JS
export function applyTheme(T: Theme) {
  const root = document.documentElement;
  root.style.setProperty("--color-bg",   T.bg);
  root.style.setProperty("--color-surf", T.surf);
  root.style.setProperty("--color-p",    T.p);
  root.style.setProperty("--color-tx",   T.tx);
  // ... demais tokens
  // ✅ Troca o tema inteiro em 1 chamada — todos os componentes atualizam
}

// Chamar ao carregar e ao mudar tema:
// useEffect(() => applyTheme(T), [T]);
```

#### Exemplo 1: Card.module.css — de 8 linhas inline para 1 className

```css
/* src/components/shared/Card.module.css */

.card {
  background:    var(--color-surf);
  border:        1px solid var(--color-bd);
  border-radius: var(--radius-xl);         /* 24px */
  padding:       18px;
  box-shadow:    var(--shadow-card);
  transition:    transform .15s ease, box-shadow .15s ease;
}

.card--clickable {
  cursor: pointer;
}

/* ✅ Hover e active — impossível com inline styles */
.card--clickable:hover {
  transform:  translateY(-1px);
  box-shadow: 0 8px 20px rgba(0,0,0,.07);
}

.card--clickable:active {
  transform:  translateY(0);
  box-shadow: var(--shadow-card);
}

/* Card hero (gradiente) */
.card--hero {
  background: var(--gradient-hero);
  border:     none;
  color:      #fff;
}
```

```tsx
// src/components/shared/Card.tsx

import styles from "./Card.module.css";

interface CardProps {
  onClick?:  () => void;
  hero?:     boolean;
  children:  React.ReactNode;
  className?: string;
}

export function Card({ onClick, hero, children, className }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        styles.card,
        onClick ? styles["card--clickable"] : "",
        hero    ? styles["card--hero"]      : "",
        className ?? "",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

// ✅ Antes: 8 linhas de style inline por uso
// ✅ Depois: <Card hero onClick={...}>
```

#### Exemplo 2: TaskItem.module.css — estados visuais limpos

```css
/* src/components/rotina/TaskItem.module.css */

.task {
  display:        flex;
  align-items:    center;
  gap:            10px;
  padding:        13px 15px;
  border-radius:  var(--radius-md);       /* 16px */
  background:     var(--color-surf);
  border:         1.5px solid var(--color-bd);
  cursor:         pointer;
  transition:     border-color .2s, background .2s;
  /* ✅ -webkit-tap-highlight-color impossível com inline */
  -webkit-tap-highlight-color: transparent;
}

.task--done {
  border-color: var(--color-ok);
  background:   color-mix(in srgb, var(--color-ok) 8%, var(--color-surf));
}

.task__text {
  margin:      0;
  font-size:   14px;
  font-weight: 600;
  color:       var(--color-tx);
  transition:  color .2s, text-decoration .2s;
}

.task__text--done {
  color:            var(--color-tm);
  text-decoration:  line-through;
}

.task__checkbox {
  width:         26px;
  height:        26px;
  border-radius: 8px;
  border:        2px solid var(--color-bd);
  background:    transparent;
  transition:    border-color .2s, background .2s, transform .15s;
  flex-shrink:   0;
}

.task__checkbox--done {
  border-color: var(--color-ok);
  background:   var(--color-ok);
  transform:    scale(1.05);
}
```

```tsx
// src/components/rotina/TaskItem.tsx

import styles from "./TaskItem.module.css";

interface TaskItemProps {
  task:     RotinaTarefa;
  done:     boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, done, onToggle, onDelete }: TaskItemProps) {
  return (
    <div
      onClick={onToggle}
      className={`${styles.task} ${done ? styles["task--done"] : ""}`}
    >
      <div className={`${styles.task__checkbox} ${done ? styles["task__checkbox--done"] : ""}`}>
        {done && <Check size={14} color="#fff" />}
      </div>

      <div style={{ flex: 1 }}>
        <p className={`${styles.task__text} ${done ? styles["task__text--done"] : ""}`}>
          {task.task}
        </p>
        {task.time && (
          <p style={{ margin: 0, fontSize: 11, color: "var(--color-tm)" }}>{task.time}</p>
        )}
      </div>

      <button onClick={e => { e.stopPropagation(); onDelete(); }} className={styles.task__delete}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}
```

#### Exemplo 3: Botão com feedback de toque real

```css
/* src/components/shared/Btn.module.css */

.btn {
  width:         100%;
  padding:       14px 0;
  border-radius: var(--radius-sm);  /* 12px */
  font-weight:   800;
  font-size:     15px;
  font-family:   inherit;
  cursor:        pointer;
  border:        none;
  transition:    transform .1s, box-shadow .1s;
  /* ✅ Feedback de toque — impossível com inline */
  -webkit-tap-highlight-color: transparent;
}

.btn:active {
  transform: scale(0.97);
}

.btn--primary {
  background:  var(--color-p);
  color:       #fff;
  box-shadow:  var(--shadow-btn);
}

.btn--primary:hover {
  filter: brightness(1.05);
}

.btn--ghost {
  background:  transparent;
  color:       var(--color-tm);
  border:      1px solid var(--color-bd);
}

.btn--danger {
  background: var(--color-er);
  color:      #fff;
}
```

#### Estratégia de migração incremental

```
Passo 1: Criar tokens.css com CSS Variables + applyTheme()
         → Sem mudar nenhum componente ainda
         → Testa troca de tema via JS

Passo 2: Migrar componentes base (Card, Btn, Sheet, Toggle)
         → Maior impacto: usados em todos os módulos

Passo 3: Migrar componentes de lista (TaskItem, TransactionItem)
         → Ganho de hover/active feedback

Passo 4: Migrar screens de baixo para cima
         → Começar por EspiritualScreen (mais simples)
         → Deixar FinancasScreen por último (mais complexa)

Regra de coexistência:
  Enquanto migra, inline styles e CSS Modules podem coexistir.
  Componentes novos: sempre CSS Modules.
  Componentes legados: migrar ao tocar (não de uma vez).
```

---


## 🎨 T_DESIGN — Sistema de Design

### Por que T_DESIGN existe

O `T` (tema ativo) funciona como um objeto de design tokens injetado em todos os componentes. **Na versão atual (inline styles)**, aplica-se diretamente como `style={{ background: T.surf }}`. **Na versão evoluída (CSS Modules)**, `T` alimenta CSS Variables via `applyTheme(T)` e os componentes usam `var(--color-surf)`.

**Nunca use cores hardcoded.** Sempre use `T.*` ou `var(--color-*)`.

### Estrutura do objeto T

```javascript
const T = {
  key:  "pastel",           // identificador do tema
  name: "Rosa Pastel",      // nome exibido em Config
  e:    "🌸",              // emoji do tema

  // Superfícies
  bg:   "#FFF0F4",          // fundo global da tela
  surf: "#FFFFFF",          // fundo de cards e sheets
  alt:  "#FFE4EE",          // fundo alternativo (inputs, chips inativos)
  bd:   "#F9D0DB",          // cor de borda

  // Cores primárias
  p:    "#E8799A",          // primária — botões, seleções, progresso
  pl:   "#F9B8CC",          // primária clara
  pd:   "#C4567A",          // primária escura
  gh:   "linear-gradient(135deg,#E8799A,#F4B8CC)", // gradiente (cards hero)

  // Texto
  tx:   "#3D2030",          // texto principal
  tm:   "#9C7A83",          // texto muted (labels, descrições)

  // Semânticas
  ok:   "#66BB6A",          // sucesso, confirmado, pago
  wn:   "#FFA726",          // atenção, pendente
  er:   "#EF5350",          // erro, urgente, saída financeira
};
```

### Os 5 temas disponíveis

| Key | Nome | Primary | Uso emocional |
|---|---|---|---|
| `pastel` | Rosa Pastel 🌸 | `#E8799A` | Padrão — feminino, acolhedor |
| `terra` | Terra & Mel 🌿 | `#8B6248` | Natural, orgânico |
| `lilac` | Lilás & Lavanda 💜 | `#8B5CF6` | Espiritual, calmo |
| `neutro` | Neutro Elegante 🤍 | `#262626` | Profissional, minimalista |
| `sage` | Sage & Céu 🩵 | `#059669` | Fresco, natural, expansivo |

### Como aplicar T_DESIGN na prática

```jsx
// ✅ Correto
<div style={{ background: T.surf, border: `1px solid ${T.bd}` }}>
  <p style={{ color: T.tx, fontWeight: 700 }}>Título</p>
  <p style={{ color: T.tm, fontSize: 12 }}>Subtítulo</p>
</div>

// ❌ Errado — nunca hardcode
<div style={{ background: "#FFFFFF", border: "1px solid #F9D0DB" }}>
```

---

## ⚙️ Padrões de Implementação

### 1. Estado global: DEF_DATA e DEF_CFG

```javascript
// Sempre factory functions — nunca objetos literais
// Evita referência compartilhada entre instâncias

const DEF_DATA = () => ({
  _v: 2,                    // versão do schema — incrementar quando mudar estrutura
  routine: { ... },
  health:  { ... },
  finance: { ... },
  spirit:  { ... },
  shopping:{ ... },
  notes:   { ... },
  reminders:{ ... },
  bloom:   { points:{} },
  cycle:   { ... },         // DEPRECATED — migrado para health.profiles[].cycle
  kids:    { ... },
  integrations: { ... },
});

const DEF_CFG = () => ({
  theme: "pastel",
  name:  "Amor",
  dash:  {
    bloom: true, water: true, routine: true,
    finance: true, cycle: true, spirit: true, reminders: true,
  },
});
```

### 2. Persistência: setData e setCfg wrappers

```javascript
// NUNCA chame setDataRaw diretamente fora do App root
// SEMPRE use os wrappers — eles garantem persistência automática

const STORAGE_DATA = "mvida_data_v2";
const STORAGE_CFG  = "mvida_cfg_v2";

const setData = fn => setDataRaw(prev => {
  const next = typeof fn === "function" ? fn(prev) : fn;
  // Auto-persist sem await — fire-and-forget
  try { window.storage.set(STORAGE_DATA, JSON.stringify(next)); } catch {}
  return next;
});
```

**Regra crítica:** Ao adicionar campo novo ao DEF_DATA, incrementar `_v` e considerar migration no carregamento:

```javascript
useEffect(() => {
  (async () => {
    let d = DEF_DATA(), c = DEF_CFG();
    try {
      const rd = await window.storage.get(STORAGE_DATA);
      if (rd?.value) {
        const loaded = JSON.parse(rd.value);
        // Migration: se _v antigo, fundir com DEF_DATA para garantir novos campos
        d = loaded._v >= 2 ? loaded : { ...DEF_DATA(), ...loaded, _v: 2 };
      }
    } catch {}
    setDataRaw(d); setCfgRaw(c);
  })();
}, []);
```

### 3. Funções puras: calcBloom e calcCycleState

Estas funções são usadas em múltiplos screens. Devem ficar **fora de qualquer componente**, no topo do arquivo.

```javascript
// ✅ Correto — função pura, reutilizável, testável
const calcCycleState = (day, start, len, menses) => {
  const ds = Math.floor((new Date(day) - new Date(start)) / 86400000);
  const dc = ((ds % len) + len) % len;
  const dl = len - dc;
  return {
    dc, dl,
    isTPM:    dl <= 7,
    isFertil: dc >= 10 && dc <= 16,
    isMenses: dc < menses,
    phase:    dc < menses ? "Menstrual" : dc < 14 ? "Folicular" : "Lútea",
  };
};

const calcBloom = (data, day) => {
  // Lê do perfil principal de saúde
  const mainP     = data.health.profiles?.find(p => p.id === "eu") || data.health.profiles?.[0];
  const allT      = data.routine.essMode
    ? data.routine.essential
    : [...data.routine.morning, ...data.routine.afternoon, ...data.routine.night];
  const doneIds   = data.routine.done[day] || [];
  const routinePct= allT.length > 0 ? (doneIds.length / allT.length) * 40 : 0;
  const wNow      = mainP?.water?.log?.[day] || 0;
  const waterPct  = Math.min(1, wNow / (mainP?.water?.goal || 2000)) * 30;
  const gratPct   = Math.min(1, (data.spirit.gratitude[day] || []).length / 3) * 30;
  return Math.round(routinePct + waterPct + gratPct);
};
```

### 4. Componentes base compartilhados

Todo componente de UI reutilizável recebe `T` como prop. Nunca acessam tema global diretamente.

```jsx
// Catálogo de componentes base obrigatórios:

ProgressBar({ color, val, max, h=8 })
// Barra de progresso animada com transition .4s

Chip({ T, active, onClick, children })
// Pill clicável — seleção de categorias, filtros, chips de tipo

Toggle({ T, val, onChange })
// Switch boolean — 44x24px, animado

Card({ T, onClick, children, style={} })
// Container com sombra sutil, cursor pointer se onClick

Sheet({ T, title, onClose, children })
// Bottom sheet modal — sempre com handle bar + blur backdrop

FInput({ T, value, onChange, placeholder, type="text", style={} })
// Input padronizado com T.alt de fundo e T.bd de borda

FSelect({ T, value, onChange, options, style={} })
// Select padronizado — mesmos tokens que FInput

Btn({ T, onClick, children, variant="primary", style={} })
// Button: primary (T.p), ghost (T.bd), danger (T.er)

ConfirmDel({ T, label, onCancel, onConfirm })
// Sheet de confirmação de exclusão — sempre usar antes de deletar

```

### 5. Props padrão: o objeto `common`

```javascript
// No App root, antes do render:
const common = { data, T, setData, setTab };

// Cada screen recebe via spread:
{tab === "rotina" && <RotinaScreen {...common} />}

// Screens que precisam de cfg recebem explicitamente:
{tab === "config" && <ConfigScreen {...common} cfg={cfg} setCfg={setCfg} />}
{tab === "home"   && <HomeScreen   {...common} cfg={cfg} />}
```

**Regra:** Toda screen recebe `setTab` via `common`. Isso habilita navegação cruzada — uma screen pode redirecionar para outra sem hierarquia prop drilling.

### 6. Estado de formulários: objetos, não N useState

```jsx
// ❌ Errado — fragmentação que escala mal
const [nome, setNome] = useState("");
const [valor, setValor] = useState("");
const [cat, setCat] = useState("Alimentação");
const [pago, setPago] = useState(false);

// ✅ Correto — objeto único, fácil de resetar
const DEF_NF = () => ({ nome:"", valor:"", cat:"Alimentação", pago:false });
const [nf, setNf] = useState(DEF_NF());

// Atualização parcial
setNf(x => ({ ...x, cat: "Moradia" }));

// Reset completo
setNf(DEF_NF());
```

### 7. Padrão de atualização imutável de dados aninhados

```javascript
// Padrão para atualizar perfil de saúde por ID
const upProfile = (id, fn) => setData(d => ({
  ...d,
  health: {
    ...d.health,
    profiles: d.health.profiles.map(p => p.id === id ? fn(p) : p),
  },
}));

// Uso:
upProfile("eu", p => ({
  ...p, water: { ...p.water, log: { ...p.water.log, [day]: (p.water.log[day]||0) + ml } }
}));
```

---

## 📊 Os 5 Pilares SCLC-G

### S — Simple (Simples)

> Regra dos **2 toques** para toda ação principal. Zero estados intermediários desnecessários. Uma responsabilidade por componente.

- Cada screen = um propósito claro
- Formulários: máximo 4 campos visíveis antes de scroll
- Toda ação de checklist (marcar tarefa, marcar medicamento) deve funcionar com **1 toque direto na linha** — sem sheet de confirmação
- States: usar `null` como valor inicial de `sheet` — não strings arbitrárias
- Componentes < 300 linhas — extrair para arquivo separado se maior
- Funções < 25 linhas — extrair se maior

**Exemplo de 2 toques:**
```
Abrir app → ver tela Rotina (já no turno atual) → tocar na tarefa → marcada ✅
```

### L — Loveable (Adorável)

> Estética que abraça. Paleta T_DESIGN com `pastel` como padrão. Microcopy em pt-BR acolhedor e humano. Feedback visual a cada ação.

**Regras visuais:**
- Fontes: Inter (pesos 400–900). Títulos: 900. Labels: 700. Corpo: 500.
- Borderradius: 12px (inputs), 14px (botões), 16px (cards menores), 20px (cards maiores), 24px (cards hero), 32px (sheets)
- Sombra padrão de card: `0 4px 12px rgba(0,0,0,.03)`
- Sombra de botão primary: `0 4px 12px ${T.p}44`
- Emojis estratégicos: contextualizar ações e estados — nunca decorativos sem função

**Tom de voz (microcopy):**
```javascript
// Correto — acolhedor, pessoal
"Pelo que você é grata hoje? ✨"
"Mínimo para dias difíceis"
"Cuide-se com carinho 🍫"
"Começando a brotar... 💧"

// Errado — frio, genérico
"Insira texto"
"Nenhum item encontrado"
"Erro ao salvar"
```

**Animações obrigatórias:**
- Progresso: `transition: "width .4s cubic-bezier(0.4, 0, 0.2, 1)"`
- Toggle: `transition: "left .2s"` + `transition: "background .2s"`
- Sheet: `backdropFilter: "blur(4px)"` no overlay
- Bloom flower: `transform: scale(${0.8 + bloomPct/200})`, `transition: "transform .5s"`

### C — Complete (Completo)

> Todo fluxo de uso fecha. Nunca deixar a usuária num beco sem saída.

**4 estados obrigatórios por lista/dado:**

| Estado | O que mostrar |
|---|---|
| `loading` | Skeleton ou spinner (quando há latência) |
| `empty` | Mensagem com emoji + CTA para adicionar |
| `error` | Mensagem + botão de retry |
| `success` | Conteúdo renderizado normalmente |

**Exemplo de estado vazio correto:**
```jsx
{tasks.length === 0 && (
  <div style={{ textAlign:"center", padding:"28px 0", color:T.tm }}>
    <p style={{ fontSize:28, margin:"0 0 8px" }}>✅</p>
    <p style={{ margin:0, fontWeight:600, fontSize:14 }}>Sem tarefas neste turno</p>
    <p style={{ margin:"4px 0 0", fontSize:12 }}>Toque em + para adicionar</p>
  </div>
)}
```

**CRUD padrão por módulo:**
- Toda lista tem botão `+` para adicionar
- Toda linha tem botão de remover (Trash2) com `ConfirmDel`
- Toggle para marcar como feito (sem sheet de confirmação — 1 toque)
- Sheets de adição têm botão "Cancelar" + "Salvar"

### C — Connected (Conectado)

> Dados de um módulo refletem em outros. A Flor do Dia é o integrador visual central.

**Conexões obrigatórias já existentes:**

```
calcBloom() lê:
  → data.routine.done[day]          → 40% do bloom
  → data.health.profiles[0].water   → 30% do bloom
  → data.spirit.gratitude[day]      → 30% do bloom

HomeScreen mostra:
  → badges de TPM (lê ciclo do perfil de saúde)
  → badges de lembretes pendentes (lê reminders do dia)
  → badge de eventos Google (lê integrations.google)
  → card de rotina com progresso real
  → card de finanças com próxima conta a vencer
  → card de conexão com contagem de gratidões do dia

Agenda → Caixa (Finanças):
  → quando realizado, propor lançamento no caixa (TODO)
```

**Conexões a implementar:**
```
SaudeScreen (medicamentos) → HomeScreen (badge "tomar remédio hoje")
RotinaScreen (crianças 100%) → badge na tab Rotina
EspiritualScreen (gratidão) → percentual exibido dentro do screen
FinancasScreen (conta vencendo) → badge urgente na tab Finanças
```

**Regra de navegação cruzada:**
Toda tela recebe `setTab`. Badges na Home devem ser clicáveis e navegar para a tela correspondente. Nunca um badge que não faz nada.

### G — Gamified (Gamificado)

> A Flor do Dia É a gamificação do VidaFlor. Não um sistema de pontos separado — uma metáfora visual integrada à vida real.

**A Flor:**
```javascript
bloomPct < 40  → <Leaf />    — "Começando a brotar... 💧"
bloomPct < 80  → <Flower />  — "Quase lá, continue! 🌱"
bloomPct >= 80 → <Flower2 /> — "Florescimento Total! ✨"

// Escala visual:
transform: `scale(${0.8 + (bloomPct/200)})`
// bloomPct=0  → scale(0.80) — flor pequena
// bloomPct=100 → scale(1.30) — flor grande e vibrante
```

**Celebração ao atingir 100%:**
```jsx
// Banner dismissível no topo da Home
{celebrated && (
  <div style={{ background:T.gh, borderRadius:20, padding:"16px 20px", color:"#fff" }}>
    <Sparkles size={28} color="#fff" />
    <p style={{ fontWeight:900, fontSize:16 }}>Florescimento Total! ✨</p>
    <p style={{ fontSize:12, opacity:.9 }}>Você completou sua flor do dia!</p>
    <button onClick={() => setCelebrated(false)}>×</button>
  </div>
)}
```

**O que contribui para o bloom (regra de negócio):**
```
Rotina completa no dia    → até 40 pontos
Hidratação ≥ meta         → até 30 pontos
3 gratidões registradas   → até 30 pontos
Total máximo por dia:       100 pontos
```

**Princípios da gamificação no VidaFlor:**
- Reconhece ações reais, não artificiais
- Nunca remove pontos (sem punição)
- Sem notificações manipuladoras
- A usuária pode desabilitar o card Bloom em Configurações
- Celebrações proporcionais — 1 toque fecha o banner

---

## 🗃️ Modelagem de Dados

### Estrutura completa do DEF_DATA

```javascript
const DEF_DATA = () => ({
  _v: 2,

  // ── ROTINA ────────────────────────────────────────────────────────────────
  routine: {
    morning:   [{ id, task, time }],   // tarefas da manhã
    afternoon: [{ id, task, time }],   // tarefas da tarde
    night:     [{ id, task, time }],   // tarefas da noite
    essential: [{ id, task }],         // modo essencial (dias difíceis)
    done:      {},                     // { "YYYY-MM-DD": [id1, id2, ...] }
    essMode:   false,                  // boolean — alterna modo
  },

  // ── SAÚDE (multi-perfil) ──────────────────────────────────────────────────
  health: {
    activeProfile: "eu",              // id do perfil ativo
    profiles: [{
      id:     "eu",
      name:   "Você",
      av:     "👩",
      type:   "adult_f",             // adult_f | adult_m | child | pet
      color:  "#E8799A",
      water:  { goal: 2000, log: {} },  // log: { "YYYY-MM-DD": ml }
      cycle:  { start, len, menses },   // só em adult_f
      meds:   [{ id, name, dose, time, log:{} }],  // log: { "YYYY-MM-DD": bool }
      notes:  {},                       // { "YYYY-MM-DD": "texto livre" }
    }],
  },

  // ── FINANÇAS ──────────────────────────────────────────────────────────────
  finance: {
    transactions: [{
      id, desc, val,
      type:        "income" | "expense",
      cat,         // categoria com emoji (ex: "🛒 Alimentação")
      date,        // "YYYY-MM-DD"
      due,         // "YYYY-MM-DD" — vencimento (apenas expense)
      paid:        bool,
      cardId:      null | cardId,
      installment: null | { total, current, groupId },
    }],
    cards: [{
      id, name, brand, color,
      closeDay: 5,   // dia de fechamento
      dueDay:   15,  // dia de vencimento
    }],
    budget: {},      // { "YYYY-MM": number } — disponível por mês
  },

  // ── ESPIRITUALIDADE ───────────────────────────────────────────────────────
  spirit: {
    gratitude: {},         // { "YYYY-MM-DD": ["item1", "item2", ...] }
    readings:  [],         // [{ id, book, chapter, date }]
    prayers:   [],         // [{ id, person, request, answered: bool }]
  },

  // ── ORGANIZAÇÃO ───────────────────────────────────────────────────────────
  shopping: {
    items: [{ id, name, cat, done: bool }],
  },
  notes: {
    list: [{ id, title, content, color, date }],
  },
  reminders: {
    list: [{ id, title, time, date, cat, priority, done: bool }],
  },

  // ── BLOOM ─────────────────────────────────────────────────────────────────
  bloom: {
    points: {},   // { "YYYY-MM-DD": number } — histórico futuro
  },

  // ── CRIANÇAS ──────────────────────────────────────────────────────────────
  kids: {
    children: [{
      id, name, av, age, color,
      tasks: [{ id, task, ic }],   // ic = emoji da tarefa
    }],
    done: {},    // { "YYYY-MM-DD": [taskId1, taskId2, ...] }
  },

  // ── INTEGRAÇÕES ───────────────────────────────────────────────────────────
  integrations: {
    google: {
      connected: false,
      email:     "",
      calendars: [{ id, name, active: bool }],
      events:    [{ id, title, time, date, cal }],
    },
  },
});
```

### IDs: convenção

```javascript
// Dados de seed (DEF_DATA) → IDs numéricos sequenciais (1, 2, 3...)
// Dados criados pelo usuário → Date.now() (timestamp 13 dígitos)
// Perfis de saúde → strings com prefixo (ex: "eu", "p_1713456789000")
// Grupos de parcelas → strings com prefixo (ex: "grp_1713456789000")
// Medicamentos → strings com prefixo (ex: "m_1713456789000")
```

---

## 📐 Responsividade e Layout

### Breakpoints e comportamento

O VidaFlor é **mobile-first**. O layout é otimizado para 375–430px de largura.

```javascript
// App container — centraliza em telas largas
<div style={{
  maxWidth: 430,
  margin: "0 auto",
  minHeight: "100vh",
  background: T.bg,
  position: "relative",
}}>
```

### Bottom Navigation

```javascript
// 6 tabs + Config acessível via ícone no header
const NAV_ITEMS = [
  { k: "home",       I: Home,        lb: "Início"   },
  { k: "rotina",     I: LayoutGrid,  lb: "Rotina"   },
  { k: "saude",      I: Heart,       lb: "Saúde"    },
  { k: "espiritual", I: Star,        lb: "Conexão"  },
  { k: "organiza",   I: ShoppingCart,lb: "Organiza" },
  { k: "financas",   I: DollarSign,  lb: "Finanças" },
];
// Config acessível via Settings no header — não na bottom nav
```

### Touch targets

Todo elemento interativo em mobile: mínimo **44×44px**.

```jsx
// Botão de ação primário
style={{ width:44, height:44, borderRadius:14, ... }}

// Ícone de ação em lista
style={{ width:28, height:28, borderRadius:8, ... }}

// Item de lista clicável → padding 12–14px vertical
style={{ padding:"13px 15px", borderRadius:16, ... }}
```

### Header sticky

```jsx
<div style={{
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: T.bg + "EE",          // levemente transparente
  backdropFilter: "blur(10px)",      // blur iOS-style
  borderBottom: `1px solid ${T.bd}`,
  padding: "14px 20px 12px",
  display: "flex",
  alignItems: "center",
  gap: 12,
}}>
```

### Padding padrão de conteúdo

```jsx
// Todas as screens:
<div style={{ padding: "20px 20px 20px" }}>
// 20px topo, 20px laterais
// paddingBottom do App container: 90px (altura da bottom nav + margem)
```

---

## 🧩 Módulos do Sistema

### Status atual de cada módulo

| Módulo | Screen | Status | Notas |
|---|---|---|---|
| Dashboard | `HomeScreen` | ✅ Completo | Bloom, agua, ciclo, finanças, rotina, espiritual, lembretes |
| Rotina adulto | `MinhaRotina` | ✅ Completo | 3 turnos + modo essencial + CRUD |
| Rotina crianças | `CriancasRotina` | ✅ Completo | Multi-criança, avatar por cor, CRUD |
| Saúde | `SaudeScreen` | ✅ v2 | Multi-perfil, água, ciclo, medicamentos, anotação |
| Espiritual | `EspiritualScreen` | ✅ Completo | Gratidão, leitura, orações |
| Compras | `OrganizaScreen` (tab) | ✅ Completo | Lista com categorias |
| Notas | `OrganizaScreen` (tab) | ✅ Completo | Grid colorido |
| Lembretes | `OrganizaScreen` (tab) | ✅ Completo | Com data, hora, prioridade |
| Finanças | `FinancasScreen` | ✅ v3 | Entradas/saídas, cartões, parcelas, orçamento, projeção |
| Config | `ConfigScreen` | ✅ Completo | Tema, nome, dash toggles, Google (demo) |

### Fluxos principais completos

```
ROTINA:
  Turno atual → lista de tarefas → toque = marcar ✅ → bloom atualiza
  + adiciona tarefa → sheet (nome + horário) → salva
  Modo essencial: toggle → 5 tarefas mínimas

CRIANÇAS:
  Selecionar criança → ver tarefas grandes e coloridas
  → toque = marcar (visual com cor da criança)
  + adicionar tarefa → sheet (nome + emoji)

SAÚDE/ÁGUA:
  Botões rápidos +150, +250, +350, +500 → 1 toque
  "Personalizado" → sheet com input
  Meta configurável via ⚙️
  Resetar dia disponível

FINANÇAS:
  "↑ Nova Entrada" ou "↓ Nova Saída" → 2 toques
  Saída parcelada: toggle → total + nº parcelas → gera automaticamente N lançamentos
  Cartão: clicar no card → ver fatura + compras + adicionar compra inline
  Projeção: clicar no card de saldo → carrossel mensal com scroll snap
  Orçamento: ✏️ → sheet → disponível do mês com feedback automático

ESPIRITUAL:
  Gratidão: + → sheet → texto → lista no mural
  Oração: + → sheet → pessoa + motivo → marcar como respondida
  Leitura: + → sheet → livro + capítulo

BLOOM:
  Calculado em tempo real via calcBloom()
  Flower cresce conforme rotina + água + gratidão
  Celebração banner ao atingir 100%
```

---

## 💬 Microcopy (pt-BR)

```javascript
// src/constants/messages.js (criar quando extrair)

export const MSG = {
  ROTINA: {
    VAZIA:        "Sem tarefas neste turno — toque em + para adicionar",
    ESSENCIAL_ON: "Modo dias difíceis ativado ⚡",
    COMPLETA:     "Turno concluído! ✅",
  },
  SAUDE: {
    AGUA_META:    "Meta batida! Corpo hidratado 💧",
    AGUA_VAZIA:   "Que tal começar com 250ml? 💧",
    MED_TOMADO:   "Medicamento registrado ✅",
  },
  FINANCAS: {
    ENTRADA:      "💚 Entrada registrada",
    SAIDA:        "🔴 Saída registrada",
    PARCELA_INFO: (n, v) => `${n}x de R$ ${v} — parcelas geradas automaticamente`,
    ORCAMENTO_OK: "Incrível, vai estar tudo pago! ✅",
    ORCAMENTO_WN: "Precisa de atenção, mas você vai conseguir! 💪",
    ORCAMENTO_ER: "Atenção! Gastos acima do disponível. Revise! 🔴",
  },
  ESPIRITUAL: {
    GRAT_VAZIA:   "Pelo que você é grata hoje? ✨",
    ORACAO_OK:    "Oração respondida 🙏",
  },
  BLOOM: {
    INICIO:       "Começando a brotar... 💧",
    MEIO:         "Quase lá, continue! 🌱",
    TOTAL:        "Florescimento Total! ✨",
    CELEBRACAO:   "Você completou sua flor do dia!",
  },
  CRIANCAS: {
    VAZIA:        "Sem tarefas ainda — toque em + para adicionar",
    COMPLETA:     (nome) => `${nome} completou todas as tarefas! 🎉`,
  },
  ERROS: {
    CAMPO_OBRIG:  (campo) => `${campo} é obrigatório`,
    GENERICO:     "Algo deu errado. Tente novamente.",
  },
} as const;
```

---

## ✅ Checklist de Qualidade

### Antes de cada commit / entrega:

#### Código
- [ ] Sem cores hardcoded — apenas `T.*` tokens
- [ ] Sem `any` (mesmo sendo JSX não TypeScript — evitar variáveis não tipadas)
- [ ] Componentes < 300 linhas — extrair se maior
- [ ] Funções < 25 linhas — extrair se maior
- [ ] Estado de formulário: objetos, não N `useState`
- [ ] IDs de novos itens: `Date.now()`
- [ ] `setData`/`setCfg` wrappers — nunca `setDataRaw` diretamente
- [ ] Funções puras (calcBloom, calcCycleState) fora de componentes

#### UX / Mobile
- [ ] Touch targets ≥ 44x44px em todos os elementos interativos?
- [ ] 1–2 toques para toda ação de checklist (marcar tarefa, marcar medicamento)?
- [ ] Ações destrutivas (remover) sempre com `ConfirmDel`?
- [ ] Ações de toggle direto (marcar feito) sem sheet de confirmação?
- [ ] Estado vazio tratado com emoji + mensagem + CTA?
- [ ] Padding padrão de screen: `20px 20px 20px`?
- [ ] paddingBottom do App container: `90px`?

#### Design
- [ ] T_DESIGN aplicado — paleta do tema ativo via `T.*`?
- [ ] Microcopy em pt-BR, acolhedor, pessoal?
- [ ] Animações de progresso: `transition: "width .4s cubic-bezier(...)"`?
- [ ] Handle bar em todos os Sheets: `width:40, height:4, background:T.bd`?
- [ ] Backdrop blur nos overlays: `backdropFilter: "blur(4px)"`?

#### Completude
- [ ] 4 estados cobertos: loading + empty + error + success?
- [ ] CRUD completo: add + toggle/edit + delete com confirm?
- [ ] Sheet de adição tem "Cancelar" + "Salvar"?
- [ ] Formulário reseta após salvar (`setNf(DEF_NF())`)?

#### Conexão
- [ ] Se o dado impacta o bloom, `calcBloom` está lendo corretamente?
- [ ] Se o dado precisa aparecer na Home, `cfg.dash.*` está verificando?
- [ ] Badge da Home é clicável e navega para a tela certa?
- [ ] `setTab` disponível na screen para navegação cruzada?

#### Gamificação
- [ ] Bloom atualiza em tempo real ao marcar tarefas?
- [ ] Card Bloom pode ser desabilitado em Config (`cfg.dash.bloom`)?
- [ ] Celebração aparece ao atingir 100% (banner dismissível)?
- [ ] Sem punição — bloom só sobe, nunca remove pontos?

---

## 🚀 Como Usar Esta SKILL

### Padrão de solicitação:

```
"Desenvolva [feature] seguindo a SKILL VidaFlor:

1. Feature: [descrição clara]
2. Tipo: Screen / Componente / Hook / Utilitário
3. Módulo: [Home / Rotina / Saúde / Espiritual / Organiza / Finanças / Config]
4. Requisitos:
   - [req 1]
   - [req 2]
5. Referência: [componente ou padrão similar já existente]

Siga: T_DESIGN, SCLC-G, microcopy pt-BR, checklist de qualidade."
```

### Exemplo prático:

```
"Desenvolva o componente `HumorDiario` seguindo a SKILL VidaFlor:

1. Feature: Card para registrar humor do dia (3 opções: 😊 😐 😔)
2. Tipo: Componente (inline no HomeScreen)
3. Módulo: Home
4. Requisitos:
   - 1 toque para selecionar humor
   - Salvar em data.health.profiles[0].notes[day]
   - Mostrar humor selecionado de dias anteriores como histórico de 7 dias
   - Contribuir +10% no calcBloom quando humor registrado
5. Referência: Card de água no HomeScreen (mesmo padrão visual)

Siga T_DESIGN pastel, microcopy acolhedor, 1 toque para marcar."
```

---

## 📋 Checklist de Feature Completa

- [ ] **Conectada?** Dados impactam bloom / home / outros módulos?
- [ ] **Mobile-first?** Funciona perfeitamente em 375px?
- [ ] **Offline?** window.storage persiste corretamente?
- [ ] **1–2 toques?** Ação principal sem sheets desnecessários?
- [ ] **CRUD?** Add + toggle + delete com confirmação?
- [ ] **Vazia?** Estado vazio tratado com emoji + CTA?
- [ ] **Bloom?** Contribui para o Flor do Dia se relevante?
- [ ] **Tema?** Funciona nos 5 temas (testar pastel + neutro)?
- [ ] **Microcopy?** Texto acolhedor, pessoal, em pt-BR?
- [ ] **Extraída?** Screen > 300 linhas virou arquivo separado?

#### Evoluções técnicas
- [ ] **TypeScript:** novo código usa interfaces tipadas de `src/types/data.ts`?
- [ ] **TypeScript:** props de componente têm interface explícita?
- [ ] **TypeScript:** funções puras têm tipo de retorno declarado?
- [ ] **Zustand:** ação que altera estado usa o store do módulo — não `setData` global?
- [ ] **Zustand:** computed values (saldoMes, calcBloom) estão no store — não inline?
- [ ] **CSS Modules:** componente novo tem `.module.css` em vez de inline styles?
- [ ] **CSS Modules:** hover e active feedback implementados no CSS?
- [ ] **CSS Variables:** cores atualizadas via `applyTheme()` ao trocar tema?

---

**Versão:** 1.1
**Data:** Abril 2026
**Status:** ✅ Active Development
**Plataforma:** Mobile-First PWA · Single-File React SPA
**Evoluções v1.1:** TypeScript + Zustand + CSS Modules
**Princípio:** "Um app que faz a mulher se sentir cuidada e organizada — não sobrecarregada."
