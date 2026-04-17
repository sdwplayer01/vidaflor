import { useState, useEffect } from "react";
import { Home, LayoutGrid, Heart, DollarSign, Settings, Plus, X, Droplets, Trash2, Check, Sparkles, Calendar, AlertCircle, Info, CreditCard, Wallet, BookOpen, Star, Clock, ShoppingCart, Bell, BellRing, Flower, Flower2, Leaf, Globe, RefreshCw, User, PieChart, Activity, Smile, FileText, Sunrise, Sun, Moon, Coffee, Baby, Users } from "lucide-react";

// ─── TEMAS ────────────────────────────────────────────────────────────────────
const T_MAP = {
  pastel: { key:"pastel", name:"Rosa Pastel",    e:Flower, bg:"#FFF0F4", surf:"#FFFFFF", alt:"#FFE4EE", p:"#E8799A", pl:"#F9B8CC", pd:"#C4567A", tx:"#3D2030", tm:"#9C7A83", bd:"#F9D0DB", ok:"#66BB6A", wn:"#FFA726", er:"#EF5350", gh:"linear-gradient(135deg,#E8799A,#F4B8CC)" },
  terra:  { key:"terra",  name:"Terra & Mel",     e:Leaf, bg:"#FAF5EE", surf:"#FFFFFF", alt:"#F2E6D8", p:"#8B6248", pl:"#C4967A", pd:"#5D3D2C", tx:"#2C1A0E", tm:"#8C6E57", bd:"#E0CCB4", ok:"#7CAA72", wn:"#E6A817", er:"#C0614E", gh:"linear-gradient(135deg,#8B6248,#C4967A)" },
  lilac:  { key:"lilac",  name:"Lilás & Lavanda", e:Heart, bg:"#F7F3FF", surf:"#FFFFFF", alt:"#EDE4FF", p:"#8B5CF6", pl:"#C4B5FD", pd:"#6D28D9", tx:"#1E1030", tm:"#7C6FA0", bd:"#DDD0F5", ok:"#66BB6A", wn:"#FFA726", er:"#EF5350", gh:"linear-gradient(135deg,#8B5CF6,#C4B5FD)" },
  neutro: { key:"neutro", name:"Neutro Elegante", e:Sparkles, bg:"#F5F5F3", surf:"#FFFFFF", alt:"#EEEEEC", p:"#262626", pl:"#737373", pd:"#0A0A0A", tx:"#0A0A0A", tm:"#737373", bd:"#D4D4D4", ok:"#22C55E", wn:"#F59E0B", er:"#EF4444", gh:"linear-gradient(135deg,#262626,#737373)" },
  sage:   { key:"sage",   name:"Sage & Céu",      e:Droplets, bg:"#F0F7F4", surf:"#FFFFFF", alt:"#DAF0E8", p:"#059669", pl:"#6EE7B7", pd:"#047857", tx:"#0D2E25", tm:"#5E9E8A", bd:"#B2DDD1", ok:"#059669", wn:"#D97706", er:"#DC2626", gh:"linear-gradient(135deg,#059669,#6EE7B7)" },
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const today    = () => new Date().toISOString().slice(0, 10);
const hour     = () => new Date().getHours();
const turnoNow = () => hour() < 12 ? "morning" : hour() < 18 ? "afternoon" : "night";
const greet    = () => hour() < 12 ? "Bom dia" : hour() < 18 ? "Boa tarde" : "Boa noite";
const fmtBRL   = v  => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const TURNOS   = [{ key:"morning",lb:"Manhã",ic:Sunrise},{key:"afternoon",lb:"Tarde",ic:Sun},{key:"night",lb:"Noite",ic:Moon}];

// ÚNICO ponto de cálculo do ciclo — usado em toda a app
const calcCycleState = (day, start, len, menses) => {
  const ds = Math.floor((new Date(day) - new Date(start)) / 86400000);
  const dc = ((ds % len) + len) % len;
  const dl = len - dc;
  return {
    dc, dl,
    isTPM:    dl <= 7,
    isFertil: dc >= 10 && dc <= 16,
    isMenses: dc < menses,
    phase:    dc < menses ? "Menstrual" : dc < 14 ? "Folicular" : "Lútea",
  };
};

// ÚNICO ponto de cálculo do bloom — função pura fora de qualquer componente
const calcBloom = (data, day) => {
  const allT = data.routine.essMode
    ? data.routine.essential
    : [...data.routine.morning, ...data.routine.afternoon, ...data.routine.night];
  const doneIds = data.routine.done[day] || [];
  const routinePct = allT.length > 0 ? (doneIds.length / allT.length) * 40 : 0;
  const mainP  = data.health.profiles.find(p => p.id === "eu") || data.health.profiles[0];
  const wNow   = mainP?.water?.log?.[day] || 0;
  const wGoal  = mainP?.water?.goal || 2000;
  const waterPct = Math.min(1, wNow / wGoal) * 30;
  const gratPct  = Math.min(1, (data.spirit.gratitude[day] || []).length / 3) * 30;
  return Math.round(routinePct + waterPct + gratPct);
};

// ─── DADOS PADRÃO ─────────────────────────────────────────────────────────────
const DEF_DATA = () => ({
  _v: 2,
  routine: {
    morning:   [{id:1,task:"Oração da manhã",time:"06:00"},{id:2,task:"Exercício",time:"06:30"},{id:3,task:"Café com a família",time:"07:30"},{id:4,task:"Vitaminas",time:"08:30"}],
    afternoon: [{id:5,task:"Almoço em família",time:"12:00"},{id:6,task:"Estudo pessoal",time:"13:30"},{id:7,task:"Cuidados da casa",time:"14:30"},{id:8,task:"Lanche das crianças",time:"16:00"}],
    night:     [{id:9,task:"Devocional em família",time:"19:00"},{id:10,task:"Jantar em família",time:"19:30"},{id:11,task:"Skincare noturno",time:"20:30"},{id:12,task:"Oração da noite",time:"22:00"}],
    essential: [{id:101,task:"Oração"},{id:102,task:"Tomar água"},{id:103,task:"Devocional"},{id:104,task:"Refeição em família"},{id:105,task:"Dormir cedo"}],
    done: {},
    essMode: false,
  },
  health: {
    activeProfile: "eu",
    profiles: [
      {
        id: "eu",
        name: "Você",
        av: "User",
        type: "adult_f",
        color: "#E8799A",
        water: { goal: 2000, log: {} },
        cycle: { start: today(), len: 28, menses: 5 },
        meds: [],
        notes: {},
      },
    ],
  },
  finance: {
    transactions: [
      {id:1,desc:"Salário",val:8000,type:"income",cat:"💼 Salário CLT",date:today(),paid:true,cardId:null,installment:null},
      {id:2,desc:"Mercado",val:350,type:"expense",cat:"🛒 Alimentação",date:today(),paid:true,cardId:null,installment:null},
      {id:3,desc:"Conta de luz",val:180,type:"expense",cat:"⚡ Contas fixas",date:today(),paid:false,due:today(),cardId:null,installment:null},
    ],
    cards: [
      {id:1,name:"Nubank",brand:"Mastercard",color:"#8A05BE",closeDay:2,dueDay:10},
      {id:2,name:"Inter",brand:"Mastercard",color:"#FF7A00",closeDay:10,dueDay:17},
    ],
    budget: {},
  },
  spirit: { gratitude:{}, readings:[], prayers:[] },
  shopping: {
    items: [
      {id:1,name:"Leite",cat:"Laticínios",done:false},
      {id:2,name:"Pão",cat:"Padaria",done:false},
      {id:3,name:"Maçã",cat:"Frutas",done:true},
    ],
  },
  notes: {
    list: [
      {id:1,title:"Ideias de Jantar",content:"Lasanha, Risoto de Cogumelos, Sopa de Abóbora",color:"#FFF9C4",date:today()},
      {id:2,title:"Lembrar",content:"Marcar pediatra da Luísa na próxima semana",color:"#E1F5FE",date:today()},
    ],
  },
  reminders: {
    list: [
      {id:1,title:"Tomar Vitamina D",time:"08:00",date:today(),cat:"Saúde",priority:"Importante",done:false},
      {id:2,title:"Pagar conta de luz",time:"10:00",date:today(),cat:"Finanças",priority:"Urgente",done:false},
    ],
  },
  bloom: { points:{} },
  integrations: {
    google: {
      connected:false, email:"",
      calendars:[
        {id:"primary",name:"Pessoal",active:true},
        {id:"family",name:"Família",active:true},
      ],
      events:[
        {id:"g1",title:"Reunião de Pais",time:"14:00",date:today(),cal:"family"},
        {id:"g2",title:"Dentista Luísa",time:"10:30",date:today(),cal:"primary"},
      ],
    },
  },
  kids: {
    children: [
      {id:1,name:"Ana",  av:"Smile",age:8,color:"#FF8FAB",tasks:[{id:301,task:"Acordar",ic:Sun},{id:302,task:"Café da manhã",ic:"🥣"},{id:303,task:"Escovar dentes",ic:"🦷"},{id:304,task:"Banho",ic:"🛁"},{id:305,task:"Dormir cedo",ic:Moon}]},
      {id:2,name:"Pedro",av:"User",age:5,color:"#74B9FF",tasks:[{id:306,task:"Acordar",ic:Sun},{id:307,task:"Café da manhã",ic:"🥣"},{id:308,task:"Escovar dentes",ic:"🦷"},{id:309,task:"Banho",ic:"🛁"},{id:310,task:"Dormir cedo",ic:Moon}]},
      {id:3,name:"Luísa",av:"Baby",age:2,color:"#A29BFE",tasks:[{id:311,task:"Mamar",ic:"🍼"},{id:312,task:"Banho",ic:"🛁"},{id:313,task:"Soneca",ic:"😴"},{id:314,task:"Dormir cedo",ic:Moon}]},
    ],
    done:{},
  },
});

const DEF_CFG = () => ({
  theme:"pastel",
  name:"Amor",
  dash:{ bloom:true, water:true, routine:true, finance:true, cycle:true, spirit:true, reminders:true },
});

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────
function ProgressBar({ color, val, max, h=8 }) {
  const pct = max > 0 ? Math.min(100,(val/max)*100) : 0;
  return (
    <div style={{ height:h,borderRadius:99,background:"rgba(0,0,0,.08)",overflow:"hidden" }}>
      <div style={{ height:"100%",width:`${pct}%`,background:color,borderRadius:99,transition:"width .4s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}
function Chip({ T, active, onClick, children }) {
  return <button onClick={onClick} style={{ padding:"7px 14px",borderRadius:99,border:`1.5px solid ${active?T.p:T.bd}`,background:active?T.p:"transparent",color:active?"#fff":T.tm,fontWeight:active?700:500,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .2s",whiteSpace:"nowrap" }}>{children}</button>;
}
function Toggle({ T, val, onChange }) {
  return (
    <div onClick={()=>onChange(!val)} style={{ width:44,height:24,borderRadius:99,background:val?T.p:T.bd,position:"relative",cursor:"pointer",transition:"background .2s",flexShrink:0 }}>
      <div style={{ position:"absolute",top:2,left:val?22:2,width:20,height:20,borderRadius:99,background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.25)" }} />
    </div>
  );
}
function Card({ T, onClick, children, style={} }) {
  return <div onClick={onClick} style={{ background:T.surf,borderRadius:24,padding:18,border:`1px solid ${T.bd}`,boxShadow:"0 4px 12px rgba(0,0,0,.03)",cursor:onClick?"pointer":"default",...style }}>{children}</div>;
}
function Sheet({ T, title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"flex-end",zIndex:999,backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.surf,borderRadius:"32px 32px 0 0",width:"100%",maxWidth:430,margin:"0 auto",padding:"24px 20px 48px",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 -8px 24px rgba(0,0,0,.1)" }}>
        <div style={{ width:40,height:4,background:T.bd,borderRadius:99,margin:"0 auto 20px" }} />
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <span style={{ fontSize:18,fontWeight:800,color:T.tx }}>{title}</span>
          <button onClick={onClose} style={{ width:32,height:32,borderRadius:99,background:T.alt,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><X size={15} color={T.tm} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function FInput({ T, value, onChange, placeholder, type="text", style={} }) {
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ width:"100%",padding:"14px 16px",borderRadius:14,border:`1.5px solid ${T.bd}`,background:T.alt,color:T.tx,fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box",...style }} />;
}
function FSelect({ T, value, onChange, options, style={} }) {
  return <select value={value} onChange={e=>onChange(e.target.value)} style={{ width:"100%",padding:"14px 16px",borderRadius:14,border:`1.5px solid ${T.bd}`,background:T.alt,color:T.tx,fontSize:15,fontFamily:"inherit",cursor:"pointer",boxSizing:"border-box",...style }}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select>;
}
function Btn({ T, onClick, children, variant="primary", style={} }) {
  const s = { primary:{background:T.p,color:"#fff",border:"none",boxShadow:`0 4px 12px ${T.p}44`}, ghost:{background:"transparent",color:T.tm,border:`1px solid ${T.bd}`}, danger:{background:T.er,color:"#fff",border:"none"} }[variant];
  return <button onClick={onClick} style={{ padding:"14px 0",borderRadius:14,width:"100%",fontWeight:800,fontSize:15,fontFamily:"inherit",cursor:"pointer",...s,...style }}>{children}</button>;
}
function ConfirmDel({ T, label, onCancel, onConfirm }) {
  return (
    <Sheet T={T} title="Confirmar exclusão" onClose={onCancel}>
      <p style={{ color:T.tm,fontSize:14,marginBottom:20 }}>Remover <strong style={{ color:T.tx }}>{label}</strong>?</p>
      <div style={{ display:"flex",gap:10 }}>
        <Btn T={T} variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn T={T} variant="danger" onClick={onConfirm}>Remover</Btn>
      </div>
    </Sheet>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab, T }) {
  const items = [
    {k:"home",      I:Home,        lb:"Início"},
    {k:"rotina",    I:LayoutGrid,  lb:"Rotina"},
    {k:"saude",     I:Heart,       lb:"Saúde"},
    {k:"espiritual",I:Star,        lb:"Conexão"},
    {k:"organiza",  I:ShoppingCart,lb:"Organiza"},
    {k:"financas",  I:DollarSign,  lb:"Finanças"},
  ];
  return (
    <nav style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:T.surf,borderTop:`1px solid ${T.bd}`,display:"flex",height:70,zIndex:100,boxShadow:"0 -4px 16px rgba(0,0,0,.05)" }}>
      {items.map(({k,I,lb})=>{
        const a = tab===k;
        return (
          <button key={k} onClick={()=>setTab(k)} style={{ flex:1,padding:"4px 0",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
            <div style={{ width:42,height:30,borderRadius:12,background:a?T.p:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s" }}>
              <I size={18} color={a?"#fff":T.tm} strokeWidth={a?2.5:2} />
            </div>
            <span style={{ fontSize:10,color:a?T.p:T.tm,fontWeight:a?800:500 }}>{lb}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ data, cfg, T, setTab, setData }) {
  const day = today();
  const bloomPct = calcBloom(data, day);
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    if (bloomPct >= 100 && !celebrated) setCelebrated(true);
  }, [bloomPct]);

  const mainP = data.health.profiles.find(p => p.id === "eu") || data.health.profiles[0];
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
  const {dc=0,dl=0,isTPM=false,isFertil=false} = showCycle ? calcCycleState(day, cyc.start, cyc.len, cyc.menses) : {};

  const remPending = data.reminders.list.filter(r=>!r.done&&r.date===day).length;
  const gEvents    = data.integrations.google.connected ? data.integrations.google.events.filter(e=>e.date===day) : [];

  const allT    = data.routine.essMode ? data.routine.essential : [...data.routine.morning,...data.routine.afternoon,...data.routine.night];
  const doneIds = data.routine.done[day] || [];

  const addWater = ml => setData(d=>({...d,health:{...d.health,profiles:d.health.profiles.map(p=>p.id===mainP.id?{...p,water:{...p.water,log:{...p.water.log,[day]:(p.water.log[day]||0)+ml}}}:p)}}));

  const tnL = {morning:"Manhã 🌅",afternoon:"Tarde ☀️",night:"Noite 🌙"};

  return (
    <div style={{ padding:"24px 20px 20px" }}>
      {/* Celebração */}
      {celebrated && (
        <div style={{ background:T.gh,borderRadius:20,padding:"16px 20px",marginBottom:20,color:"#fff",display:"flex",alignItems:"center",gap:12,position:"relative",overflow:"hidden" }}>
          <Sparkles size={28} color="#fff" />
          <div style={{ flex:1 }}>
            <p style={{ margin:0,fontWeight:900,fontSize:16 }}>Florescimento Total! ✨</p>
            <p style={{ margin:"2px 0 0",fontSize:12,opacity:.9 }}>Você completou sua flor do dia!</p>
          </div>
          <button onClick={()=>setCelebrated(false)} style={{ background:"rgba(255,255,255,.2)",border:"none",borderRadius:99,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><X size={14} color="#fff" /></button>
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div>
          <h2 style={{ margin:0,color:T.tx,fontSize:26,fontWeight:900 }}>{greet()}, {cfg.name}</h2>
          <p style={{ margin:"2px 0 0",color:T.tm,fontSize:14 }}>{tnL[turnoNow()]}</p>
        </div>
        <div style={{ width:52,height:52,borderRadius:18,background:T.gh,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:`0 8px 16px ${T.p}33` }}>{T.e}</div>
      </div>

      {/* Bloom */}
      {cfg.dash.bloom && (
        <Card T={T} style={{ marginBottom:20,background:T.gh,border:"none",color:"#fff",padding:"24px 20px",position:"relative",overflow:"hidden" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",zIndex:2 }}>
            <div style={{ flex:1 }}>
              <p style={{ margin:0,fontSize:13,fontWeight:700,opacity:.9 }}>FLOR DO DIA</p>
              <h3 style={{ margin:"4px 0 12px",fontSize:20,fontWeight:900 }}>
                {bloomPct>=100?"Florescimento Total! ✨":bloomPct>=50?"Quase lá, continue! 🌱":"Começando a brotar... 💧"}
              </h3>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ flex:1,height:10,background:"rgba(255,255,255,.25)",borderRadius:99,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${bloomPct}%`,background:"#fff",borderRadius:99,transition:"width 1s ease" }} />
                </div>
                <span style={{ fontSize:14,fontWeight:900 }}>{bloomPct}%</span>
              </div>
            </div>
            <div style={{ marginLeft:20,transform:`scale(${0.8+(bloomPct/200)})`,transition:"transform .5s" }}>
              {bloomPct>=80?<Flower2 size={60} color="#fff" strokeWidth={1.5}/>:bloomPct>=40?<Flower size={52} color="#fff" strokeWidth={1.5}/>:<Leaf size={44} color="#fff" strokeWidth={1.5}/>}
            </div>
          </div>
          <div style={{ position:"absolute",left:-20,bottom:-20,width:120,height:120,borderRadius:99,background:"rgba(255,255,255,.1)" }} />
        </Card>
      )}

      {/* Badges contextuais */}
      <div style={{ display:"flex",gap:10,marginBottom:20,overflowX:"auto",paddingBottom:4 }}>
        {isTPM && <div style={{ background:T.er+"15",padding:"8px 14px",borderRadius:14,border:`1px solid ${T.er}33`,display:"flex",alignItems:"center",gap:6,flexShrink:0 }}><span style={{ fontSize:12,fontWeight:700,color:T.er }}>Fase Lútea ({dl}d)</span></div>}
        {gEvents.length>0 && <div onClick={()=>setTab("rotina")} style={{ background:"#4285F415",padding:"8px 14px",borderRadius:14,border:"1px solid #4285F433",display:"flex",alignItems:"center",gap:6,flexShrink:0,cursor:"pointer" }}><Calendar size={14} color="#4285F4"/><span style={{ fontSize:12,fontWeight:700,color:"#4285F4" }}>{gEvents.length} eventos</span></div>}
        {remPending>0 && <div onClick={()=>setTab("organiza")} style={{ background:T.wn+"15",padding:"8px 14px",borderRadius:14,border:`1px solid ${T.wn}33`,display:"flex",alignItems:"center",gap:6,flexShrink:0,cursor:"pointer" }}><BellRing size={14} color={T.wn}/><span style={{ fontSize:12,fontWeight:700,color:T.wn }}>{remPending} alertas</span></div>}
      </div>

      {/* Cards */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        {cfg.dash.water && (
          <Card T={T} onClick={()=>setTab("saude")}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:12 }}>
              <div style={{ width:34,height:34,borderRadius:11,background:T.alt,display:"flex",alignItems:"center",justifyContent:"center" }}><Droplets size={18} color={T.p}/></div>
              <button onClick={e=>{e.stopPropagation();addWater(250)}} style={{ width:26,height:26,borderRadius:9,background:T.p,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><Plus size={14} color="#fff"/></button>
            </div>
            <p style={{ margin:0,fontSize:11,color:T.tm,fontWeight:700 }}>HIDRATAÇÃO</p>
            <p style={{ margin:"3px 0 8px",fontSize:20,fontWeight:900,color:T.tx }}>{wPct}%</p>
            <ProgressBar color={T.p} val={wNow} max={wGoal} h={6}/>
          </Card>
        )}
        {cfg.dash.cycle && showCycle && (
          <Card T={T} onClick={()=>setTab("saude")}>
            <div style={{ width:34,height:34,borderRadius:11,background:T.alt,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12 }}>
              {isFertil ? <Sparkles size={18} color={T.p}/> : <Heart size={18} color={T.p}/>}
            </div>
            <p style={{ margin:0,fontSize:11,color:T.tm,fontWeight:700 }}>CICLO</p>
            <p style={{ margin:"3px 0 0",fontSize:20,fontWeight:900,color:T.tx }}>Dia {dc+1}</p>
            <p style={{ margin:0,fontSize:11,color:isFertil?T.ok:T.tm,fontWeight:700 }}>{isFertil?"Período Fértil":`Faltam ${dl}d`}</p>
          </Card>
        )}
        {cfg.dash.routine && (
          <Card T={T} onClick={()=>setTab("rotina")} style={{ gridColumn:"span 2" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
              <p style={{ margin:0,fontSize:14,fontWeight:900,color:T.tx }}>📋 Rotina de Hoje</p>
              <span style={{ fontSize:12,color:T.tm,fontWeight:700,background:T.alt,padding:"3px 10px",borderRadius:99 }}>{doneIds.length}/{allT.length}</span>
            </div>
            <ProgressBar color={T.p} val={doneIds.length} max={allT.length} h={10}/>
          </Card>
        )}
        {cfg.dash.finance && (
          <Card T={T} onClick={()=>setTab("financas")} style={{ gridColumn:"span 2" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div>
                <p style={{ margin:0,fontSize:11,color:T.tm,fontWeight:700 }}>SALDO DO MÊS</p>
                <p style={{ margin:"3px 0 0",fontSize:24,fontWeight:900,color:T.tx }}>R$ {fmtBRL(bal)}</p>
                {nextDue && <p style={{ margin:"4px 0 0",fontSize:11,color:T.er,fontWeight:700,display:"flex",alignItems:"center",gap:4 }}><AlertCircle size={11}/> Vence: {nextDue.desc} (R$ {fmtBRL(nextDue.val)})</p>}
              </div>
              <div style={{ width:46,height:46,borderRadius:14,background:T.alt,display:"flex",alignItems:"center",justifyContent:"center" }}><DollarSign size={22} color={T.p}/></div>
            </div>
          </Card>
        )}
        {cfg.dash.spirit && (
          <Card T={T} onClick={()=>setTab("espiritual")}>
            <div style={{ width:34,height:34,borderRadius:11,background:T.alt,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12 }}>
              <Star size={18} color={T.p}/>
            </div>
            <p style={{ margin:0,fontSize:11,color:T.tm,fontWeight:700 }}>CONEXÃO</p>
            <p style={{ margin:"3px 0 0",fontSize:14,fontWeight:800,color:T.tx }}>{(data.spirit.gratitude[day]||[]).length} gratidões</p>
          </Card>
        )}
        {cfg.dash.reminders && (
          <Card T={T} onClick={()=>setTab("organiza")}>
            <div style={{ width:34,height:34,borderRadius:11,background:T.alt,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12 }}>
              <Bell size={18} color={remPending>0?T.wn:T.p}/>
            </div>
            <p style={{ margin:0,fontSize:11,color:T.tm,fontWeight:700 }}>LEMBRETES</p>
            <p style={{ margin:"3px 0 0",fontSize:14,fontWeight:800,color:remPending>0?T.wn:T.tx }}>{remPending} hoje</p>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── ROTINA ───────────────────────────────────────────────────────────────────
function RotinaScreen({ data, T, setData, setTab }) {
  const [view, setView] = useState("minha");
  return (
    <div>
      <div style={{ padding:"20px 20px 0" }}>
        <div style={{ display:"flex",gap:6,background:T.alt,padding:4,borderRadius:14,marginBottom:4 }}>
          {[{k:"minha",lb:"📋 Minha Rotina"},{k:"criancas",lb:"🧒 Crianças"}].map(({k,lb})=>(
            <button key={k} onClick={()=>setView(k)} style={{ flex:1,padding:"10px 8px",borderRadius:10,border:"none",background:view===k?T.surf:"transparent",color:view===k?T.p:T.tm,fontWeight:view===k?700:500,cursor:"pointer",fontSize:13,fontFamily:"inherit",boxShadow:view===k?"0 1px 6px rgba(0,0,0,.07)":"none",transition:"all .2s" }}>{lb}</button>
          ))}
        </div>
      </div>
      {view==="minha"    && <MinhaRotina    data={data} T={T} setData={setData} setTab={setTab}/>}
      {view==="criancas" && <CriancasRotina data={data} T={T} setData={setData}/>}
    </div>
  );
}

function MinhaRotina({ data, T, setData, setTab }) {
  const day = today();
  const [turno, setTurno] = useState(turnoNow());
  const [sheet, setSheet] = useState(null);
  const [nt, setNt]       = useState({ task:"", time:"" });
  const [delId, setDelId] = useState(null);

  const em      = data.routine.essMode;
  const tasks   = em ? data.routine.essential : data.routine[turno];
  const doneIds = data.routine.done[day] || [];
  const allT    = em ? data.routine.essential : [...data.routine.morning,...data.routine.afternoon,...data.routine.night];
  const doneCnt = allT.filter(t=>doneIds.includes(t.id)).length;

  const toggleDone = id => setData(d=>{
    const prev = d.routine.done[day]||[];
    const next = prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];
    return {...d,routine:{...d.routine,done:{...d.routine.done,[day]:next}}};
  });
  const doAdd = () => {
    if (!nt.task.trim()) return;
    const key = em?"essential":turno;
    setData(d=>({...d,routine:{...d.routine,[key]:[...d.routine[key],{id:Date.now(),task:nt.task.trim(),time:nt.time}]}}));
    setNt({task:"",time:""}); setSheet(null);
  };
  const doRemove = () => {
    const key = em?"essential":turno;
    setData(d=>({...d,routine:{...d.routine,[key]:d.routine[key].filter(x=>x.id!==delId)}}));
    setDelId(null); setSheet(null);
  };

  const delTask = tasks.find(t=>t.id===delId);

  return (
    <div style={{ padding:"16px 20px 20px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
        <div>
          <h2 style={{ margin:0,color:T.tx,fontSize:20,fontWeight:900 }}>Minha Rotina</h2>
          <p style={{ margin:"2px 0 0",color:T.tm,fontSize:12 }}>{doneCnt}/{allT.length} tarefas hoje</p>
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          <button onClick={()=>setData(d=>({...d,routine:{...d.routine,essMode:!d.routine.essMode}}))}
            style={{ padding:"6px 14px",borderRadius:99,background:em?T.p:T.alt,border:"none",color:em?"#fff":T.tm,fontSize:12,fontWeight:700,cursor:"pointer" }}>
            {em?"⚡ Essencial":"📅 Completo"}
          </button>
          <button onClick={()=>setSheet("add")} style={{ width:38,height:38,borderRadius:12,background:T.p,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 4px 10px ${T.p}44` }}><Plus size={18} color="#fff"/></button>
        </div>
      </div>
      <ProgressBar color={T.p} val={doneCnt} max={allT.length} h={6}/>

      {!em && (
        <div style={{ display:"flex",gap:6,margin:"14px 0",background:T.alt,padding:4,borderRadius:14 }}>
          {TURNOS.map(({key,lb,ic:Ic})=>( 
            <button key={key} onClick={()=>setTurno(key)} style={{ flex:1,padding:"8px 4px",borderRadius:10,border:"none",background:turno===key?T.surf:"transparent",color:turno===key?T.p:T.tm,fontWeight:turno===key?700:500,cursor:"pointer",fontSize:12,fontFamily:"inherit",boxShadow:turno===key?"0 1px 6px rgba(0,0,0,.07)":"none",transition:"all .2s",display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
              <Ic size={16} /><span>{lb}</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {tasks.length===0 && (
          <div style={{ textAlign:"center",padding:"28px 0",color:T.tm }}>
            <p style={{ fontSize:26,margin:"0 0 6px" }}>✅</p>
            <p style={{ margin:0,fontWeight:600,fontSize:13 }}>Sem tarefas aqui</p>
          </div>
        )}
        {tasks.map(t=>{
          const done = doneIds.includes(t.id);
          return (
            <div key={t.id} onClick={()=>toggleDone(t.id)} style={{ display:"flex",alignItems:"center",gap:10,background:T.surf,padding:"13px 14px",borderRadius:16,border:`1.5px solid ${done?T.ok+"55":T.bd}`,cursor:"pointer",transition:"all .2s" }}>
              <div style={{ width:26,height:26,borderRadius:8,border:`2px solid ${done?T.ok:T.bd}`,background:done?T.ok:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s" }}>
                {done && <Check size={14} color="#fff"/>}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ margin:0,fontSize:14,fontWeight:600,color:done?T.tm:T.tx,textDecoration:done?"line-through":"none" }}>{t.task}</p>
                {t.time && t.time!=="00:00" && <p style={{ margin:0,fontSize:11,color:T.tm }}>{t.time}</p>}
              </div>
              <button onClick={e=>{e.stopPropagation();setDelId(t.id);setSheet("del")}} style={{ width:26,height:26,borderRadius:8,background:T.alt,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><Trash2 size={12} color={T.tm}/></button>
            </div>
          );
        })}
      </div>

      {sheet==="add" && (
        <Sheet T={T} title="Nova tarefa" onClose={()=>setSheet(null)}>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <FInput T={T} value={nt.task} onChange={v=>setNt(x=>({...x,task:v}))} placeholder="Nome da tarefa"/>
            <FInput T={T} value={nt.time} onChange={v=>setNt(x=>({...x,time:v}))} placeholder="Horário (ex: 07:30)"/>
            {!em && (
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {TURNOS.map(({key,lb,ic:Ic})=><Chip key={key} T={T} active={turno===key} onClick={()=>setTurno(key)}><div style={{ display:"flex", alignItems:"center", gap:5 }}><Ic size={14}/> {lb}</div></Chip>)}
              </div>
            )}
            <Btn T={T} onClick={doAdd}>Adicionar tarefa</Btn>
          </div>
        </Sheet>
      )}
      {sheet==="del" && delTask && <ConfirmDel T={T} label={delTask.task} onCancel={()=>setSheet(null)} onConfirm={doRemove}/>}
    </div>
  );
}

function CriancasRotina({ data, T, setData }) {
  const day = today();
  const [selId, setSelId]   = useState(data.kids.children[0]?.id||null);
  const [sheet, setSheet]   = useState(null);
  const [nt,    setNt]      = useState({task:"",ic:"⭐"});
  const [nc,    setNc]      = useState({name:"",av:"Smile",age:"",color:"#FF8FAB"});
  const [delId, setDelId]   = useState(null);
  const [delKid,setDelKid]  = useState(null);

  const children = data.kids.children;
  const child    = children.find(c=>c.id===selId);
  const doneIds  = data.kids.done[day]||[];

  const toggleDone = id => setData(d=>{
    const prev = d.kids.done[day]||[];
    const next = prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];
    return {...d,kids:{...d.kids,done:{...d.kids.done,[day]:next}}};
  });
  const doAddTask = () => {
    if (!nt.task.trim()||!child) return;
    setData(d=>({...d,kids:{...d.kids,children:d.kids.children.map(c=>c.id===selId?{...c,tasks:[...c.tasks,{id:Date.now(),task:nt.task.trim(),ic:nt.ic}]}:c)}}));
    setNt({task:"",ic:"⭐"}); setSheet(null);
  };
  const doRemoveTask = () => {
    setData(d=>({...d,kids:{...d.kids,children:d.kids.children.map(c=>c.id===selId?{...c,tasks:c.tasks.filter(t=>t.id!==delId)}:c)}}));
    setDelId(null); setSheet(null);
  };
  const doAddChild = () => {
    if (!nc.name.trim()) return;
    const id = Date.now();
    setData(d=>({...d,kids:{...d.kids,children:[...d.kids.children,{id,name:nc.name.trim(),av:nc.av,age:parseInt(nc.age)||0,color:nc.color,tasks:[]}]}}));
    setSelId(id); setNc({name:"",av:"Smile",age:"",color:"#FF8FAB"}); setSheet(null);
  };
  const doRemoveChild = () => {
    setData(d=>({...d,kids:{...d.kids,children:d.kids.children.filter(c=>c.id!==delKid)}}));
    const rem = children.filter(c=>c.id!==delKid);
    setSelId(rem[0]?.id||null); setDelKid(null); setSheet(null);
  };

  const EMOJIS = ["⭐","🦷","🛁","🍼","☀️","🌙","🥣","🏃","📚","🎮","🎨","🌈","🍎","💤","🙏"];
  const COLORS = ["#FF8FAB","#74B9FF","#A29BFE","#55EFC4","#FDCB6E","#E17055","#00CEC9","#FD79A8"];
  const AVS    = ["👧","👦","👶","🧒","👼"];

  const doneCnt = child?child.tasks.filter(t=>doneIds.includes(t.id)).length:0;
  const delTask = child?.tasks.find(t=>t.id===delId);
  const delChild = children.find(c=>c.id===delKid);

  return (
    <div style={{ padding:"16px 20px 20px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
        <div>
          <h2 style={{ margin:0,color:T.tx,fontSize:20,fontWeight:900 }}>Rotina das Crianças</h2>
          <p style={{ margin:"2px 0 0",color:T.tm,fontSize:12 }}>Toque para marcar ✅</p>
        </div>
        <button onClick={()=>setSheet("addChild")} style={{ padding:"8px 14px",borderRadius:12,background:T.p,border:"none",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer" }}>+ Criança</button>
      </div>

      {children.length===0 ? (
        <div style={{ textAlign:"center",padding:"40px 0",color:T.tm }}>
          <p style={{ fontSize:40,margin:"0 0 8px" }}>👶</p>
          <p style={{ margin:0,fontWeight:600 }}>Nenhuma criança cadastrada</p>
        </div>
      ) : (
        <>
          <div style={{ display:"flex",gap:10,marginBottom:16,overflowX:"auto",paddingBottom:4 }}>
            {children.map(c=>{
              const cd = c.tasks.filter(t=>doneIds.includes(t.id)).length;
              const sel = selId===c.id;
              return (
                <button key={c.id} onClick={()=>setSelId(c.id)} style={{ flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 16px",borderRadius:16,border:`2px solid ${sel?c.color:T.bd}`,background:sel?c.color+"18":"transparent",cursor:"pointer",fontFamily:"inherit",transition:"all .2s" }}>
                  <span style={{ fontSize:28 }}>{c.av}</span>
                  <span style={{ fontSize:13,fontWeight:700,color:sel?c.color:T.tm }}>{c.name}</span>
                  <span style={{ fontSize:10,color:T.tm }}>{cd}/{c.tasks.length}</span>
                </button>
              );
            })}
          </div>

          {child && (
            <div style={{ background:T.surf,borderRadius:20,border:`1px solid ${T.bd}`,overflow:"hidden" }}>
              <div style={{ background:`linear-gradient(135deg,${child.color}CC,${child.color}66)`,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:34 }}>{child.av}</span>
                  <div>
                    <p style={{ margin:0,fontSize:18,fontWeight:900,color:"#fff" }}>{child.name}</p>
                    <p style={{ margin:"2px 0 0",fontSize:12,color:"rgba(255,255,255,.8)" }}>{child.age} anos · {doneCnt}/{child.tasks.length} feitas</p>
                  </div>
                </div>
                <div style={{ display:"flex",gap:6 }}>
                  <button onClick={()=>setSheet("addTask")} style={{ width:34,height:34,borderRadius:10,background:"rgba(255,255,255,.3)",border:"1px solid rgba(255,255,255,.5)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><Plus size={16} color="#fff"/></button>
                  <button onClick={()=>{setDelKid(child.id);setSheet("delChild")}} style={{ width:34,height:34,borderRadius:10,background:"rgba(255,255,255,.2)",border:"1px solid rgba(255,255,255,.4)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><Trash2 size={14} color="#fff"/></button>
                </div>
              </div>
              <div style={{ padding:"0 18px",marginTop:-2 }}>
                <div style={{ height:5,borderRadius:99,background:"rgba(0,0,0,.08)",overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${child.tasks.length>0?Math.round((doneCnt/child.tasks.length)*100):0}%`,background:child.color,borderRadius:99,transition:"width .4s" }}/>
                </div>
              </div>
              <div style={{ padding:"12px 14px 18px",display:"flex",flexDirection:"column",gap:10 }}>
                {child.tasks.length===0 && <div style={{ textAlign:"center",padding:"16px 0",color:T.tm }}><p style={{ fontSize:22,margin:"0 0 6px" }}>✨</p><p style={{ margin:0,fontSize:13 }}>Sem tarefas ainda</p></div>}
                {child.tasks.map(t=>{
                  const done = doneIds.includes(t.id);
                  return (
                    <div key={t.id} onClick={()=>toggleDone(t.id)} style={{ display:"flex",alignItems:"center",gap:14,padding:"13px 15px",borderRadius:16,background:done?child.color+"18":T.alt,border:`2px solid ${done?child.color:T.bd}`,cursor:"pointer",position:"relative",transition:"all .2s" }}>
                      <span style={{ fontSize:28,flexShrink:0 }}>{t.ic}</span>
                      <p style={{ margin:0,flex:1,fontSize:17,fontWeight:700,color:done?child.color:T.tx,textDecoration:done?"line-through":"none" }}>{t.task}</p>
                      <div style={{ width:26,height:26,borderRadius:99,border:`2.5px solid ${done?child.color:T.bd}`,background:done?child.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        {done && <Check size={13} color="#fff"/>}
                      </div>
                      <button onClick={e=>{e.stopPropagation();setDelId(t.id);setSheet("delTask")}} style={{ position:"absolute",top:6,right:6,width:20,height:20,borderRadius:99,background:"rgba(0,0,0,.08)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><X size={10} color={T.tm}/></button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {sheet==="addTask"&&child&&(
        <Sheet T={T} title={`Tarefa para ${child.name}`} onClose={()=>setSheet(null)}>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <FInput T={T} value={nt.task} onChange={v=>setNt(x=>({...x,task:v}))} placeholder="Nome da tarefa"/>
            <p style={{ margin:0,fontSize:13,color:T.tm,fontWeight:600 }}>Emoji:</p>
            <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
              {EMOJIS.map(e=><button key={e} onClick={()=>setNt(x=>({...x,ic:e}))} style={{ width:44,height:44,borderRadius:12,border:`2px solid ${nt.ic===e?T.p:T.bd}`,background:nt.ic===e?T.p+"18":"transparent",fontSize:22,cursor:"pointer" }}>{e}</button>)}
            </div>
            <Btn T={T} onClick={doAddTask}>Adicionar</Btn>
          </div>
        </Sheet>
      )}
      {sheet==="addChild"&&(
        <Sheet T={T} title="Nova criança" onClose={()=>setSheet(null)}>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <FInput T={T} value={nc.name} onChange={v=>setNc(x=>({...x,name:v}))} placeholder="Nome"/>
            <FInput T={T} value={nc.age}  onChange={v=>setNc(x=>({...x,age:v}))}  placeholder="Idade" type="number"/>
            <p style={{ margin:0,fontSize:13,color:T.tm,fontWeight:600 }}>Avatar:</p>
            <div style={{ display:"flex",gap:8 }}>
              {AVS.map(a=><button key={a} onClick={()=>setNc(x=>({...x,av:a}))} style={{ width:50,height:50,borderRadius:14,border:`2px solid ${nc.av===a?T.p:T.bd}`,background:nc.av===a?T.p+"18":"transparent",fontSize:26,cursor:"pointer" }}>{a}</button>)}
            </div>
            <p style={{ margin:0,fontSize:13,color:T.tm,fontWeight:600 }}>Cor:</p>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {COLORS.map(c=><button key={c} onClick={()=>setNc(x=>({...x,color:c}))} style={{ width:34,height:34,borderRadius:99,background:c,border:`3px solid ${nc.color===c?"#fff":"transparent"}`,outline:`2px solid ${nc.color===c?c:"transparent"}`,cursor:"pointer" }}/>)}
            </div>
            <Btn T={T} onClick={doAddChild}>Adicionar criança</Btn>
          </div>
        </Sheet>
      )}
      {sheet==="delTask"&&delTask&&<ConfirmDel T={T} label={delTask.task} onCancel={()=>setSheet(null)} onConfirm={doRemoveTask}/>}
      {sheet==="delChild"&&delChild&&<ConfirmDel T={T} label={delChild.name} onCancel={()=>setSheet(null)} onConfirm={doRemoveChild}/>}
    </div>
  );
}

// ─── SAÚDE ────────────────────────────────────────────────────────────────────
function SaudeScreen({ data, T, setData }) {
  const day = today();

  // ── State local ──────────────────────────────────────────────────────────────
  const [activeId, setActiveId] = useState(
    data.health.activeProfile || data.health.profiles[0]?.id
  );
  const [sheet, setSheet] = useState(null);

  // Formulários (3 objetos, não N useState)
  const [nProfile, setNProfile] = useState({ name:"", av:"👤", type:"adult_f", color:"#8B5CF6", water_goal:2000 });
  const [nMed,     setNMed]     = useState({ name:"", dose:"", time:"08:00" });
  const [editCycle,setEditCycle]= useState({ start:"", len:"28", menses:"5" });
  const [editWGoal,setEditWGoal]= useState("");
  const [mlInput,  setMlInput]  = useState("");
  const [editPInfo,setEditPInfo]= useState({ name:"", av:"", color:"" });
  const [delMedId, setDelMedId] = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const profiles = data.health.profiles;
  const profile  = profiles.find(p => p.id === activeId) || profiles[0];

  const upProfile = (id, fn) => setData(d => ({
    ...d,
    health: {
      ...d.health,
      profiles: d.health.profiles.map(p => p.id === id ? fn(p) : p),
    },
  }));

  const switchProfile = id => {
    setActiveId(id);
    setData(d => ({ ...d, health: { ...d.health, activeProfile: id } }));
  };

  // Água
  const wNow  = profile?.water?.log?.[day] || 0;
  const wGoal = profile?.water?.goal || 2000;
  const wPct  = Math.min(100, Math.round((wNow / wGoal) * 100));
  const cups  = Math.floor(wNow / 250);

  const addWater = ml => upProfile(profile.id, p => ({
    ...p, water: { ...p.water, log: { ...p.water.log, [day]: (p.water.log[day] || 0) + ml } }
  }));
  const resetWater = () => upProfile(profile.id, p => ({
    ...p, water: { ...p.water, log: { ...p.water.log, [day]: 0 } }
  }));

  // Ciclo (só adult_f)
  const hasCycle = profile?.type === "adult_f";
  const cyc = profile?.cycle || { start: today(), len: 28, menses: 5 };
  const cycleState = hasCycle ? calcCycleState(day, cyc.start, cyc.len, cyc.menses) : null;

  // Medicamentos
  const meds = profile?.meds || [];
  const toggleMedLog = medId => {
    const key = `${day}_${medId}`;
    upProfile(profile.id, p => ({
      ...p,
      meds: p.meds.map(m => m.id === medId
        ? { ...m, log: { ...m.log, [day]: !m.log[day] } }
        : m
      ),
    }));
  };

  // ── Ações de CRUD ─────────────────────────────────────────────────────────────
  const doAddProfile = () => {
    if (!nProfile.name.trim()) return;
    const id = `p_${Date.now()}`;
    const base = {
      id,
      name: nProfile.name.trim(),
      av:   nProfile.av,
      type: nProfile.type,
      color:nProfile.color,
      water: { goal: parseInt(nProfile.water_goal) || 2000, log: {} },
      meds:  [],
      notes: {},
    };
    if (nProfile.type === "adult_f") base.cycle = { start: today(), len: 28, menses: 5 };
    setData(d => ({ ...d, health: { ...d.health, profiles: [...d.health.profiles, base] } }));
    setNProfile({ name:"", av:"👤", type:"adult_f", color:"#8B5CF6", water_goal:2000 });
    setSheet(null);
    switchProfile(id);
  };

  const doRemoveProfile = () => {
    if (profiles.length <= 1) { setSheet(null); return; }
    const remaining = profiles.filter(p => p.id !== profile.id);
    setData(d => ({ ...d, health: { ...d.health, profiles: remaining, activeProfile: remaining[0].id } }));
    setActiveId(remaining[0].id);
    setSheet(null);
  };

  const doSaveCycle = () => {
    upProfile(profile.id, p => ({
      ...p, cycle: { start: editCycle.start || cyc.start, len: parseInt(editCycle.len) || 28, menses: parseInt(editCycle.menses) || 5 }
    }));
    setSheet(null);
  };

  const doSaveWGoal = () => {
    const v = parseInt(editWGoal);
    if (!v || v < 100) return;
    upProfile(profile.id, p => ({ ...p, water: { ...p.water, goal: v } }));
    setSheet(null);
  };

  const doAddMed = () => {
    if (!nMed.name.trim()) return;
    upProfile(profile.id, p => ({
      ...p, meds: [...p.meds, { id: `m_${Date.now()}`, ...nMed, log: {} }]
    }));
    setNMed({ name:"", dose:"", time:"08:00" }); setSheet(null);
  };

  const doRemoveMed = () => {
    upProfile(profile.id, p => ({ ...p, meds: p.meds.filter(m => m.id !== delMedId) }));
    setDelMedId(null); setSheet(null);
  };

  const doEditProfile = () => {
    upProfile(profile.id, p => ({
      ...p,
      name:  editPInfo.name.trim()  || p.name,
      av:    editPInfo.av           || p.av,
      color: editPInfo.color        || p.color,
    }));
    setSheet(null);
  };

  // ── Constantes visuais ────────────────────────────────────────────────────────
  const TYPES = [
    { v:"adult_f", lb:"Mulher",  ic:"👩" },
    { v:"adult_m", lb:"Homem",   ic:"👨" },
    { v:"child",   lb:"Criança", ic:"🧒" },
    { v:"pet",     lb:"Pet",     ic:"🐾" },
  ];
  const AVS_ADULT_F = ["👩","👱‍♀️","👩‍🦱","👩‍🦰","🧕","👵"];
  const AVS_ADULT_M = ["👨","👱","👨‍🦱","👨‍🦰","🧔","👴"];
  const AVS_CHILD   = ["👧","👦","🧒","👶"];
  const AVS_PET     = ["🐶","🐱","🐰","🐦","🐹","🐟"];
  const avPool = nProfile.type === "adult_f" ? AVS_ADULT_F : nProfile.type === "adult_m" ? AVS_ADULT_M : nProfile.type === "child" ? AVS_CHILD : AVS_PET;
  const PROFILE_COLORS = ["#E8799A","#8B5CF6","#059669","#F59E0B","#3B82F6","#EC4899","#14B8A6","#F97316"];

  const phaseColor = cycleState
    ? cycleState.isMenses ? T.er : cycleState.isFertil ? T.ok : T.p
    : T.p;

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding:"20px 20px 20px" }}>

      {/* ── SELETOR DE PERFIS ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h2 style={{ margin:0, color:T.tx, fontSize:20, fontWeight:900 }}>Saúde & Bem-estar</h2>
        <button onClick={() => setSheet("addProfile")}
          style={{ padding:"7px 14px", borderRadius:12, background:T.p, border:"none", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 10px ${T.p}44` }}>
          + Perfil
        </button>
      </div>

      {/* Chips de perfil */}
      <div style={{ display:"flex", gap:10, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
        {profiles.map(p => {
          const sel = p.id === activeId;
          return (
            <button key={p.id} onClick={() => switchProfile(p.id)}
              style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                padding:"10px 16px", borderRadius:16, border:`2px solid ${sel ? p.color : T.bd}`,
                background:sel ? p.color + "18" : "transparent", cursor:"pointer", fontFamily:"inherit", transition:"all .2s" }}>
              <span style={{ fontSize:26 }}>{p.av}</span>
              <span style={{ fontSize:12, fontWeight:700, color:sel ? p.color : T.tm }}>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── HEADER DO PERFIL ATIVO ── */}
      {profile && (
        <div style={{ background:`linear-gradient(135deg,${profile.color}CC,${profile.color}66)`, borderRadius:20, padding:"16px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:14, position:"relative", overflow:"hidden" }}>
          <span style={{ fontSize:40 }}>{profile.av}</span>
          <div style={{ flex:1 }}>
            <p style={{ margin:0, fontSize:18, fontWeight:900, color:"#fff" }}>{profile.name}</p>
            <p style={{ margin:"2px 0 0", fontSize:12, color:"rgba(255,255,255,.85)" }}>
              {TYPES.find(t => t.v === profile.type)?.lb}
              {hasCycle && cycleState && ` · Dia ${cycleState.dc + 1} do ciclo`}
            </p>
          </div>
          <button onClick={() => { setEditPInfo({ name:profile.name, av:profile.av, color:profile.color }); setSheet("editProfile"); }}
            style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,.25)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Settings size={16} color="#fff" />
          </button>
          <div style={{ position:"absolute", right:-20, bottom:-20, width:80, height:80, borderRadius:99, background:"rgba(255,255,255,.12)" }} />
        </div>
      )}

      {/* ── ÁGUA ── */}
      <div style={{ background:T.surf, borderRadius:20, border:`1px solid ${T.bd}`, marginBottom:14, overflow:"hidden" }}>
        <div style={{ background:T.gh, padding:"16px 18px", color:"#fff" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:40, height:40, borderRadius:13, background:"rgba(255,255,255,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>💧</div>
              <div>
                <p style={{ margin:0, fontWeight:900, fontSize:16, color:"#fff" }}>Hidratação</p>
                <p style={{ margin:0, fontSize:12, opacity:.9 }}>{wNow}ml / {wGoal}ml</p>
              </div>
            </div>
            <button onClick={() => { setEditWGoal(String(wGoal)); setSheet("editWGoal"); }}
              style={{ width:32, height:32, borderRadius:10, background:"rgba(255,255,255,.2)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <Settings size={15} color="#fff" />
            </button>
          </div>
          <div style={{ height:10, borderRadius:99, background:"rgba(255,255,255,.25)", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${wPct}%`, background:"#fff", borderRadius:99, transition:"width .4s" }} />
          </div>
        </div>
        <div style={{ padding:"16px 18px" }}>
          <div style={{ display:"flex", justifyContent:"space-around", marginBottom:14 }}>
            <div style={{ textAlign:"center" }}>
              <p style={{ margin:0, fontSize:26, fontWeight:900, color:T.tx }}>{wPct}%</p>
              <p style={{ margin:0, fontSize:10, color:T.tm, fontWeight:700 }}>DA META</p>
            </div>
            <div style={{ width:1, background:T.bd }} />
            <div style={{ textAlign:"center" }}>
              <p style={{ margin:0, fontSize:26, fontWeight:900, color:T.tx }}>{cups}</p>
              <p style={{ margin:0, fontSize:10, color:T.tm, fontWeight:700 }}>COPOS 250ml</p>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
            {[150, 250, 350, 500].map(ml => (
              <button key={ml} onClick={() => addWater(ml)}
                style={{ padding:"11px 0", borderRadius:12, border:`1.5px solid ${T.bd}`, background:T.surf, color:T.tx, fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                +{ml}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <button onClick={() => { setMlInput(""); setSheet("customMl"); }}
              style={{ flex:1, padding:"11px", borderRadius:12, border:`1.5px solid ${T.p}`, background:"transparent", color:T.p, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
              Personalizado
            </button>
            <button onClick={resetWater}
              style={{ flex:1, padding:"11px", borderRadius:12, border:`1.5px solid ${T.er}44`, background:"transparent", color:T.er, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
              Resetar
            </button>
          </div>
        </div>
      </div>

      {/* ── CICLO (só adult_f) ── */}
      {hasCycle && cycleState && (
        <div style={{ background:T.surf, borderRadius:20, border:`2px solid ${phaseColor}44`, marginBottom:14, overflow:"hidden" }}>
          <div style={{ background:phaseColor, padding:"16px 18px", color:"#fff" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:40, height:40, borderRadius:13, background:"rgba(255,255,255,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                  {cycleState.isMenses ? "🩸" : cycleState.isFertil ? "👶" : "🌸"}
                </div>
                <div>
                  <p style={{ margin:0, fontWeight:900, fontSize:16, color:"#fff" }}>Ciclo Menstrual</p>
                  <p style={{ margin:0, fontSize:12, opacity:.9 }}>Dia {cycleState.dc + 1} de {cyc.len}</p>
                </div>
              </div>
              <button onClick={() => { setEditCycle({ start:cyc.start, len:String(cyc.len), menses:String(cyc.menses) }); setSheet("editCycle"); }}
                style={{ width:32, height:32, borderRadius:10, background:"rgba(255,255,255,.2)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <Settings size={15} color="#fff" />
              </button>
            </div>
            <div style={{ background:"rgba(255,255,255,.18)", borderRadius:12, padding:"10px 14px", fontSize:13, fontWeight:700, color:"#fff" }}>
              {cycleState.isMenses ? "Fase Menstrual" : cycleState.isFertil ? "Período Fértil — bom para engravidar 👶" : cycleState.isTPM ? "TPM chegando — cuide-se com carinho 🍫" : `Fase ${cycleState.phase}`}
            </div>
          </div>
          <div style={{ padding:"14px 18px", display:"flex", justifyContent:"space-around" }}>
            <div style={{ textAlign:"center" }}>
              <p style={{ margin:0, fontSize:10, color:T.tm, fontWeight:700 }}>PRÓX. MENS.</p>
              <p style={{ margin:"4px 0 0", fontSize:20, fontWeight:900, color:T.tx }}>{cycleState.dl}d</p>
            </div>
            <div style={{ width:1, background:T.bd }} />
            <div style={{ textAlign:"center" }}>
              <p style={{ margin:0, fontSize:10, color:T.tm, fontWeight:700 }}>PERÍODO FÉRTIL</p>
              <p style={{ margin:"4px 0 0", fontSize:20, fontWeight:900, color:cycleState.isFertil ? T.ok : T.tx }}>
                {cycleState.isFertil ? "AGORA" : `em ${Math.max(0, 10 - cycleState.dc)}d`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── MEDICAMENTOS ── */}
      <div style={{ background:T.surf, borderRadius:20, border:`1px solid ${T.bd}`, marginBottom:14 }}>
        <div style={{ padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${T.bd}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:22 }}>💊</span>
            <p style={{ margin:0, fontWeight:800, color:T.tx, fontSize:15 }}>Medicamentos</p>
          </div>
          <button onClick={() => { setNMed({ name:"", dose:"", time:"08:00" }); setSheet("addMed"); }}
            style={{ width:32, height:32, borderRadius:10, background:T.p, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <Plus size={16} color="#fff" />
          </button>
        </div>
        <div style={{ padding:"10px 14px 14px" }}>
          {meds.length === 0 ? (
            <p style={{ textAlign:"center", color:T.tm, fontSize:13, padding:"14px 0", margin:0 }}>Nenhum medicamento cadastrado</p>
          ) : meds.map(m => {
            const taken = m.log[day] || false;
            return (
              <div key={m.id} onClick={() => toggleMedLog(m.id)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 10px", borderRadius:14, background:taken ? T.ok + "12" : T.alt, border:`1.5px solid ${taken ? T.ok : T.bd}`, cursor:"pointer", marginBottom:8, transition:"all .2s" }}>
                <div style={{ width:28, height:28, borderRadius:8, border:`2px solid ${taken ? T.ok : T.bd}`, background:taken ? T.ok : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {taken && <Check size={15} color="#fff" />}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0, fontSize:14, fontWeight:700, color:taken ? T.tm : T.tx, textDecoration:taken ? "line-through" : "none" }}>{m.name}</p>
                  <p style={{ margin:0, fontSize:11, color:T.tm }}>{m.dose && `${m.dose} · `}{m.time}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setDelMedId(m.id); setSheet("delMed"); }}
                  style={{ width:28, height:28, borderRadius:8, background:T.er + "15", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <Trash2 size={13} color={T.er} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ANOTAÇÃO DO DIA ── */}
      <div style={{ background:T.surf, borderRadius:20, border:`1px solid ${T.bd}`, padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <span style={{ fontSize:20 }}>📝</span>
          <p style={{ margin:0, fontWeight:800, color:T.tx, fontSize:14 }}>Como está hoje?</p>
        </div>
        <textarea
          value={profile?.notes?.[day] || ""}
          onChange={e => upProfile(profile.id, p => ({ ...p, notes: { ...p.notes, [day]: e.target.value } }))}
          placeholder="Sintomas, humor, observações de saúde..."
          style={{ width:"100%", padding:"12px 14px", borderRadius:14, border:`1.5px solid ${T.bd}`, background:T.alt, color:T.tx, fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box", minHeight:72, resize:"none", lineHeight:1.5 }}
        />
      </div>

      {/* ════════════════ SHEETS ════════════════ */}

      {/* Adicionar perfil */}
      {sheet === "addProfile" && (
        <Sheet T={T} title="Novo Perfil" onClose={() => setSheet(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <FInput T={T} value={nProfile.name} onChange={v => setNProfile(x => ({ ...x, name:v }))} placeholder="Nome (ex: Marido, Luísa, Rex...)" />
            <div>
              <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:T.tx }}>Tipo:</p>
              <div style={{ display:"flex", gap:8 }}>
                {TYPES.map(t => (
                  <button key={t.v} onClick={() => setNProfile(x => ({ ...x, type:t.v, av:t.ic }))}
                    style={{ flex:1, padding:"10px 4px", borderRadius:12, border:`2px solid ${nProfile.type===t.v ? T.p : T.bd}`, background:nProfile.type===t.v ? T.p+"15" : "transparent", cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:22 }}>{t.ic}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:nProfile.type===t.v ? T.p : T.tm }}>{t.lb}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:T.tx }}>Avatar:</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {avPool.map(a => (
                  <button key={a} onClick={() => setNProfile(x => ({ ...x, av:a }))}
                    style={{ width:46, height:46, borderRadius:12, border:`2px solid ${nProfile.av===a ? T.p : T.bd}`, background:nProfile.av===a ? T.p+"15" : "transparent", fontSize:24, cursor:"pointer" }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:T.tx }}>Cor:</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {PROFILE_COLORS.map(c => (
                  <button key={c} onClick={() => setNProfile(x => ({ ...x, color:c }))}
                    style={{ width:34, height:34, borderRadius:99, background:c, border:`3px solid ${nProfile.color===c ? "#fff" : "transparent"}`, outline:`2px solid ${nProfile.color===c ? c : "transparent"}`, cursor:"pointer" }} />
                ))}
              </div>
            </div>
            {nProfile.type !== "pet" && (
              <FInput T={T} value={String(nProfile.water_goal)} onChange={v => setNProfile(x => ({ ...x, water_goal:v }))} placeholder="Meta de água (ml)" type="number" />
            )}
            <Btn T={T} onClick={doAddProfile}>Adicionar Perfil</Btn>
          </div>
        </Sheet>
      )}

      {/* Editar perfil */}
      {sheet === "editProfile" && (
        <Sheet T={T} title={`Editar — ${profile.name}`} onClose={() => setSheet(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <FInput T={T} value={editPInfo.name} onChange={v => setEditPInfo(x => ({ ...x, name:v }))} placeholder={profile.name} />
            <div>
              <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:T.tx }}>Avatar:</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[...AVS_ADULT_F,...AVS_ADULT_M,...AVS_CHILD,...AVS_PET].map(a => (
                  <button key={a} onClick={() => setEditPInfo(x => ({ ...x, av:a }))}
                    style={{ width:44, height:44, borderRadius:11, border:`2px solid ${editPInfo.av===a ? T.p : T.bd}`, background:editPInfo.av===a ? T.p+"15" : "transparent", fontSize:22, cursor:"pointer" }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:700, color:T.tx }}>Cor:</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {PROFILE_COLORS.map(c => (
                  <button key={c} onClick={() => setEditPInfo(x => ({ ...x, color:c }))}
                    style={{ width:34, height:34, borderRadius:99, background:c, border:`3px solid ${editPInfo.color===c ? "#fff" : "transparent"}`, outline:`2px solid ${editPInfo.color===c ? c : "transparent"}`, cursor:"pointer" }} />
                ))}
              </div>
            </div>
            <Btn T={T} onClick={doEditProfile}>Salvar</Btn>
            {profiles.length > 1 && (
              <Btn T={T} variant="danger" onClick={doRemoveProfile} style={{ background:T.er+"18", color:T.er, border:`1px solid ${T.er}33` }}>
                Remover perfil
              </Btn>
            )}
          </div>
        </Sheet>
      )}

      {/* Editar meta água */}
      {sheet === "editWGoal" && (
        <Sheet T={T} title="Meta de água" onClose={() => setSheet(null)}>
          <FInput T={T} value={editWGoal} onChange={setEditWGoal} placeholder="Meta em ml (ex: 2000)" type="number" style={{ marginBottom:16 }} />
          <Btn T={T} onClick={doSaveWGoal}>Salvar</Btn>
        </Sheet>
      )}

      {/* Ml personalizado */}
      {sheet === "customMl" && (
        <Sheet T={T} title="Adicionar água" onClose={() => setSheet(null)}>
          <FInput T={T} value={mlInput} onChange={setMlInput} placeholder="Quantidade em ml" type="number" style={{ marginBottom:16 }} />
          <Btn T={T} onClick={() => { const v = parseInt(mlInput); if (v > 0) { addWater(v); setSheet(null); } }}>Adicionar</Btn>
        </Sheet>
      )}

      {/* Editar ciclo */}
      {sheet === "editCycle" && (
        <Sheet T={T} title="Configurar Ciclo" onClose={() => setSheet(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><p style={{ margin:"0 0 6px", fontSize:13, fontWeight:700, color:T.tx }}>Início da última menstruação:</p>
              <FInput T={T} value={editCycle.start} onChange={v => setEditCycle(x => ({ ...x, start:v }))} type="date" /></div>
            <div><p style={{ margin:"0 0 6px", fontSize:13, fontWeight:700, color:T.tx }}>Duração do ciclo (dias):</p>
              <FInput T={T} value={editCycle.len} onChange={v => setEditCycle(x => ({ ...x, len:v }))} type="number" /></div>
            <div><p style={{ margin:"0 0 6px", fontSize:13, fontWeight:700, color:T.tx }}>Duração da menstruação (dias):</p>
              <FInput T={T} value={editCycle.menses} onChange={v => setEditCycle(x => ({ ...x, menses:v }))} type="number" /></div>
            <Btn T={T} onClick={doSaveCycle}>Salvar</Btn>
          </div>
        </Sheet>
      )}

      {/* Adicionar medicamento */}
      {sheet === "addMed" && (
        <Sheet T={T} title="Novo Medicamento" onClose={() => setSheet(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <FInput T={T} value={nMed.name} onChange={v => setNMed(x => ({ ...x, name:v }))} placeholder="Nome (ex: Vitamina D)" />
            <FInput T={T} value={nMed.dose} onChange={v => setNMed(x => ({ ...x, dose:v }))} placeholder="Dose (ex: 1 cápsula)" />
            <div><p style={{ margin:"0 0 6px", fontSize:13, fontWeight:700, color:T.tx }}>Horário:</p>
              <FInput T={T} value={nMed.time} onChange={v => setNMed(x => ({ ...x, time:v }))} type="time" /></div>
            <Btn T={T} onClick={doAddMed}>Adicionar</Btn>
          </div>
        </Sheet>
      )}

      {/* Confirmar delete medicamento */}
      {sheet === "delMed" && (
        <Sheet T={T} title="Remover medicamento?" onClose={() => setSheet(null)}>
          <p style={{ color:T.tm, fontSize:14, marginBottom:20 }}>
            Remover <strong style={{ color:T.tx }}>{meds.find(m => m.id === delMedId)?.name}</strong>?
          </p>
          <div style={{ display:"flex", gap:10 }}>
            <Btn T={T} variant="ghost" onClick={() => setSheet(null)}>Cancelar</Btn>
            <Btn T={T} variant="danger" onClick={doRemoveMed}>Remover</Btn>
          </div>
        </Sheet>
      )}

    </div>
  );
}

// ─── ESPIRITUAL ───────────────────────────────────────────────────────────────
function EspiritualScreen({ data, T, setData }) {
  const day = today();
  const [sheet, setSheet] = useState(null);
  const [grat, setGrat]   = useState("");
  const [read, setRead]   = useState({book:"",chapter:""});
  const [pray, setPray]   = useState({person:"",request:""});

  const bloomPct = calcBloom(data, day);
  const gratToday = data.spirit.gratitude[day]||[];

  const addGrat = () => {
    if (!grat.trim()) return;
    setData(d=>({...d,spirit:{...d.spirit,gratitude:{...d.spirit.gratitude,[day]:[...(d.spirit.gratitude[day]||[]),grat]}}}));
    setGrat(""); setSheet(null);
  };
  const addRead = () => {
    if (!read.book.trim()) return;
    setData(d=>({...d,spirit:{...d.spirit,readings:[{id:Date.now(),...read,date:day},...d.spirit.readings]}}));
    setRead({book:"",chapter:""}); setSheet(null);
  };
  const addPray = () => {
    if (!pray.person.trim()) return;
    setData(d=>({...d,spirit:{...d.spirit,prayers:[{id:Date.now(),...pray,answered:false},...d.spirit.prayers]}}));
    setPray({person:"",request:""}); setSheet(null);
  };
  const togglePray = id => setData(d=>({...d,spirit:{...d.spirit,prayers:d.spirit.prayers.map(p=>p.id===id?{...p,answered:!p.answered}:p)}}));
  const removeGrat = i => setData(d=>({...d,spirit:{...d.spirit,gratitude:{...d.spirit.gratitude,[day]:d.spirit.gratitude[day].filter((_,idx)=>idx!==i)}}}));

  return (
    <div style={{ padding:"24px 20px 20px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 style={{ margin:0,color:T.tx,fontSize:22,fontWeight:900 }}>Conexão & Paz</h2><p style={{ margin:"2px 0 0",color:T.tm,fontSize:13 }}>Momentos de luz no seu dia</p></div>
        <div style={{ textAlign:"center" }}>
          <p style={{ margin:0,fontSize:11,color:T.tm,fontWeight:700 }}>BLOOM</p>
          <p style={{ margin:0,fontSize:20,fontWeight:900,color:T.p }}>{bloomPct}%</p>
        </div>
      </div>

      {/* Gratidão */}
      <Card T={T} style={{ marginBottom:16,background:T.gh,border:"none",color:"#fff",padding:"22px 20px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}><Star size={22} fill="#fff"/><p style={{ margin:0,fontWeight:900,fontSize:18 }}>Mural de Gratidão</p></div>
          <button onClick={()=>setSheet("grat")} style={{ width:34,height:34,borderRadius:11,background:"rgba(255,255,255,.25)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><Plus size={18} color="#fff"/></button>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {gratToday.length===0?<p style={{ margin:0,fontSize:14,opacity:.9,fontStyle:"italic" }}>Pelo que você é grata hoje? ✨</p>:gratToday.map((g,i)=>(
            <div key={i} style={{ background:"rgba(255,255,255,.18)",padding:"12px 16px",borderRadius:14,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <p style={{ margin:0,fontSize:14,fontWeight:600 }}>{i+1}. {g}</p>
              <button onClick={()=>removeGrat(i)} style={{ background:"none",border:"none",opacity:.7,cursor:"pointer" }}><X size={14} color="#fff"/></button>
            </div>
          ))}
        </div>
      </Card>

      {/* Leitura e Oração */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16 }}>
        <Card T={T} onClick={()=>setSheet("read")}>
          <div style={{ width:38,height:38,borderRadius:13,background:T.alt,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10 }}><BookOpen size={20} color={T.p}/></div>
          <p style={{ margin:0,fontSize:11,color:T.tm,fontWeight:700 }}>LEITURA</p>
          <p style={{ margin:"3px 0 0",fontSize:14,fontWeight:800,color:T.tx }}>{data.spirit.readings[0]?`${data.spirit.readings[0].book} ${data.spirit.readings[0].chapter}`:"Registrar"}</p>
        </Card>
        <Card T={T} onClick={()=>setSheet("pray")}>
          <div style={{ width:38,height:38,borderRadius:13,background:T.alt,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10 }}><Heart size={20} color={T.p}/></div>
          <p style={{ margin:0,fontSize:11,color:T.tm,fontWeight:700 }}>ORAÇÕES</p>
          <p style={{ margin:"3px 0 0",fontSize:14,fontWeight:800,color:T.tx }}>{data.spirit.prayers.filter(p=>!p.answered).length} pendentes</p>
        </Card>
      </div>

      {/* Lista de orações */}
      {data.spirit.prayers.length>0 && (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <p style={{ margin:"0 0 4px",fontSize:13,fontWeight:700,color:T.tm }}>INTERCESSÕES</p>
          {data.spirit.prayers.map(p=>(
            <div key={p.id} onClick={()=>togglePray(p.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:16,background:T.surf,border:`1.5px solid ${p.answered?T.ok:T.bd}`,cursor:"pointer" }}>
              <div style={{ width:24,height:24,borderRadius:99,border:`2px solid ${p.answered?T.ok:T.bd}`,background:p.answered?T.ok:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{p.answered&&<Check size={13} color="#fff"/>}</div>
              <div style={{ flex:1 }}>
                <p style={{ margin:0,fontSize:14,fontWeight:700,color:p.answered?T.tm:T.tx,textDecoration:p.answered?"line-through":"none" }}>{p.person}</p>
                {p.request&&<p style={{ margin:0,fontSize:11,color:T.tm }}>{p.request}</p>}
              </div>
              {p.answered&&<span style={{ fontSize:18 }}>🙏</span>}
            </div>
          ))}
        </div>
      )}

      {sheet==="grat"&&<Sheet T={T} title="Eu sou grata por..." onClose={()=>setSheet(null)}><FInput T={T} value={grat} onChange={setGrat} placeholder="Escreva sua gratidão..." style={{ marginBottom:16 }}/><Btn T={T} onClick={addGrat}>Registrar</Btn></Sheet>}
      {sheet==="read"&&<Sheet T={T} title="O que leu hoje?" onClose={()=>setSheet(null)}><FInput T={T} value={read.book} onChange={v=>setRead(x=>({...x,book:v}))} placeholder="Livro (ex: Provérbios)" style={{ marginBottom:12 }}/><FInput T={T} value={read.chapter} onChange={v=>setRead(x=>({...x,chapter:v}))} placeholder="Capítulo" style={{ marginBottom:16 }}/><Btn T={T} onClick={addRead}>Salvar</Btn></Sheet>}
      {sheet==="pray"&&<Sheet T={T} title="Pedido de Oração" onClose={()=>setSheet(null)}><FInput T={T} value={pray.person} onChange={v=>setPray(x=>({...x,person:v}))} placeholder="Por quem ou pelo quê?" style={{ marginBottom:12 }}/><FInput T={T} value={pray.request} onChange={v=>setPray(x=>({...x,request:v}))} placeholder="Motivo (opcional)" style={{ marginBottom:16 }}/><Btn T={T} onClick={addPray}>Adicionar</Btn></Sheet>}
    </div>
  );
}

// ─── ORGANIZA ─────────────────────────────────────────────────────────────────
function OrganizaScreen({ data, T, setData, setTab }) {
  const day = today();
  const [sub, setSub] = useState("compras");
  const [sheet, setSheet] = useState(null);
  const [ni, setNi] = useState({name:"",cat:"Alimentação"});
  const [nn, setNn] = useState({title:"",content:"",color:"#FFF9C4"});
  const [nr, setNr] = useState({title:"",time:"09:00",date:day,cat:"Geral",priority:"Importante"});

  const pendComp = data.shopping.items.filter(i=>!i.done).length;
  const pendRem  = data.reminders.list.filter(r=>!r.done&&r.date===day).length;

  const addItem = () => {
    if (!ni.name.trim()) return;
    setData(d=>({...d,shopping:{...d.shopping,items:[...d.shopping.items,{id:Date.now(),...ni,done:false}]}}));
    setNi({name:"",cat:"Alimentação"}); setSheet(null);
  };
  const toggleItem  = id => setData(d=>({...d,shopping:{...d.shopping,items:d.shopping.items.map(i=>i.id===id?{...i,done:!i.done}:i)}}));
  const removeItem  = id => setData(d=>({...d,shopping:{...d.shopping,items:d.shopping.items.filter(i=>i.id!==id)}}));

  const addNote = () => {
    if (!nn.title.trim()&&!nn.content.trim()) return;
    setData(d=>({...d,notes:{...d.notes,list:[...d.notes.list,{id:Date.now(),...nn,date:day}]}}));
    setNn({title:"",content:"",color:"#FFF9C4"}); setSheet(null);
  };
  const removeNote = id => setData(d=>({...d,notes:{...d.notes,list:d.notes.list.filter(n=>n.id!==id)}}));

  const addRem = () => {
    if (!nr.title.trim()) return;
    setData(d=>({...d,reminders:{...d.reminders,list:[...d.reminders.list,{id:Date.now(),...nr,done:false}]}}));
    setNr({title:"",time:"09:00",date:day,cat:"Geral",priority:"Importante"}); setSheet(null);
  };
  const toggleRem = id => setData(d=>({...d,reminders:{...d.reminders,list:d.reminders.list.map(r=>r.id===id?{...r,done:!r.done}:r)}}));
  const removeRem = id => setData(d=>({...d,reminders:{...d.reminders,list:d.reminders.list.filter(r=>r.id!==id)}}));

  const SHOP_CATS  = ["Alimentação","Higiene","Casa","Laticínios","Padaria","Frutas","Outros"];
  const NOTE_COLS  = ["#FFF9C4","#E1F5FE","#F8BBD0","#C8E6C9","#E1BEE7","#FFE0B2"];
  const REM_CATS   = ["Geral","Saúde","Finanças","Família","Casa"];
  const REM_PRIOS  = ["Suave","Importante","Urgente"];

  const addLabel = sub==="compras"?"addItem":sub==="notas"?"addNote":"addRem";

  return (
    <div style={{ padding:"24px 20px 20px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 style={{ margin:0,color:T.tx,fontSize:22,fontWeight:900 }}>Organização</h2>
        <button onClick={()=>setSheet(addLabel)} style={{ width:44,height:44,borderRadius:14,background:T.p,border:"none",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 6px 12px ${T.p}44` }}><Plus size={22}/></button>
      </div>

      <div style={{ display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:4 }}>
        <Chip T={T} active={sub==="compras"} onClick={()=>setSub("compras")}>Compras {pendComp>0&&`(${pendComp})`}</Chip>
        <Chip T={T} active={sub==="notas"}   onClick={()=>setSub("notas")}>Notas</Chip>
        <Chip T={T} active={sub==="lembretes"} onClick={()=>setSub("lembretes")}>Lembretes {pendRem>0&&`(${pendRem})`}</Chip>
      </div>

      {sub==="compras" && (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {data.shopping.items.length===0&&<div style={{ textAlign:"center",padding:"28px 0",color:T.tm }}><ShoppingCart size={32} color={T.tm} style={{ marginBottom: 12, opacity: 0.5 }}/><p style={{ margin:0 }}>Lista vazia</p></div>}
          {data.shopping.items.map(i=>(
            <div key={i.id} onClick={()=>toggleItem(i.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:14,background:i.done?T.ok+"12":T.surf,border:`1.5px solid ${i.done?T.ok:T.bd}`,cursor:"pointer" }}>
              <div style={{ width:26,height:26,borderRadius:8,background:i.done?T.ok:T.bd,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{i.done&&<Check size={15} color="#fff"/>}</div>
              <div style={{ flex:1 }}><p style={{ margin:0,fontSize:14,fontWeight:600,color:i.done?T.tm:T.tx,textDecoration:i.done?"line-through":"none" }}>{i.name}</p><p style={{ margin:0,fontSize:11,color:T.tm }}>{i.cat}</p></div>
              <button onClick={e=>{e.stopPropagation();removeItem(i.id)}} style={{ width:28,height:28,borderRadius:8,background:T.er+"15",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><Trash2 size={13} color={T.er}/></button>
            </div>
          ))}
        </div>
      )}

      {sub==="notas" && (
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
          {data.notes.list.length===0&&<div style={{ gridColumn:"span 2",textAlign:"center",padding:"28px 0",color:T.tm }}><FileText size={32} color={T.tm} style={{ marginBottom: 12, opacity: 0.5 }}/><p style={{ margin:0 }}>Nenhuma nota</p></div>}
          {data.notes.list.map(n=>(
            <div key={n.id} style={{ background:n.color,borderRadius:16,padding:16,position:"relative",minHeight:100 }}>
              <button onClick={()=>removeNote(n.id)} style={{ position:"absolute",top:8,right:8,width:22,height:22,borderRadius:6,background:"rgba(0,0,0,.1)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><X size={11} color="#333"/></button>
              <p style={{ margin:"0 0 6px",fontWeight:800,fontSize:14,color:"#333",paddingRight:20 }}>{n.title}</p>
              <p style={{ margin:0,fontSize:12,color:"#555",lineHeight:1.4 }}>{n.content}</p>
              <p style={{ margin:"10px 0 0",fontSize:10,color:"#888" }}>{n.date}</p>
            </div>
          ))}
        </div>
      )}

      {sub==="lembretes" && (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {data.reminders.list.length===0&&<div style={{ textAlign:"center",padding:"28px 0",color:T.tm }}><Bell size={32} color={T.tm} style={{ marginBottom: 12, opacity: 0.5 }}/><p style={{ margin:0 }}>Nenhum lembrete</p></div>}
          {data.reminders.list.map(r=>{
            const urg = r.priority==="Urgente";
            return (
              <div key={r.id} onClick={()=>toggleRem(r.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:14,background:r.done?T.ok+"12":urg?T.er+"10":T.surf,border:`1.5px solid ${r.done?T.ok:urg?T.er:T.bd}`,cursor:"pointer" }}>
                <div style={{ width:26,height:26,borderRadius:8,background:r.done?T.ok:urg?T.er:T.bd,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{r.done&&<Check size={15} color="#fff"/>}</div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:0,fontSize:14,fontWeight:600,color:r.done?T.tm:T.tx,textDecoration:r.done?"line-through":"none" }}>{r.title}</p>
                  <p style={{ margin:0,fontSize:11,color:urg?T.er:T.tm }}>{r.time} · {r.cat} · {r.priority}</p>
                </div>
                <button onClick={e=>{e.stopPropagation();removeRem(r.id)}} style={{ width:28,height:28,borderRadius:8,background:T.er+"15",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><Trash2 size={13} color={T.er}/></button>
              </div>
            );
          })}
        </div>
      )}

      {/* Sheets */}
      {sheet==="addItem"&&<Sheet T={T} title="Novo Item" onClose={()=>setSheet(null)}>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <FInput T={T} value={ni.name} onChange={v=>setNi(x=>({...x,name:v}))} placeholder="Nome do item"/>
          <FSelect T={T} value={ni.cat} onChange={v=>setNi(x=>({...x,cat:v}))} options={SHOP_CATS}/>
          <Btn T={T} onClick={addItem}>Adicionar</Btn>
        </div>
      </Sheet>}

      {sheet==="addNote"&&<Sheet T={T} title="Nova Nota" onClose={()=>setSheet(null)}>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <FInput T={T} value={nn.title} onChange={v=>setNn(x=>({...x,title:v}))} placeholder="Título"/>
          <textarea value={nn.content} onChange={e=>setNn(x=>({...x,content:e.target.value}))} placeholder="Conteúdo..." style={{ width:"100%",padding:"14px 16px",borderRadius:14,border:`1.5px solid ${T.bd}`,background:T.alt,color:T.tx,fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box",minHeight:80,resize:"none" }}/>
          <div style={{ display:"flex",gap:8 }}>{NOTE_COLS.map(c=><button key={c} onClick={()=>setNn(x=>({...x,color:c}))} style={{ width:36,height:36,borderRadius:99,background:c,border:nn.color===c?`3px solid ${T.p}`:"none",cursor:"pointer" }}/>)}</div>
          <Btn T={T} onClick={addNote}>Adicionar</Btn>
        </div>
      </Sheet>}

      {sheet==="addRem"&&<Sheet T={T} title="Novo Lembrete" onClose={()=>setSheet(null)}>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <FInput T={T} value={nr.title} onChange={v=>setNr(x=>({...x,title:v}))} placeholder="Descrição"/>
          <div style={{ display:"flex",gap:10 }}>
            <FInput T={T} value={nr.date} onChange={v=>setNr(x=>({...x,date:v}))} type="date" style={{ flex:1 }}/>
            <FInput T={T} value={nr.time} onChange={v=>setNr(x=>({...x,time:v}))} type="time" style={{ flex:1 }}/>
          </div>
          <FSelect T={T} value={nr.cat}      onChange={v=>setNr(x=>({...x,cat:v}))}      options={REM_CATS}/>
          <FSelect T={T} value={nr.priority} onChange={v=>setNr(x=>({...x,priority:v}))} options={REM_PRIOS}/>
          <Btn T={T} onClick={addRem}>Adicionar</Btn>
        </div>
      </Sheet>}
    </div>
  );
}

// ─── FINANÇAS v2 ──────────────────────────────────────────────────────────────
function FinancasScreen({ data, T, setData }) {

  // ── estado inicial de novo lançamento (aceita cardId pré-preenchido) ──────
  const DEF_NF = (cardId = null) => ({
    desc:"", val:"", cat:"🛒 Alimentação",
    paid:false, due:today(), date:today(),
    cardId,
    parcelada:false, totalParcelas:2, totalVal:""
  });

  const [sub,            setSub]           = useState("lancamentos");
  const [sheet,          setSheet]         = useState(null);
  const [nf,             setNf]            = useState(DEF_NF());
  const [nc,             setNc]            = useState({name:"",brand:"Mastercard",color:"#8A05BE",closeDay:5,dueDay:15});
  const [delId,          setDelId]         = useState(null);
  const [delKid,         setDelKid]        = useState(null);
  const [selectedCard,   setSelectedCard]  = useState(null);
  const [showProjecao,   setShowProjecao]  = useState(false);
  const [showBudgetEdit, setShowBudgetEdit]= useState(false);
  const [budgetInput,    setBudgetInput]   = useState("");
  const [cardAddMode,    setCardAddMode]   = useState(false); // form inline no detalhe do cartão

  const trans  = data.finance.transactions || [];
  const cards  = data.finance.cards        || [];
  const budget = data.finance.budget       || {};

  const curMonth  = today().slice(0, 7);
  const budgetMes = budget[curMonth] || 0;

  // ── cálculos do mês — Number() garante que valores salvos como string somem ─
  const monthTrans = trans.filter(t => (t.date||"").slice(0,7) === curMonth);
  const entradas   = monthTrans.filter(t => t.type==="income" ).reduce((s,t) => s + Number(t.val), 0);
  const saidasTot  = monthTrans.filter(t => t.type==="expense").reduce((s,t) => s + Number(t.val), 0);
  const pending    = monthTrans.filter(t => t.type==="expense" && !t.paid).reduce((s,t) => s + Number(t.val), 0);
  const bal        = entradas - saidasTot;

  // ── feedback de orçamento ─────────────────────────────────────────────────
  const budgetBalance = budgetMes > 0 ? budgetMes - saidasTot : null;
  const getBudgetFeedback = () => {
    if (!budgetMes) return null;
    const ratio = budgetBalance / budgetMes;
    if (ratio >= 0.20) return { msg:"Muito bom! Pense em poupar/investir! 🚀",        color:T.ok, border:T.ok+"44" };
    if (ratio >= 0)    return { msg:"Incrível, vai estar tudo pago! ✅",              color:T.ok, border:T.ok+"33" };
    if (ratio >= -0.20)return { msg:"Precisa de atenção, mas você vai conseguir! 💪", color:T.wn, border:T.wn+"44" };
    return                    { msg:"Atenção! Gastos acima do disponível. Revise! 🔴", color:T.er, border:T.er+"44" };
  };
  const bf = getBudgetFeedback();

  // ── parcelas ──────────────────────────────────────────────────────────────
  const allParcelas = trans
    .filter(t => t.installment)
    .sort((a,b) => (a.date||"") > (b.date||"") ? 1 : -1);

  // ── fatura do cartão num mês ──────────────────────────────────────────────
  const cardBill = (cid, month) =>
    trans.filter(t => t.cardId === cid && (t.date||"").slice(0,7) === month)
         .reduce((s,t) => s + Number(t.val), 0);

  // ── mapa de meses para o carrossel de projeção ────────────────────────────
  const monthMap = {};
  trans.forEach(t => {
    const m = (t.date||"").slice(0,7);
    if (!m) return;
    if (!monthMap[m]) monthMap[m] = { ent:0, sai:0 };
    if (t.type==="income") monthMap[m].ent += Number(t.val);
    else                   monthMap[m].sai += Number(t.val);
  });
  // adiciona 3 meses futuros mesmo sem transações
  for (let i = 1; i <= 3; i++) {
    const d = new Date(); d.setMonth(d.getMonth() + i);
    const m = d.toISOString().slice(0,7);
    if (!monthMap[m]) monthMap[m] = { ent:0, sai:0 };
  }
  const sortedMonths = Object.keys(monthMap).sort();

  const fmtMonth = m => {
    const [y, mo] = m.split("-");
    const nm = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    return `${nm[parseInt(mo)-1]}/${y.slice(2)}`;
  };

  // ── cartão selecionado ────────────────────────────────────────────────────
  const sCard      = cards.find(c => c.id === selectedCard);
  const sCardTrans = sCard
    ? trans.filter(t => t.cardId === sCard.id).sort((a,b) => (a.date||"") > (b.date||"") ? -1 : 1)
    : [];
  const sCardCur = sCard ? cardBill(sCard.id, curMonth) : 0;

  // ── ACTIONS ───────────────────────────────────────────────────────────────
  const saveBudget = () => {
    const v = parseFloat(budgetInput.replace(",","."));
    if (!v || v <= 0) return;
    setData(d => ({ ...d, finance:{ ...d.finance, budget:{ ...(d.finance.budget||{}), [curMonth]:v } } }));
    setShowBudgetEdit(false); setBudgetInput("");
  };

  const saveEntrada = () => {
    if (!nf.desc.trim() || !nf.val) return;
    setData(d => ({ ...d, finance:{ ...d.finance, transactions:[{
      id:Date.now(), desc:nf.desc, val:parseFloat(String(nf.val).replace(",",".")),
      type:"income", cat:nf.cat, date:nf.date, paid:true, cardId:null, installment:null
    }, ...d.finance.transactions] } }));
    setNf(DEF_NF()); setSheet(null);
  };

  const saveSaida = (isCardDirect = false) => {
    if (!nf.desc.trim()) return;
    if (nf.parcelada) {
      const total  = parseInt(nf.totalParcelas) || 2;
      const tv     = parseFloat(String(nf.totalVal||nf.val).replace(",","."));
      if (!tv) return;
      const parcVal = Math.round((tv / total) * 100) / 100;
      const gid     = `grp_${Date.now()}`;
      const items   = Array.from({ length:total }, (_, i) => {
        const d = new Date(nf.date); d.setMonth(d.getMonth() + i);
        const ds = d.toISOString().slice(0,10);
        return {
          id: Date.now() + i, desc:nf.desc, val:parcVal, type:"expense",
          cat:nf.cat, date:ds, due:ds,
          paid: i === 0 ? nf.paid : false,
          cardId: nf.cardId || null,
          installment: { total, current:i+1, groupId:gid }
        };
      });
      setData(d => ({ ...d, finance:{ ...d.finance, transactions:[...items, ...d.finance.transactions] } }));
    } else {
      const val = parseFloat(String(nf.val).replace(",","."));
      if (!val) return;
      setData(d => ({ ...d, finance:{ ...d.finance, transactions:[{
        id:Date.now(), desc:nf.desc, val, type:"expense",
        cat:nf.cat, date:nf.date, due:nf.due,
        paid:nf.paid, cardId:nf.cardId||null, installment:null
      }, ...d.finance.transactions] } }));
    }
    if (isCardDirect) { setNf(DEF_NF(sCard?.id||null)); setCardAddMode(false); }
    else { setNf(DEF_NF()); setSheet(null); }
  };

  const addCard = () => {
    if (!nc.name.trim()) return;
    setData(d => ({ ...d, finance:{ ...d.finance, cards:[...(d.finance.cards||[]), { id:Date.now(), ...nc }] } }));
    setNc({ name:"", brand:"Mastercard", color:"#8A05BE", closeDay:5, dueDay:15 }); setSheet(null);
  };

  const togglePaid = id =>
    setData(d => ({ ...d, finance:{ ...d.finance, transactions:d.finance.transactions.map(t => t.id===id ? { ...t, paid:!t.paid } : t) } }));

  const removeTrans = (id = delId) => {
    setData(d => ({ ...d, finance:{ ...d.finance, transactions:d.finance.transactions.filter(t => t.id !== id) } }));
    if (id === delId) { setDelId(null); setSheet(null); }
  };

  const removeCard = () => {
    setData(d => ({ ...d, finance:{ ...d.finance, cards:d.finance.cards.filter(c => c.id !== delKid) } }));
    setDelKid(null); setSheet(null);
  };

  // ── constantes ────────────────────────────────────────────────────────────
  const CATS_ENT = ["💼 Salário CLT","🏢 Pró-labore","💰 Freelance","📦 Venda","🏠 Aluguel recebido","💸 Transferência recebida","🎁 Presente/Doação","📈 Rendimento","➕ Outro"];
  const CATS_SAI = ["🛒 Alimentação","🏠 Moradia","⚡ Contas fixas","🚗 Transporte","💊 Saúde","📚 Educação","👗 Vestuário","🎭 Lazer","💳 Fatura cartão","📦 Parcelada","💸 Empréstimo","🏧 Débito/Dinheiro","📲 PIX","➕ Outro"];
  const BRANDS   = ["Mastercard","Visa","Elo","Amex"];
  const C_CORES  = ["#8A05BE","#FF7A00","#000000","#2196F3","#4CAF50","#E91E63","#607D8B"];

  const delTrans = trans.find(t => t.id === delId);
  const delCardO = cards.find(c => c.id === delKid);

  // ── helper: badge de parcela ──────────────────────────────────────────────
  const InstBadge = ({ t }) => t.installment
    ? <span style={{ fontSize:10, padding:"2px 7px", borderRadius:6, background:T.p+"20", color:T.p, fontWeight:700, marginLeft:4, flexShrink:0 }}>{t.installment.current}/{t.installment.total}x</span>
    : null;

  // ── helper: form de saída reutilizável (usado no sheet e no card detail) ──
  const SaidaForm = ({ isCardDirect = false }) => (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <FInput T={T} value={nf.desc} onChange={v=>setNf(x=>({...x,desc:v}))} placeholder="Descrição"/>

      {/* Toggle parcelada */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",background:T.alt,padding:"13px 16px",borderRadius:14 }}>
        <div>
          <p style={{ margin:0,fontSize:14,fontWeight:700,color:T.tx }}>Compra parcelada</p>
          <p style={{ margin:"2px 0 0",fontSize:11,color:T.tm }}>Cartão, boleto, crediário ou empréstimo</p>
        </div>
        <Toggle T={T} val={nf.parcelada} onChange={v=>setNf(x=>({...x,parcelada:v}))}/>
      </div>

      {nf.parcelada ? (
        <>
          <FInput T={T} value={nf.totalVal} onChange={v=>setNf(x=>({...x,totalVal:v}))} placeholder="Valor TOTAL (R$)" type="number"/>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            <div>
              <p style={{ margin:"0 0 6px",fontSize:12,color:T.tm,fontWeight:600 }}>Nº de parcelas</p>
              <FInput T={T} value={String(nf.totalParcelas)} onChange={v=>setNf(x=>({...x,totalParcelas:parseInt(v)||2}))} type="number"/>
            </div>
            <div>
              <p style={{ margin:"0 0 6px",fontSize:12,color:T.tm,fontWeight:600 }}>1ª parcela em</p>
              <FInput T={T} value={nf.date} onChange={v=>setNf(x=>({...x,date:v}))} type="date"/>
            </div>
          </div>
          {nf.totalVal && nf.totalParcelas >= 2 && (
            <div style={{ padding:"10px 14px",borderRadius:12,background:T.p+"14",border:`1px solid ${T.p}33` }}>
              <p style={{ margin:0,fontSize:13,color:T.p,fontWeight:800 }}>
                {nf.totalParcelas}x de R$ {fmtBRL(parseFloat(nf.totalVal||"0")/nf.totalParcelas)}
              </p>
              <p style={{ margin:"3px 0 0",fontSize:11,color:T.tm }}>Parcelas geradas automaticamente</p>
            </div>
          )}
        </>
      ) : (
        <>
          <FInput T={T} value={nf.val}  onChange={v=>setNf(x=>({...x,val:v}))}  placeholder="Valor (R$)" type="number"/>
          <FInput T={T} value={nf.date} onChange={v=>setNf(x=>({...x,date:v}))} type="date"/>
          <FInput T={T} value={nf.due}  onChange={v=>setNf(x=>({...x,due:v}))}  placeholder="Vencimento" type="date"/>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",background:T.alt,padding:"13px 16px",borderRadius:14 }}>
            <span style={{ fontSize:14,fontWeight:700,color:T.tx }}>Confirmar pagamento</span>
            <Toggle T={T} val={nf.paid} onChange={v=>setNf(x=>({...x,paid:v}))}/>
          </div>
        </>
      )}

      <p style={{ margin:"4px 0 0",fontSize:12,color:T.tm,fontWeight:700 }}>Categoria:</p>
      <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
        {CATS_SAI.map(c => <Chip key={c} T={T} active={nf.cat===c} onClick={()=>setNf(x=>({...x,cat:c}))}>{c}</Chip>)}
      </div>

      {/* Vincular ao cartão — aparece sempre que há cartões cadastrados */}
      {cards.length > 0 && !isCardDirect && (
        <>
          <p style={{ margin:"4px 0 0",fontSize:12,color:T.tm,fontWeight:700 }}>Vincular ao cartão (opcional):</p>
          <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
            <Chip T={T} active={!nf.cardId} onClick={()=>setNf(x=>({...x,cardId:null}))}>💵 Nenhum</Chip>
            {cards.map(c => (
              <Chip key={c.id} T={T} active={nf.cardId===c.id} onClick={()=>setNf(x=>({...x,cardId:c.id}))}>
                💳 {c.name}
              </Chip>
            ))}
          </div>
        </>
      )}

      <Btn T={T} onClick={()=>saveSaida(isCardDirect)}>Salvar Saída</Btn>
      {isCardDirect && (
        <Btn T={T} variant="ghost" onClick={()=>{ setCardAddMode(false); setNf(DEF_NF(sCard?.id||null)); }}>Cancelar</Btn>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding:"24px 20px 20px" }}>

      {/* ── Cabeçalho ── */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div>
          <h2 style={{ margin:0,color:T.tx,fontSize:22,fontWeight:900 }}>Finanças</h2>
          <p style={{ margin:"2px 0 0",color:T.tm,fontSize:13 }}>Prosperidade e equilíbrio</p>
        </div>
        <button
          onClick={()=>sub==="cartoes" ? setSheet("addCard") : setSheet("addSaida")}
          style={{ width:44,height:44,borderRadius:14,background:T.p,border:"none",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 6px 12px ${T.p}44` }}>
          <Plus size={22}/>
        </button>
      </div>

      {/* ── Card Saldo — clicável → carrossel de projeção ── */}
      <Card T={T} onClick={()=>setShowProjecao(true)}
        style={{ background:T.gh,border:"none",padding:"22px 22px 18px",marginBottom:12,color:"#fff",position:"relative",overflow:"hidden" }}>
        <p style={{ margin:0,fontSize:11,opacity:.85,fontWeight:700,letterSpacing:"0.5px" }}>SALDO · {fmtMonth(curMonth)}</p>
        <p style={{ margin:"4px 0 18px",fontSize:34,fontWeight:900,lineHeight:1 }}>
          R$ {fmtBRL(bal)}
        </p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1px 1fr" }}>
          <div>
            <p style={{ margin:0,fontSize:10,opacity:.7,fontWeight:700 }}>ENTRADAS</p>
            <p style={{ margin:"2px 0 0",fontSize:17,fontWeight:900,color:"#A8F5C0" }}>R$ {fmtBRL(entradas)}</p>
          </div>
          <div style={{ background:"rgba(255,255,255,.2)" }}/>
          <div style={{ paddingLeft:16 }}>
            <p style={{ margin:0,fontSize:10,opacity:.7,fontWeight:700 }}>SAÍDAS</p>
            <p style={{ margin:"2px 0 0",fontSize:17,fontWeight:900,color:"#FFAAAA" }}>R$ {fmtBRL(saidasTot)}</p>
          </div>
        </div>
        {pending > 0 && (
          <div style={{ marginTop:14,display:"inline-flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:10,background:"rgba(0,0,0,.18)" }}>
            <AlertCircle size={12} color="#FFEB3B"/>
            <span style={{ fontSize:12,fontWeight:700,color:"#FFEB3B" }}>R$ {fmtBRL(pending)} a confirmar</span>
          </div>
        )}
        <div style={{ position:"absolute",right:-15,top:-15,opacity:.07 }}><Wallet size={100} color="#fff"/></div>
        <p style={{ position:"absolute",bottom:14,right:18,margin:0,fontSize:10,opacity:.55,fontWeight:700 }}>ver histórico →</p>
      </Card>

      {/* ── Card Orçamento do mês ── */}
      <Card T={T} style={{ marginBottom:18,padding:"16px 18px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12 }}>
          <div style={{ flex:1 }}>
            <p style={{ margin:0,fontSize:11,fontWeight:700,color:T.tm,letterSpacing:"0.4px" }}>DISPONÍVEL ESTE MÊS</p>
            {budgetMes > 0 ? (
              <>
                <p style={{ margin:"3px 0 10px",fontSize:19,fontWeight:900,color:T.tx }}>R$ {fmtBRL(budgetMes)}</p>
                <ProgressBar color={bf?.color||T.p} val={saidasTot} max={budgetMes} h={6}/>
                {bf && (
                  <div style={{ marginTop:10,padding:"8px 12px",borderRadius:10,background:bf.color+"14",border:`1px solid ${bf.border}` }}>
                    <p style={{ margin:0,fontSize:12,fontWeight:700,color:bf.color }}>{bf.msg}</p>
                    {budgetBalance !== null && (
                      <p style={{ margin:"3px 0 0",fontSize:11,color:T.tm }}>
                        {budgetBalance >= 0
                          ? `Sobram R$ ${fmtBRL(budgetBalance)} após todas as saídas`
                          : `Faltam R$ ${fmtBRL(Math.abs(budgetBalance))} para cobrir as contas`}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p style={{ margin:"4px 0 0",fontSize:13,color:T.tm }}>Toque em ✏️ para informar quanto tem disponível</p>
            )}
          </div>
          <button onClick={()=>{ setBudgetInput(budgetMes ? String(budgetMes) : ""); setShowBudgetEdit(true); }}
            style={{ width:34,height:34,borderRadius:11,background:T.alt,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
            <Settings size={16} color={T.tx} />
          </button>
        </div>
      </Card>

      {/* ── Tabs ── */}
      <div style={{ display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:4 }}>
        <Chip T={T} active={sub==="lancamentos"} onClick={()=>setSub("lancamentos")}>Lançamentos</Chip>
        <Chip T={T} active={sub==="cartoes"}     onClick={()=>setSub("cartoes")}>Cartões</Chip>
        <Chip T={T} active={sub==="parcelas"}    onClick={()=>setSub("parcelas")}>
          Parcelas{allParcelas.filter(t=>!t.paid&&(t.date||"")>=today()).length>0
            && ` (${allParcelas.filter(t=>!t.paid&&(t.date||"")>=today()).length})`}
        </Chip>
      </div>

      {/* ──────────────── ABA LANÇAMENTOS ──────────────── */}
      {sub==="lancamentos" && (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:4 }}>
            <button onClick={()=>{ setNf(DEF_NF()); setSheet("addEntrada"); }}
              style={{ padding:"12px",borderRadius:14,border:`1.5px solid ${T.ok}`,background:T.ok+"14",color:T.ok,fontWeight:800,fontSize:13,cursor:"pointer" }}>
              Nova Entrada
            </button>
            <button onClick={()=>{ setNf(DEF_NF()); setSheet("addSaida"); }}
              style={{ padding:"12px",borderRadius:14,border:`1.5px solid ${T.er}`,background:T.er+"14",color:T.er,fontWeight:800,fontSize:13,cursor:"pointer" }}>
              Nova Saída
            </button>
          </div>

          {monthTrans.length===0 && (
            <div style={{ textAlign:"center",padding:"32px 0",color:T.tm }}>
              <DollarSign size={32} color={T.tm} style={{ marginBottom: 12, opacity: 0.5 }}/>
              <p style={{ margin:0,fontWeight:600 }}>Nenhum lançamento este mês</p>
            </div>
          )}

          {[...monthTrans].sort((a,b)=>(a.date||"")>(b.date||"")?-1:1).map(t => {
            const overdue = !t.paid && t.due && new Date(t.due) < new Date(today());
            const cardName = t.cardId ? cards.find(c=>c.id===t.cardId)?.name : null;
            return (
              <div key={t.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 15px",borderRadius:16,background:T.surf,border:`1.5px solid ${t.paid?T.ok:overdue?T.er:T.bd}` }}>
                <button onClick={()=>togglePaid(t.id)}
                  style={{ width:34,height:34,borderRadius:11,background:t.paid?T.ok:T.alt,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
                  {t.paid ? <Check size={18} color="#fff"/> : <Clock size={16} color={T.tm}/>}
                </button>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",flexWrap:"wrap" }}>
                    <p style={{ margin:0,fontWeight:700,color:T.tx,fontSize:14,textDecoration:t.paid?"line-through":"none",opacity:t.paid?.6:1,marginRight:4 }}>{t.desc}</p>
                    <InstBadge t={t}/>
                  </div>
                  <p style={{ margin:0,color:overdue?T.er:T.tm,fontSize:11,fontWeight:600,marginTop:2 }}>
                    {t.cat}
                    {cardName && ` · 💳 ${cardName}`}
                    {t.due && ` · vence ${t.due}`}
                  </p>
                </div>
                <div style={{ textAlign:"right",flexShrink:0 }}>
                  <p style={{ margin:0,fontWeight:900,fontSize:15,color:t.type==="income"?T.ok:T.er }}>
                    {t.type==="income"?"+":"-"}R$ {fmtBRL(t.val)}
                  </p>
                  <button onClick={()=>{ setDelId(t.id); setSheet("delTrans"); }}
                    style={{ background:"none",border:"none",color:T.er,fontSize:10,cursor:"pointer",fontWeight:700 }}>
                    REMOVER
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────── ABA CARTÕES ──────────────── */}
      {sub==="cartoes" && (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {cards.length===0 && (
            <div style={{ textAlign:"center",padding:"32px 0",color:T.tm }}>
              <CreditCard size={32} color={T.tm} style={{ marginBottom: 12, opacity: 0.5 }}/>
              <p style={{ margin:0,fontWeight:600 }}>Nenhum cartão cadastrado</p>
              <button onClick={()=>setSheet("addCard")} style={{ marginTop:12,padding:"10px 22px",borderRadius:12,background:T.p,border:"none",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13 }}>
                + Cadastrar Cartão
              </button>
            </div>
          )}
          {cards.map(c => {
            const bill    = cardBill(c.id, curMonth);
            const futuros = [1,2,3].map(i => {
              const d = new Date(); d.setMonth(d.getMonth()+i);
              const m = d.toISOString().slice(0,7);
              return { m, v:cardBill(c.id, m) };
            }).filter(x => x.v > 0);
            const closD = c.closeDay || 5;
            const dueD  = c.dueDay   || 10;
            return (
              <div key={c.id} onClick={()=>{ setSelectedCard(c.id); setCardAddMode(false); setNf(DEF_NF(c.id)); setSheet("cardDetail"); }}
                style={{ background:c.color,borderRadius:22,padding:"22px",color:"#fff",position:"relative",overflow:"hidden",boxShadow:"0 8px 24px rgba(0,0,0,.16)",cursor:"pointer" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22 }}>
                  <div>
                    <p style={{ margin:0,fontSize:11,opacity:.65,fontWeight:700,letterSpacing:"1px" }}>{c.brand?.toUpperCase()}</p>
                    <p style={{ margin:"4px 0 0",fontSize:21,fontWeight:900 }}>{c.name}</p>
                  </div>
                  <CreditCard size={26}/>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end" }}>
                  <div>
                    <p style={{ margin:0,fontSize:10,opacity:.7,fontWeight:700 }}>FATURA ATUAL</p>
                    <p style={{ margin:0,fontSize:20,fontWeight:900 }}>R$ {fmtBRL(bill)}</p>
                    <p style={{ margin:"3px 0 0",fontSize:11,opacity:.75 }}>Fecha dia {closD} · Vence dia {dueD}</p>
                  </div>
                  <button onClick={e=>{ e.stopPropagation(); setDelKid(c.id); setSheet("delCard"); }}
                    style={{ background:"rgba(255,255,255,.2)",border:"none",color:"#fff",width:32,height:32,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <X size={14}/>
                  </button>
                </div>
                {futuros.length > 0 && (
                  <div style={{ marginTop:14,display:"flex",gap:6,flexWrap:"wrap" }}>
                    {futuros.map(f => (
                      <div key={f.m} style={{ padding:"4px 10px",borderRadius:8,background:"rgba(0,0,0,.18)",fontSize:11,fontWeight:700 }}>
                        {fmtMonth(f.m)}: R$ {fmtBRL(f.v)}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ position:"absolute",right:-20,bottom:-20,width:100,height:100,borderRadius:99,background:"rgba(255,255,255,.08)" }}/>
                <p style={{ position:"absolute",top:22,right:56,margin:0,fontSize:10,opacity:.5,fontWeight:700 }}>ver detalhes</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ──────────────── ABA PARCELAS ──────────────── */}
      {sub==="parcelas" && (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {allParcelas.length===0 && (
            <div style={{ textAlign:"center",padding:"32px 0",color:T.tm }}>
              <PieChart size={32} color={T.tm} style={{ marginBottom: 12, opacity: 0.5 }}/>
              <p style={{ margin:0,fontWeight:600 }}>Nenhuma parcela registrada</p>
              <p style={{ margin:"6px 0 0",fontSize:12 }}>Adicione uma saída parcelada para ver o compromisso futuro</p>
            </div>
          )}
          {allParcelas.map(t => {
            const isCur  = (t.date||"").slice(0,7) === curMonth;
            const isFut  = (t.date||"") > today() && !isCur;
            const isPast = (t.date||"") < today() && !isCur;
            const badge  = t.paid
              ? { lbl:"Pago",      c:T.ok }
              : isCur  ? { lbl:"Atual",  c:T.p  }
              : isFut  ? { lbl:"Futuro",    c:T.tm }
              :           { lbl:"Atrasado", c:T.er };
            const cardName = t.cardId ? cards.find(c=>c.id===t.cardId)?.name : null;
            return (
              <div key={t.id}
                style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:14,background:T.surf,
                  border:`1.5px solid ${t.paid?T.ok:isCur?T.p:isPast&&!t.paid?T.er:T.bd}`,
                  opacity:t.paid&&isPast?.65:1 }}>
                <div style={{ width:34,height:34,borderRadius:11,
                  background:t.paid?T.ok+"20":isCur?T.p+"20":T.alt,
                  border:`2px solid ${t.paid?T.ok:isCur?T.p:T.bd}`,
                  display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  {t.paid
                    ? <Check size={16} color={T.ok}/>
                    : <span style={{ fontSize:12,fontWeight:900,color:isCur?T.p:T.tm }}>{t.installment?.current}</span>}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ margin:0,fontWeight:700,color:T.tx,fontSize:14 }}>{t.desc}</p>
                  <p style={{ margin:"2px 0 0",color:T.tm,fontSize:11 }}>
                    {t.installment?.current}/{t.installment?.total}x · {t.date}
                    {cardName && ` · 💳 ${cardName}`}
                  </p>
                </div>
                <div style={{ textAlign:"right",flexShrink:0 }}>
                  <p style={{ margin:0,fontWeight:900,fontSize:14,color:T.er }}>R$ {fmtBRL(t.val)}</p>
                  <span style={{ fontSize:10,fontWeight:700,color:badge.c }}>{badge.lbl}</span>
                </div>
                {/* botão remover parcela */}
                <button onClick={()=>removeTrans(t.id)}
                  style={{ width:28,height:28,borderRadius:8,background:T.er+"18",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0 }}>
                  <Trash2 size={13} color={T.er}/>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════ SHEETS ════════════════ */}

      {/* Editar orçamento */}
      {showBudgetEdit && (
        <Sheet T={T} title="Orçamento Disponível" onClose={()=>setShowBudgetEdit(false)}>
          <p style={{ margin:"0 0 14px",fontSize:13,color:T.tm,lineHeight:1.5 }}>
            Informe quanto você tem disponível para pagar as contas este mês. O aplicativo calcula as projeções automaticamente.
          </p>
          <FInput T={T} value={budgetInput} onChange={setBudgetInput} placeholder="Ex: 3500.00" type="number"/>
          <div style={{ height:12 }}/>
          <Btn T={T} onClick={saveBudget}>Salvar</Btn>
        </Sheet>
      )}

      {/* ── Carrossel de Histórico & Projeção ── */}
      {showProjecao && (
        <Sheet T={T} title="Histórico Mensal" onClose={()=>setShowProjecao(false)}>
          <p style={{ margin:"-10px 0 14px",fontSize:12,color:T.tm }}>Deslize para navegar entre os meses</p>
          {sortedMonths.length === 0 && (
            <p style={{ color:T.tm,fontSize:13,textAlign:"center",padding:16 }}>Nenhum dado ainda.</p>
          )}
          {/* carrossel com scroll snap */}
          <div style={{
            display:"flex",
            gap:14,
            overflowX:"auto",
            scrollSnapType:"x mandatory",
            WebkitOverflowScrolling:"touch",
            paddingBottom:16,
            marginLeft:-20,
            marginRight:-20,
            paddingLeft:20,
            paddingRight:20,
          }}>
            {sortedMonths.map(m => {
              const g      = monthMap[m];
              const saldo  = g.ent - g.sai;
              const isCurr = m === curMonth;
              const isFut  = m > curMonth;
              const cardBg = isCurr ? T.gh : isFut ? T.alt : T.surf;
              const textC  = isCurr ? "#fff" : T.tx;
              const subC   = isCurr ? "rgba(255,255,255,.75)" : T.tm;
              return (
                <div key={m} style={{
                  minWidth:"78vw",
                  maxWidth:300,
                  scrollSnapAlign:"start",
                  flexShrink:0,
                  borderRadius:22,
                  padding:"20px 22px",
                  background:cardBg,
                  border:`1.5px solid ${isCurr?"transparent":T.bd}`,
                  boxShadow:isCurr?"0 8px 24px rgba(0,0,0,.12)":"none",
                  color:textC,
                  position:"relative",
                  overflow:"hidden",
                }}>
                  {/* badges */}
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                    <span style={{ fontSize:14,fontWeight:800,color:textC }}>{fmtMonth(m)}</span>
                    {isCurr && <span style={{ fontSize:10,padding:"2px 8px",borderRadius:6,background:"rgba(255,255,255,.25)",color:"#fff",fontWeight:700 }}>ATUAL</span>}
                    {isFut  && <span style={{ fontSize:10,padding:"2px 8px",borderRadius:6,background:T.wn+"25",color:T.wn,fontWeight:700 }}>PROJEÇÃO</span>}
                  </div>
                  {/* saldo grande */}
                  <p style={{ margin:"0 0 4px",fontSize:11,fontWeight:700,opacity:.7,color:textC }}>SALDO</p>
                  <p style={{ margin:"0 0 16px",fontSize:30,fontWeight:900,color:saldo>=0?(isCurr?"#A8F5C0":T.ok):(isCurr?"#FFAAAA":T.er),lineHeight:1 }}>
                    {saldo >= 0 ? "+" : ""}R$ {fmtBRL(saldo)}
                  </p>
                  {/* entradas e saídas */}
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1px 1fr",gap:0 }}>
                    <div>
                      <p style={{ margin:0,fontSize:10,fontWeight:700,color:subC }}>ENTRADAS</p>
                      <p style={{ margin:"3px 0 0",fontSize:15,fontWeight:900,color:isCurr?"#A8F5C0":T.ok }}>R$ {fmtBRL(g.ent)}</p>
                    </div>
                    <div style={{ background:isCurr?"rgba(255,255,255,.2)":T.bd }}/>
                    <div style={{ paddingLeft:14 }}>
                      <p style={{ margin:0,fontSize:10,fontWeight:700,color:subC }}>SAÍDAS</p>
                      <p style={{ margin:"3px 0 0",fontSize:15,fontWeight:900,color:isCurr?"#FFAAAA":T.er }}>R$ {fmtBRL(g.sai)}</p>
                    </div>
                  </div>
                  {/* ornamento */}
                  {isCurr && <div style={{ position:"absolute",right:-20,bottom:-20,width:90,height:90,borderRadius:99,background:"rgba(255,255,255,.08)" }}/>}
                </div>
              );
            })}
            {/* padding final do carrossel */}
            <div style={{ minWidth:6, flexShrink:0 }}/>
          </div>
          {/* indicador de pontos */}
          <div style={{ display:"flex",justifyContent:"center",gap:6,marginTop:4 }}>
            {sortedMonths.map(m => (
              <div key={m} style={{ width:m===curMonth?18:6,height:6,borderRadius:99,background:m===curMonth?T.p:T.bd,transition:"width .2s" }}/>
            ))}
          </div>
        </Sheet>
      )}

      {/* Nova Entrada */}
      {sheet==="addEntrada" && (
        <Sheet T={T} title="Nova Entrada" onClose={()=>setSheet(null)}>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <FInput T={T} value={nf.desc} onChange={v=>setNf(x=>({...x,desc:v}))} placeholder="Descrição"/>
            <FInput T={T} value={nf.val}  onChange={v=>setNf(x=>({...x,val:v}))}  placeholder="Valor (R$)" type="number"/>
            <FInput T={T} value={nf.date} onChange={v=>setNf(x=>({...x,date:v}))} type="date"/>
            <p style={{ margin:"4px 0 0",fontSize:12,color:T.tm,fontWeight:700 }}>Categoria:</p>
            <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
              {CATS_ENT.map(c => <Chip key={c} T={T} active={nf.cat===c} onClick={()=>setNf(x=>({...x,cat:c}))}>{c}</Chip>)}
            </div>
            <Btn T={T} onClick={saveEntrada}>Salvar Entrada</Btn>
          </div>
        </Sheet>
      )}

      {/* Nova Saída */}
      {sheet==="addSaida" && (
        <Sheet T={T} title="Nova Saída" onClose={()=>setSheet(null)}>
          <SaidaForm isCardDirect={false}/>
        </Sheet>
      )}

      {/* Novo Cartão */}
      {sheet==="addCard" && (
        <Sheet T={T} title="Novo Cartão" onClose={()=>setSheet(null)}>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <FInput T={T} value={nc.name} onChange={v=>setNc(x=>({...x,name:v}))} placeholder="Nome do cartão (ex: Nubank)"/>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {BRANDS.map(b => <Chip key={b} T={T} active={nc.brand===b} onClick={()=>setNc(x=>({...x,brand:b}))}>{b}</Chip>)}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
              <div>
                <p style={{ margin:"0 0 6px",fontSize:12,color:T.tm,fontWeight:600 }}>Dia de fechamento</p>
                <FInput T={T} value={String(nc.closeDay)} onChange={v=>setNc(x=>({...x,closeDay:parseInt(v)||5}))} placeholder="Ex: 5" type="number"/>
              </div>
              <div>
                <p style={{ margin:"0 0 6px",fontSize:12,color:T.tm,fontWeight:600 }}>Dia de vencimento</p>
                <FInput T={T} value={String(nc.dueDay)} onChange={v=>setNc(x=>({...x,dueDay:parseInt(v)||15}))} placeholder="Ex: 15" type="number"/>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {C_CORES.map(c => (
                <button key={c} onClick={()=>setNc(x=>({...x,color:c}))}
                  style={{ width:38,height:38,borderRadius:99,background:c,border:nc.color===c?`3px solid ${T.p}`:"2px solid transparent",cursor:"pointer" }}/>
              ))}
            </div>
            <Btn T={T} onClick={addCard}>Cadastrar Cartão</Btn>
          </div>
        </Sheet>
      )}

      {/* ── Detalhe do Cartão ── */}
      {sheet==="cardDetail" && sCard && (
        <Sheet T={T} title={`💳 ${sCard.name}`} onClose={()=>{ setSheet(null); setCardAddMode(false); setNf(DEF_NF()); }}>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

            {/* fatura atual */}
            <div style={{ padding:"16px",borderRadius:16,background:sCard.color+"18",border:`1.5px solid ${sCard.color}55` }}>
              <p style={{ margin:0,fontSize:11,color:T.tm,fontWeight:700 }}>FATURA ATUAL · {fmtMonth(curMonth)}</p>
              <p style={{ margin:"4px 0 4px",fontSize:28,fontWeight:900,color:T.tx }}>R$ {fmtBRL(sCardCur)}</p>
              <p style={{ margin:0,fontSize:12,color:T.tm }}>Fecha dia {sCard.closeDay||5} · Vence dia {sCard.dueDay||10}</p>
            </div>

            {/* botão nova compra */}
            {!cardAddMode && (
              <button onClick={()=>{ setNf(DEF_NF(sCard.id)); setCardAddMode(true); }}
                style={{ padding:"12px",borderRadius:14,border:`1.5px solid ${T.p}`,background:T.p+"14",color:T.p,fontWeight:800,fontSize:13,cursor:"pointer" }}>
                + Nova compra neste cartão
              </button>
            )}

            {/* form inline de nova compra */}
            {cardAddMode && (
              <div style={{ background:T.alt,borderRadius:16,padding:"16px 14px",border:`1px solid ${T.bd}` }}>
                <p style={{ margin:"0 0 12px",fontSize:13,fontWeight:800,color:T.tx }}>Nova compra — {sCard.name}</p>
                <SaidaForm isCardDirect={true}/>
              </div>
            )}

            {/* compras vinculadas */}
            <p style={{ margin:0,fontSize:13,fontWeight:800,color:T.tx }}>Compras vinculadas:</p>
            {sCardTrans.length === 0
              ? <p style={{ color:T.tm,fontSize:13,textAlign:"center",padding:12 }}>Nenhuma compra vinculada ainda</p>
              : (
                <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                  {sCardTrans.slice(0, 20).map(t => (
                    <div key={t.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 13px",borderRadius:12,background:T.surf,border:`1px solid ${T.bd}` }}>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                          <p style={{ margin:0,fontSize:13,fontWeight:700,color:T.tx }}>{t.desc}</p>
                          <InstBadge t={t}/>
                        </div>
                        <p style={{ margin:"2px 0 0",fontSize:11,color:T.tm }}>{t.date} · {t.cat}</p>
                      </div>
                      <span style={{ fontWeight:900,fontSize:13,color:T.er,flexShrink:0,marginLeft:8 }}>
                        R$ {fmtBRL(t.val)}
                      </span>
                      {/* excluir compra */}
                      <button onClick={()=>removeTrans(t.id)}
                        style={{ width:28,height:28,borderRadius:8,background:T.er+"18",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginLeft:8 }}>
                        <Trash2 size={13} color={T.er}/>
                      </button>
                    </div>
                  ))}
                </div>
              )
            }

            {/* próximas faturas */}
            <p style={{ margin:0,fontSize:13,fontWeight:800,color:T.tx }}>Previsão de faturas:</p>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {[1,2,3].map(i => {
                const d = new Date(); d.setMonth(d.getMonth()+i);
                const m = d.toISOString().slice(0,7);
                const v = cardBill(sCard.id, m);
                return (
                  <div key={m} style={{ display:"flex",justifyContent:"space-between",padding:"11px 14px",borderRadius:12,background:T.alt }}>
                    <span style={{ fontSize:13,color:T.tx,fontWeight:700 }}>{fmtMonth(m)}</span>
                    <span style={{ fontSize:13,fontWeight:900,color:v>0?T.er:T.tm }}>R$ {fmtBRL(v)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Sheet>
      )}

      {/* Confirmações */}
      {sheet==="delTrans" && delTrans && <ConfirmDel T={T} label={delTrans.desc} onCancel={()=>setSheet(null)} onConfirm={()=>removeTrans()}/>}
      {sheet==="delCard"  && delCardO  && <ConfirmDel T={T} label={delCardO.name} onCancel={()=>setSheet(null)} onConfirm={removeCard}/>}
    </div>
  );
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
function ConfigScreen({ data, cfg, T, setData, setCfg }) {
  const [name, setName]   = useState(cfg.name);
  const [sheet,setSheet]  = useState(null);
  const [syncing,setSyncing]=useState(false);
  const [banner,setBanner]=useState(null);

  const saveName = () => { setCfg(c=>({...c,name:name.trim()||"Amor"})); setBanner({msg:"Nome salvo!",type:"ok"}); setTimeout(()=>setBanner(null),2000); };
  const toggleDash = k => setCfg(c=>({...c,dash:{...c.dash,[k]:!c.dash[k]}}));

  const connectGoogle = () => {
    setSyncing(true);
    setTimeout(()=>{
      setData(d=>({...d,integrations:{...d.integrations,google:{...d.integrations.google,connected:true,email:"demo@vidaflor.app"}}}));
      setSyncing(false);
      setBanner({msg:"Modo demonstração ativo. Sincronização real com Google em breve!",type:"wn"});
      setTimeout(()=>setBanner(null),4000);
    },1500);
  };
  const disconnectGoogle = () => setData(d=>({...d,integrations:{...d.integrations,google:{...d.integrations.google,connected:false,email:""}}}));
  const toggleCalendar = id => setData(d=>({...d,integrations:{...d.integrations,google:{...d.integrations.google,calendars:d.integrations.google.calendars.map(c=>c.id===id?{...c,active:!c.active}:c)}}}));
  const resetAll = () => { if(window.confirm("Apagar todos os dados e recomeçar?")){ setData(DEF_DATA()); setCfg(DEF_CFG()); }};

  const DASH_ITEMS = [
    {k:"bloom",    lb:"Flor do Dia", ic: Flower},
    {k:"water",    lb:"Meta de Água", ic: Droplets},
    {k:"routine",  lb:"Rotina Diária", ic: LayoutGrid},
    {k:"finance",  lb:"Saldo Financeiro", ic: DollarSign},
    {k:"cycle",    lb:"Ciclo Menstrual", ic: Flower2},
    {k:"spirit",   lb:"Conexão & Paz", ic: Star},
    {k:"reminders",lb:"Lembretes", ic: Bell},
  ];

  return (
    <div style={{ padding:"24px 20px 20px" }}>
      <h2 style={{ margin:"0 0 20px",color:T.tx,fontSize:24,fontWeight:900 }}>Configurações</h2>

      {/* Banner inline */}
      {banner&&<div style={{ background:banner.type==="ok"?T.ok:T.wn,borderRadius:14,padding:"12px 16px",marginBottom:16,color:"#fff",fontWeight:700,fontSize:14 }}>{banner.msg}</div>}

      {/* Nome */}
      <Card T={T} style={{ marginBottom:14 }}>
        <p style={{ margin:"0 0 10px",fontWeight:800,color:T.tx,fontSize:14 }}>Seu Perfil</p>
        <div style={{ display:"flex",gap:8 }}>
          <FInput T={T} value={name} onChange={setName} placeholder="Como quer ser chamada?" style={{ flex:1 }}/>
          <button onClick={saveName} style={{ padding:"0 18px",borderRadius:12,background:T.p,border:"none",color:"#fff",fontWeight:800,cursor:"pointer",fontSize:14 }}>OK</button>
        </div>
      </Card>

      {/* Google */}
      <Card T={T} style={{ marginBottom:14 }}>
        <p style={{ margin:"0 0 12px",fontWeight:800,color:T.tx,fontSize:14 }}>Integrações</p>
        <div style={{ display:"flex",alignItems:"center",gap:12,padding:14,borderRadius:14,background:data.integrations.google.connected?"#4285F412":T.alt,border:`1.5px solid ${data.integrations.google.connected?"#4285F433":T.bd}` }}>
          <div style={{ width:38,height:38,borderRadius:11,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}><Globe size={22} color="#4285F4"/></div>
          <div style={{ flex:1 }}>
            <p style={{ margin:0,fontSize:14,fontWeight:800,color:T.tx }}>Google Agenda</p>
            <p style={{ margin:0,fontSize:11,color:T.tm }}>{data.integrations.google.connected?data.integrations.google.email:"Não conectado · Em breve real"}</p>
          </div>
          <button onClick={()=>data.integrations.google.connected?setSheet("google"):connectGoogle()} style={{ padding:"7px 12px",borderRadius:10,background:data.integrations.google.connected?T.alt:"#4285F4",border:"none",color:data.integrations.google.connected?T.tm:"#fff",fontSize:12,fontWeight:700,cursor:"pointer" }}>
            {syncing?<RefreshCw size={14}/>:data.integrations.google.connected?"Gerenciar":"Conectar"}
          </button>
        </div>
      </Card>

      {/* Temas */}
      <Card T={T} style={{ marginBottom:14 }}>
        <p style={{ margin:"0 0 12px",fontWeight:800,color:T.tx,fontSize:14 }}>Aparência e Cores</p>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {Object.values(T_MAP).map(t=>(
            <button key={t.key} onClick={()=>setCfg(c=>({...c,theme:t.key}))} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:14,border:`2px solid ${cfg.theme===t.key?T.p:T.bd}`,background:cfg.theme===t.key?T.p+"12":"transparent",cursor:"pointer",fontFamily:"inherit" }}>
              <div style={{ width:34,height:34,borderRadius:10,background:t.gh,flexShrink:0 }}/>
              <span style={{ fontSize:14,fontWeight:cfg.theme===t.key?800:500,color:T.tx }}><div style={{ display:"flex", alignItems:"center", gap: 6 }}><t.e size={16}/> {t.name}</div></span>
              {cfg.theme===t.key&&<Check size={16} color={T.p} style={{ marginLeft:"auto" }}/>}
            </button>
          ))}
        </div>
      </Card>

      {/* Dashboard */}
      <Card T={T} style={{ marginBottom:14 }}>
        <p style={{ margin:"0 0 14px",fontWeight:800,color:T.tx,fontSize:14 }}>Preferências da Tela Inicial</p>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {DASH_ITEMS.map(({k,lb,ic:Ic})=>(
            <div key={k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Ic size={16} color={T.tm} />
                <span style={{ fontSize:14,color:T.tx,fontWeight:600 }}>{lb}</span>
              </div>
              <Toggle T={T} val={cfg.dash[k]} onChange={()=>toggleDash(k)}/>
            </div>
          ))}
        </div>
      </Card>

      <Btn T={T} variant="danger" onClick={resetAll} style={{ background:T.er+"15",color:T.er,border:`1px solid ${T.er}33`,marginTop:8 }}><div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap: 8 }}><Trash2 size={16}/> Resetar Aplicativo</div></Btn>
      <p style={{ textAlign:"center",color:T.tm,fontSize:11,marginTop:16,fontWeight:600 }}>Minha Vida · v11 · SCLC</p>

      {sheet==="google"&&(
        <Sheet T={T} title="Google Agenda" onClose={()=>setSheet(null)}>
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div style={{ background:"#4285F412",padding:14,borderRadius:14,border:"1px solid #4285F433" }}>
              <p style={{ margin:0,fontSize:13,fontWeight:800,color:"#4285F4" }}>Conta Conectada (Demo)</p>
              <p style={{ margin:"4px 0 0",fontSize:12,color:T.tm }}>{data.integrations.google.email}</p>
            </div>
            <div>
              <p style={{ margin:"0 0 10px",fontSize:14,fontWeight:800,color:T.tx }}>Calendários:</p>
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {data.integrations.google.calendars.map(c=>(
                  <div key={c.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <span style={{ fontSize:14,color:T.tx }}>{c.name}</span>
                    <Toggle T={T} val={c.active} onChange={()=>toggleCalendar(c.id)}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:"flex",gap:10 }}>
              <Btn T={T} variant="ghost" onClick={disconnectGoogle} style={{ flex:1 }}>Desconectar</Btn>
              <Btn T={T} onClick={()=>setSheet(null)} style={{ flex:1 }}>Fechar</Btn>
            </div>
          </div>
        </Sheet>
      )}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const STORAGE_DATA = "mvida_data_v2";
const STORAGE_CFG  = "mvida_cfg_v2";

export default function App() {
  const [tab,      setTab]     = useState("home");
  const [data,     setDataRaw] = useState(null);
  const [cfg,      setCfgRaw]  = useState(null);

  useEffect(()=>{
    (async()=>{
      let d=DEF_DATA(), c=DEF_CFG();
      try{ const r=await window.storage.get(STORAGE_DATA); if(r?.value) d=JSON.parse(r.value); }catch{}
      try{ const r=await window.storage.get(STORAGE_CFG);  if(r?.value) c=JSON.parse(r.value); }catch{}
      setDataRaw(d); setCfgRaw(c);
    })();
  },[]);

  const syncData = async (key,next) => { try{ await window.storage.set(key,JSON.stringify(next)); }catch{} };

  const setData = fn => setDataRaw(prev=>{
    const next = typeof fn==="function"?fn(prev):fn;
    syncData(STORAGE_DATA,next);
    return next;
  });
  const setCfg = fn => setCfgRaw(prev=>{
    const next = typeof fn==="function"?fn(prev):fn;
    syncData(STORAGE_CFG,next);
    return next;
  });

  if (!data||!cfg) return (
    <div style={{ height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FFF0F4" }}>
      <div style={{ textAlign:"center" }}><div style={{ fontSize:52,marginBottom:10 }}><Flower size={20} color={T.p}/></div><p style={{ color:"#9C7A83",fontSize:14,fontWeight:700,fontFamily:"sans-serif" }}>Florescendo...</p></div>
    </div>
  );

  const T = T_MAP[cfg.theme]||T_MAP.pastel;
  const screens = {home:"Início",rotina:"Rotina",saude:"Saúde",espiritual:"Conexão",organiza:"Organização",financas:"Finanças",config:"Configurações"};

  const common = { data, T, setData, setTab };

  return (
    <div style={{ minHeight:"100vh",background:T.bg,fontFamily:"'Segoe UI',system-ui,sans-serif",maxWidth:430,margin:"0 auto",position:"relative",transition:"background .5s" }}>
      {/* Header */}
      <div style={{ position:"sticky",top:0,zIndex:50,background:T.bg+"EE",borderBottom:`1px solid ${T.bd}`,padding:"14px 20px 12px",display:"flex",alignItems:"center",gap:12,backdropFilter:"blur(10px)" }}>
        <div style={{ width:34,height:34,borderRadius:11,background:T.gh,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,boxShadow:`0 4px 8px ${T.p}33` }}><Flower size={20} color={T.p}/></div>
        <div>
          <p style={{ margin:0,fontSize:10,color:T.tm,fontWeight:800,letterSpacing:"0.5px" }}>MINHA VIDA</p>
          <p style={{ margin:0,fontSize:14,fontWeight:900,color:T.tx }}>{screens[tab]}</p>
        </div>
        <button onClick={()=>setTab("config")} style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",padding:6 }}><Settings size={20} color={T.tm}/></button>
      </div>

      {/* Conteúdo */}
      <div style={{ paddingBottom:90,minHeight:"calc(100vh - 64px)" }}>
        {tab==="home"      && <HomeScreen     {...common} cfg={cfg}/>}
        {tab==="rotina"    && <RotinaScreen   {...common}/>}
        {tab==="saude"     && <SaudeScreen    {...common}/>}
        {tab==="espiritual"&& <EspiritualScreen {...common}/>}
        {tab==="organiza"  && <OrganizaScreen {...common}/>}
        {tab==="financas"  && <FinancasScreen {...common}/>}
        {tab==="config"    && <ConfigScreen   {...common} cfg={cfg} setCfg={setCfg}/>}
      </div>

      <BottomNav tab={tab} setTab={setTab} T={T}/>

      <style>{`
        *{-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{display:none;}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
      `}</style>
    </div>
  );
}
