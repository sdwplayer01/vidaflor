const fs = require('fs');

let app = fs.readFileSync('app/minha-vida-v11.jsx.txt', 'utf8');
const saude = fs.readFileSync('saude-v2.jsx', 'utf8');
const financas = fs.readFileSync('FinancasScreen-v2.jsx', 'utf8');

// 1. Update DEF_DATA (health and cycle)
app = app.replace('health: { water: { goal:2000, log:{} } },', `health: {
    activeProfile: "eu",
    profiles: [
      {
        id: "eu",
        name: "Você",
        av: "👩",
        type: "adult_f",
        color: "#E8799A",
        water: { goal: 2000, log: {} },
        cycle: { start: today(), len: 28, menses: 5 },
        meds: [],
        notes: {},
      },
    ],
  },`);

app = app.replace('  cycle: { start:today(), len:28, menses:5 },\\n', '');
app = app.replace('  cycle: { start:today(), len:28, menses:5 },\\r\\n', '');
app = app.replace(/  cycle: \{ start:today\(\), len:28, menses:5 \},\r?\n/, '');

// 2. Update calcBloom
const old_calc = `const wNow  = data.health.water.log[day] || 0;
  const waterPct = Math.min(1, wNow / data.health.water.goal) * 30;`;
const new_calc = `const mainP  = data.health.profiles.find(p => p.id === "eu") || data.health.profiles[0];
  const wNow   = mainP?.water?.log?.[day] || 0;
  const wGoal  = mainP?.water?.goal || 2000;
  const waterPct = Math.min(1, wNow / wGoal) * 30;`;
app = app.replace(old_calc, new_calc);

// 3. Update HomeScreen variables
const old_home_vars = `  const wNow  = data.health.water.log[day] || 0;
  const wGoal = data.health.water.goal;
  const wPct  = Math.min(100, Math.round((wNow/wGoal)*100));

  const trans   = data.finance.transactions;
  const curMonth = today().slice(0,7);
  const monthTrans = trans.filter(t=>(t.date||"").slice(0,7)===curMonth);
  const bal     = monthTrans.filter(t=>t.type==="income").reduce((s,t)=>s+t.val,0) - monthTrans.filter(t=>t.type==="expense").reduce((s,t)=>s+t.val,0);
  const pending = monthTrans.filter(t=>t.type==="expense"&&!t.paid).reduce((s,t)=>s+t.val,0);
  const nextDue = monthTrans.filter(t=>t.type==="expense"&&!t.paid&&t.due).sort((a,b)=>a.due>b.due?1:-1)[0];

  const {dc,dl,isTPM,isFertil} = calcCycleState(day, data.cycle.start, data.cycle.len, data.cycle.menses);`;

const new_home_vars = `  const mainP = data.health.profiles.find(p => p.id === "eu") || data.health.profiles[0];
  const wNow  = mainP?.water?.log?.[day] || 0;
  const wGoal = mainP?.water?.goal || 2000;
  const wPct  = Math.min(100, Math.round((wNow/wGoal)*100));

  const trans   = data.finance.transactions;
  const curMonth = today().slice(0,7);
  const monthTrans = trans.filter(t=>(t.date||"").slice(0,7)===curMonth);
  const bal     = monthTrans.filter(t=>t.type==="income").reduce((s,t)=>s+t.val,0) - monthTrans.filter(t=>t.type==="expense").reduce((s,t)=>s+t.val,0);
  const pending = monthTrans.filter(t=>t.type==="expense"&&!t.paid).reduce((s,t)=>s+t.val,0);
  const nextDue = monthTrans.filter(t=>t.type==="expense"&&!t.paid&&t.due).sort((a,b)=>a.due>b.due?1:-1)[0];

  const cyc = mainP?.cycle;
  const showCycle = !!cyc;
  const {dc=0,dl=0,isTPM=false,isFertil=false} = showCycle ? calcCycleState(day, cyc.start, cyc.len, cyc.menses) : {};`;

app = app.replace(old_home_vars, new_home_vars);

// 4. Update HomeScreen AddWater
const old_addW = `const addWater = ml => setData(d=>({...d,health:{...d.health,water:{...d.health.water,log:{...d.health.water.log,[day]:(d.health.water.log[day]||0)+ml}}}}));`;
const new_addW = `const addWater = ml => setData(d=>({...d,health:{...d.health,profiles:d.health.profiles.map(p=>p.id===mainP.id?{...p,water:{...p.water,log:{...p.water.log,[day]:(p.water.log[day]||0)+ml}}}:p)}}));`;
app = app.replace(old_addW, new_addW);

// 5. Fix HomeScreen Cycle Card protection
const old_card_cycle = `{cfg.dash.cycle && (`;
const new_card_cycle = `{cfg.dash.cycle && showCycle && (`;
app = app.replace(old_card_cycle, new_card_cycle);

// 6. Extract and replace SaudeScreen (ends where EspiritualScreen begins)
const strict_match_saude = saude.match(new RegExp('function SaudeScreen.*?(?=\\r?\\n\\/\\/ ═══════════════════════════════════════════════════════════════════════════════\\r?\\n\\/\\/  PATCH)', 's'));
if (strict_match_saude) {
    app = app.replace(new RegExp('function SaudeScreen.*?((?=\\r?\\n\\/\\/ ─── ESPIRITUAL ───────────────────────────────────────────────────────────────))', 's'), strict_match_saude[0] + '\\n\\n');
} else {
    console.log("Could not find SaudeScreen in saude-v2.jsx");
}

// 7. Extract and replace FinancasScreen
const match_financas = financas.match(new RegExp('function FinancasScreen.*?$', 's'));
if (match_financas) {
    app = app.replace(new RegExp('function FinancasScreen.*?((?=\\r?\\n\\/\\/ ─── CONFIG ───────────────────────────────────────────────────────────────────))', 's'), match_financas[0] + '\\n\\n');
} else {
    console.log("Could not find FinancasScreen in FinancasScreen-v2.jsx");
}

fs.writeFileSync('app/minha-vida-v11.jsx.txt', app, 'utf8');
console.log("Updated app/minha-vida-v11.jsx.txt successfully.");
