---
name: vida-flor-dev
description: >
  Guia de desenvolvimento para o App Vida Flor (v11). Use este skill para QUALQUER tarefa
  de código neste projeto — criar telas, componentes, lógicas de estado, integrações ou
  correções de bug. Obrigatório sempre que o usuário mencionar "Vida Flor", módulos do app
  (rotina, saúde, finanças, kids, bloom, spirit, shopping, reminders), DEF_DATA, T_MAP ou
  SCLC. Deve ser ativado mesmo para pequenas alterações, pois o padrão de qualidade e
  consistência do projeto depende de aderência estrita a estas regras.
---

# Desenvolvimento do App Vida Flor (v11)

Toda decisão de código neste projeto — nome de variável, cor, novo campo de estado ou
estrutura de componente — é avaliada contra três pilares: **SCLC** (filosofia de produto),
**T_MAP** (design system) e **DEF_DATA** (contrato de dados).

Antes de escrever qualquer linha, leia as referências relevantes para a tarefa:

| Situação                               | Leia                          |
| -------------------------------------- | ----------------------------- |
| Nova tela, componente ou UX            | `references/SCLC.md`          |
| Qualquer uso de cor ou espaçamento     | `references/T_MAP.md`         |
| Novo campo de estado ou persistência   | `references/DEF_DATA.md`      |
| Tarefa ampla que cobre os três acima   | Todos os três, nesta ordem    |

---

## Workflow obrigatório para cada tarefa

### 1. Análise SCLC antes de codar

Responda mentalmente antes de abrir o editor:

- **Simple:** A nova tela tem uma função principal? O objetivo é alcançável em ≤ 3 cliques?
- **Crafted:** Estou usando `T_MAP` para todas as cores? Há feedback visual para cada ação do usuário?
- **Logical:** O novo dado existe no `DEF_DATA`? O CRUD está completo (incluindo empty state e delete seguro)?
- **Connected:** Mudanças neste módulo refletem em tempo real em outros que dependem deste estado?

Se qualquer resposta for "não sei", resolva antes de implementar.

### 2. Atualizar o DEF_DATA primeiro

Nenhum campo de estado nasce fora do `DEF_DATA`. Se a feature exige dados novos:

1. Defina a chave, o valor-padrão e o tipo esperado no `DEF_DATA`.
2. Adicione migração se o schema muda (veja padrão anti-crash em `references/DEF_DATA.md`).
3. Só então implemente a UI.

```js
// ✅ Correto — novo campo declarado no DEF_DATA antes de usar
const DEF_DATA = () => ({
  // ... campos existentes ...
  reminders: {
    list: [], // { id, text, date, urgency: 'low'|'mid'|'high', done: false }
  },
});

// ❌ Errado — estado criado diretamente no componente, fora do contrato
const [reminders, setReminders] = useState([]);
```

### 3. Implementar UI com T_MAP estrito

Toda propriedade visual vem de `T` (objeto resolvido de `T_MAP[cfg.theme]`).
Não existe exceção para "só essa vez".

```jsx
// ✅ Correto
<button style={{ background: T.p, color: '#fff' }}>Salvar</button>
<p style={{ color: T.tm }}>Nenhuma tarefa por aqui ainda.</p>
<div style={{ background: T.er + '18' }}>Aviso de erro suave</div>

// ❌ Errado — strings mágicas de cor direto no JSX
<button style={{ background: '#E8799A' }}>Salvar</button>
<p style={{ color: '#9C7A83' }}>Nenhuma tarefa por aqui ainda.</p>
```

Uso das propriedades semânticas do T_MAP:

| Prop | Uso correto                                         |
| ---- | --------------------------------------------------- |
| `T.p`  | Botão primário, ícone ativo, chip selecionado     |
| `T.tx` | Títulos e texto principal                         |
| `T.tm` | Placeholders, descrições secundárias              |
| `T.ok` | Confirmação, receita, tarefa concluída            |
| `T.er` | Erro, despesa, deletar, atrasado                  |
| `T.wn` | Aviso, prazo próximo, estado intermediário        |
| `T.bd` | Bordas de card e divisórias                       |
| `T.alt`| Fundo de input estático, botão ghost              |
| `T.gh` | Gradiente para headers e cards de destaque        |

Opacidade via sufixo hex é permitida e encorajada:
```jsx
background: T.p + '22'  // ~13% opacidade — fundo de chip inativo
background: T.er + '18' // ~9% opacidade  — fundo de alerta suave
```

### 4. Componentes e ícones

- **Sempre** `lucide-react` ou `phosphor-icons`. Nunca emoji como substituto de ícone funcional.
- Emojis grandes são permitidos em contextos afetivos (avatar de perfil, empty states, celebrações).
- Micro-interações são obrigatórias: `disabled` durante requisição, `hover` com transição, loader efêmero.

```jsx
// ✅ Correto
import { Trash2, CheckCircle2 } from 'lucide-react';
<Trash2 size={18} color={T.er} />

// ❌ Errado
<span onClick={handleDelete}>🗑️</span>
```

### 5. Lógica resiliente

Padrões obrigatórios de defesa contra crash:

```js
// Optional chaining em toda leitura de estado aninhado
const goal = data?.health?.profiles?.[0]?.water?.goal ?? 2000;

// Empty state explícito em toda lista renderizada
{items.length === 0
  ? <EmptyState T={T} msg="Nenhum item ainda." />
  : items.map(item => <Card key={item.id} T={T} {...item} />)
}

// Delete com soft confirm, nunca direto
const handleDelete = (id) => {
  if (!confirmId) { setConfirmId(id); return; }
  setData(d => ({ ...d, list: d.list.filter(i => i.id !== id) }));
  setConfirmId(null);
};
```

### 6. Persistência e preparação para cloud

Todo `useEffect` de salvamento deve cobrir o estado novo:

```js
useEffect(() => {
  localStorage.setItem('vf_data', JSON.stringify(data));
  // TODO: Sync with Supabase — await supabase.from('users').update({ data }).eq('id', userId)
}, [data]);
```

Comentários `// TODO: Sync with Supabase` são obrigatórios em toda mutação de estado
persistida, sinalizando o ponto exato de injeção da API futura.

---

## Regras inegociáveis (checklist de revisão)

Antes de entregar qualquer código, confirme:

- [ ] Nenhuma cor hex fora do `T_MAP`
- [ ] Todo estado novo declarado no `DEF_DATA`
- [ ] CRUD completo: criar, listar (com empty state), editar/concluir, deletar (com proteção)
- [ ] Nenhum emoji usado como ícone funcional
- [ ] `optional chaining` (`?.`) em toda leitura de estado aninhado
- [ ] `// TODO: Sync with Supabase` em toda mutação persistida
- [ ] `<Componente T={T}>` — `T` passado como prop para todo sub-componente com estilo

---

## Estrutura dos módulos do app

| Chave no DEF_DATA   | Módulo / Tela        | Notas                                              |
| ------------------- | -------------------- | -------------------------------------------------- |
| `routine`           | Rotina               | `done` é Record keyed por date ISO + id de tarefa |
| `health.profiles`   | Saúde                | Multi-perfil; `activeProfile` controla a aba ativa |
| `finance`           | Finanças             | `transactions` usa `type: 'income' | 'expense'`   |
| `spirit`            | Espiritual           | Gratidão, leituras e orações                       |
| `shopping`          | Compras (Organiza)   | `done` booleano por item                          |
| `notes`             | Notas                | Blocos com cor e id                                |
| `reminders`         | Lembretes            | `urgency: 'low' | 'mid' | 'high'`                |
| `bloom`             | Bloom / Flor         | Calculado dinamicamente; não mutado diretamente    |
| `kids`              | Kids                 | `done` é Record keyed por date ISO + id da tarefa |
| `integrations`      | Config / Google      | `connected` booleano; eventos em cache local       |

---

## Referências

- **`references/SCLC.md`** — Filosofia completa dos 4 pilares com exemplos e anti-padrões
- **`references/T_MAP.md`** — Estrutura completa do tema, todas as propriedades e regras de uso
- **`references/DEF_DATA.md`** — Schema base do DEF_DATA v11, tipagens e padrão de migração anti-crash
