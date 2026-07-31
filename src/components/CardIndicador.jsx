import React from "react";

const CORES_INDICADOR = {
  emerald: { icone: "text-emerald-400", bg: "bg-emerald-500/10", valor: "text-emerald-400" },
  violet: { icone: "text-violet-400", bg: "bg-violet-500/10", valor: "text-violet-400" },
  cyan: { icone: "text-cyan-400", bg: "bg-cyan-500/10", valor: "text-cyan-400" },
  amber: { icone: "text-amber-400", bg: "bg-amber-500/10", valor: "text-amber-400" },
  slate: { icone: "text-slate-400", bg: "bg-white/5", valor: "text-slate-300" },
};

export default function CardIndicador({ icone: Icone, label, valor, cor = "violet", carregando }) {
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