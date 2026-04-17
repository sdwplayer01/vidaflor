// ═══════════════════════════════════════════════════════════════════════════════
//  SAÚDE V2 — Substituição cirúrgica do SaudeScreen + ajustes no DEF_DATA
//  Copie este bloco sobre:
//    1. A seção "health" dentro de DEF_DATA
//    2. calcBloom (atualizado para usar novo path)
//    3. A função SaudeScreen inteira
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 1. NOVO BLOCO "health" DENTRO DE DEF_DATA ────────────────────────────────
// Substitua:  health: { water: { goal:2000, log:{} } },
// Por isto:

/*
  health: {
    activeProfile: "eu",
    profiles: [
      {
        id: "eu",
        name: "Você",
        av: "👩",
        type: "adult_f",   // adult_f | adult_m | child | pet
        color: "#E8799A",
        water: { goal: 2000, log: {} },
        cycle: { start: today(), len: 28, menses: 5 },
        meds: [],          // [{ id, name, dose, time, log:{} }]
        notes: {},         // { "YYYY-MM-DD": "texto livre" }
      },
    ],
  },
*/

// ─── 2. calcBloom ATUALIZADO ───────────────────────────────────────────────────
// O bloom agora lê do perfil "eu"
// Substitua a função calcBloom por:

/*
const calcBloom = (data, day) => {
  const allT = data.routine.essMode
    ? data.routine.essential
    : [...data.routine.morning, ...data.routine.afternoon, ...data.routine.night];
  const doneIds   = data.routine.done[day] || [];
  const routinePct = allT.length > 0 ? (doneIds.length / allT.length) * 40 : 0;
  const mainP  = data.health.profiles.find(p => p.id === "eu") || data.health.profiles[0];
  const wNow   = mainP?.water?.log?.[day] || 0;
  const wGoal  = mainP?.water?.goal || 2000;
  const waterPct = Math.min(1, wNow / wGoal) * 30;
  const gratPct  = Math.min(1, (data.spirit.gratitude[day] || []).length / 3) * 30;
  return Math.round(routinePct + waterPct + gratPct);
};
*/

// ─── 3. NOVO SaudeScreen (código completo) ────────────────────────────────────

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

// ═══════════════════════════════════════════════════════════════════════════════
//  PATCH NO DEF_DATA — substitua o bloco "health" e "cycle" por:
//
//  health: {
//    activeProfile: "eu",
//    profiles: [
//      {
//        id: "eu",
//        name: "Você",
//        av: "👩",
//        type: "adult_f",
//        color: "#E8799A",
//        water: { goal: 2000, log: {} },
//        cycle: { start: today(), len: 28, menses: 5 },
//        meds: [],
//        notes: {},
//      },
//    ],
//  },
//
//  REMOVA o bloco "cycle" raiz (agora fica dentro de cada perfil adult_f)
//
//  PATCH NO calcBloom — substitua as linhas de wNow/wGoal por:
//    const mainP = data.health.profiles.find(p => p.id === "eu") || data.health.profiles[0];
//    const wNow  = mainP?.water?.log?.[day] || 0;
//    const wGoal = mainP?.water?.goal || 2000;
//
//  PATCH NO HomeScreen — substitua:
//    const {dc,dl,...} = calcCycleState(day, data.cycle.start, ...)
//  Por:
//    const mainP = data.health.profiles.find(p => p.id === "eu") || data.health.profiles[0];
//    const cyc   = mainP?.cycle;
//    const showCycle = !!cyc;
//    const {dc,dl,isTPM,isFertil} = showCycle ? calcCycleState(day, cyc.start, cyc.len, cyc.menses) : {};
// ═══════════════════════════════════════════════════════════════════════════════
