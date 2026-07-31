import React from "react";
import { Sparkles } from "lucide-react";

const LABEL_METRICA_PREVISAO = {
  membros: "Membros",
  dizimos: "Dízimos",
  batismos: "Batismos",
  visitantes: "Visitantes",
};

export default function CardPrevisoes({ previsoes, carregando }) {
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