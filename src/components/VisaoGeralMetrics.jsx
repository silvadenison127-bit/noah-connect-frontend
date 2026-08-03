import React, { useEffect, useState } from "react";
import {
  Users, UserCog, Wallet, Church, HeartHandshake, CalendarDays,
  Newspaper, Megaphone, GraduationCap, BookOpen, Layers, ChevronDown,
  Landmark, ShieldCheck, ShieldAlert, ShieldX, CheckCircle2, AlertCircle, XCircle, HelpCircle
} from "lucide-react";
import api from "../services/api";
import CardEstatistica from "./CardEstatistica";

// Formata o valor de um KPI conforme seu estado (contrato { valor, estado }).
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

// Visual da classificação de segurança (seguro / atencao / critico)
const ESTILO_SEGURANCA = {
  seguro: { icone: ShieldCheck, cor: "text-emerald-400", bg: "bg-emerald-500/10", label: "Seguro" },
  atencao: { icone: ShieldAlert, cor: "text-amber-400", bg: "bg-amber-500/10", label: "Atenção" },
  critico: { icone: ShieldX, cor: "text-rose-400", bg: "bg-rose-500/10", label: "Crítico" },
};

// Visual do status de cada critério individual
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

export default function VisaoGeralMetrics() {
  const [contagens, setContagens] = useState(null);
  const [seguranca, setSeguranca] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoSeguranca, setCarregandoSeguranca] = useState(true);
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
        const res = await api.get("/metrics/seguranca");
        if (ativo) setSeguranca(res.data);
      } catch {
        if (ativo) setSeguranca(null);
      } finally {
        if (ativo) setCarregandoSeguranca(false);
      }
    })();

    return () => { ativo = false; };
  }, []);

  const c = contagens ?? {};

  // Cards secundários (painel expansível)
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

      {/* Card de Segurança (indicador inteligente, Fase 2) */}
      <CardSeguranca seguranca={seguranca} carregando={carregandoSeguranca} />

      {/* Botão Ver mais */}
      <button
        onClick={() => setExpandido((v) => !v)}
        className="flex items-center gap-2 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
      >
        {expandido ? "Ver menos" : "Ver mais indicadores"}
        <ChevronDown size={14} className={`transition-transform ${expandido ? "rotate-180" : ""}`} />
      </button>

      {/* Painel expansível */}
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