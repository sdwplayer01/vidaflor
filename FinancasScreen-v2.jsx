// ─── FINANÇAS v3 ──────────────────────────────────────────────────────────────
// Substituir APENAS a função FinancasScreen do arquivo principal.
// Não altera mais nada no app.

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
          <p style={{ margin:0,fontSize:14,fontWeight:700,color:T.tx }}>📦 Compra parcelada?</p>
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
            <span style={{ fontSize:14,fontWeight:700,color:T.tx }}>✅ Já confirmado?</span>
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

      <Btn T={T} onClick={()=>saveSaida(isCardDirect)}>🔴 Salvar Saída</Btn>
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
            <span style={{ fontSize:15 }}>✏️</span>
          </button>
        </div>
      </Card>

      {/* ── Tabs ── */}
      <div style={{ display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:4 }}>
        <Chip T={T} active={sub==="lancamentos"} onClick={()=>setSub("lancamentos")}>📋 Lançamentos</Chip>
        <Chip T={T} active={sub==="cartoes"}     onClick={()=>setSub("cartoes")}>💳 Cartões</Chip>
        <Chip T={T} active={sub==="parcelas"}    onClick={()=>setSub("parcelas")}>
          📦 Parcelas{allParcelas.filter(t=>!t.paid&&(t.date||"")>=today()).length>0
            && ` (${allParcelas.filter(t=>!t.paid&&(t.date||"")>=today()).length})`}
        </Chip>
      </div>

      {/* ──────────────── ABA LANÇAMENTOS ──────────────── */}
      {sub==="lancamentos" && (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:4 }}>
            <button onClick={()=>{ setNf(DEF_NF()); setSheet("addEntrada"); }}
              style={{ padding:"12px",borderRadius:14,border:`1.5px solid ${T.ok}`,background:T.ok+"14",color:T.ok,fontWeight:800,fontSize:13,cursor:"pointer" }}>
              ↑ Nova Entrada
            </button>
            <button onClick={()=>{ setNf(DEF_NF()); setSheet("addSaida"); }}
              style={{ padding:"12px",borderRadius:14,border:`1.5px solid ${T.er}`,background:T.er+"14",color:T.er,fontWeight:800,fontSize:13,cursor:"pointer" }}>
              ↓ Nova Saída
            </button>
          </div>

          {monthTrans.length===0 && (
            <div style={{ textAlign:"center",padding:"32px 0",color:T.tm }}>
              <p style={{ fontSize:30,margin:"0 0 8px" }}>💸</p>
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
              <p style={{ fontSize:30,margin:"0 0 8px" }}>💳</p>
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
              <p style={{ fontSize:30,margin:"0 0 8px" }}>📦</p>
              <p style={{ margin:0,fontWeight:600 }}>Nenhuma parcela registrada</p>
              <p style={{ margin:"6px 0 0",fontSize:12 }}>Adicione uma saída parcelada para ver o compromisso futuro</p>
            </div>
          )}
          {allParcelas.map(t => {
            const isCur  = (t.date||"").slice(0,7) === curMonth;
            const isFut  = (t.date||"") > today() && !isCur;
            const isPast = (t.date||"") < today() && !isCur;
            const badge  = t.paid
              ? { lbl:"✅ pago",      c:T.ok }
              : isCur  ? { lbl:"⏳ este mês",  c:T.p  }
              : isFut  ? { lbl:"⬜ futuro",    c:T.tm }
              :           { lbl:"⚠️ atrasado", c:T.er };
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
        <Sheet T={T} title="💰 Disponível este mês" onClose={()=>setShowBudgetEdit(false)}>
          <p style={{ margin:"0 0 14px",fontSize:13,color:T.tm,lineHeight:1.5 }}>
            Informe quanto você tem disponível para pagar as contas este mês. O app calcula automaticamente se vai sobrar ou faltar! 🎯
          </p>
          <FInput T={T} value={budgetInput} onChange={setBudgetInput} placeholder="Ex: 3500.00" type="number"/>
          <div style={{ height:12 }}/>
          <Btn T={T} onClick={saveBudget}>Salvar</Btn>
        </Sheet>
      )}

      {/* ── Carrossel de Histórico & Projeção ── */}
      {showProjecao && (
        <Sheet T={T} title="📅 Histórico & Projeção" onClose={()=>setShowProjecao(false)}>
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
        <Sheet T={T} title="↑ Nova Entrada" onClose={()=>setSheet(null)}>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <FInput T={T} value={nf.desc} onChange={v=>setNf(x=>({...x,desc:v}))} placeholder="Descrição"/>
            <FInput T={T} value={nf.val}  onChange={v=>setNf(x=>({...x,val:v}))}  placeholder="Valor (R$)" type="number"/>
            <FInput T={T} value={nf.date} onChange={v=>setNf(x=>({...x,date:v}))} type="date"/>
            <p style={{ margin:"4px 0 0",fontSize:12,color:T.tm,fontWeight:700 }}>Categoria:</p>
            <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
              {CATS_ENT.map(c => <Chip key={c} T={T} active={nf.cat===c} onClick={()=>setNf(x=>({...x,cat:c}))}>{c}</Chip>)}
            </div>
            <Btn T={T} onClick={saveEntrada}>💚 Salvar Entrada</Btn>
          </div>
        </Sheet>
      )}

      {/* Nova Saída */}
      {sheet==="addSaida" && (
        <Sheet T={T} title="↓ Nova Saída" onClose={()=>setSheet(null)}>
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
            <Btn T={T} onClick={addCard}>💳 Cadastrar Cartão</Btn>
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
