import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import {
  Users, Users2, CalendarDays, HeartHandshake, Wallet, Sparkles, Calendar,
  AlertTriangle, AlertCircle, Info,
} from "lucide-react";
import api from "../services/api";
import CardIndicador from "../components/CardIndicador";
import { useAuth } from "../context/AuthContext";

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

const tooltipStyle = {
  contentStyle: { background: "#15152A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 12 },
  labelStyle: { color: "#fff" },
  itemStyle: { color: "#C4B5FD" },
};

const ESTILO_SEVERIDADE = {
  CRITICAL: { icone: AlertTriangle, cor: "text-rose-400", bg: "bg-rose-500/10" },
  WARNING: { icone: AlertCircle, cor: "text-amber-400", bg: "bg-amber-500/10" },
  INFO: { icone: Info, cor: "text-sky-400", bg: "bg-sky-500/10" },
};

function CardAlertas({ alertas, carregando }) {
  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white text-sm">Alertas Inteligentes (IA)</h3>
        {alertas?.length > 0 && (
          <span className="text-[10px] bg-amber-500/15 text-amber-300 font-medium px-2 py-0.5 rounded-full">
            {alertas.length}
          </span>
        )}
      </div>
      {carregando ? (
        <p className="text-xs text-slate-500">Carregando...</p>
      ) : !alertas || alertas.length === 0 ? (
        <p className="text-xs text-slate-500">Nenhum alerta no momento. Tudo em ordem!</p>
      ) : (
        <div className="space-y-2.5 overflow-y-auto">
          {alertas.slice(0, 3).map((a) => {
            const estilo = ESTILO_SEVERIDADE[a.severidade] || ESTILO_SEVERIDADE.INFO;
            const Icone = estilo.icone;
            return (
              <div key={a.id} className="flex items-start gap-2.5">
                <div className={`w-7 h-7 rounded-lg ${estilo.bg} flex items-center justify-center ${estilo.cor} shrink-0 mt-0.5`}>
                  <Icone size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white leading-snug">{a.titulo}</p>
                </div>
              </div>
            );
          })}
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
        setEventos(eventosRes.data.slice(0, 4));

        if (usuario?.tipo === "admin") {
          const [pedidosRes, membrosRes, celulasRes] = await Promise.all([
            api.get("/oracao").catch(() => ({ data: [] })),
            api.get("/membros").catch(() => ({ data: [] })),
            api.get("/celulas").catch(() => ({ data: [] })),
          ]);
          setPedidos(pedidosRes.data.slice(0, 4));
          setMembros(membrosRes.data.slice(0, 4));
          setCelulas(celulasRes.data);
        } else {
          const meusRes = await api.get("/oracao/meus").catch(() => ({ data: [] }));
          setPedidos(meusRes.data.slice(0, 4));
        }
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [usuario]);

  const totalMembros = stats?.membros_ativos ?? 0;
  const indicadores = stats?.indicadores ?? {};
  const alertas = stats?.alertas ?? [];
  const financeiro = stats?.financeiro ?? { entradas: 0, saidas: 0, saldo: 0 };

  const serieMembros = stats?.historico?.membros?.serie ?? [];
  const dadosCrescimento = serieMembros.map((p) => ({
    mes: new Date(`${p.periodo}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    membros: p.valor,
  }));

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">
            Bem-vindo, {usuario?.nome?.split(" ")[0] || "Administrador"}!
          </h2>
          <p className="text-xs text-slate-400">
            Resumo executivo da Igreja Noah hoje.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0F0F1E] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 shadow-sm">
          <Calendar size={13} />
          {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <CardIndicador icone={Users} label="Membros" valor={totalMembros.toLocaleString("pt-BR")} cor="violet" carregando={carregando} />
        <CardIndicador icone={Users2} label="Células" valor={celulas.length} cor="cyan" carregando={carregando} />
        <CardIndicador icone={CalendarDays} label="Eventos" valor={stats?.eventos_este_mes ?? 0} cor="amber" carregando={carregando} />
        <CardIndicador icone={HeartHandshake} label="Pedidos de Oração" valor={stats?.pedidos_em_oracao ?? 0} cor="emerald" carregando={carregando} />
        <CardIndicador icone={Wallet} label="Financeiro" valor={formatarMoeda(financeiro.saldo)} cor={indicadores.financeiro_status?.saudavel ? "emerald" : "amber"} carregando={carregando} />
        <CardIndicador icone={Sparkles} label="IA Noah" valor={indicadores.ia_score?.label ?? "..."} cor="violet" carregando={carregando} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white text-sm">Crescimento da Igreja</h3>
            <span className="text-[10px] text-slate-500">Últimos 12 meses</span>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosCrescimento}>
                <defs>
                  <linearGradient id="gradMembros" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="membros" stroke="#A78BFA" strokeWidth={2.5} fill="url(#gradMembros)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white text-sm">Próximos Eventos</h3>
          </div>
          {carregando ? (
            <p className="text-xs text-slate-500">Carregando...</p>
          ) : eventos.length === 0 ? (
            <p className="text-xs text-slate-500">Nenhum evento cadastrado ainda.</p>
          ) : (
            <div className="space-y-2.5 overflow-y-auto">
              {eventos.map((ev) => {
                const data = new Date(ev.data_inicio);
                const dia = data.toLocaleDateString("pt-BR", { day: "2-digit" });
                const mes = data.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", "");
                return (
                  <div key={ev.id} className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex flex-col items-center justify-center text-violet-400 shrink-0">
                      <span className="text-xs font-bold leading-none">{dia}</span>
                      <span className="text-[9px] leading-none mt-0.5">{mes}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white truncate">{ev.titulo}</p>
                      <p className="text-[10px] text-slate-500">
                        {data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3" style={{ flexBasis: "220px", flexShrink: 0 }}>
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 flex flex-col">
          <h3 className="font-semibold text-white text-sm mb-3">Pedidos Recentes</h3>
          {carregando ? (
            <p className="text-xs text-slate-500">Carregando...</p>
          ) : pedidos.length === 0 ? (
            <p className="text-xs text-slate-500">Nenhum pedido ainda.</p>
          ) : (
            <div className="space-y-2.5 overflow-y-auto">
              {pedidos.map((p) => (
                <div key={p.id} className="flex items-center gap-2.5">
                  <Avatar nome={p.anonimo ? "Anônimo" : p.nome_solicitante} tamanho={28} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate">{p.titulo || "Pedido de oração"}</p>
                    <p className="text-[10px] text-slate-500 truncate">{p.anonimo ? "Anônimo" : p.nome_solicitante}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 flex flex-col">
          <h3 className="font-semibold text-white text-sm mb-3">Últimos Cadastros</h3>
          {carregando ? (
            <p className="text-xs text-slate-500">Carregando...</p>
          ) : membros.length === 0 ? (
            <p className="text-xs text-slate-500">Nenhum membro cadastrado ainda.</p>
          ) : (
            <div className="space-y-2.5 overflow-y-auto">
              {membros.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5">
                  <Avatar nome={m.nome} tamanho={28} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate">{m.nome}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{m.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <CardAlertas alertas={alertas} carregando={carregando} />
      </div>
    </div>
  );
}