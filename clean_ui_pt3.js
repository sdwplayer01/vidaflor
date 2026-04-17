const fs = require('fs');

let app = fs.readFileSync('app/minha-vida-v11.jsx.txt', 'utf8');

// 1. ADD NEW ICONS TO IMPORT IF MISSING
app = app.replace(
  /import \{ Home, LayoutGrid.*?lucide-react";/s,
  'import { Home, LayoutGrid, Heart, DollarSign, Settings, Plus, X, Droplets, Trash2, Check, Sparkles, Calendar, AlertCircle, Info, CreditCard, Wallet, BookOpen, Star, Clock, ShoppingCart, Bell, BellRing, Flower, Flower2, Leaf, Globe, RefreshCw, User, PieChart, Activity, Smile, FileText, Sunrise, Sun, Moon, Coffee, Baby, Users } from "lucide-react";'
);

// 2. T_MAP
app = app.replace(
  /e:"🌸"/g, 'e:Flower'
).replace(
  /e:"🌿"/g, 'e:Leaf'
).replace(
  /e:"💜"/g, 'e:Heart'
).replace(
  /e:"🤍"/g, 'e:Sparkles'
).replace(
  /e:"🩵"/g, 'e:Droplets'
);

// T_MAP Render in Tema Selector (ConfigScreen)
app = app.replace(
  /\{t\.e\} \{t\.name\}/g,
  '<div style={{ display:"flex", alignItems:"center", gap: 6 }}><t.e size={16}/> {t.name}</div>'
);

// 3. TURNOS
app = app.replace(
  /ic:"🌅"/g, 'ic:Sunrise'
).replace(
  /ic:"☀️"/g, 'ic:Sun'
).replace(
  /ic:"🌙"/g, 'ic:Moon'
);

// TURNOS Render in RotinaScreen Shift Selector
app = app.replace(
  /\{TURNOS\.map\(\(\{key,lb,ic\}\)=>\(/g,
  '{TURNOS.map(({key,lb,ic:Ic})=>( '
).replace(
  /<span style=\{\{ fontSize:14 \}\}>\{ic\}<\/span><span>\{lb\}<\/span>/g,
  '<Ic size={16} /><span>{lb}</span>'
);

// TURNOS Render in RotinaScreen "Nova tarefa" Chips
app = app.replace(
  /\{TURNOS\.map\(\(\{key,lb,ic\}\)=><Chip key=\{key\} T=\{T\} active=\{turno===key\} onClick=\{\(\)=>setTurno\(key\)\}>\{ic\} \{lb\}<\/Chip>\)\}/g,
  '{TURNOS.map(({key,lb,ic:Ic})=><Chip key={key} T={T} active={turno===key} onClick={()=>setTurno(key)}><div style={{ display:"flex", alignItems:"center", gap:5 }}><Ic size={14}/> {lb}</div></Chip>)}'
);

// TURNOS Render Home (if any)
app = app.replace(
  /const tNow = TURNOS\.find\(t=>t\.key===turno\);/,
  'const tNow = TURNOS.find(t=>t.key===turno); const TIc = tNow ? tNow.ic : Sun;'
);
// In home greeting:
app = app.replace(
  /<span style=\{\{ fontSize:18 \}\}>\{tNow\?tNow\.ic:""\}<\/span>/g,
  '{tNow && <TIc size={18} color={T.tm} />}'
);

// 4. KIDS IN DEF_DATA
app = app.replace(/av:"👧"/g, 'av:"Smile"');
app = app.replace(/av:"👦"/g, 'av:"User"');
app = app.replace(/av:"👶"/g, 'av:"Baby"');
app = app.replace(/av:"🧑"/g, 'av:"Smile"');
app = app.replace(/av:"🧒"/g, 'av:"Smile"');

// 5. DEF_DATA PROFILES
app = app.replace(/av: "👩"/g, 'av: "User"');

// Write out the result
fs.writeFileSync('app/minha-vida-v11.jsx.txt', app, 'utf8');
console.log("Script Pt3 executado com sucesso!");
