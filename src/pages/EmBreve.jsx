import React from "react";

export default function EmBreve({ titulo }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
      <p className="text-slate-800 font-semibold mb-1">{titulo}</p>
      <p className="text-sm text-slate-400">Este módulo ainda será construído nas próximas etapas.</p>
    </div>
  );
}
