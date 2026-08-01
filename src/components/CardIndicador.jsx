import React from "react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";

const CORES_INDICADOR = {
  emerald: { icone: "text-emerald-400", bg: "bg-emerald-500/10", valor: "text-emerald-400", linha: "#34D399" },
  violet: { icone: "text-violet-400", bg: "bg-violet-500/10", valor: "text-violet-400", linha: "#A78BFA" },
  cyan: { icone: "text-cyan-400", bg: "bg-cyan-500/10", valor: "text-cyan-400", linha: "#22D3EE" },
  amber: { icone: "text-amber-400", bg: "bg-amber-500/10", valor: "text-amber-400", linha: "#FBBF24" },
  slate: { icone: "text-slate-400", bg: "bg-white/5", valor: "text-slate-300", linha: "#94A3B8" },
};

export default function CardIndicador({
  icone: Icone, label, valor, cor = "violet", carregando,
  variacao, sparkline,
}) {
  const c = CORES_INDICADOR[cor] || CORES_INDICADOR.violet;
  const variacaoPositiva = typeof variacao === "string" && variacao.trim().startsWith("+");
  const variacaoNegativa = typeof variacao === "string" && variacao.trim().startsWith("-");

  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-3 flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center ${c.icone} shrink-0`}>
            <Icone size={14} />
          </div>
          <p className="text-[11px] text-slate-400 truncate">{label}</p>
        </div>
        {variacao && (
          <span
            className={`flex items-center gap-0.5 text-[10px] font-medium shrink-0 ${
              variacaoNegativa ? "text-rose-400" : variacaoPositiva ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            {variacaoPositiva && <ArrowUp size={10} />}
            {variacaoNegativa && <ArrowDown size={10} />}
            {variacao}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className={`text-lg font-bold ${c.valor} leading-none`}>
          {carregando ? "..." : valor}
        </p>
        {sparkline && sparkline.length > 1 && (
          <div className="w-14 h-6 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline.map((v, i) => ({ i, v }))}>
                <Line type="monotone" dataKey="v" stroke={c.linha} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}