import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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

export default function CardRecomendacoes({ recomendacoes, carregando }) {
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