import React from "react";

export default function CardEstatistica({ icone: Icone, label, valor, carregando }) {
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