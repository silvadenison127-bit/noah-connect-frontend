import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { HeartHandshake } from "lucide-react";
import api from "../services/api";

const CORES_STATUS = {
  em_oracao: "#F59E0B",
  respondido: "#34D399",
  encerrado: "#64748B",
};

const LABEL_STATUS = {
  em_oracao: "Em Oração",
  respondido: "Respondido",
  encerrado: "Encerrado",
};

export default function CardPedidosOracaoResumo() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    api.get("/oracao/resumo")
      .then((res) => { if (ativo) setDados(res.data); })
      .catch(() => { if (ativo) setDados(null); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const contagens = dados?.contagens ?? { em_oracao: 0, respondido: 0, encerrado: 0 };
  const total = dados?.total ?? 0;

  const dadosGrafico = Object.keys(LABEL_STATUS)
    .filter((chave) => contagens[chave] > 0)
    .map((chave) => ({ nome: LABEL_STATUS[chave], valor: contagens[chave], chave }));

  return (
    <div className="bg-[#0F0F1E] rounded-xl border border-white/10 shadow-sm p-3 h-full">
      <div className="flex items-center gap-2 mb-2">
        <HeartHandshake size={15} className="text-violet-400" />
        <h3 className="font-semibold text-white text-sm">Pedidos de Oração</h3>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">Resumo geral</p>

      {carregando ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : total === 0 ? (
        <p className="text-sm text-slate-500">Nenhum pedido registrado ainda.</p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosGrafico} dataKey="valor" innerRadius={32} outerRadius={46} paddingAngle={2}>
                  {dadosGrafico.map((d, i) => (
                    <Cell key={i} fill={CORES_STATUS[d.chave]} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-white">{total}</span>
              <span className="text-[9px] text-slate-500">Total</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5 text-sm min-w-0">
            {Object.keys(LABEL_STATUS).map((chave) => (
              <div key={chave} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-slate-300 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CORES_STATUS[chave] }} />
                  {LABEL_STATUS[chave]}
                </span>
                <span className="text-slate-200 font-medium shrink-0 text-xs">
                  {contagens[chave]} ({total > 0 ? Math.round((contagens[chave] / total) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
