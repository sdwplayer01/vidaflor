import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

app = read_file('app/minha-vida-v11.jsx.txt')
saude = read_file('saude-v2.jsx')
financas = read_file('FinancasScreen-v2.jsx')

# 1. Update DEF_DATA (health and cycle)
app = app.replace('health: { water: { goal:2000, log:{} } },', '''health: {
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
  },''')

app = app.replace('  cycle: { start:today(), len:28, menses:5 },\n', '')

# 2. Update calcBloom
old_calc = '''const wNow  = data.health.water.log[day] || 0;
  const waterPct = Math.min(1, wNow / data.health.water.goal) * 30;'''
new_calc = '''const mainP  = data.health.profiles.find(p => p.id === "eu") || data.health.profiles[0];
  const wNow   = mainP?.water?.log?.[day] || 0;
  const wGoal  = mainP?.water?.goal || 2000;
  const waterPct = Math.min(1, wNow / wGoal) * 30;'''
app = app.replace(old_calc, new_calc)

# 3. Update HomeScreen variables
old_home_vars = '''  const wNow  = data.health.water.log[day] || 0;
  const wGoal = data.health.water.goal;
  const wPct  = Math.min(100, Math.round((wNow/wGoal)*100));

  const trans   = data.finance.transactions;
  const curMonth = today().slice(0,7);
  const monthTrans = trans.filter(t=>(t.date||"").slice(0,7)===curMonth);
  const bal     = monthTrans.filter(t=>t.type==="income").reduce((s,t)=>s+t.val,0) - monthTrans.filter(t=>t.type==="expense").reduce((s,t)=>s+t.val,0);
  const pending = monthTrans.filter(t=>t.type==="expense"&&!t.paid).reduce((s,t)=>s+t.val,0);
  const nextDue = monthTrans.filter(t=>t.type==="expense"&&!t.paid&&t.due).sort((a,b)=>a.due>b.due?1:-1)[0];

  const {dc,dl,isTPM,isFertil} = calcCycleState(day, data.cycle.start, data.cycle.len, data.cycle.menses);'''

new_home_vars = '''  const mainP = data.health.profiles.find(p => p.id === "eu") || data.health.profiles[0];
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
  const {dc=0,dl=0,isTPM=false,isFertil=false} = showCycle ? calcCycleState(day, cyc.start, cyc.len, cyc.menses) : {};'''

app = app.replace(old_home_vars, new_home_vars)

# 4. Update HomeScreen AddWater
old_addW = '''const addWater = ml => setData(d=>({...d,health:{...d.health,water:{...d.health.water,log:{...d.health.water.log,[day]:(d.health.water.log[day]||0)+ml}}}}));'''
new_addW = '''const addWater = ml => setData(d=>({...d,health:{...d.health,profiles:d.health.profiles.map(p=>p.id===mainP.id?{...p,water:{...p.water,log:{...p.water.log,[day]:(p.water.log[day]||0)+ml}}}:p)}}));'''
app = app.replace(old_addW, new_addW)

# 5. Fix HomeScreen Cycle Card protection
old_card_cycle = '''{cfg.dash.cycle && ('''
new_card_cycle = '''{cfg.dash.cycle && showCycle && ('''
app = app.replace(old_card_cycle, new_card_cycle)

# 6. Extract and replace SaudeScreen (ends where EspiritualScreen begins)
match_saude = re.search(r'function SaudeScreen.*?(?=\n// ─── ESPIRITUAL ───────────────────────────────────────────────────────────────)', saude, re.DOTALL)
if match_saude:
    saude_func = match_saude.group(0)
    app = re.sub(r'function SaudeScreen.*?(?=\n// ─── ESPIRITUAL ───────────────────────────────────────────────────────────────)', saude_func, app, flags=re.DOTALL)
else:
    print("Could not find SaudeScreen in saude-v2.jsx")

# 7. Extract and replace FinancasScreen
match_financas = re.search(r'function FinancasScreen.*', financas, re.DOTALL)
if match_financas:
    financas_func = match_financas.group(0)
    app = re.sub(r'function FinancasScreen.*?(?=\n// ─── CONFIG ───────────────────────────────────────────────────────────────────)', financas_func + '\n\n', app, flags=re.DOTALL)
else:
    print("Could not find FinancasScreen in FinancasScreen-v2.jsx")

write_file('app/minha-vida-v11.jsx.txt', app)
print("Updated app/minha-vida-v11.jsx.txt successfully.")
