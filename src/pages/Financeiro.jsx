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

  const maiorCategoria = resumo?.por_categoria?.[0]?.total
    ? Math.max(...resumo.por_categoria.map((c) => parseFloat(c.total)))
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800 text-lg">Financeiro</h2>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl px-4 py-2"
        >
          <Plus size={16} /> Nova Despesa
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <TrendingUp size={16} className="text-emerald-500" /> Entradas este mês
          </div>
          <p className="text-xl font-bold text-slate-800">
            {resumo ? formatarMoeda(resumo.entradas) : "..."}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <TrendingDown size={16} className="text-rose-500" /> Saídas este mês
          </div>
          <p className="text-xl font-bold text-slate-800">
            {resumo ? formatarMoeda(resumo.saidas) : "..."}
          </p>
        </div>
