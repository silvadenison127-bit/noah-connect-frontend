import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell
} from "recharts";
import {
  Users, Calendar, HeartHandshake, CalendarDays,
  HeartPulse, Brain, Activity, TrendingUp, Anchor, Wallet, ShieldCheck,
  AlertTriangle, AlertCircle, Info, ArrowRight, Sparkles
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const CORES_CELULA = ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"];

function Avatar({ nome, tamanho = 32 }) {
  const iniciais = nome?.split(" ").map((p) => p[0]).slice(0, 2).join("") || "?";
  return (
    <div
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.38 }}
      className="rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-semibold shrink-0"
    >
      {iniciais}
    </div>
  );
}

function CardEstatistica({ icone: Icone, label, valor, carregando }) {
  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 flex flex-col gap-3 min-w-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
          <Icone size={20} />
        </div>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">
        {carregando ? "..." : valor}
      </p>
    </div>
  );
}

const CORES_INDICADOR = {
  emerald: { icone: "text-emerald-400", bg: "bg-emerald-500/10", valor: "text-emerald-400" },
  violet: { icone: "text-violet-400", bg: "bg-violet-500/10", valor: "text-violet-400" },
  cyan: { icone: "text-cyan-400", bg: "bg-cyan-500/10", valor: "text-cyan-400" },
  amber: { icone: "text-amber-400", bg: "bg-amber-500/10", valor: "text-amber-400" },
  slate: { icone: "text-slate-400", bg: "bg-white/5", valor: "text-slate-300" },
};

function CardIndicador({ icone: Icone, label, valor, cor = "violet", carregando }) {
  const c = CORES_INDICADOR[cor] || CORES_INDICADOR.violet;
  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center ${c.icone} shrink-0`}>
          <Icone size={16} />
        </div>
        <p className="text-xs text-slate-400 truncate">{label}</p>
      </div>
      <p className={`text-xl font-bold ${c.valor}`}>
        {carregando ? "..." : valor}
      </p>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: "#15152A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 12 },
  labelStyle: { color: "#fff" },
  itemStyle: { color: "#C4B5FD" },
};

// ---------- Saúde da Igreja detalhada (Fase 4.1) ----------

const LABEL_CATEGORIA_SAUDE = {
  frequenciaCultos: "Frequência em Cultos",
  participacaoCelulas: "Participação em Células",
  participacaoMinisterios: "Participação em Ministérios",
  crescimento: "Crescimento de Membros",
  retencao: "Retenção",
  participacaoEventos: "Participação em Eventos",
};

function GaugeSaude({ percentual }) {
  const valorExibido = percentual ?? 0;
  const valorArco = Math.min(Math.max(valorExibido, 0), 100);
  const raio = 42;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia - (valorArco / 100) * circunferencia;

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={raio} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={raio} fill="none" stroke="#34D399" strokeWidth="8"
          strokeDasharray={circunferencia} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white">{percentual !== null ? `${percentual}%` : "--"}</span>
        <span className="text-[9px] text-slate-500">Saudável</span>
      </div>
    </div>
  );
}

function CardSaudeIgreja({ saude, carregando }) {
  const indicadores = saude?.indicadores ?? {};
  const categorias = Object.keys(LABEL_CATEGORIA_SAUDE).filter((k) => indicadores[k]);

  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
      <h3 className="font-semibold text-white mb-1">Saúde da Igreja</h3>
      <p className="text-xs text-slate-500 mb-4">Baseado em dados reais da plataforma</p>
      {carregando ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : (
        <div className="flex items-center gap-5">
          <GaugeSaude percentual={saude?.score ?? null} />
          <div className="flex-1 space-y-2 min-w-0">
            {categorias.map((chave) => {
              const item = indicadores[chave];
              const valor = item?.percentual;
              return (
                <div key={chave}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 truncate">{LABEL_CATEGORIA_SAUDE[chave]}</span>
                    <span className="text-slate-200 font-medium shrink-0 ml-2">
                      {valor === null || valor === undefined ? "Sem dado" : `${valor}%`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full"
                      style={{ width: `${Math.min(Math.max(valor ?? 0, 0), 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {indicadores.pedidosOracaoAtivos && (
              <p className="text-[11px] text-slate-500 pt-1">
                Pedidos de oração ativos: <span className="text-slate-300 font-medium">{indicadores.pedidosOracaoAtivos.total}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Alertas Inteligentes (Fase 4.2) ----------

const ESTILO_SEVERIDADE = {
  CRITICAL: { icone: AlertTriangle, cor: "text-rose-400", bg: "bg-rose-500/10" },
  WARNING: { icone: AlertCircle, cor: "text-amber-400", bg: "bg-amber-500/10" },
  INFO: { icone: Info, cor: "text-sky-400", bg: "bg-sky-500/10" },
};

function CardAlertas({ alertas, carregando }) {
  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Alertas Inteligentes (IA)</h3>
        {alertas?.length > 0 && (
          <span className="text-[10px] bg-amber-500/15 text-amber-300 font-medium px-2 py-0.5 rounded-full">
            {alertas.length}
          </span>
        )}
      </div>
      {carregando ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : !alertas || alertas.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum alerta no momento. Tudo em ordem! 🎉</p>
      ) : (
        <div className="space-y-3">
          {alertas.map((a) => {
            const estilo = ESTILO_SEVERIDADE[a.severidade] || ESTILO_SEVERIDADE.INFO;
            const Icone = estilo.icone;
            return (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${estilo.bg} flex items-center justify-center ${estilo.cor} shrink-0 mt-0.5`}>
                  <Icone size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{a.titulo}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{a.descricao}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Ações Sugeridas / Recomendações (Fase 4.3) ----------

const ROTA_POR_CATEGORIA = {
  "Frequência": "/cultos",
  "Financeiro": "/financeiro",
  "Células": "/celulas",
  "Ministérios": "/ministerios",
  "Eventos": "/eventos",
  "Visitantes": "/membros",
  "Membros": "/membros",
  "Sistema": "/configuracoes",
  "Segurança": "/configuracoes",
};

function CardRecomendacoes({ recomendacoes, carregando }) {
  const navigate = useNavigate();
  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
      <h3 className="font-semibold text-white mb-4">Ações Sugeridas pela IA</h3>
      {carregando ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : !recomendacoes || recomendacoes.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhuma ação pendente no momento.</p>
      ) : (
        <div className="space-y-3">
          {recomendacoes.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200 truncate">{r.acaoRecomendada}</p>
                <p className="text-[11px] text-slate-500">{r.areaResponsavel}</p>
              </div>
              <button
                onClick={() => navigate(ROTA_POR_CATEGORIA[r.categoria] || "/")}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium shrink-0"
              >
                Ver <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Previsões da IA (Fase 4.4 - infraestrutura, sem dado fictício) ----------

const LABEL_METRICA_PREVISAO = {
  membros: "Membros",
  dizimos: "Dízimos",
  batismos: "Batismos",
  visitantes: "Visitantes",
};

function CardPrevisoes({ previsoes, carregando }) {
  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-violet-400" />
        <h3 className="font-semibold text-white">Previsões da IA</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">Baseado em dados históricos</p>
      {carregando ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {previsoes?.map((p) => (
            <div key={p.metrica} className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">{LABEL_METRICA_PREVISAO[p.metrica] || p.metrica}</p>
              <p className="text-[11px] text-slate-500 leading-snug">{p.mensagem}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [membros, setMembros] = useState([]);
  const [celulas, setCelulas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const [statsRes, eventosRes] = await Promise.all([
          api.get("/dashboard").catch(() => ({ data: null })),
          api.get("/eventos").catch(() => ({ data: [] })),
        ]);

        setStats(statsRes.data);
        setEventos(eventosRes.data.slice(0, 5));

        if (usuario?.tipo === "admin") {
          const [pedidosRes, membrosRes, celulasRes] = await Promise.all([
            api.get("/oracao").catch(() => ({ data: [] })),
            api.get("/membros").catch(() => ({ data: [] })),
            api.get("/celulas").catch(() => ({ data: [] })),
          ]);
          setPedidos(pedidosRes.data.slice(0, 5));
          setMembros(membrosRes.data.slice(0, 4));
          setCelulas(celulasRes.data);
        } else {
          const meusRes = await api.get("/oracao/meus").catch(() => ({ data: [] }));
          setPedidos(meusRes.data.slice(0, 5));
        }
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [usuario]);

  const totalMembros = stats?.membros_ativos ?? 0;
  const indicadores = stats?.indicadores ?? {};
  const saudeDetalhada = stats?.saude_detalhada ?? null;
  const alertas = stats?.alertas ?? [];
  const recomendacoes = stats?.recomendacoes ?? [];
  const previsoes = stats?.previsoes ?? [];

  // Série real de crescimento (Fase 4.5), formatada para o gráfico
  const serieMembros = stats?.historico?.membros?.serie ?? [];
  const dadosCrescimento = serieMembros.map((p) => ({
    mes: new Date(`${p.periodo}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    membros: p.valor,
  }));

  const totalEmCelulas = celulas.reduce((soma, c) => soma + parseInt(c.total_membros, 10), 0);
  const semCelula = Math.max(totalMembros - totalEmCelulas, 0);

  const dadosCelulas = celulas.length > 0
    ? [
        ...celulas.map((c) => ({ nome: c.nome, valor: parseInt(c.total_membros, 10) })),
        ...(semCelula > 0 ? [{ nome: "Sem célula", valor: semCelula }] : []),
      ]
    : [{ nome: "Nenhuma célula cadastrada", valor: 1 }];

  const financeiro = stats?.financeiro ?? { entradas: 0, saidas: 0, saldo: 0 };

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <>
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">
            Bem-vindo, {usuario?.nome?.split(" ")[0] || "Administrador"}! 👋
          </h2>
          <p className="text-sm text-slate-400">
            Veja o resumo geral do que está acontecendo na Igreja Noah hoje.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0F0F1E] border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 shadow-sm">
          <Calendar size={15} />
          {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* KPIs ESTRATÉGICOS (Fase 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <CardIndicador icone={HeartPulse} label="Igreja Saudável" valor={indicadores.igreja_saudavel?.label ?? "..."} cor="emerald" carregando={carregando} />
        <CardIndicador icone={Brain} label="IA Score" valor={indicadores.ia_score?.label ?? "..."} cor="violet" carregando={carregando} />
        <CardIndicador icone={Activity} label="Engajamento" valor={indicadores.engajamento?.label ?? "..."} cor="cyan" carregando={carregando} />
        <CardIndicador icone={TrendingUp} label="Crescimento" valor={indicadores.crescimento?.label ?? "..."} cor="emerald" carregando={carregando} />
        <CardIndicador icone={Anchor} label="Retenção" valor={indicadores.retencao?.label ?? "..."} cor="amber" carregando={carregando} />
        <CardIndicador icone={Wallet} label="Financeiro" valor={indicadores.financeiro_status?.label ?? "..."} cor={indicadores.financeiro_status?.saudavel ? "emerald" : "amber"} carregando={carregando} />
        <CardIndicador icone={ShieldCheck} label="Segurança" valor={indicadores.seguranca?.label ?? "..."} cor="slate" carregando={carregando} />
      </div>

      {/* CARDS OPERACIONAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardEstatistica icone={Users} label="Membros Ativos" valor={totalMembros.toLocaleString("pt-BR")} carregando={carregando} />
        <CardEstatistica icone={HeartHandshake} label="Pedidos de Oração" valor={stats?.pedidos_em_oracao ?? 0} carregando={carregando} />
        <CardEstatistica icone={CalendarDays} label="Eventos este Mês" valor={stats?.eventos_este_mes ?? 0} carregando={carregando} />
        <CardEstatistica icone={Calendar} label="Próximos Eventos" valor={eventos.length} carregando={carregando} />
      </div>

      {/* GRÁFICO (histórico real) + EVENTOS + PEDIDOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Crescimento de Membros</h3>
            <span className="text-[10px] text-slate-500">Últimos 12 meses</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosCrescimento}>
                <defs>
                  <linearGradient id="gradMembros" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="membros" stroke="#A78BFA" strokeWidth={2.5} fill="url(#gradMembros)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Próximos Eventos</h3>
            <button className="text-xs text-violet-400 font-medium">Ver todos</button>
          </div>
          {carregando ? (
            <p className="text-sm text-slate-500">Carregando...</p>
          ) : eventos.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum evento cadastrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {eventos.map((ev) => {
                const data = new Date(ev.data_inicio);
                const dia = data.toLocaleDateString("pt-BR", { day: "2-digit" });
                const mes = data.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", "");
                const amanha = new Date(); amanha.setDate(amanha.getDate() + 1);
                const isAmanha = data.toDateString() === amanha.toDateString();
                return (
                  <div key={ev.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex flex-col items-center justify-center text-violet-400 shrink-0">
                      <span className="text-sm font-bold leading-none">{dia}</span>
                      <span className="text-[10px] leading-none mt-0.5">{mes}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{ev.titulo}</p>
                      <p className="text-xs text-slate-500">
                        {data.toLocaleDateString("pt-BR", { weekday: "long" })}, {data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {isAmanha && (
                      <span className="text-[10px] bg-violet-500/15 text-violet-300 font-medium px-2 py-1 rounded-full shrink-0">Amanhã</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Pedidos de Oração Recentes</h3>
            <button className="text-xs text-violet-400 font-medium">Ver todos</button>
          </div>
          {carregando ? (
            <p className="text-sm text-slate-500">Carregando...</p>
          ) : pedidos.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum pedido ainda.</p>
          ) : (
            <div className="space-y-3">
              {pedidos.map((p) => {
                const criado = new Date(p.criado_em);
                const agora = new Date();
                const diffH = Math.floor((agora - criado) / 3600000);
                const quando = diffH < 1 ? "Agora mesmo" : diffH < 24 ? `Há ${diffH} horas` : `Há ${Math.floor(diffH / 24)} dia${Math.floor(diffH / 24) > 1 ? "s" : ""}`;
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <Avatar nome={p.anonimo ? "Anônimo" : p.nome_solicitante} tamanho={32} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{p.titulo || "Pedido de oração"}</p>
                      <p className="text-xs text-slate-500 truncate">{p.anonimo ? "Anônimo" : p.nome_solicitante}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{quando}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FINANCEIRO + CÉLULAS + ÚLTIMOS CADASTROS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Resumo Financeiro</h3>
            <span className="text-[10px] text-slate-500">Este mês</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-300"><span className="w-2 h-2 rounded-full bg-emerald-400" />Entradas</span>
              <span className="text-sm font-semibold text-slate-100">{carregando ? "..." : formatarMoeda(financeiro.entradas)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-300"><span className="w-2 h-2 rounded-full bg-rose-400" />Saídas</span>
              <span className="text-sm font-semibold text-slate-100">{carregando ? "..." : formatarMoeda(financeiro.saidas)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="flex items-center gap-2 text-sm text-slate-300"><span className="w-2 h-2 rounded-full bg-violet-400" />Saldo</span>
              <span className="text-sm font-bold text-violet-400">{carregando ? "..." : formatarMoeda(financeiro.saldo)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <h3 className="font-semibold text-white mb-4">Membros por Célula</h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosCelulas} dataKey="valor" innerRadius={42} outerRadius={62} paddingAngle={2}>
                    {dadosCelulas.map((_, i) => (<Cell key={i} fill={CORES_CELULA[i % CORES_CELULA.length]} stroke="none" />))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{totalMembros.toLocaleString("pt-BR")}</span>
                <span className="text-[10px] text-slate-500">Total</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 text-sm min-w-0">
              {dadosCelulas.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-slate-300 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CORES_CELULA[i % CORES_CELULA.length] }} />
                    {c.nome}
                  </span>
                  <span className="text-slate-200 font-medium shrink-0 text-xs">{c.valor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Últimos Cadastros</h3>
            <button className="text-xs text-violet-400 font-medium">Ver todos</button>
          </div>
          {carregando ? (
            <p className="text-sm text-slate-500">Carregando...</p>
          ) : membros.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum membro cadastrado ainda.</p>
          ) : (
            <div className="space-y-3">
              {membros.map((m) => {
                const criado = new Date(m.membro_desde);
                const agora = new Date();
                const diffH = Math.floor((agora - criado) / 3600000);
                const quando = diffH < 1 ? "Agora mesmo" : diffH < 24 ? `Há ${diffH} horas` : `Há ${Math.floor(diffH / 24)} dia${Math.floor(diffH / 24) > 1 ? "s" : ""}`;
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <Avatar nome={m.nome} tamanho={32} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{m.nome}</p>
                      <p className="text-xs text-slate-500 capitalize">{m.tipo}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{quando}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SAÚDE DA IGREJA + ALERTAS + AÇÕES SUGERIDAS (Fase 4.1 / 4.2 / 4.3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CardSaudeIgreja saude={saudeDetalhada} carregando={carregando} />
        <CardAlertas alertas={alertas} carregando={carregando} />
        <CardRecomendacoes recomendacoes={recomendacoes} carregando={carregando} />
      </div>

      {/* PREVISÕES DA IA (Fase 4.4) */}
      <div className="grid grid-cols-1 gap-4">
        <CardPrevisoes previsoes={previsoes} carregando={carregando} />
      </div>
    </>
  );
}
