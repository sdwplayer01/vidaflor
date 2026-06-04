# Vida Flor

App de gestão pessoal e familiar com uma identidade única: uma **flor de vitalidade animada** que floresce conforme o usuário cuida da própria vida — rotina, saúde, finanças, espiritualidade e família.

## Quick Start

```bash
npm install
npm run dev
```

Abrir em `http://localhost:5173`

## Build & Deploy

```bash
npm run build      # build de produção em dist/
npm run preview    # prévia local do build
npx tsc --noEmit   # verificação de tipos
```

Deploy automático para GitHub Pages via GitHub Actions em push to `main`.

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 |
| Build | Vite 6 |
| Linguagem | TypeScript 6 (strict) |
| Estado | Zustand 5 |
| Gráficos | Recharts 2 |
| Ícones | Lucide React |
| Persistência | localStorage + window.storage (Claude Artifacts) |

Sem backend. 100% client-side. Zero custo de infraestrutura.

## Features

| Feature | Status | Descrição |
|---------|--------|-----------|
| **Bloom** | ✅ | Flor SVG animada que sintetiza vitalidade em 6 dimensões |
| **Dia** | ✅ | Agenda diária com rotina por turno (manhã/tarde/noite) |
| **Saúde** | ✅ | Múltiplos perfis, hidratação, ciclo, medicamentos, humor |
| **Finanças** | ✅ | Transações, cartões, faturas, orçamento por envelopes, CSV |
| **Espiritual** | ✅ | Gratidões, orações, leituras bíblicas |
| **Organiza** | ✅ | Lista de compras, notas, lembretes |
| **Família** | ✅ | Casa, Filhos e Pets em tela unificada |
| **Config** | ✅ | Temas (Aurora/Crepúsculo), nome, toggles do dashboard |

## Arquitetura

```
src/
  app/            # boot.ts, routes.ts
  features/       # módulos de domínio (rotina, saude, financas, etc.)
  screens/        # HomeScreen, ConfigScreen, FamiliaScreen
  shared/
    ui/           # 13 componentes reutilizáveis (Btn, Card, Sheet, etc.)
    storage/      # adapter.ts, persist-middleware.ts, keys.ts
    utils/        # money.ts (centavos), date.ts, id.ts
    types/        # common.ts, theme.ts
```

Cada feature segue a anatomia: `types.ts` · `store.ts` · `migrations.ts` · `selectors.ts` · `utils.ts` · `seed.ts` · `[Feature]Screen.tsx`

## Design System

- 80+ CSS variables em `src/styles/tokens.css`
- 2 temas: **Aurora** (off-white quente) e **Crepúsculo** (ameixa profunda)
- Tipografia: Instrument Serif (display) + Geist (UI) + JetBrains Mono
- Glassmorphism com backdrop-filter
- Animações acessíveis com `prefers-reduced-motion`

## Limitações Conhecidas

> Este app é **offline-first** sem backend. Todos os dados ficam no localStorage do navegador.
> Não há autenticação, sincronização entre dispositivos ou notificações push.
> Roadmap Fase 5: autenticação e sync via Supabase.

## Licença

Privado — distribuição mediante licença.
