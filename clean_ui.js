const fs = require('fs');

let app = fs.readFileSync('app/minha-vida-v11.jsx.txt', 'utf8');

// 1. ADD MISSING ICONS IF ANY
// We'll replace the lucide import line to include some useful ones like User, Smile, PieChart, Activity
app = app.replace(
  /import \{ Home, LayoutGrid.*?lucide-react";/,
  'import { Home, LayoutGrid, Heart, DollarSign, Settings, Plus, X, Droplets, Trash2, Check, Sparkles, Calendar, AlertCircle, Info, CreditCard, Wallet, BookOpen, Star, Clock, ShoppingCart, Bell, BellRing, Flower, Flower2, Leaf, Globe, RefreshCw, User, PieChart, Activity, Smile, FileText } from "lucide-react";'
);

// 2. DASH_ITEMS EMOJIS
const oldDash = `const DASH_ITEMS = [
    {k:"bloom",    lb:"🌸 Flor do Dia"},
    {k:"water",    lb:"💧 Meta de água"},
    {k:"routine",  lb:"📋 Rotina diária"},
    {k:"finance",  lb:"💰 Saldo financeiro"},
    {k:"cycle",    lb:"🌸 Ciclo menstrual"},
    {k:"spirit",   lb:"✨ Conexão & Paz"},
    {k:"reminders",lb:"🔔 Lembretes"},
  ];`;
const newDash = `const DASH_ITEMS = [
    {k:"bloom",    lb:"Flor do Dia", ic: Flower},
    {k:"water",    lb:"Meta de Água", ic: Droplets},
    {k:"routine",  lb:"Rotina Diária", ic: LayoutGrid},
    {k:"finance",  lb:"Saldo Financeiro", ic: DollarSign},
    {k:"cycle",    lb:"Ciclo Menstrual", ic: Flower2},
    {k:"spirit",   lb:"Conexão & Paz", ic: Star},
    {k:"reminders",lb:"Lembretes", ic: Bell},
  ];`;
app = app.replace(oldDash, newDash);

// In ConfigScreen where DASH_ITEMS is rendered:
const oldDashRender = `{DASH_ITEMS.map(({k,lb})=>(
            <div key={k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontSize:14,color:T.tx }}>{lb}</span>`;
const newDashRender = `{DASH_ITEMS.map(({k,lb,ic:Ic})=>(
            <div key={k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Ic size={16} color={T.tm} />
                <span style={{ fontSize:14,color:T.tx,fontWeight:600 }}>{lb}</span>
              </div>`;
app = app.replace(oldDashRender, newDashRender);

// 3. EMPTY STATES
app = app.replace(/<p style=\{\{ fontSize:28,margin:"0 0 6px" \}\}>🛒<\/p>/g, '<ShoppingCart size={32} color={T.tm} style={{ marginBottom: 12, opacity: 0.5 }}/>');
app = app.replace(/<p style=\{\{ fontSize:28,margin:"0 0 6px" \}\}>📝<\/p>/g, '<FileText size={32} color={T.tm} style={{ marginBottom: 12, opacity: 0.5 }}/>');
app = app.replace(/<p style=\{\{ fontSize:28,margin:"0 0 6px" \}\}>🔔<\/p>/g, '<Bell size={32} color={T.tm} style={{ marginBottom: 12, opacity: 0.5 }}/>');
app = app.replace(/<p style=\{\{ fontSize:30,margin:"0 0 8px" \}\}>💸<\/p>/g, '<DollarSign size={32} color={T.tm} style={{ marginBottom: 12, opacity: 0.5 }}/>');
app = app.replace(/<p style=\{\{ fontSize:30,margin:"0 0 8px" \}\}>💳<\/p>/g, '<CreditCard size={32} color={T.tm} style={{ marginBottom: 12, opacity: 0.5 }}/>');
app = app.replace(/<p style=\{\{ fontSize:30,margin:"0 0 8px" \}\}>📦<\/p>/g, '<PieChart size={32} color={T.tm} style={{ marginBottom: 12, opacity: 0.5 }}/>');

// 4. CHIPS & TABS EMOJIS
app = app.replace(/🛒 Compras/g, 'Compras');
app = app.replace(/📝 Notas/g, 'Notas');
app = app.replace(/🔔 Lembretes/g, 'Lembretes');
app = app.replace(/📋 Lançamentos/g, 'Lançamentos');
app = app.replace(/💳 Cartões/g, 'Cartões');
app = app.replace(/📦 Parcelas/g, 'Parcelas');

// 5. BUTTONS EMOJIS & TEXT
app = app.replace(/<span style=\{\{ fontSize:15 \}\}>✏️<\/span>/g, '<Settings size={16} color={T.tx} />');
app = app.replace(/🗑️ Resetar todos os dados/g, '<div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap: 8 }}><Trash2 size={16}/> Resetar Aplicativo</div>');
app = app.replace(/💚 Salvar Entrada/g, 'Salvar Entrada');
app = app.replace(/🔴 Salvar Saída/g, 'Salvar Saída');
app = app.replace(/💳 Cadastrar Cartão/g, 'Cadastrar Cartão');

// Config Section Titles
app = app.replace(/✏️ Seu nome no app/g, 'Seu Perfil');
app = app.replace(/🔗 Integrações/g, 'Integrações');
app = app.replace(/🎨 Tema/g, 'Aparência e Cores');
app = app.replace(/🏠 Cards da tela inicial/g, 'Preferências da Tela Inicial');

// 6. FINANCAS BADGES & TEXTS
app = app.replace(/✅ pago/g, 'Pago');
app = app.replace(/⏳ este mês/g, 'Atual');
app = app.replace(/⬜ futuro/g, 'Futuro');
app = app.replace(/⚠️ atrasado/g, 'Atrasado');

app = app.replace(/✅ Já confirmado\?/g, 'Confirmar pagamento');
app = app.replace(/📦 Compra parcelada\?/g, 'Compra parcelada');

app = app.replace(/💰 Disponível este mês/g, 'Orçamento Disponível');
app = app.replace(/📅 Histórico \& Projeção/g, 'Histórico Mensal');
app = app.replace(/↑ Nova Entrada/g, 'Nova Entrada');
app = app.replace(/↓ Nova Saída/g, 'Nova Saída');

app = app.replace(/O app calcula automaticamente se vai sobrar ou faltar! 🎯/g, 'O aplicativo calcula as projeções automaticamente.');

// 7. HOME SCREENS CYCLE EMOJIS
app = app.replace(/<span style=\{\{ fontSize:16 \}\}>🍫<\/span>/g, '');
app = app.replace(/TPM em \{dl\}d/g, 'Fase Lútea ({dl}d)');

app = app.replace(/<span style=\{\{ fontSize:18 \}\}>\{isFertil\?"👶":"🌸"\}<\/span>/g, '{isFertil ? <Sparkles size={18} color={T.p}/> : <Heart size={18} color={T.p}/>}');

// 8. OTHERS
app = app.replace(/💕/g, '<Flower size={20} color={T.p}/>');
app = app.replace(/<div style=\{\{ fontSize:52,marginBottom:10 \}\}>💕<\/div>/g, '<div style={{ marginBottom:16, display:"flex", justifyContent:"center" }}><Flower2 size={48} color="#E8799A"/></div>');

app = app.replace(/Minha Vida · v11 · SLCC ✨/g, 'Minha Vida · v11 · SCLC');

// AVATARS fallback
// In the DEF_DATA we won't change the actual string yet, but any <div ...>{p.av}</div> should try to use it minimally or just rely on Name initials.
// We'll leave the avatar logic to be handled at the component level if needed. By default, emojis in text are just text.

fs.writeFileSync('app/minha-vida-v11.jsx.txt', app, 'utf8');
console.log("UI Limpa executada com sucesso!");
