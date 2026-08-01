import React from "react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import {
  BarChart3, Users, UserPlus, ClipboardCheck, Wallet, CalendarDays,
  HeartHandshake, Users2, BookOpen, Megaphone, Droplet, Anchor,
  GraduationCap, Sparkles, Circle, RefreshCw, Download, MapPin, Database,
} from "lucide-react";
import CardIndicador from "../components/CardIndicador";

const tooltipStyle = {
  contentStyle: { background: "#15152A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 11 },
  labelStyle: { color: "#fff" },
  itemStyle: { color: "#C4B5FD" },
};

const ZERO_SPARK = [0, 0, 0, 0, 0, 0, 0];

const KPIS = [
  { icone: Users, label: "Membros Ativos", valor: "0", variacao: "0%", cor: "violet", sparkline: ZERO_SPARK },
  { icone: UserPlus, label: "Novos Membros", valor: "0", variacao: "0%", cor: "emerald", sparkline: ZERO_SPARK },
  { icone: ClipboardCheck, label: "Frequencia Media", valor: "0%", variacao: "0%", cor: "cyan", sparkline: ZERO_SPARK },
  { icone: Wallet, label: "Dizimos e Ofertas", valor: "R$ 0,00", variacao: "0%", cor: "emerald", sparkline: ZERO_SPARK },
  { icone: CalendarDays, label: "Eventos", valor: "0", variacao: "0%", cor: "amber", sparkline: ZERO_SPARK },
  { icone: HeartHandshake, label: "Ministerios", valor: "0", variacao: "0%", cor: "cyan", sparkline: ZERO_SPARK },
  { icone: Users2, label: "Celulas", valor: "0", variacao: "0%", cor: "cyan", sparkline: ZERO_SPARK },
  { icone: BookOpen, label: "Discipulado", valor: "0%", variacao: "0%", cor: "violet", sparkline: ZERO_SPARK },
  { icone: Megaphone, label: "Evangelismo", valor: "0", variacao: "0%", cor: "amber", sparkline: ZERO_SPARK },
  { icone: Droplet, label: "Batismos", valor: "0", variacao: "0%", cor: "emerald", sparkline: ZERO_SPARK },
  { icone: Anchor, label: "Retencao", valor: "0%", variacao: "0%", cor: "amber", sparkline: ZERO_SPARK },
  { icone: GraduationCap, label: "Cursos", valor: "0", variacao: "0%", cor: "violet", sparkline: ZERO_SPARK },
  { icone: Sparkles, label: "IA Insights", valor: "0", variacao: "0%", cor: "violet", sparkline: ZERO_SPARK },
];

const CRESCIMENTO_MOCK = [
  { mes: "Fev", membros: 0 }, { mes: "Mar", membros: 0 }, { mes: "Abr", membros: 0 },
  { mes: "Mai", membros: 0 }, { mes: "Jun", membros: 0 }, { mes: "Jul", membros: 0 },
];

const FINANCEIRO_MOCK = [
  { mes: "Fev", saldo: 0 }, { mes: "Mar", saldo: 0 }, { mes: "Abr", saldo: 0 },
  { mes: "Mai", saldo: 0 }, { mes: "Jun", saldo: 0 }, { mes: "Jul", saldo: 0 },
];

const RETENCAO_MOCK = [
  { nome: "Retidos", valor: 0 },
  { nome: "Restante", valor: 100 },
];

const CORES_RETENCAO = ["#8B5CF6", "rgba(255,255,255,0.08)"];

const BOTOES_HERO = [
  { label: "Periodo", icone: CalendarDays },
  { label: "Campus", icone: MapPin },
  { label: "Exportar", icone: Download },
  { label: "Atualizar", icone: RefreshCw },
];

const BADGES_STATUS = [
  { icone: Circle, cor: "text-emerald-400", texto: "Banco: Aguardando conexao" },
  { icone: RefreshCw, cor: "text-slate-400", texto: "Ultima atualizacao: Sem sincronizacao" },
  { icone: BarChart3, cor: "text-violet-400", texto: "Registros processados: 0" },
];

export default function ExecutiveBI() {
  return (
    <div className="space-y-4">
      {/* HERO COMPACTO */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-[#0F0F1E] to-[#0F0F1E]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.10),transparent_60%)]" />
        <div className="relative flex items-start justify-between gap-4 px-5 py-3.5 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-900/40 shrink-0">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h1 className="text-base font-bold text-white">Executive BI</h1>
                <span className="text-[11px] font-medium text-violet-300">Business Intelligence Executivo</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-2xl">
                Transforme dados em decisoes estrategicas. Uma visao 360° da igreja baseada em indicadores.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[10px] font-medium text-violet-300 bg-violet-500/15 border border-violet-500/30 rounded-full px-2.5 py-0.5">
              Modo Demonstracao
            </span>

            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {BOTOES_HERO.map((b) => {
                const Icone = b.icone;
                return (
                  <button
                    key={b.label}
                    disabled
                    className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 opacity-50 cursor-not-allowed"
                  >
                    <Icone size={12} />
                    {b.label}
                  </button>
                );
              })}
              {BADGES_STATUS.map((b) => {
                const Icone = b.icone;
                return (
                  <span
                    key={b.texto}
                    className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-white/5 border border-white/10 rounded-full px-2.5 py-1"
                  >
                    <Icone size={10} className={b.cor} />
                    {b.texto}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* GRID DE KPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-3">
        {KPIS.map((kpi) => (
          <CardIndicador
            key={kpi.label}
            icone={kpi.icone}
            label={kpi.label}
            valor={kpi.valor}
            variacao={kpi.variacao}
            cor={kpi.cor}
            sparkline={kpi.sparkline}
          />
        ))}
      </div>

      {/* GRID ANALYTICS - 3 GRAFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4">
          <h3 className="text-xs font-semibold text-slate-300 mb-2">Crescimento</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CRESCIMENTO_MOCK}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} domain={[0, 10]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="membros" stroke="#A78BFA" strokeWidth={2.5} dot={{ r: 3, fill: "#A78BFA" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4">
          <h3 className="text-xs font-semibold text-slate-300 mb-2">Financeiro</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FINANCEIRO_MOCK}>
                <defs>
                  <linearGradient id="gradFinanceiroBI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} domain={[0, 10]} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="saldo" stroke="#34D399" strokeWidth={2.5} fill="url(#gradFinanceiroBI)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4">
          <h3 className="text-xs font-semibold text-slate-300 mb-2">Retencao</h3>
          <div className="h-[250px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={RETENCAO_MOCK} dataKey="valor" innerRadius={55} outerRadius={80} paddingAngle={2} startAngle={90} endAngle={-270}>
                  {RETENCAO_MOCK.map((_, i) => (<Cell key={i} fill={CORES_RETENCAO[i]} stroke="none" />))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white">0%</span>
              <span className="text-[10px] text-slate-500">Retencao</span>
            </div>
          </div>
        </div>
      </div>

      {/* GRID OPERACIONAL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <CardIndicador icone={HeartHandshake} label="Ministerios" valor="0 ativos" cor="cyan" />
        <CardIndicador icone={CalendarDays} label="Eventos" valor="0 este mes" cor="amber" />
        <CardIndicador icone={ClipboardCheck} label="Frequencia" valor="0%" cor="violet" />
        <CardIndicador icone={Sparkles} label="IA Insights" valor="0 insights" cor="violet" />
      </div>

      {/* ESTADO VAZIO ELEGANTE */}
      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm px-6 py-8 flex flex-col items-center text-center gap-2">
        <Database size={26} className="text-slate-600 mb-1" />
        <h3 className="text-sm font-semibold text-slate-300">Nenhum dado disponivel no momento</h3>
        <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
          Os indicadores serao preenchidos automaticamente conforme os modulos da igreja forem sendo
          utilizados. Assim que houver movimentacao de membros, eventos, financas, celulas, cursos e
          demais modulos, o Executive BI sera atualizado automaticamente.
        </p>
      </div>

      {/* RODAPE INFORMATIVO */}
      <div className="text-center pt-1 space-y-0.5">
        <p className="text-[10px] text-slate-500 font-medium">Fonte dos dados</p>
        <p className="text-[10px] text-slate-600">
          Membros • Financeiro • Eventos • Celulas • Ministerios • Cursos • Agenda • IA Noah
        </p>
      </div>
    </div>
  );
}