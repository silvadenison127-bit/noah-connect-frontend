import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Cake, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const CORES_FAIXA = ["#8B5CF6", "#A78BFA", "#34D399", "#F59E0B", "#F472B6"];

export default function CardDistribuicaoIdades() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    api.get("/metrics/distribuicao-idades")
      .then((res) => { if (ativo) setDados(res.data); })
      .catch(() => { if (ativo) setDados(null); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const faixas = dados?.faixas ?? [];
  const totalComData = dados?.totalComData ?? 0;
  const semDados = !carregando && (dados?.estado === "aguardando_dados" || totalComData === 0);

  return (
    <div className="bg-[#0F0F1E] rounded-xl border border-white/10 shadow-sm p-3 h-full">
      <div className="flex items-center gap-2 mb-0.5">
        <Cake size={15} className="text-violet-400" />
        <h3 className="font-semibold text-white text-sm">Distribuição de Idades</h3>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">Baseado em membros cadastrados</p>

      {carregando ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : semDados ? (
        <div className="flex flex-col items-center justify-center text-center py-4 gap-2">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center">
            <Cake size={22} className="text-slate-600" />
          </div>
          <p className="text-xs text-slate-400 max-w-[180px]">
            Cadastre a data de nascimento dos membros para ativar este indicador.
          </p>
          <Link
            to="/membros"
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium"
          >
            Ir para Membros <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={faixas} dataKey="total" innerRadius={32} outerRadius={46} paddingAngle={2}>
                  {faixas.map((_, i) => (
                    <Cell key={i} fill={CORES_FAIXA[i % CORES_FAIXA.length]} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-white">{totalComData}</span>
              <span className="text-[9px] text-slate-500">Total</span>
            </div>
          </div>
          <div className="flex-1 space-y-1 text-sm min-w-0">
            {faixas.map((f, i) => (
              <div key={f.chave} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-slate-300 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CORES_FAIXA[i % CORES_FAIXA.length] }} />
                  {f.label}
                </span>
                <span className="text-slate-200 font-medium shrink-0 text-xs">{f.percentual}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
