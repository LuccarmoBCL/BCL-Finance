import React, { useState, useMemo } from "react";
import {
  LayoutDashboard, Wallet, TrendingUp, Calendar, ListPlus,
  CreditCard, ShieldAlert, Plus, Trash2, Target,
  ArrowUpRight, ArrowDownRight, PiggyBank, LineChart as LineIcon,
  BookOpen, X,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, ComposedChart,
} from "recharts";

/* ─── BCL brand tokens ─────────────────────────────────────────── */
const C = {
  green: "#0D3B2C",
  greenMid: "#12523A",
  greenSoft: "#2D7A54",
  gold: "#C9A84C",
  goldDeep: "#B08F35",
  bg: "#EEF2F0",
  card: "#FFFFFF",
  ink: "#1C2B24",
  sub: "#6B7B73",
  line: "#DDE5E1",
  red: "#C0392B",
  blue: "#2471A3",
  purple: "#7D3C98",
};

const TYPES = ["Receita", "Despesa", "Poupança", "Investimento", "Dívida"];
const SUBCATS = ["Fixa", "Variável", "Essencial", "Supérflua", "Emergência"];
const CATS_DESP = ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação",
  "Lazer", "Vestuário", "Assinaturas", "Pets", "Contas", "Outros"];
const CATS_REC = ["Salário", "Freelance", "Rendimentos", "Presente", "Outros"];
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MABR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const TYPE_COLOR = {
  Receita: C.greenSoft, Despesa: C.red, Poupança: C.blue,
  Investimento: C.purple, "Dívida": C.goldDeep,
};

const brl = (n) =>
  (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const monthOf = (iso) => (iso ? parseInt(iso.split("-")[1], 10) - 1 : 0);

/* ─── seed data so the app looks alive on first open ───────────── */
const seed = [
  { id: 1, date: "2025-01-05", sub: "Fixa", type: "Receita", amount: 5200, cat: "Salário", obs: "Salário mensal" },
  { id: 2, date: "2025-01-08", sub: "Essencial", type: "Despesa", amount: 1450, cat: "Moradia", obs: "Aluguel" },
  { id: 3, date: "2025-01-11", sub: "Variável", type: "Despesa", amount: 520, cat: "Alimentação", obs: "Mercado" },
  { id: 4, date: "2025-01-15", sub: "Essencial", type: "Investimento", amount: 800, cat: "Rendimentos", obs: "Tesouro Direto" },
  { id: 5, date: "2025-01-20", sub: "Emergência", type: "Poupança", amount: 400, cat: "Outros", obs: "Reserva" },
  { id: 6, date: "2025-01-24", sub: "Supérflua", type: "Despesa", amount: 190, cat: "Lazer", obs: "Cinema e jantar" },
  { id: 7, date: "2025-02-05", sub: "Fixa", type: "Receita", amount: 5200, cat: "Salário", obs: "Salário mensal" },
  { id: 8, date: "2025-02-09", sub: "Essencial", type: "Despesa", amount: 1450, cat: "Moradia", obs: "Aluguel" },
  { id: 9, date: "2025-02-13", sub: "Variável", type: "Despesa", amount: 610, cat: "Alimentação", obs: "Mercado" },
  { id: 10, date: "2025-02-16", sub: "Variável", type: "Despesa", amount: 320, cat: "Transporte", obs: "Combustível" },
  { id: 11, date: "2025-02-22", sub: "Essencial", type: "Investimento", amount: 900, cat: "Rendimentos", obs: "CDB" },
  { id: 12, date: "2025-03-05", sub: "Fixa", type: "Receita", amount: 5600, cat: "Salário", obs: "Salário + bônus" },
  { id: 13, date: "2025-03-10", sub: "Essencial", type: "Despesa", amount: 1450, cat: "Moradia", obs: "Aluguel" },
  { id: 14, date: "2025-03-14", sub: "Variável", type: "Despesa", amount: 480, cat: "Alimentação", obs: "Mercado" },
  { id: 15, date: "2025-03-18", sub: "Supérflua", type: "Despesa", amount: 260, cat: "Vestuário", obs: "Roupas" },
];

const DEFAULT_METAS = {
  Alimentação: 700, Transporte: 400, Moradia: 1500, Saúde: 300, Educação: 200,
  Lazer: 300, Vestuário: 150, Assinaturas: 120, Pets: 120, Contas: 400, Outros: 250,
};

/* ─── tiny UI atoms ────────────────────────────────────────────── */
function Card({ children, className = "", style = {} }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ background: C.card, boxShadow: "0 1px 3px rgba(13,59,44,.06), 0 8px 24px rgba(13,59,44,.05)", ...style }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon, highlight }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden"
      style={{
        background: highlight ? C.green : C.card,
        boxShadow: "0 1px 3px rgba(13,59,44,.06), 0 8px 24px rgba(13,59,44,.05)",
      }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wide uppercase"
          style={{ color: highlight ? C.gold : C.sub }}>{label}</span>
        <span className="rounded-lg p-1.5"
          style={{ background: highlight ? "rgba(201,168,76,.15)" : `${color}14` }}>
          <Icon size={16} style={{ color: highlight ? C.gold : color }} />
        </span>
      </div>
      <span className="text-2xl font-bold tracking-tight"
        style={{ color: highlight ? "#fff" : color }}>{brl(value)}</span>
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-bold" style={{ color: C.green }}>{children}</h2>
      {sub && <p className="text-xs mt-0.5" style={{ color: C.sub }}>{sub}</p>}
    </div>
  );
}


/* ─── persistência no navegador (localStorage) ─────────────────── */
function usePersistedState(key, initial) {
  const [state, setState] = React.useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });
  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

/* ─── main app ─────────────────────────────────────────────────── */
export default function App() {
  const [tab, setTab] = useState("painel");
  const [tx, setTx] = usePersistedState("bcl_tx", seed);
  const [metas, setMetas] = usePersistedState("bcl_metas", DEFAULT_METAS);
  const [selMonth, setSelMonth] = useState(0); // Janeiro
  const [showForm, setShowForm] = useState(false);

  // emergency calc
  const [emGasto, setEmGasto] = usePersistedState("bcl_emGasto", 3000);
  const [emMeses, setEmMeses] = usePersistedState("bcl_emMeses", 6);
  const [emAtual, setEmAtual] = usePersistedState("bcl_emAtual", 2000);
  const [emMensal, setEmMensal] = usePersistedState("bcl_emMensal", 400);

  const sumBy = (list, type) =>
    list.filter((t) => t.type === type).reduce((a, b) => a + b.amount, 0);

  const totals = useMemo(() => ({
    Receita: sumBy(tx, "Receita"),
    Despesa: sumBy(tx, "Despesa"),
    Poupança: sumBy(tx, "Poupança"),
    Investimento: sumBy(tx, "Investimento"),
    "Dívida": sumBy(tx, "Dívida"),
  }), [tx]);
  const saldo = totals.Receita - totals.Despesa - totals.Poupança - totals.Investimento - totals["Dívida"];

  // monthly matrix
  const monthly = useMemo(() => {
    const rows = MABR.map((m, i) => {
      const inMonth = tx.filter((t) => monthOf(t.date) === i);
      return {
        mes: m,
        Receita: sumBy(inMonth, "Receita"),
        Despesa: sumBy(inMonth, "Despesa"),
        Poupança: sumBy(inMonth, "Poupança"),
        Investimento: sumBy(inMonth, "Investimento"),
      };
    });
    return rows;
  }, [tx]);

  const monthTx = useMemo(
    () => tx.filter((t) => monthOf(t.date) === selMonth),
    [tx, selMonth]
  );
  const monthTotals = {
    Receita: sumBy(monthTx, "Receita"),
    Despesa: sumBy(monthTx, "Despesa"),
    Poupança: sumBy(monthTx, "Poupança"),
    Investimento: sumBy(monthTx, "Investimento"),
    "Dívida": sumBy(monthTx, "Dívida"),
  };
  const monthSaldo = monthTotals.Receita - monthTotals.Despesa - monthTotals.Poupança - monthTotals.Investimento - monthTotals["Dívida"];

  const despByCat = useMemo(() => {
    const map = {};
    tx.filter((t) => t.type === "Despesa").forEach((t) => {
      map[t.cat] = (map[t.cat] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [tx]);

  const monthDespByCat = useMemo(() => {
    const map = {};
    monthTx.filter((t) => t.type === "Despesa").forEach((t) => {
      map[t.cat] = (map[t.cat] || 0) + t.amount;
    });
    return map;
  }, [monthTx]);

  const addTx = (t) => setTx((p) => [...p, { ...t, id: Date.now() }]);
  const delTx = (id) => setTx((p) => p.filter((t) => t.id !== id));

  const emMeta = emGasto * emMeses;
  const emFalta = Math.max(emMeta - emAtual, 0);
  const emPct = emMeta > 0 ? Math.min(emAtual / emMeta, 1) : 0;
  const emTempo = emMensal > 0 ? Math.ceil(emFalta / emMensal) : 0;

  const NAV = [
    { id: "painel", label: "Painel", icon: LayoutDashboard },
    { id: "mes", label: "Mês a Mês", icon: Calendar },
    { id: "orcamento", label: "Orçamento", icon: Wallet },
    { id: "rastreio", label: "Rastreamento", icon: TrendingUp },
    { id: "transacoes", label: "Transações", icon: ListPlus },
    { id: "contas", label: "Contas", icon: CreditCard },
    { id: "emergencia", label: "Emergência", icon: ShieldAlert },
    { id: "manual", label: "Manual", icon: BookOpen },
  ];

  const PIE_COLORS = [C.greenSoft, C.gold, C.blue, C.purple, C.red, C.goldDeep,
    "#3E9268", "#5D6D7E", "#48C9B0", "#EB984E", "#AF7AC5"];

  return (
    <div className="min-h-screen w-full" style={{ background: C.bg, color: C.ink,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      {/* top brand bar */}
      <header style={{ background: C.green }} className="w-full">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2" style={{ background: "rgba(201,168,76,.15)" }}>
              <PiggyBank size={22} style={{ color: C.gold }} />
            </div>
            <div>
              <div className="text-lg font-bold leading-none" style={{ color: C.gold }}>
                BCL Finance
              </div>
              <div className="text-[11px] mt-1" style={{ color: "#A8C4B4" }}>
                Controle Financeiro Pessoal
              </div>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-transform active:scale-95"
            style={{ background: C.gold, color: C.green }}>
            <Plus size={16} /> Nova transação
          </button>
        </div>
        <div style={{ height: 3, background: C.gold }} />
      </header>

      {/* nav */}
      <nav className="sticky top-0 z-20" style={{ background: C.green }}>
        <div className="max-w-6xl mx-auto px-2 flex gap-1 overflow-x-auto">
          {NAV.map((n) => {
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors"
                style={{
                  color: active ? C.gold : "#8FB3A2",
                  borderBottom: active ? `2px solid ${C.gold}` : "2px solid transparent",
                }}>
                <n.icon size={15} /> {n.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* ── PAINEL ── */}
        {tab === "painel" && (
          <div className="space-y-6">
            <SectionTitle sub="Sua central de controle, tudo em um só lugar">
              Painel financeiro
            </SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Receita total" value={totals.Receita} color={C.greenSoft} icon={ArrowUpRight} />
              <StatCard label="Despesa total" value={totals.Despesa} color={C.red} icon={ArrowDownRight} />
              <StatCard label="Investido" value={totals.Investimento} color={C.purple} icon={TrendingUp} />
              <StatCard label="Saldo" value={saldo} color={C.gold} icon={Wallet} highlight />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Poupança" value={totals.Poupança} color={C.blue} icon={PiggyBank} />
              <StatCard label="Dívida total" value={totals["Dívida"]} color={C.goldDeep} icon={CreditCard} />
              <Card className="p-4 flex flex-col gap-1 justify-center">
                <span className="text-[11px] font-semibold uppercase" style={{ color: C.sub }}>Taxa de poupança</span>
                <span className="text-2xl font-bold" style={{ color: C.blue }}>
                  {totals.Receita > 0 ? (((totals.Poupança + totals.Investimento) / totals.Receita) * 100).toFixed(1) : "0.0"}%
                </span>
              </Card>
              <Card className="p-4 flex flex-col gap-1 justify-center" style={{ background: C.green }}>
                <span className="text-[11px] font-semibold uppercase" style={{ color: C.gold }}>Transações</span>
                <span className="text-2xl font-bold text-white">{tx.length}</span>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-5">
                <SectionTitle sub="Divisão de todas as despesas">Despesas por categoria</SectionTitle>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={despByCat} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={55} outerRadius={95} paddingAngle={2}>
                      {despByCat.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => brl(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
              <Card className="p-5">
                <SectionTitle sub="Comparativo mensal">Receita x Despesa</SectionTitle>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip formatter={(v) => brl(v)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Receita" fill={C.greenSoft} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Despesa" fill={C.red} radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {/* ── MÊS A MÊS ── */}
        {tab === "mes" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle sub="Escolha o mês e todo o resumo muda">Resumo mês a mês</SectionTitle>
              <select value={selMonth} onChange={(e) => setSelMonth(+e.target.value)}
                className="rounded-xl px-4 py-2 text-sm font-semibold border-0 outline-none"
                style={{ background: C.green, color: C.gold }}>
                {MESES.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatCard label="Receita" value={monthTotals.Receita} color={C.greenSoft} icon={ArrowUpRight} />
              <StatCard label="Despesa" value={monthTotals.Despesa} color={C.red} icon={ArrowDownRight} />
              <StatCard label="Poupança" value={monthTotals.Poupança} color={C.blue} icon={PiggyBank} />
              <StatCard label="Investido" value={monthTotals.Investimento} color={C.purple} icon={TrendingUp} />
              <StatCard label="Dívida" value={monthTotals["Dívida"]} color={C.goldDeep} icon={CreditCard} />
            </div>
            <Card className="p-6 flex items-center justify-between" style={{ background: C.green }}>
              <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: C.gold }}>
                Saldo de {MESES[selMonth]}
              </span>
              <span className="text-3xl font-bold" style={{ color: monthSaldo >= 0 ? "#fff" : "#F5B7B1" }}>
                {brl(monthSaldo)}
              </span>
            </Card>
            <Card className="p-5">
              <SectionTitle sub="Gasto real contra a meta no mês selecionado">Despesas por categoria no mês</SectionTitle>
              <div className="space-y-3">
                {CATS_DESP.map((cat) => {
                  const gasto = monthDespByCat[cat] || 0;
                  const meta = metas[cat] || 0;
                  const pct = meta > 0 ? gasto / meta : 0;
                  const over = pct > 1;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-sm w-28 shrink-0" style={{ color: C.ink }}>{cat}</span>
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: C.line }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(pct * 100, 100)}%`, background: over ? C.red : C.greenSoft }} />
                      </div>
                      <span className="text-xs w-40 text-right tabular-nums" style={{ color: over ? C.red : C.sub }}>
                        {brl(gasto)} / {brl(meta)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* ── ORÇAMENTO ── */}
        {tab === "orcamento" && (
          <div className="space-y-6">
            <SectionTitle sub="Realizado automático das transações, mês a mês">Orçamento anual</SectionTitle>
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr style={{ background: C.greenMid }}>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-white sticky left-0" style={{ background: C.greenMid }}>Categoria</th>
                      {MABR.map((m) => <th key={m} className="px-2 py-3 text-xs font-semibold text-white">{m}</th>)}
                      <th className="px-3 py-3 text-xs font-semibold" style={{ color: C.gold }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ background: "#EAF6EE" }}>
                      <td colSpan={14} className="px-4 py-1.5 text-xs font-bold" style={{ color: C.greenSoft }}>RECEITAS</td>
                    </tr>
                    {CATS_REC.map((cat, ri) => {
                      const cells = MABR.map((_, mi) =>
                        tx.filter((t) => t.cat === cat && t.type === "Receita" && monthOf(t.date) === mi)
                          .reduce((a, b) => a + b.amount, 0));
                      const total = cells.reduce((a, b) => a + b, 0);
                      return (
                        <tr key={cat} style={{ background: ri % 2 ? "#F8FAF9" : "#fff" }}>
                          <td className="px-4 py-2 text-left sticky left-0" style={{ background: ri % 2 ? "#F8FAF9" : "#fff" }}>{cat}</td>
                          {cells.map((v, i) => <td key={i} className="px-2 py-2 text-center tabular-nums" style={{ color: v ? C.ink : C.line }}>{v ? brl(v) : "·"}</td>)}
                          <td className="px-3 py-2 text-center font-semibold tabular-nums" style={{ color: C.greenSoft }}>{brl(total)}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: "#FDECEA" }}>
                      <td colSpan={14} className="px-4 py-1.5 text-xs font-bold" style={{ color: C.red }}>DESPESAS</td>
                    </tr>
                    {CATS_DESP.map((cat, ri) => {
                      const cells = MABR.map((_, mi) =>
                        tx.filter((t) => t.cat === cat && t.type === "Despesa" && monthOf(t.date) === mi)
                          .reduce((a, b) => a + b.amount, 0));
                      const total = cells.reduce((a, b) => a + b, 0);
                      return (
                        <tr key={cat} style={{ background: ri % 2 ? "#F8FAF9" : "#fff" }}>
                          <td className="px-4 py-2 text-left sticky left-0" style={{ background: ri % 2 ? "#F8FAF9" : "#fff" }}>{cat}</td>
                          {cells.map((v, i) => <td key={i} className="px-2 py-2 text-center tabular-nums" style={{ color: v ? C.ink : C.line }}>{v ? brl(v) : "·"}</td>)}
                          <td className="px-3 py-2 text-center font-semibold tabular-nums" style={{ color: C.red }}>{brl(total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="text-xs" style={{ color: C.sub }}>
              Os valores acima são preenchidos automaticamente pelas transações. Defina suas metas na aba Mês a Mês.
            </p>
          </div>
        )}

        {/* ── RASTREAMENTO ── */}
        {tab === "rastreio" && (
          <div className="space-y-6">
            <SectionTitle sub="Evolução de cada tipo ao longo do ano">Rastreamento</SectionTitle>
            <Card className="p-5">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(v) => brl(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="Receita" stroke={C.greenSoft} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Despesa" stroke={C.red} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Poupança" stroke={C.blue} strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Investimento" stroke={C.purple} strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
            <div className="grid md:grid-cols-4 gap-3">
              {TYPES.map((t) => (
                <Card key={t} className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLOR[t] }} />
                    <span className="text-xs font-semibold uppercase" style={{ color: C.sub }}>{t}</span>
                  </div>
                  <span className="text-xl font-bold" style={{ color: TYPE_COLOR[t] }}>{brl(totals[t])}</span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── TRANSAÇÕES ── */}
        {tab === "transacoes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <SectionTitle sub="Cada lançamento abastece todo o painel">Registro de transações</SectionTitle>
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                style={{ background: C.green, color: C.gold }}>
                <Plus size={16} /> Adicionar
              </button>
            </div>
            <Card className="p-0 overflow-hidden">
              {tx.length === 0 ? (
                <div className="p-10 text-center" style={{ color: C.sub }}>
                  Nenhuma transação ainda. Toque em Adicionar para começar.
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: C.line }}>
                  {[...tx].sort((a, b) => b.date.localeCompare(a.date)).map((t) => (
                    <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-black/[.02]">
                      <div className="w-1.5 h-10 rounded-full shrink-0" style={{ background: TYPE_COLOR[t.type] }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{t.obs || t.cat}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: `${TYPE_COLOR[t.type]}18`, color: TYPE_COLOR[t.type] }}>
                            {t.cat}
                          </span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: C.sub }}>
                          {brDate(t.date)} · {t.type} · {t.sub}
                        </div>
                      </div>
                      <span className="font-bold tabular-nums shrink-0"
                        style={{ color: t.type === "Receita" ? C.greenSoft : t.type === "Despesa" ? C.red : C.ink }}>
                        {t.type === "Despesa" ? "-" : "+"}{brl(t.amount)}
                      </span>
                      <button onClick={() => delTx(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 shrink-0">
                        <Trash2 size={15} style={{ color: C.red }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── CONTAS ── */}
        {tab === "contas" && <ContasView />}

        {/* ── EMERGÊNCIA ── */}
        {tab === "emergencia" && (
          <div className="space-y-6 max-w-2xl">
            <SectionTitle sub="Calcule sua reserva e acompanhe o progresso">Fundo de emergência</SectionTitle>
            <Card className="p-5 space-y-4">
              <NumField label="Gasto mensal médio" value={emGasto} onChange={setEmGasto} money />
              <NumField label="Meses de segurança (ideal 6 a 12)" value={emMeses} onChange={setEmMeses} />
              <NumField label="Valor já guardado" value={emAtual} onChange={setEmAtual} money />
              <NumField label="Quanto pretende guardar por mês" value={emMensal} onChange={setEmMensal} money />
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-5" style={{ background: C.green }}>
                <span className="text-[11px] font-semibold uppercase" style={{ color: C.gold }}>Meta do fundo</span>
                <div className="text-2xl font-bold text-white mt-1">{brl(emMeta)}</div>
              </Card>
              <Card className="p-5" style={{ background: "#FDECEA" }}>
                <span className="text-[11px] font-semibold uppercase" style={{ color: C.sub }}>Ainda falta</span>
                <div className="text-2xl font-bold mt-1" style={{ color: C.red }}>{brl(emFalta)}</div>
              </Card>
            </div>
            <Card className="p-5">
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: C.sub }}>Progresso</span>
                <span className="font-semibold" style={{ color: C.greenSoft }}>{(emPct * 100).toFixed(1)}%</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ background: C.line }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${emPct * 100}%`, background: `linear-gradient(90deg, ${C.greenSoft}, ${C.gold})` }} />
              </div>
              <p className="text-sm mt-4" style={{ color: C.ink }}>
                Guardando <b>{brl(emMensal)}</b> por mês, você atinge sua meta em{" "}
                <b style={{ color: C.purple }}>{emTempo} {emTempo === 1 ? "mês" : "meses"}</b>.
              </p>
            </Card>
          </div>
        )}

        {/* ── MANUAL ── */}
        {tab === "manual" && <ManualView />}
      </main>

      <footer style={{ background: C.green }}>
        <div style={{ height: 3, background: C.gold }} />
        <div className="max-w-6xl mx-auto px-4 py-3 text-center text-xs" style={{ color: C.gold }}>
          BCL Finance · Planejamento Financeiro e Patrimonial · (11) 99720-9769
        </div>
      </footer>

      {showForm && <TxForm onClose={() => setShowForm(false)} onAdd={addTx} />}
    </div>
  );
}

/* ─── transaction form modal ───────────────────────────────────── */
function TxForm({ onClose, onAdd }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [type, setType] = useState("Despesa");
  const [sub, setSub] = useState("Variável");
  const [cat, setCat] = useState("Alimentação");
  const [amount, setAmount] = useState("");
  const [obs, setObs] = useState("");

  const catOptions = type === "Receita" ? CATS_REC : CATS_DESP;

  const submit = () => {
    const val = parseFloat(String(amount).replace(",", "."));
    if (!val || val <= 0) return;
    onAdd({ date, type, sub, cat: catOptions.includes(cat) ? cat : catOptions[0], amount: val, obs });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: "rgba(13,59,44,.45)" }} onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl md:rounded-2xl overflow-hidden"
        style={{ background: C.card }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ background: C.green }}>
          <span className="font-bold" style={{ color: C.gold }}>Nova transação</span>
          <button onClick={onClose} className="p-1 rounded-lg"><X size={18} color="#A8C4B4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <Field label="Data">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="inp" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <select value={type} onChange={(e) => { setType(e.target.value); setCat((e.target.value === "Receita" ? CATS_REC : CATS_DESP)[0]); }} className="inp">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Subcategoria">
              <select value={sub} onChange={(e) => setSub(e.target.value)} className="inp">
                {SUBCATS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Categoria">
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="inp">
              {catOptions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Montante (R$)">
            <input type="number" inputMode="decimal" placeholder="0,00" value={amount}
              onChange={(e) => setAmount(e.target.value)} className="inp" />
          </Field>
          <Field label="Observação (opcional)">
            <input type="text" placeholder="Ex: mercado da semana" value={obs}
              onChange={(e) => setObs(e.target.value)} className="inp" />
          </Field>
          <button onClick={submit}
            className="w-full rounded-xl py-3 font-semibold mt-2 transition-transform active:scale-[.98]"
            style={{ background: C.gold, color: C.green }}>
            Salvar transação
          </button>
        </div>
      </div>
      <style>{`.inp{width:100%;border:1px solid ${C.line};border-radius:12px;padding:10px 12px;font-size:14px;outline:none;background:#F8FAF9;color:${C.ink}}
        .inp:focus{border-color:${C.greenSoft};box-shadow:0 0 0 3px ${C.greenSoft}22}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium block mb-1" style={{ color: C.sub }}>{label}</span>
      {children}
    </label>
  );
}

function NumField({ label, value, onChange, money }) {
  return (
    <label className="block">
      <span className="text-xs font-medium block mb-1.5" style={{ color: C.sub }}>{label}</span>
      <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid ${C.line}`, background: "#F8FAF9" }}>
        {money && <span className="pl-3 text-sm" style={{ color: C.sub }}>R$</span>}
        <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2.5 text-sm bg-transparent outline-none" style={{ color: C.ink }} />
      </div>
    </label>
  );
}

/* ─── contas view (manual entry) ───────────────────────────────── */
function ContasView() {
  const [contas, setContas] = usePersistedState("bcl_contas", [
    { id: 1, nome: "Itaú", tipo: "Corrente", saldo: 3200 },
    { id: 2, nome: "Nubank", tipo: "Digital", saldo: 1850 },
  ]);
  const [cartoes, setCartoes] = usePersistedState("bcl_cartoes", [
    { id: 1, nome: "Nubank", limite: 5000, fatura: 1240 },
    { id: 2, nome: "Itaú", limite: 8000, fatura: 3100 },
  ]);
  const totContas = contas.reduce((a, b) => a + (+b.saldo || 0), 0);
  const totFatura = cartoes.reduce((a, b) => a + (+b.fatura || 0), 0);

  const upd = (setter, id, field, val) =>
    setter((p) => p.map((x) => x.id === id ? { ...x, [field]: val } : x));

  return (
    <div className="space-y-6">
      <SectionTitle sub="Todos os seus saldos e limites em um só lugar">Contas e cartões</SectionTitle>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold" style={{ color: C.green }}>Contas bancárias</h3>
          <button onClick={() => setContas((p) => [...p, { id: Date.now(), nome: "Nova conta", tipo: "Corrente", saldo: 0 }])}
            className="text-xs font-semibold flex items-center gap-1" style={{ color: C.greenSoft }}>
            <Plus size={14} /> conta
          </button>
        </div>
        <div className="space-y-2">
          {contas.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <input value={c.nome} onChange={(e) => upd(setContas, c.id, "nome", e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm" style={{ background: "#F8FAF9", border: `1px solid ${C.line}` }} />
              <input value={c.saldo} type="number" onChange={(e) => upd(setContas, c.id, "saldo", +e.target.value)}
                className="w-32 px-3 py-2 rounded-lg text-sm text-right tabular-nums" style={{ background: "#EEF4FF", border: `1px solid ${C.line}`, color: C.blue }} />
              <button onClick={() => setContas((p) => p.filter((x) => x.id !== c.id))} className="p-1.5"><Trash2 size={14} color={C.red} /></button>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 pt-3 border-t" style={{ borderColor: C.line }}>
          <span className="font-semibold text-sm" style={{ color: C.green }}>Total em contas</span>
          <span className="font-bold" style={{ color: C.greenSoft }}>{brl(totContas)}</span>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold" style={{ color: C.green }}>Cartões de crédito</h3>
          <button onClick={() => setCartoes((p) => [...p, { id: Date.now(), nome: "Novo cartão", limite: 0, fatura: 0 }])}
            className="text-xs font-semibold flex items-center gap-1" style={{ color: C.greenSoft }}>
            <Plus size={14} /> cartão
          </button>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_90px_90px_90px_28px] gap-2 text-[11px] font-semibold uppercase px-1" style={{ color: C.sub }}>
            <span>Cartão</span><span className="text-right">Limite</span><span className="text-right">Fatura</span><span className="text-right">Disponível</span><span />
          </div>
          {cartoes.map((c) => (
            <div key={c.id} className="grid grid-cols-[1fr_90px_90px_90px_28px] gap-2 items-center">
              <input value={c.nome} onChange={(e) => upd(setCartoes, c.id, "nome", e.target.value)}
                className="px-3 py-2 rounded-lg text-sm" style={{ background: "#F8FAF9", border: `1px solid ${C.line}` }} />
              <input value={c.limite} type="number" onChange={(e) => upd(setCartoes, c.id, "limite", +e.target.value)}
                className="px-2 py-2 rounded-lg text-sm text-right tabular-nums" style={{ background: "#EEF4FF", border: `1px solid ${C.line}`, color: C.blue }} />
              <input value={c.fatura} type="number" onChange={(e) => upd(setCartoes, c.id, "fatura", +e.target.value)}
                className="px-2 py-2 rounded-lg text-sm text-right tabular-nums" style={{ background: "#EEF4FF", border: `1px solid ${C.line}`, color: C.blue }} />
              <span className="text-sm text-right tabular-nums font-semibold" style={{ color: C.greenSoft }}>{brl((+c.limite || 0) - (+c.fatura || 0))}</span>
              <button onClick={() => setCartoes((p) => p.filter((x) => x.id !== c.id))} className="p-1"><Trash2 size={14} color={C.red} /></button>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 pt-3 border-t" style={{ borderColor: C.line }}>
          <span className="font-semibold text-sm" style={{ color: C.green }}>Total das faturas</span>
          <span className="font-bold" style={{ color: C.red }}>{brl(totFatura)}</span>
        </div>
      </Card>
    </div>
  );
}

/* ─── manual view ──────────────────────────────────────────────── */
function ManualView() {
  const blocks = [
    { icon: ListPlus, t: "Transações", d: "O coração do app. Registre cada gasto, receita, investimento ou dívida. Preencha data, tipo, categoria e valor. Todo o resto se atualiza sozinho." },
    { icon: Wallet, t: "Orçamento", d: "Mostra o realizado mês a mês, puxado automaticamente das transações. Serve como a base que alimenta as outras telas." },
    { icon: TrendingUp, t: "Rastreamento", d: "Acompanhe a evolução de receitas, despesas, poupança e investimentos ao longo do ano no gráfico de linha." },
    { icon: Calendar, t: "Mês a Mês", d: "Escolha um mês e veja o resumo focado nele, com as barras de meta por categoria mudando na hora." },
    { icon: LayoutDashboard, t: "Painel", d: "A visão geral: cards com seus totais do ano, taxa de poupança e os gráficos principais." },
    { icon: CreditCard, t: "Contas", d: "Liste seus bancos e cartões. O disponível de cada cartão é calculado sozinho (limite menos fatura)." },
    { icon: ShieldAlert, t: "Emergência", d: "Calcule sua reserva ideal, veja quanto falta e em quantos meses você chega lá." },
  ];
  return (
    <div className="space-y-4">
      <SectionTitle sub="Um guia rápido para aproveitar tudo">Como usar</SectionTitle>
      <Card className="p-5" style={{ background: "#F7F1E1", border: `1px solid ${C.gold}` }}>
        <p className="text-sm font-medium" style={{ color: C.green }}>
          A regra de ouro: você só precisa registrar suas transações. Todo o resto (gráficos, totais, metas e resumos) se preenche sozinho.
        </p>
      </Card>
      <div className="grid md:grid-cols-2 gap-3">
        {blocks.map((b) => (
          <Card key={b.t} className="p-4 flex gap-3">
            <div className="rounded-xl p-2.5 h-fit" style={{ background: `${C.greenSoft}14` }}>
              <b.icon size={18} style={{ color: C.greenSoft }} />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: C.green }}>{b.t}</h3>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: C.sub }}>{b.d}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
