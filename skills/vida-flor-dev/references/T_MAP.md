# Design System: T_MAP

O `T_MAP` é o objeto central que define os temas e a identidade visual do App Vida Flor. **Nunca** utilize cores hexadecimais, RGB ou nomes de cores CSS diretamente no código dos componentes. Sempre referencie as variáveis desestruturadas do `T_MAP`.

## Estrutura do T_MAP

No Vida Flor v11, o `T_MAP` possui múltiplos temas (ex: `pastel`, `terra`, `lilac`, `neutro`, `sage`). Ao renderizar a aplicação, a propriedade `T` recebe exatamente o objeto de cores do tema salvo na configuração do usuário (`cfg.theme`).

O objeto de uma cor (ex: `T_MAP.pastel`) segue uma matriz compacta para manter o JSX limpo e otimizado:

```javascript
const T_MAP = {
  pastel: {
    key: "pastel",
    name: "Rosa Pastel",
    e: "🌸",         // Emoji representante do tema
    bg: "#FFF0F4",   // Fundo principal fora de cards (Background)
    surf: "#FFFFFF", // Superfície principal (Cards, Modals)
    alt: "#FFE4EE",  // Fundo secundário (Inputs estáticos, botões ghost)
    p: "#E8799A",    // Primary (Verde principal, Destaques, Botões de ação principais)
    pl: "#F9B8CC",   // Primary Light (Sombreados brandos, marcações leves)
    pd: "#C4567A",   // Primary Dark (Contrastes)
    tx: "#3D2030",   // Text (Texto principal e tútulos)
    tm: "#9C7A83",   // Text Muted (Descrições e placeholders)
    bd: "#F9D0DB",   // Border (Bordas de cards, divisórias)
    ok: "#66BB6A",   // Sucesso (Ações positivas, transações de entrada)
    wn: "#FFA726",   // Aviso (Cards de aviso, projetivos medianos)
    er: "#EF5350",   // Erro (Saídas financeiras, deletar, atrasado)
    gh: "linear-gradient(135deg,#E8799A,#F4B8CC)" // Gradient Header/Hero (Cards brilhantes)
  },
  // Mais temas (terra, lilac...) mantem exatamente essas chaves.
};
```

## Regras de Uso em Componentes

1.  **Passagem por Prop:** Sempre passe a variável resolvida `T` para sub-componentes (ex: `<Card T={T}>`, `<Btn T={T}>`).
2.  **Consistência de Tipos:** Utilize `T.p` para todas as ações primárias de estado (ícones ativos, fundo de chip ativo, botões centrais).
3.  **Proibição:** É estritamente proibido o uso constante de strings mágicas como `'#FF0000'`, `'red'` na árvore DOM diretamente no styling, fora do mapa global de paleta constante nas funções.

## Exemplo de Aplicação (React JSX)

**Incorreto:**
```jsx
<button style={{ backgroundColor: '#E8799A', color: 'white' }}>Salvar</button>
<p style={{ color: "#3D2030", fontWeight: 700 }}>Nome da Tarefa</p>
```

**Correto:**
```jsx
// Assumindo que a variável `T` equivale ao pacote do tema ativo (T_MAP[cfg.theme])
<button style={{ backgroundColor: T.p, color: '#fff' }}>Salvar</button>
<p style={{ color: T.tx, fontWeight: 700 }}>Nome da Tarefa</p>
```

> **Aviso para UX Encantador (Alpha channels):** As propriedades de strings hexadecimais permitem manipulação visual nativa via sufixos de opacidade. Exemplo: Para um botão desabilitado ou de fundo calmo baseado na cor principal, podemos usar `background: T.p+"14"`. A adição de strings literais limitadas a hexadecimal opaco é totalmente encorajada para a geração de states UI.
