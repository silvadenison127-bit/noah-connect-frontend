import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";

const CATEGORIAS = [
  { valor: "aluguel", label: "Aluguel" },
  { valor: "contas", label: "Contas (água, luz, internet)" },
  { valor: "manutencao", label: "Manutenção" },
  { valor: "eventos", label: "Eventos" },
  { valor: "missoes", label: "Missões" },
  { valor: "material", label: "Material" },
  { valor: "salarios", label: "Salários" },
  { valor: "outros", label: "Outros" },
];

const CORES_CATEGORIA = ["#EF4444", "#F97316", "#F59E0B", "#84CC16", "#10B981", "#06B6D4", "#8B5CF6", "#EC4899"];

export default function Financeiro() {
  const [historico, setHistorico] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [nova, setNova] = useState({
    categoria: "outros",
    descricao: "",
    valor: "",
    forma_pagamento: "dinheiro",
    data_lancamento: new Date().toISOString().slice(0, 10),
  });

  function carregar() {
    setCarregando(true);
    Promise.all([
      api.get("/financeiro"),
      api.get("/financeiro/resumo"),
    ])
      .then(([histRes, resumoRes]) => {
        setHistorico(histRes.data);
        setResumo(resumoRes.data);
      })
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post("/financeiro/despesas", nova);
      setNova({
        categoria: "outros",
        descricao: "",
        valor: "",
        forma_pagamento: "dinheiro",
        data_lancamento: new Date().toISOString().slice(0, 10),
      });
      setMostrarForm(false);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao registrar despesa");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id, movimento) {
    if (movimento !== "saida") {
      alert("Entradas (dízimos/ofertas) são removidas na tela 'Dízimos e Ofertas'.");
      return;
    }
    if (!window.confirm("Remover esta despesa?")) return;
    try {
      await api.delete(`/financeiro/despesas/${id}`);
      carregar();
    } catch (err) {
      alert("Erro ao remover despesa");
    }
  }

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function labelCategoria(cat) {
    return CATEGORIAS.find((c) => c.valor === cat)?.label || cat;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white text-lg">Financeiro</h2>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm font-medium rounded-xl px-4 py-2"
        >
          <Plus size={16} /> Nova Despesa
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <TrendingUp size={16} className="text-emerald-400" /> Entradas este mês
          </div>
          <p className="text-xl font-bold text-white">
            {resumo ? formatarMoeda(resumo.entradas) : "..."}
          </p>
        </div>
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <TrendingDown size={16} className="text-rose-400" /> Saídas este mês
          </div>
          <p className="text-xl font-bold text-white">
            {resumo ? formatarMoeda(resumo.saidas) : "..."}
          </p>
        </div>
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Wallet size={16} className="text-violet-400" /> Saldo este mês
          </div>
          <p className="text-xl font-bold text-violet-400">
            {resumo ? formatarMoeda(resumo.saldo) : "..."}
          </p>
        </div>
      </div>

      {/* Formulário de nova despesa */}
      {mostrarForm && (
        <form onSubmit={salvar} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={nova.categoria}
            onChange={(e) => setNova({ ...nova, categoria: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.valor} value={c.valor} className="bg-[#0F0F1E]">{c.label}</option>
            ))}
          </select>

          <input
            required
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Valor (R$)"
            value={nova.valor}
            onChange={(e) => setNova({ ...nova, valor: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
          />

          <select
            value={nova.forma_pagamento}
            onChange={(e) => setNova({ ...nova, forma_pagamento: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="dinheiro" className="bg-[#0F0F1E]">Dinheiro</option>
            <option value="pix" className="bg-[#0F0F1E]">Pix</option>
            <option value="cartao" className="bg-[#0F0F1E]">Cartão</option>
            <option value="transferencia" className="bg-[#0F0F1E]">Transferência</option>
            <option value="boleto" className="bg-[#0F0F1E]">Boleto</option>
          </select>

          <input
            type="date"
            value={nova.data_lancamento}
            onChange={(e) => setNova({ ...nova, data_lancamento: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 [color-scheme:dark]"
          />

          <input
            placeholder="Descrição (opcional)"
            value={nova.descricao}
            onChange={(e) => setNova({ ...nova, descricao: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 sm:col-span-2"
          />

          <button
            disabled={salvando}
            className="sm:col-span-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
          >
            {salvando ? "Salvando..." : "Salvar Despesa"}
          </button>
        </form>
      )}

      {/* Resumo por categoria */}
      {resumo?.por_categoria?.length > 0 && (
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <h3 className="font-semibold text-white mb-3">Despesas por Categoria (este mês)</h3>
          <div className="space-y-2">
            {resumo.por_categoria.map((c, i) => {
              const percentual = resumo.saidas > 0 ? (parseFloat(c.total) / resumo.saidas) * 100 : 0;
              return (
                <div key={c.categoria}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-300">{labelCategoria(c.categoria)}</span>
                    <span className="font-medium text-slate-100">{formatarMoeda(c.total)}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${percentual}%`, background: CORES_CATEGORIA[i % CORES_CATEGORIA.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Histórico completo (entradas + saídas) */}
      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="font-semibold text-white">Histórico Completo</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-white/10">
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Descrição</th>
              <th className="px-5 py-3 font-medium">Categoria</th>
              <th className="px-5 py-3 font-medium">Movimento</th>
              <th className="px-5 py-3 font-medium">Valor</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td className="px-5 py-4 text-slate-500" colSpan={6}>Carregando...</td></tr>
            ) : historico.length === 0 ? (
              <tr><td className="px-5 py-4 text-slate-500" colSpan={6}>Nenhum lançamento registrado ainda.</td></tr>
            ) : (
              historico.map((h) => (
                <tr key={`${h.movimento}-${h.id}`} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-slate-400">
                    {new Date(h.data_lancamento).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                  </td>
                  <td className="px-5 py-3 text-slate-200">
                    {h.descricao || (h.movimento === "entrada" ? (h.membro_nome || "Anônimo") : "-")}
                  </td>
                  <td className="px-5 py-3 text-slate-400 capitalize">{labelCategoria(h.categoria)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${h.movimento === "entrada" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                      {h.movimento === "entrada" ? "Entrada" : "Saída"}
                    </span>
                  </td>
                  <td className={`px-5 py-3 font-semibold ${h.movimento === "entrada" ? "text-emerald-400" : "text-rose-400"}`}>
                    {h.movimento === "entrada" ? "+" : "-"} {formatarMoeda(h.valor)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {h.movimento === "saida" && (
                      <button
                        onClick={() => remover(h.id, h.movimento)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
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
