import React, { useEffect, useState } from "react";
import {
  Users, UserCog, Wallet, Church, HeartHandshake, CalendarDays,
  Newspaper, Megaphone, GraduationCap, BookOpen, Layers, ChevronDown,
  Landmark, ShieldCheck, ShieldAlert, ShieldX, CheckCircle2, AlertCircle,
  XCircle, HelpCircle, HeartPulse, Brain, Activity, TrendingUp, Anchor
} from "lucide-react";
import api from "../services/api";
import CardEstatistica from "./CardEstatistica";

function exibir(kpi, { moeda = false } = {}) {
  if (!kpi) return "...";
  switch (kpi.estado) {
    case "real":
      return moeda
        ? Number(kpi.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : Number(kpi.valor).toLocaleString("pt-BR");
    case "aguardando_dados":
      return "Aguardando dados";
    case "indisponivel":
      return "Não disponível";
    case "erro":
      return "—";
    default:
      return "...";
  }
}

const ESTILO_SEGURANCA = {
  seguro: { icone: ShieldCheck, cor: "text-emerald-400", bg: "bg-emerald-500/10", label: "Seguro" },
  atencao: { icone: ShieldAlert, cor: "text-amber-400", bg: "bg-amber-500/10", label: "Atenção" },
  critico: { icone: ShieldX, cor: "text-rose-400", bg: "bg-rose-500/10", label: "Crítico" },
};

const ESTILO_STATUS_CRITERIO = {
  ok: { icone: CheckCircle2, cor: "text-emerald-400" },
  atencao: { icone: AlertCircle, cor: "text-amber-400" },
  erro: { icone: XCircle, cor: "text-rose-400" },
  nao_validado: { icone: HelpCircle, cor: "text-slate-500" },
};

function CardSeguranca({ seguranca, carregando }) {
  const [expandido, setExpandido] = useState(false);

  if (carregando) {
    return (
      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
        <p className="text-sm text-slate-500">Carregando segurança...</p>
      </div>
    );
  }

  if (!seguranca || seguranca.status !== "real") {
    return (
      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
        <p className="text-sm text-slate-500">Não foi possível avaliar a segurança.</p>
      </div>
    );
  }

  const estilo = ESTILO_SEGURANCA[seguranca.classificacao] || ESTILO_SEGURANCA.atencao;
  const Icone = estilo.icone;

  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${estilo.bg} flex items-center justify-center ${estilo.cor}`}>
            <Icone size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-400">Segurança do Sistema</p>
            <p className={`text-lg font-bold ${estilo.cor}`}>{estilo.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500">Nota</p>
            <p className="text-xl font-bold text-white tabular-nums">{seguranca.nota}/100</p>
          </div>
          <button
            onClick={() => setExpandido((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
          >
            {expandido ? "Ocultar critérios" : "Ver critérios"}
            <ChevronDown size={14} className={`transition-transform ${expandido ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {expandido && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5">
          {seguranca.criterios.map((c) => {
            const s = ESTILO_STATUS_CRITERIO[c.status] || ESTILO_STATUS_CRITERIO.nao_validado;
            const IconeStatus = s.icone;
            return (
              <div key={c.nome} className="flex items-start gap-2.5">
                <IconeStatus size={16} className={`${s.cor} shrink-0 mt-0.5`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-200">{c.nome}</p>
                  <p className="text-xs text-slate-500">{c.descricao}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Cores por indicador inteligente (badge compacto)
const CORES_INDICADOR = {
  emerald: { icone: "text-emerald-400", bg: "bg-emerald-500/10", valor: "text-emerald-400" },
  violet: { icone: "text-violet-400", bg: "bg-violet-500/10", valor: "text-violet-400" },
  cyan: { icone: "text-cyan-400", bg: "bg-cyan-500/10", valor: "text-cyan-400" },
  amber: { icone: "text-amber-400", bg: "bg-amber-500/10", valor: "text-amber-400" },
  rose: { icone: "text-rose-400", bg: "bg-rose-500/10", valor: "text-rose-400" },
  slate: { icone: "text-slate-400", bg: "bg-white/5", valor: "text-slate-300" },
};

function CardIndicadorInteligente({ icone: Icone, label, rotulo, cor, carregando }) {
  const c = CORES_INDICADOR[cor] || CORES_INDICADOR.slate;
  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center ${c.icone} shrink-0`}>
          <Icone size={16} />
        </div>
        <p className="text-xs text-slate-400 truncate">{label}</p>
      </div>
      <p className={`text-lg font-bold ${c.valor} truncate`}>
        {carregando ? "..." : rotulo}
      </p>
    </div>
  );
}

// Deriva a cor de cada indicador a partir do seu estado/classificação real.
function corIgrejaSaudavel(kpi) {
  if (!kpi || kpi.estado !== "real") return "slate";
  if (kpi.valor >= 70) return "emerald";
  if (kpi.valor >= 40) return "amber";
  return "rose";
}
function corIaScore(kpi) {
  if (!kpi || kpi.estado !== "real") return "slate";
  return kpi.valor >= 70 ? "violet" : kpi.valor >= 40 ? "amber" : "rose";
}
function corPercentualNeutro(kpi) {
  if (!kpi || kpi.estado !== "real") return "slate";
  return "cyan";
}
function corCrescimento(kpi) {
  if (!kpi || kpi.estado !== "real" || typeof kpi.valor !== "number") return "slate";
  return kpi.valor >= 0 ? "emerald" : "amber";
}
function corFinanceiro(kpi) {
  if (!kpi || kpi.estado !== "real") return "slate";
  if (kpi.classificacao === "saudavel") return "emerald";
  if (kpi.classificacao === "critico") return "rose";
  return "amber";
}

export default function VisaoGeralMetrics() {
  const [contagens, setContagens] = useState(null);
  const [seguranca, setSeguranca] = useState(null);
  const [crescimento, setCrescimento] = useState(null);
  const [retencao, setRetencao] = useState(null);
  const [engajamento, setEngajamento] = useState(null);
  const [financeiroStatus, setFinanceiroStatus] = useState(null);
  const [igrejaSaudavel, setIgrejaSaudavel] = useState(null);
  const [iaScore, setIaScore] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [carregandoInteligentes, setCarregandoInteligentes] = useState(true);
  const [erro, setErro] = useState(false);
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    let ativo = true;

    (async () => {
      try {
        const res = await api.get("/metrics/contagens");
        if (ativo) setContagens(res.data.contagens);
      } catch {
        if (ativo) setErro(true);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();

    (async () => {
      try {
        const [seg, cres, ret, eng, fin, saude, score] = await Promise.all([
          api.get("/metrics/seguranca").catch(() => null),
          api.get("/metrics/crescimento").catch(() => null),
          api.get("/metrics/retencao").catch(() => null),
          api.get("/metrics/engajamento").catch(() => null),
          api.get("/metrics/financeiro-status").catch(() => null),
          api.get("/metrics/igreja-saudavel").catch(() => null),
          api.get("/metrics/ia-score").catch(() => null),
        ]);
        if (!ativo) return;
        setSeguranca(seg?.data ?? null);
        setCrescimento(cres?.data ?? null);
        setRetencao(ret?.data ?? null);
        setEngajamento(eng?.data ?? null);
        setFinanceiroStatus(fin?.data ?? null);
        setIgrejaSaudavel(saude?.data ?? null);
        setIaScore(score?.data ?? null);
      } finally {
        if (ativo) setCarregandoInteligentes(false);
      }
    })();

    return () => { ativo = false; };
  }, []);

  const c = contagens ?? {};

  const secundarios = [
    { icone: Church, label: "Ministérios", kpi: c.ministerios },
    { icone: GraduationCap, label: "Cursos Ativos", kpi: c.cursos },
    { icone: Layers, label: "Turmas", kpi: c.turmas },
    { icone: CalendarDays, label: "Eventos este Mês", kpi: c.eventosDoMes },
    { icone: CalendarDays, label: "Próximos Eventos", kpi: c.proximosEventos },
    { icone: HeartHandshake, label: "Pedidos de Oração", kpi: c.pedidosOracao },
    { icone: Newspaper, label: "Notícias", kpi: c.noticias },
    { icone: Megaphone, label: "Comunicados", kpi: c.comunicados },
    { icone: BookOpen, label: "Estudos Bíblicos", kpi: c.estudosBiblicos },
    { icone: UserCog, label: "Administradores", kpi: c.administradores },
    { icone: Landmark, label: "Receita do Mês", kpi: c.receitaDoMes, moeda: true },
    { icone: Wallet, label: "Despesa do Mês", kpi: c.despesaDoMes, moeda: true },
  ];

  if (erro) {
    return (
      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 p-5 text-sm text-slate-400">
        Não foi possível carregar a visão geral. Verifique sua conexão e recarregue.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 4 cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardEstatistica icone={Users} label="Membros Ativos" valor={exibir(c.membrosAtivos)} carregando={carregando} />
        <CardEstatistica icone={UserCog} label="Líderes" valor={exibir(c.lideres)} carregando={carregando} />
        <CardEstatistica icone={Church} label="Células" valor={exibir(c.celulas)} carregando={carregando} />
        <CardEstatistica icone={Wallet} label="Saldo do Mês" valor={exibir(c.saldoDoMes, { moeda: true })} carregando={carregando} />
      </div>

      {/* Indicadores inteligentes (Fase 2) — sempre com dado real ou "Aguardando dados" */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <CardIndicadorInteligente
          icone={HeartPulse} label="Igreja Saudável"
          rotulo={igrejaSaudavel?.rotulo ?? "..."} cor={corIgrejaSaudavel(igrejaSaudavel)}
          carregando={carregandoInteligentes}
        />
        <CardIndicadorInteligente
          icone={Brain} label="IA Score"
          rotulo={iaScore?.rotulo ?? "..."} cor={corIaScore(iaScore)}
          carregando={carregandoInteligentes}
        />
        <CardIndicadorInteligente
          icone={Activity} label="Engajamento"
          rotulo={engajamento?.rotulo ?? "..."} cor={corPercentualNeutro(engajamento)}
          carregando={carregandoInteligentes}
        />
        <CardIndicadorInteligente
          icone={TrendingUp} label="Crescimento"
          rotulo={crescimento?.rotulo ?? "..."} cor={corCrescimento(crescimento)}
          carregando={carregandoInteligentes}
        />
        <CardIndicadorInteligente
          icone={Anchor} label="Retenção"
          rotulo={retencao?.rotulo ?? "..."} cor={corPercentualNeutro(retencao)}
          carregando={carregandoInteligentes}
        />
        <CardIndicadorInteligente
          icone={Wallet} label="Financeiro"
          rotulo={financeiroStatus?.rotulo ?? "..."} cor={corFinanceiro(financeiroStatus)}
          carregando={carregandoInteligentes}
        />
      </div>

      {/* Card de Segurança (detalhado, com critérios expansíveis) */}
      <CardSeguranca seguranca={seguranca} carregando={carregandoInteligentes} />

      {/* Botão Ver mais */}
      <button
        onClick={() => setExpandido((v) => !v)}
        className="flex items-center gap-2 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
      >
        {expandido ? "Ver menos" : "Ver mais indicadores"}
        <ChevronDown size={14} className={`transition-transform ${expandido ? "rotate-180" : ""}`} />
      </button>

      {expandido && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {secundarios.map((s) => (
            <CardEstatistica
              key={s.label}
              icone={s.icone}
              label={s.label}
              valor={exibir(s.kpi, { moeda: s.moeda })}
              carregando={carregando}
            />
          ))}
        </div>
      )}
    </div>
  );
}