# Filosofia SCLC — Referência Completa

SCLC é o critério de qualidade para toda decisão de produto e código.
Cada pilar tem perguntas de validação e anti-padrões conhecidos.

---

## 1. Simple — Simplicidade e Foco

> A base da retenção: zero atrito, zero esforço cognitivo.

### Critérios
- Uma tela = uma função principal. Se o usuário precisa decidir o que fazer primeiro, a tela falhou.
- **Regra dos 3 cliques:** qualquer objetivo principal deve ser alcançável em no máximo 3 interações.
- Código lean: não importe bibliotecas para problemas que a API nativa resolve.

### Padrões corretos
```jsx
// Early return — lógica limpa, sem ternário aninhado
if (!user) return <Login />;
if (loading) return <Skeleton />;
return <Dashboard user={user} />;

// Renderização condicional direta
{abaAtiva === 'home' && <HomePanel />}
{abaAtiva === 'config' && <ConfigPanel />}

// Não use Moment.js se Date nativo resolve
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
```

### Anti-padrões
```jsx
// ❌ Ternário em cascata — "Árvore do Terror"
return loading ? <Spinner /> : error ? <ErrorMsg /> : data ? <List data={data} /> : <Empty />;

// ❌ Biblioteca pesada para problema trivial
import moment from 'moment';
const today = moment().format('YYYY-MM-DD');
```

---

## 2. Crafted — Construção Artesanal e Premium

> Acabamento de software moderno. Nenhum clique acontece no vazio.

### Critérios
- Toda ação tem feedback visual: loading, success, error.
- Ícones de biblioteca (`lucide-react`, `phosphor-icons`), nunca emojis como substituto funcional.
- Cores, espaçamentos e tipografia vêm exclusivamente do design system (THEME_MAP).
- Micro-interações: `hover`, `disabled` durante requisição, `transition` em mudanças de estado.

### Padrões corretos
```jsx
// Feedback de ação assíncrona
const [saving, setSaving] = useState(false);
const handleSave = async () => {
  setSaving(true);
  await api.save(data);
  setSaving(false);
};

<button
  onClick={handleSave}
  disabled={saving}
  style={{
    background: saving ? T.p + '80' : T.p,
    transition: 'all 0.2s ease',
    cursor: saving ? 'not-allowed' : 'pointer',
  }}
>
  {saving ? <Loader2 size={16} className="spin" /> : 'Salvar'}
</button>

// Hover com opacidade
<div
  style={{ background: T.alt, transition: 'background 0.15s' }}
  onMouseEnter={e => e.currentTarget.style.background = T.bd}
  onMouseLeave={e => e.currentTarget.style.background = T.alt}
>
```

### Anti-padrões
```jsx
// ❌ Clique sem feedback
<button onClick={save}>Salvar</button>

// ❌ Emoji como ícone funcional
<span onClick={handleDelete}>🗑️</span>

// ❌ Cor hard-coded no componente
<button style={{ background: '#4F46E5' }}>Ação</button>
```

---

## 3. Logical — Lógica de Dados e Completude

> Se faz, faz o ciclo completo. Sem meio-termo.

### Critérios
- Estado nasce no STATE_DEF. Nunca inicializado diretamente num componente.
- CRUD completo para toda entidade: Create · Read (+ empty state) · Update · Delete (com proteção).
- Leituras defensivas: `?.` em todo acesso aninhado, `??` em fallbacks.
- Migrações explícitas quando o schema muda.

### Padrões corretos
```js
// Leitura defensiva
const balance = data?.finance?.transactions
  ?.filter(t => t.type === 'income')
  ?.reduce((acc, t) => acc + t.val, 0) ?? 0;

// CRUD completo — exemplo de reducer
const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD':    return { ...state, list: [...state.list, action.item] };
    case 'UPDATE': return { ...state, list: state.list.map(i => i.id === action.id ? { ...i, ...action.patch } : i) };
    case 'DELETE': return { ...state, list: state.list.filter(i => i.id !== action.id) };
    default:       return state;
  }
};

// Empty state explícito
{list.length === 0
  ? <p style={{ color: T.tm, textAlign: 'center' }}>Nenhum item ainda.</p>
  : list.map(item => <Item key={item.id} data={item} T={T} />)
}

// Delete com confirmação
{pendingDelete === item.id
  ? <button onClick={() => dispatch({ type: 'DELETE', id: item.id })} style={{ color: T.er }}>Confirmar exclusão</button>
  : <Trash2 onClick={() => setPendingDelete(item.id)} size={16} color={T.tm} />
}
```

### Anti-padrões
```js
// ❌ Estado sem contrato
const [tasks, setTasks] = useState([]); // de onde vem? qual é o shape?

// ❌ Leitura sem defesa
const name = user.profile.name; // crash se user ou profile for undefined

// ❌ Feature sem delete ou sem empty state
```

---

## 4. Connected — Conexão e Flow Contínuo

> Interfaces não são ilhas. Pensamento em sistema.

### Critérios
- Mudança num módulo reflete automaticamente nos outros que dependem do mesmo estado.
- Estado global gerenciado em um único lugar (Context, Zustand, Redux — escolha e seja consistente).
- Toda mutação persistida tem um comentário `// TODO: Sync` marcando o ponto de injeção da API.
- O app nunca trava offline. Usa cache local com optimistic update.

### Padrões corretos
```js
// Optimistic update — UI atualiza antes da confirmação da API
const toggleTask = (id) => {
  // Atualiza local imediatamente
  dispatch({ type: 'TOGGLE', id });

  // Sincroniza com backend em background
  api.patch(`/tasks/${id}`, { done: true }).catch(() => {
    // Reverte se falhar
    dispatch({ type: 'TOGGLE', id });
    toast.error('Falha ao salvar. Tente novamente.');
  });
};

// Comentário de sync obrigatório
useEffect(() => {
  localStorage.setItem('state', JSON.stringify(state));
  // TODO: Sync → await supabase.from('state').upsert({ user_id, data: state })
}, [state]);

// Estado global compartilhado
const { data, dispatch } = useApp(); // hook do Context global
const tasksDone = data.tasks.filter(t => t.done).length; // mesmo dado, telas diferentes
```

### Anti-padrões
```js
// ❌ Estado duplicado em componente filho
const [localTasks, setLocalTasks] = useState(props.tasks); // dessync garantido

// ❌ Sem comentário de sync em persistência
useEffect(() => {
  localStorage.setItem('state', JSON.stringify(state));
}, [state]); // ponto de injeção da API não documentado

// ❌ App que trava offline sem fallback
const tasks = await api.getTasks(); // sem cache, sem tratamento de falha de rede
```