---
name: vidaflor-design
description: >
  Design-only guide for transferring the Vida Flor "jardim digital" visual identity
  onto the EXISTING Vida Flor repo. Use this skill whenever the work is visual:
  restyle or redesign a screen/component, apply the `--vf-*` tokens, wire the two
  premium themes (Aurora light / Crepúsculo warm-dark), fix font/theme cascade bugs,
  align a view to the prototype's layout/typography/motion, or audit styling drift.
  Trigger on "redesign", "aplica o design", "aplicar design system", "migra o
  visual", "nova identidade visual", "estiliza a tela", "Aurora", "Crepúsculo",
  "tokens vf", "deixa premium", "a flor", "vitalidade". This skill owns ONLY the
  visual layer. It never builds stores, persistence, migrations, or business logic —
  for that, defer to CLAUDE.md and the `vidaflor-arch` skill, and preserve all logic
  verbatim. Read the prototype in `vidaflor/` (styles.css, flower.jsx, ui.jsx,
  screens-*.jsx) + PLANO_AGENTE.md as the design source of truth.
---

# Vida Flor — Design Transfer Guide (design-only)

Transfer the Vida Flor visual identity onto the **existing** repo, one screen at a
time. The scope of this skill is the **visual layer only**: tokens, themes, fonts,
primitives, typography, motion, copy voice. **Never** touch stores, persistence,
migrations, money math, or routing logic — those belong to `CLAUDE.md` +
`vidaflor-arch`. When restyling, preserve every line of business logic verbatim.

> Vida Flor is **not** a productivity app. It is a contemplative digital garden whose
> emotional center is a procedural flower that blooms with the user's care. Every
> visual decision serves that metaphor.

---

## Stack reality — confront this before styling anything

This repo is **Vite 6 + React 18 + TypeScript 6 + CSS Modules + Zustand 5 +
lucide-react + Recharts**. Confirmed from `package.json`. It is decisively **NOT**:

| The old design skill assumed | The real repo |
|---|---|
| Next.js App Router, `next/font`, `globals.css`, `'use client'` | Vite SPA, fonts via `<link>` in root `index.html`, entry `src/main.tsx` |
| Tailwind v4 `@theme` + utility classes + `@apply` | **CSS Modules** (`Name.module.css`) + inline `style={{ var(--vf-*) }}` |
| `--color-brand-500` cyan, dark navy `#030712` surfaces | `--vf-*` tokens, warm Aurora/Crepúsculo, rose `#B8607A` anchor |
| Inter + Playfair Display | **Instrument Serif + Geist + JetBrains Mono** (already loaded in `index.html`) |
| `cva` + Radix `Slot` + `cn()` | `[styles.a, cond ? styles.b : "", className].filter(Boolean).join(" ")` |
| Sidebar + TopBar desktop dashboard | 480px mobile-first shell + fixed 6-tab BottomNav |

> ⚠️ **The currently-installed `vidaflor-design` skill is the generic Next.js one.**
> That mismatch is the source of the "confrontos" — Claude Code reads it and tries to
> apply Tailwind/dark-navy/cyan to a Vite/CSS-Modules/warm app. **This file replaces it.**

---

## Phase 0 — Read the design source of truth

Before styling, read (intent → values → DNA → APIs → the screen):

1. `vidaflor/PLANO_AGENTE.md` — concept, flower spec, theme philosophy, copy voice, anti-patterns.
2. `vidaflor/styles.css` — the prototype's complete `--vf-*` token set (mirrors `src/styles/tokens.css`).
3. `vidaflor/flower.jsx` — the procedural BloomFlower (sensory DNA: spring, breathe, sway).
4. `vidaflor/ui.jsx` — primitives + icon set as designed.
5. The specific `vidaflor/screens-*.jsx` for the screen you're restyling — layout, spacing, hierarchy, copy.
6. Screenshots in `uploads/*.png` — contrast, glass surfaces, motion cues.

Treat the prototype as **design spec**, not code to port line-by-line. The repo's real
primitive APIs (below) win over the prototype's prop names where they differ.

---

## Phase 1 — Confront the current repo: live styling conflicts

These exist in `sdwplayer01/vidaflor@main` **right now**. Surface them and get a
yes/no before restyling — they cause wrong fonts and theme flicker on every screen.
Ship fixes in small gated slices (per CLAUDE.md), not one dump.

| # | Conflict (verified) | Where | Fix (design-owned) |
|---|---|---|---|
| **1** | **Body font is broken.** `tokens.css` sets `body` → `var(--vf-font-ui)` (Geist), but `global.css` **and** `index.css` (imported last in `main.tsx`) re-set `body` → `'Inter'`. Inter is **not even loaded** in `index.html`, so it falls back to system sans — Geist never applies. | `src/index.css`, `src/styles/global.css` | Delete both `body { font-family: 'Inter' … }` rules. Let `tokens.css` own the body font. |
| **2** | **Two theme appliers.** v2 `src/shared/constants/themes.ts` `applyTheme()` only sets `data-theme` (correct — lets the CSS cascade resolve every `--vf-*`). Legacy `src/utils/applyTheme.ts` defines 5 dead themes (pastel/terra/lilac/neutro/sage) and **writes inline `--vf-*` via JS that clobber the cascade**. | `src/utils/applyTheme.ts` | Confirm nothing imports the legacy one, then delete it. Only `constants/themes.ts` may set the theme. |
| **3** | **Triple reset overlap.** Box-sizing/scrollbar resets are declared in `index.css`, `styles/reset.css` (via `global.css`), **and** inside `tokens.css` — order-dependent, partly contradictory (`index.css` hides scrollbars; `tokens.css` styles a 4px thumb). | `index.css`, `reset.css`, `tokens.css` | Consolidate to one reset. Prefer the `tokens.css` reset; strip the duplicates from `index.css`. |
| **4** | **Legacy color leakage risk.** `src/utils/` still ships `bloom.ts`, `cycle.ts`, `date.ts`, `migration.ts`, `storage.ts` from v1, some with hardcoded old pinks (`#E8799A`). | `src/utils/*` | Don't import design values from `src/utils`. Any hardcoded legacy hex in a styled component → map to a `--vf-*` token (table below). Removal of the files is an **arch** task — flag, don't delete blindly. |

Conflicts touching stores, migrations, or storage keys are **not yours** — note them
and defer to `vidaflor-arch` / CLAUDE.md.

---

## Phase 2 — Tokens (`src/styles/tokens.css`) — already correct, just use them

Tokens **already exist and match the prototype**. Do not convert to Tailwind `@theme`.
The system: every token is a CSS variable `--vf-*`, defined under
`:root, [data-theme="aurora"]` and `[data-theme="crepusculo"]`; theme-independent
tokens (fonts, radii, spacing, easing, scale) live in a third `:root` block.
**Theme switch = one line:** `document.documentElement.setAttribute("data-theme", key)`
— the cascade re-resolves everything. **Never write per-theme component CSS.**

### Token families (use names verbatim)

```
Surfaces  --vf-bg-0 --vf-bg-1 --vf-surf --vf-surf-alt --vf-surf-soft
          --vf-glass --vf-glass-strong --vf-bd --vf-bd-strong
Text      --vf-tx --vf-tx-soft --vf-tx-mute --vf-tx-faint --vf-on-rose
Palette   --vf-coral(-soft) --vf-rose(-soft/-deep) --vf-lilac(-soft)
          --vf-champagne(-soft) --vf-sage(-soft)
Gradients --vf-grad-hero --vf-grad-coral/-rose/-lilac/-champ/-sage --vf-grad-ambient
Flower    --vf-petal-outer/-mid/-inner/-bud --vf-petal-glow
Shadows   --vf-shadow-xs/-sm/-md/-lg --vf-shadow-hero --vf-shadow-glow
          --vf-shadow-card(-hover) --vf-shadow-btn --vf-shadow-sheet --vf-shadow-nav
Semantic  --vf-ok --vf-wn --vf-er (+ -light)
Type      --vf-font-display/-ui/-mono · --vf-fs-xs..xl · --vf-fw-md/-bold/-xbold/-black
Radii     --vf-r-xs(8) -sm(12) -md(18) -lg(24) -xl(32) -2xl(44) -full
Spacing   --vf-sp-xs(4) -sm(8) -md(16) -lg(24) -xl(40)
Easing    --vf-ease-spring --vf-ease-organic --vf-ease-soft
```

Backward-compat aliases exist (`--vf-bg --vf-p --vf-pl --vf-pd --vf-gh --vf-tm
--vf-white --vf-alt --vf-s2`) — keep them mapped; prefer canonical names in new code.
**Adding a token? Add it to BOTH theme blocks** (or the shared `:root` if theme-independent).

### Ready-made helper classes in `tokens.css` (reuse, don't re-declare)

`.vf-display` `.vf-display-it` `.vf-eyebrow` `.vf-label` `.vf-body` `.vf-caption`
`.vf-mono` `.vf-glass-card` `.vf-tap` `.vf-pill` (+ `-rose`/`-sage`/`-champ`).

---

## Phase 3 — Fonts & theme are wired; just stop fighting them

- **Fonts are loaded.** `index.html` already pulls Instrument Serif (ital), Geist
  (400–700), JetBrains Mono. `<html lang="pt-BR" data-theme="aurora">` is preset.
  Your only job: close **Conflict #1** so `--vf-font-ui` (Geist) wins on `body`.
- **Theme is wired.** `ThemeProvider` reads `useConfigStore(s=>s.theme)` and calls the
  v2 `applyTheme`. Don't add a second theme effect. `useTheme()` gives
  `{ themeKey, theme, setTheme }` for the config picker.

---

## Phase 4 — Primitives: real APIs (do not invent props)

Reuse primitives from `src/shared/ui` — **never recreate**. Each is `Name.tsx` +
`Name.module.css` + `index.ts`, barrelled in `src/shared/ui/index.ts`. Extend by
adding a class to the `.module.css` and widening the TS union — keep the
`.filter(Boolean).join(" ")` merge. No `cva`, no `cn()`, no Radix.

| Primitive | Real signature |
|---|---|
| `Btn` | `variant?: "primary" \| "ghost" \| "danger"` · `loading` · `onClick` · `type` · `ariaLabel` · `disabled` · `style` · `className` |
| `Card` | `hero?: boolean` · `onClick?` (adds `.clickable`) · `style` · `className` |
| `Chip` | `active: boolean` · `onClick` · `children` — it's a **toggle button**, not tone variants |
| `Sheet` | `title: string` · `onClose` · `children` — **no `open` prop**; render it conditionally. Closes on overlay click / Esc / X; locks body scroll; traps focus |
| `Badge` | `label: string` · `variant?: "default" \| "success" \| "warning" \| "danger" \| "info"` |
| `ProgressBar` | `color: string` · `val: number` · `max: number` · `h?: number` |
| `Toggle` `FInput` `FSelect` `EmptyState` `SectionHeader` `ActionRow` `ConfirmDel` | read the file before use |

> The prototype's `ui.jsx` shows richer prop names (e.g. tone-based Chip, `Sheet open=`).
> **The repo APIs above are authoritative.** Match them; don't port the prototype's props.

> `Btn` has only `primary \| ghost \| danger`. For a "secondary/outline" look use
> `ghost`, or add a variant class + widen `BtnVariant` — never pass an undefined variant.

---

## Phase 5 — Shell, BottomNav & the flower (visual binding only)

- **`AppShell`** — 480px centered container, `background: var(--vf-grad-ambient)` fixed,
  `paddingBottom: 96`. Each screen renders **its own header**; there is no shared TopBar.
- **`BottomNav`** — fixed 6 tabs (`home`/`dia`/`saude`/`espiritual`/`organiza`/`financas`).
  The **home tab is `<FlowerMark pct={vitality} size={22}>`**, not an icon — the mark
  responds to vitality. Other tabs: `lucide-react` at `strokeWidth={1.6}`.
- **The flower blooms from one derived number, `vitality (0–100)`.** Read it for visual
  binding only: `import { useVitality } from "@/features/bloom/selectors"`. Never add
  visual conditionals outside that abstraction; never recompute vitality in a component
  (that's `bloom/selectors.ts` + `bloom/utils.ts` — arch territory).

### Motion DNA — the flower is never static

Spring easing `var(--vf-ease-spring)` = `cubic-bezier(0.34,1.56,0.64,1)` on petals &
sheets. The flower breathes (breathe 5s + sway 8s + petal-spring). **Always** gate
ambient loops behind `@media (prefers-reduced-motion: reduce)`.

---

## Phase 6 — Restyle a screen

**Procedure:** read the matching `vidaflor/screens-*.jsx` → identify which primitives it
uses → replicate layout/spacing/type hierarchy with `--vf-*` + primitives → preserve the
copy voice → confirm it renders in **both** themes. Change visual classes/tokens only;
leave store reads/writes, selectors, handlers, and types untouched.

**Legacy → `--vf-*` mapping** (apply to any hardcoded styling you encounter):

| Old / hardcoded | New |
|---|---|
| `#FFFFFF` / `white` card | `var(--vf-surf)` (or `<Card>` / `.vf-glass-card`) |
| page background | `var(--vf-grad-ambient)` (shell) / `var(--vf-bg-0)` |
| old pink `#E8799A` / `--vf-p` | `var(--vf-rose)` (`#B8607A` anchor) |
| grey text ramp | `var(--vf-tx)` / `-soft` / `-mute` / `-faint` |
| `#eee`-ish borders | `var(--vf-bd)` / `var(--vf-bd-strong)` |
| ad-hoc green/red/amber | `var(--vf-ok)` / `var(--vf-er)` / `var(--vf-wn)` (+ `-light`) |
| raw `<button>` CTA | `<Btn variant="primary">` |
| Lora / Playfair heading | `.vf-display` / `.vf-display-it` (Instrument Serif) |
| mono numbers | `var(--vf-font-mono)` / `.vf-mono` |
| neon / hard shadow | `var(--vf-shadow-sm/-md)` (warm, low-opacity, layered) |

### Quick patterns

```tsx
// Contemplative header
<p className="vf-eyebrow">hoje</p>
<h1 className="vf-display-it" style={{ fontSize: 32, color: "var(--vf-tx)" }}>seu jardim respira</h1>

// Hero / glass card
<Card hero>…</Card>
<div className="vf-glass-card" style={{ padding: "var(--vf-sp-lg)" }}>…</div>

// Status pill · primary action · sheet · progress · mono number
<span className="vf-pill vf-pill-rose">florescendo</span>
<Btn variant="primary" onClick={fn}>plantar cuidado</Btn>
{aberto && <Sheet title="plantar cuidado" onClose={fechar}>…</Sheet>}
<ProgressBar color="var(--vf-rose)" val={pct} max={100} h={8} />
<span style={{ fontFamily: "var(--vf-font-mono)" }}>{pct}%</span>
```

---

## Phase 7 — Verify (design checks only)

```bash
# Inter / wrong fonts must be gone from styling
grep -rn "Inter\|Playfair\|Lora" --include="*.css" --include="*.tsx" src/

# Legacy theme applier must not be imported
grep -rn "utils/applyTheme" --include="*.ts" --include="*.tsx" src/

# Hardcoded hex where a token belongs (spot-check)
grep -rn "#fff\b\|#FFFFFF\|#E8799A" --include="*.tsx" src/features/ src/screens/
```

- [ ] Body font resolves to **Geist** (Conflict #1 closed).
- [ ] Only the v2 `applyTheme` (constants/themes.ts) sets `data-theme`.
- [ ] Screen renders correctly in **both** `aurora` and `crepusculo`.
- [ ] Vitality-affecting actions visibly move the flower.
- [ ] `prefers-reduced-motion` disables breathe / sway / shimmer.
- [ ] Primitives reused from `src/shared/ui` — none recreated; real props used.

---

## Typography

| Use | Token / class |
|---|---|
| Contemplative moments, hero, labels, brand | `--vf-font-display` / `.vf-display` / `.vf-display-it` (Instrument Serif — its italic is the identity; **never** Lora/Playfair) |
| UI, body, operational numbers | `--vf-font-ui` (Geist) — implicit default |
| "Cold" numbers: %, counters, metrics | `--vf-font-mono` / `.vf-mono` (JetBrains Mono) |

Scale `--vf-fs-xs(11)..xl(22)`; weights `--vf-fw-md(500)..black(900)`.

---

## Copy voice (preserve — poetic, lowercase, italic where possible)

| Don't say | Say |
|---|---|
| adicionar tarefa | **plantar cuidado** |
| salvar gratidão | **guardar no jardim** |
| progresso / completar | **florescer** / **abrir pétalas** |
| contato / mensagem | **presença** / **tocar** |
| finanças / saldo | **solo fértil** |

Microcopy in pt-BR, contemplative, lowercase, italic where the display font allows.
No dry CTAs.

---

## Anti-patterns — do NOT

- ❌ Introduce Tailwind, `cva`, Radix `Slot`, `cn()`, or `@theme` — match the repo's idioms.
- ❌ Recreate a primitive locally, or pass props it doesn't have (see Phase 4).
- ❌ Use emojis as structural UI icons — only as personal symbols (task/mood/transaction).
- ❌ Swap Instrument Serif for Lora/Playfair — its italic is the brand.
- ❌ Gradient every card. Glass + hero are special cases only.
- ❌ Washed generic pink. Burnt rose `#B8607A` (`--vf-rose`) is the anchor.
- ❌ Draw the flower with emoji or static SVG. **Procedural always.**
- ❌ More than **2 warm colors** on one screen.
- ❌ Neon `text-shadow`/`box-shadow`. Shadows are warm, low-opacity, multi-layer.
- ❌ Bring back the 5 legacy themes (pastel/terra/lilac/neutro/sage).
- ❌ Touch stores, persistence, migrations, money math, or routing — defer to `vidaflor-arch` / CLAUDE.md.

---

## Border & shadow convention

`--vf-bd` standard borders · `--vf-bd-strong` inputs/active · `--vf-shadow-xs/-sm`
resting cards · `--vf-shadow-md` hover · `--vf-shadow-lg/-hero` hero/sheets ·
`--vf-shadow-glow` flower only. Icon stroke `1.6` resting. Cards lift
`translateY(-2px)` + widen shadow on hover.

---

## Order checklist

```
[ ] Phase 0 — Read PLANO_AGENTE.md + prototype (styles/flower/ui/screen) + screenshots
[ ] Phase 1 — Confront the 4 live conflicts; fix #1 & #2 first, in gated slices
[ ] Phase 2 — Use tokens.css as the single token source (add new tokens to BOTH themes)
[ ] Phase 3 — Stop the Inter override; one theme effect only
[ ] Phase 4 — Reuse/extend primitives with their REAL props
[ ] Phase 5 — Shell + BottomNav + FlowerMark bound to useVitality (visual only)
[ ] Phase 6 — Restyle the screen: visual classes only, map legacy → --vf-*, keep voice
[ ] Phase 7 — Both-theme test + grep sweep + reduced-motion
```

*Vida Flor is a digital garden where the user cultivates themselves. This skill moves
only the visual layer — logic stays exactly as the Walter built it.*
