import React, { useEffect, useState } from "react";
import {
  Users, UserCog, Wallet, Church, HeartHandshake, CalendarDays,
  Newspaper, Megaphone, GraduationCap, BookOpen, Layers, ChevronDown, Landmark
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

export default function VisaoGeralMetrics() {
  const [contagens, setContagens] = useState(null);
  const [carregando, setCarregando] = useState(true);
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