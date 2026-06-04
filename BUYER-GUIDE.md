# Vida Flor — Guia do Comprador

Tudo que você precisa saber para rodar, personalizar e monetizar este projeto.

---

## O que você está recebendo

**Vida Flor** é um app React SPA completo de gestão pessoal e familiar, pronto para produção. Sem backend, sem banco de dados externo, sem mensalidade de infraestrutura — tudo persiste no navegador do usuário.

### Funcionalidades incluídas

| Módulo | O que faz |
|---|---|
| **Rotina** | Tarefas por turno (manhã / tarde / noite), modo essencial |
| **Saúde** | Múltiplos perfis (adulto/criança/pet), hidratação, sono, passos, humor, medicamentos, ciclo menstrual |
| **Finanças** | Receitas e despesas, cartões de crédito, parcelamento, orçamento por categoria, faturas |
| **Espiritual** | Gratidão diária, lista de oração, registro de leitura bíblica |
| **Organiza** | Lista de compras, notas coloridas, lembretes com prioridade |
| **Kids** | Perfis de crianças, tarefas por criança com emojis |
| **Pets** | Perfis de pets, rotina de cuidados, registro diário |
| **Casa** | Tarefas domésticas com recorrência (diária / semanal / mensal) |
| **Bloom** | Dashboard visual de saúde geral da família (gamificação positiva) |

---

## Pré-requisitos

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)

---

## Rodando localmente

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/vida-flor.git
cd vida-flor

# 2. Instale dependências
pnpm install

# 3. Inicie o servidor de desenvolvimento
pnpm dev
```

Abra `http://localhost:5173` no navegador. O app já vem com dados de demonstração carregados.

### Build de produção

```bash
pnpm build      # gera a pasta /dist
pnpm preview    # serve o build localmente para testes finais
```

---

## Deploy

### GitHub Pages (automático — recomendado)

O workflow `.github/workflows/deploy.yml` faz deploy automático a cada push na branch `main`.

1. Vá em **Settings → Pages** no seu repositório
2. Em **Source**, selecione **GitHub Actions**
3. Faça um push — o CI compila e publica em `https://SEU_USUARIO.github.io/vida-flor`

### Vercel / Netlify

Arraste a pasta `/dist` gerada pelo `pnpm build` para o painel do Vercel ou Netlify. Configuração de build:

```
Build command:  pnpm build
Output dir:     dist
```

### Claude Artifacts

O app foi originalmente construído para rodar como Claude Artifact. O arquivo `index.html` funciona como entry point standalone — basta colar o conteúdo da pasta `dist/` como artifact de texto HTML em qualquer conversa Claude.

---

## Personalização essencial

### 1. Nome e identidade visual

Edite `index.html` (title, meta description) e `src/shared/constants/themes.ts` para trocar as cores do tema.

### 2. Dados de demonstração

Cada módulo tem um arquivo `src/features/[modulo]/seed.ts`. Edite esses arquivos para pré-popular o app com dados da sua família ou do seu cliente.

### 3. Adicionar um novo módulo

Siga o padrão de qualquer feature existente:

```
src/features/novo-modulo/
  types.ts        # interfaces do domínio
  store.ts        # Zustand store com persistVidaFlor()
  migrations.ts   # versionamento do estado
  seed.ts         # dados iniciais
  selectors.ts    # cálculos derivados
  NovoModuloScreen.tsx
```

Registre a nova aba em `src/app/routes.ts`.

### 4. Idioma / microcopy

Todo texto visível ao usuário está inline nos componentes TSX. Busque strings em português e troque pela linguagem desejada — não há arquivo de i18n a configurar.

---

## Arquitetura em 30 segundos

```
src/
  app/        boot.ts + routes.ts (configuração central)
  features/   um módulo por domínio (store + screen + types)
  shared/     ui/, hooks/, storage/, utils/
```

**Persistência:** `localStorage` (standalone) ou `window.storage` (Claude Artifacts API). Sem servidor, sem conta, sem custo de infra.

**Estado:** Zustand 5 com middleware próprio (`persistVidaFlor`). Cada store é independente e versionada — atualizações de schema passam pela `migrations.ts` da feature.

---

## O que está pronto vs o que você pode evoluir

### Pronto para uso imediato
- Todos os 8 módulos funcionais com CRUD completo
- Persistência local confiável com migrations versionadas
- Build de produção limpo (TypeScript zero erros)
- CI/CD automático via GitHub Actions
- Design responsivo (mobile-first)

### Roadmap sugerido para monetização
- **SaaS com autenticação:** adicionar Supabase ou Firebase para sincronização multi-dispositivo
- **PWA offline:** adicionar service worker para uso sem internet
- **Notificações push:** lembretes de medicamentos e tarefas
- **Exportação PDF:** relatório mensal de saúde e finanças
- **White-label:** empacotar para clínicas, escolas, igrejas com branding customizado

---

## Suporte e dúvidas

Este projeto foi entregue com código-fonte completo e documentação inline. Para questões técnicas, abra uma issue no repositório ou consulte a documentação das bibliotecas utilizadas:

- [React 18](https://react.dev)
- [Zustand 5](https://zustand.docs.pmnd.rs)
- [Vite 6](https://vite.dev)
- [Recharts](https://recharts.org)
- [Lucide React](https://lucide.dev)
