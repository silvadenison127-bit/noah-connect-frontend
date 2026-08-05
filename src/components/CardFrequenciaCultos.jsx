import React, { useEffect, useState } from "react";
import { Church } from "lucide-react";
import api from "../services/api";

function corPorPercentual(percentual) {
  if (percentual === null || percentual === undefined) return "bg-white/5";
  if (percentual >= 70) return "bg-emerald-500/70";
  if (percentual >= 40) return "bg-amber-500/70";
  return "bg-rose-500/70";
}

export default function CardFrequenciaCultos() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    api.get("/metrics/frequencia-cultos")
      .then((res) => { if (ativo) setDados(res.data); })
      .catch(() => { if (ativo) setDados(null); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const semanas = dados?.semanas ?? [];

  return (
    <div className="bg-[#0F0F1E] rounded-xl border border-white/10 shadow-sm p-3 h-full">
      <div className="flex items-center gap-2 mb-0.5">
        <Church size={15} className="text-violet-400" />
        <h3 className="font-semibold text-white text-sm">Frequência dos Cultos</h3>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">Últimas 8 semanas</p>

      {carregando ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : semanas.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum culto registrado no período.</p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {semanas.map((s) => (
            <div key={s.semana} className="flex flex-col gap-1">
              {s.cultos.map((c) => (
                <div
                  key={c.id}
                  title={`${c.titulo} — ${c.semRegistro ? "sem registro" : `${c.percentual}% presença`}`}
                  className={`h-4 rounded ${corPorPercentual(c.percentual)}`}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500/70" />Alta</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500/70" />Média</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500/70" />Baixa</span>
      </div>
    </div>
  );
}
