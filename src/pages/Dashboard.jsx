import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell
} from "recharts";
import { Users, Calendar, HeartHandshake, Wallet, CalendarDays } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

// Dados de exemplo para o gráfico de crescimento (serão substituídos por dados reais futuramente)
const dadosCrescimento = [
  { mes: "Jan", membros: 0 },
  { mes: "Fev", membros: 0 },
  { mes: "Mar", membros: 0 },
  { mes: "Abr", membros: 0 },
  { mes: "Mai", membros: 0 },
  { mes: "Jun", membros: 0 },
  { mes: "Jul", membros: 0 },
  { mes: "Ago", membros: 0 },
  { mes: "Set", membros: 0 },
  { mes: "Out", membros: 0 },
  { mes: "Nov", membros: 0 },
  { mes: "Dez", membros: 0 },
];

const CORES_CELULA = ["#6C3BFF", "#9B6BFF", "#C4A8FF", "#E4D6FF", "#F1ECFF"];

function Avatar({ nome, tamanho = 32 }) {
  const iniciais = nome?.split(" ").map((p) => p[0]).slice(0, 2).join("") || "?";
  return (
    <div
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.38 }}
      className="rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-white flex items-center justify-center font-semibold shrink-0"
    >
      {iniciais}
    </div>
  );
}

function CardEstatistica({ icone: Icone, label, valor, variacao, carregando }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 min-w-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
          <Icone size={20} />
        </div>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 tabular-nums">
          {carregando ? "..." : valor}
        </p>
        {variacao && (
          <p className="text-xs text-emerald-500 font-medium mt-0.5">{variacao}</p>
        )}
      </div>
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
  const [crescimento, setCrescimento] = useState(dadosCrescimento);
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

        // Atualiza o gráfico com o total real de membros no mês atual
        if (statsRes.data?.membros_ativos) {
          const mesAtual = new Date().getMonth();
          setCrescimento(prev =>
            prev.map((d, i) => i <= mesAtual
              ? { ...d, membros: Math.round(statsRes.data.membros_ativos * ((i + 1) / (mesAtual + 1))) }
              : d
            )
          );
        }

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

  // Dados reais do donut de células (a partir das células cadastradas)
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
          <h2 className="text-xl font-bold text-slate-800">
            Bem-vindo, {usuario?.nome?.split(" ")[0] || "Administrador"}! 👋
          </h2>
          <p className="text-sm text-slate-500">
            Veja o resumo geral do que está acontecendo na Igreja Noah hoje.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-600 shadow-sm">
          <Calendar size={15} />
          {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* CARDS DE ESTATÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardEstatistica
          icone={Users}
          label="Membros Ativos"
          valor={totalMembros.toLocaleString("pt-BR")}
          carregando={carregando}
        />
        <CardEstatistica
          icone={HeartHandshake}
          label="Pedidos de Oração"
          valor={stats?.pedidos_em_oracao ?? 0}
          carregando={carregando}
        />
        <CardEstatistica
          icone={CalendarDays}
          label="Eventos este Mês"
          valor={stats?.eventos_este_mes ?? 0}
          carregando={carregando}
        />
        <CardEstatistica
          icone={Calendar}
          label="Próximos Eventos"
          valor={eventos.length}
          carregando={carregando}
        />
      </div>

      {/* GRÁFICO + EVENTOS + PEDIDOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Gráfico de crescimento */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Crescimento de Membros</h3>
            <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-500">
              <option>Este ano</option>
            </select>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={crescimento}>
                <defs>
                  <linearGradient id="gradMembros" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6C3BFF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6C3BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="membros" stroke="#6C3BFF" strokeWidth={2.5} fill="url(#gradMembros)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Próximos Eventos</h3>
            <button className="text-xs text-violet-600 font-medium">Ver todos</button>
          </div>
          {carregando ? (
            <p className="text-sm text-slate-400">Carregando...</p>
          ) : eventos.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum evento cadastrado ainda.</p>
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
                    <div className="w-12 h-12 rounded-xl bg-violet-50 flex flex-col items-center justify-center text-violet-600 shrink-0">
                      <span className="text-sm font-bold leading-none">{dia}</span>
                      <span className="text-[10px] leading-none mt-0.5">{mes}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{ev.titulo}</p>
                      <p className="text-xs text-slate-400">
                        {data.toLocaleDateString("pt-BR", { weekday: "long" })}, {data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {isAmanha && (
                      <span className="text-[10px] bg-violet-100 text-violet-600 font-medium px-2 py-1 rounded-full shrink-0">Amanhã</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pedidos de Oração */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Pedidos de Oração Recentes</h3>
            <button className="text-xs text-violet-600 font-medium">Ver todos</button>
          </div>
          {carregando ? (
            <p className="text-sm text-slate-400">Carregando...</p>
          ) : pedidos.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum pedido ainda.</p>
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
                      <p className="text-sm font-medium text-slate-800 truncate">{p.titulo || "Pedido de oração"}</p>
                      <p className="text-xs text-slate-400 truncate">{p.anonimo ? "Anônimo" : p.nome_solicitante}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{quando}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FINANCEIRO + CÉLULAS + ÚLTIMOS CADASTROS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Resumo Financeiro */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Resumo Financeiro</h3>
            <select className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-500">
              <option>Este mês</option>
            </select>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />Entradas
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {carregando ? "..." : formatarMoeda(financeiro.entradas)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-2 h-2 rounded-full bg-rose-500" />Saídas
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {carregando ? "..." : formatarMoeda(financeiro.saidas)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-2 h-2 rounded-full bg-violet-600" />Saldo
              </span>
              <span className="text-sm font-bold text-violet-600">
                {carregando ? "..." : formatarMoeda(financeiro.saldo)}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Registro de saídas em breve.</p>
        </div>

        {/* Donut Membros por Célula */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Membros por Célula</h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosCelulas} dataKey="valor" innerRadius={42} outerRadius={62} paddingAngle={2}>
                    {dadosCelulas.map((_, i) => (
                      <Cell key={i} fill={CORES_CELULA[i % CORES_CELULA.length]} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-800">{totalMembros.toLocaleString("pt-BR")}</span>
                <span className="text-[10px] text-slate-400">Total</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5 text-sm min-w-0">
              {dadosCelulas.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-slate-600 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CORES_CELULA[i % CORES_CELULA.length] }} />
                    {c.nome}
                  </span>
                  <span className="text-slate-700 font-medium shrink-0 text-xs">{c.valor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Últimos Cadastros */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Últimos Cadastros</h3>
            <button className="text-xs text-violet-600 font-medium">Ver todos</button>
          </div>
          {carregando ? (
            <p className="text-sm text-slate-400">Carregando...</p>
          ) : membros.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum membro cadastrado ainda.</p>
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
                      <p className="text-sm font-medium text-slate-800 truncate">{m.nome}</p>
                      <p className="text-xs text-slate-400 capitalize">{m.tipo}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{quando}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
