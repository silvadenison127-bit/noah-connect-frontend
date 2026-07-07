import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Users, Church, HeartHandshake, Wallet, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";

function primeiroDiaMes() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export default function Relatorios() {
  const [resumo, setResumo] = useState(null);
  const [frequencia, setFrequencia] = useState([]);
  const [financeiro, setFinanceiro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoFinanceiro, setCarregandoFinanceiro] = useState(false);

  const [periodo, setPeriodo] = useState({ inicio: primeiroDiaMes(), fim: hoje() });

  function carregarBase() {
    setCarregando(true);
    Promise.all([
      api.get("/relatorios/resumo"),
      api.get("/relatorios/frequencia"),
    ])
      .then(([resumoRes, freqRes]) => {
        setResumo(resumoRes.data);
        setFrequencia(freqRes.data);
      })
      .finally(() => setCarregando(false));
  }

  function carregarFinanceiro() {
    setCarregandoFinanceiro(true);
    api.get(`/relatorios/financeiro?inicio=${periodo.inicio}&fim=${periodo.fim}`)
      .then((res) => setFinanceiro(res.data))
      .catch(() => alert("Erro ao buscar relatório financeiro"))
      .finally(() => setCarregandoFinanceiro(false));
  }

  useEffect(() => {
    carregarBase();
    carregarFinanceiro();
  }, []);

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-slate-800 text-lg">Relatórios</h2>

      {/* Resumo geral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Users size={16} className="text-violet-500" /> Membros Ativos
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {carregando ? "..." : resumo?.membros_ativos}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Church size={16} className="text-violet-500" /> Cultos este Mês
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {carregando ? "..." : resumo?.cultos_este_mes}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Users size={16} className="text-violet-500" /> Células
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {carregando ? "..." : resumo?.total_celulas}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <HeartHandshake size={16} className="text-violet-500" /> Ministérios
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {carregando ? "..." : resumo?.total_ministerios}
          </p>
        </div>
      </div>

      {/* Relatório financeiro por período */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-semibold text-slate-800">Relatório Financeiro</h3>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={periodo.inicio}
              onChange={(e) => setPeriodo({ ...periodo, inicio: e.target.value })}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
            />
            <span className="text-xs text-slate-400">até</span>
            <input
              type="date"
              value={periodo.fim}
              onChange={(e) => setPeriodo({ ...periodo, fim: e.target.value })}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
            />
            <button
              onClick={carregarFinanceiro}
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg px-3 py-1.5"
            >
              Filtrar
            </button>
          </div>
        </div>

        {carregandoFinanceiro ? (
          <p className="text-sm text-slate-400">Carregando...</p>
        ) : financeiro ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium mb-1">
                  <TrendingUp size={13} /> Entradas
                </div>
                <p className="text-lg font-bold text-emerald-700">{formatarMoeda(financeiro.entradas)}</p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-rose-600 text-xs font-medium mb-1">
                  <TrendingDown size={13} /> Saídas
                </div>
                <p className="text-lg font-bold text-rose-700">{formatarMoeda(financeiro.saidas)}</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-violet-600 text-xs font-medium mb-1">
                  <Wallet size={13} /> Saldo
                </div>
                <p className="text-lg font-bold text-violet-700">{formatarMoeda(financeiro.saldo)}</p>
              </div>
            </div>

            {financeiro.por_categoria_despesa?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Despesas por categoria</p>
                <div className="space-y-1.5">
                  {financeiro.por_categoria_despesa.map((c) => (
                    <div key={c.categoria} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 capitalize">{c.categoria}</span>
                      <span className="font-medium text-slate-700">{formatarMoeda(c.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {financeiro.por_tipo_entrada?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Entradas por tipo</p>
                <div className="space-y-1.5">
                  {financeiro.por_tipo_entrada.map((t) => (
                    <div key={t.tipo} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 capitalize">{t.tipo}</span>
                      <span className="font-medium text-slate-700">{formatarMoeda(t.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Selecione um período e clique em Filtrar.</p>
        )}
      </div>

      {/* Frequência nos cultos */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Frequência nos Últimos Cultos</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Culto</th>
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Presença</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td className="px-5 py-4 text-slate-400" colSpan={4}>Carregando...</td></tr>
            ) : frequencia.length === 0 ? (
              <tr><td className="px-5 py-4 text-slate-400" colSpan={4}>Nenhum culto registrado ainda.</td></tr>
            ) : (
              frequencia.map((f) => {
                const percentual = f.total_membros > 0
                  ? Math.round((parseInt(f.presentes, 10) / parseInt(f.total_membros, 10)) * 100)
                  : 0;
                return (
                  <tr key={f.evento_id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-700">{f.titulo}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(f.data_inicio).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        {f.presentes} de {f.total_membros}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${percentual}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
