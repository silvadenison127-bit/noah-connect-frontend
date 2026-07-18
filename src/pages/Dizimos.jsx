import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";

export default function Dizimos() {
  const [lancamentos, setLancamentos] = useState([]);
  const [membros, setMembros] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [novo, setNovo] = useState({
    usuario_id: "",
    tipo: "dizimo",
    valor: "",
    forma_pagamento: "dinheiro",
    observacao: "",
    data_lancamento: new Date().toISOString().slice(0, 10),
  });

  function carregar() {
    setCarregando(true);
    Promise.all([
      api.get("/dizimos"),
      api.get("/dizimos/resumo"),
    ])
      .then(([lancRes, resumoRes]) => {
        setLancamentos(lancRes.data);
        setResumo(resumoRes.data);
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
    api.get("/membros").then((res) => setMembros(res.data)).catch(() => {});
  }, []);

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const payload = { ...novo, usuario_id: novo.usuario_id || null };
      await api.post("/dizimos", payload);
      setNovo({
        usuario_id: "",
        tipo: "dizimo",
        valor: "",
        forma_pagamento: "dinheiro",
        observacao: "",
        data_lancamento: new Date().toISOString().slice(0, 10),
      });
      setMostrarForm(false);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao registrar lançamento");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id) {
    if (!window.confirm("Remover este lançamento?")) return;
    try {
      await api.delete(`/dizimos/${id}`);
      carregar();
    } catch (err) {
      alert("Erro ao remover lançamento");
    }
  }

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white text-lg">Dízimos e Ofertas</h2>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm font-medium rounded-xl px-4 py-2"
        >
          <Plus size={16} /> Novo Lançamento
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <TrendingUp size={16} className="text-emerald-400" /> Total este mês
          </div>
          <p className="text-xl font-bold text-white">
            {resumo ? formatarMoeda(resumo.total_mes) : "..."}
          </p>
        </div>
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <TrendingUp size={16} className="text-violet-400" /> Dízimos este mês
          </div>
          <p className="text-xl font-bold text-white">
            {resumo ? formatarMoeda(resumo.dizimos_mes) : "..."}
          </p>
        </div>
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <TrendingDown size={16} className="text-amber-400" /> Ofertas este mês
          </div>
          <p className="text-xl font-bold text-white">
            {resumo ? formatarMoeda(resumo.ofertas_mes) : "..."}
          </p>
        </div>
      </div>

      {mostrarForm && (
        <form onSubmit={salvar} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={novo.usuario_id}
            onChange={(e) => setNovo({ ...novo, usuario_id: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="" className="bg-[#0F0F1E]">Membro (opcional / anônimo)</option>
            {membros.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#0F0F1E]">{m.nome}</option>
            ))}
          </select>

          <select
            value={novo.tipo}
            onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="dizimo" className="bg-[#0F0F1E]">Dízimo</option>
            <option value="oferta" className="bg-[#0F0F1E]">Oferta</option>
          </select>

          <input
            required
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Valor (R$)"
            value={novo.valor}
            onChange={(e) => setNovo({ ...novo, valor: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
          />

          <select
            value={novo.forma_pagamento}
            onChange={(e) => setNovo({ ...novo, forma_pagamento: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="dinheiro" className="bg-[#0F0F1E]">Dinheiro</option>
            <option value="pix" className="bg-[#0F0F1E]">Pix</option>
            <option value="cartao" className="bg-[#0F0F1E]">Cartão</option>
            <option value="transferencia" className="bg-[#0F0F1E]">Transferência</option>
          </select>

          <input
            type="date"
            value={novo.data_lancamento}
            onChange={(e) => setNovo({ ...novo, data_lancamento: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 [color-scheme:dark]"
          />

          <input
            placeholder="Observação (opcional)"
            value={novo.observacao}
            onChange={(e) => setNovo({ ...novo, observacao: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
          />

          <button
            disabled={salvando}
            className="sm:col-span-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
          >
            {salvando ? "Salvando..." : "Salvar Lançamento"}
          </button>
        </form>
      )}

      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-white/10">
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Membro</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Pagamento</th>
              <th className="px-5 py-3 font-medium">Valor</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td className="px-5 py-4 text-slate-500" colSpan={6}>Carregando...</td></tr>
            ) : lancamentos.length === 0 ? (
              <tr><td className="px-5 py-4 text-slate-500" colSpan={6}>Nenhum lançamento registrado ainda.</td></tr>
            ) : (
              lancamentos.map((l) => (
                <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-slate-400">
                    {new Date(l.data_lancamento).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-100">{l.membro_nome || "Anônimo"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${l.tipo === "dizimo" ? "bg-violet-500/15 text-violet-300" : "bg-amber-500/15 text-amber-300"}`}>
                      {l.tipo}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 capitalize">{l.forma_pagamento}</td>
                  <td className="px-5 py-3 font-semibold text-white">{formatarMoeda(l.valor)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => remover(l.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
