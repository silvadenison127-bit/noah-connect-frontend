import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Oracao() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [novoPedido, setNovoPedido] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function carregar() {
    setCarregando(true);
    const endpoint = usuario?.tipo === "admin" ? "/oracao" : "/oracao/meus";
    api.get(endpoint).then((res) => setPedidos(res.data)).finally(() => setCarregando(false));
  }

  useEffect(carregar, [usuario]);

  async function enviarPedido(e) {
    e.preventDefault();
    if (!novoPedido.trim()) return;
    setEnviando(true);
    try {
      await api.post("/oracao", { pedido: novoPedido, anonimo });
      setNovoPedido("");
      setAnonimo(false);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao enviar pedido");
    } finally {
      setEnviando(false);
    }
  }

  async function atualizarStatus(id, status) {
    try {
      await api.put(`/oracao/${id}/status`, { status });
      carregar();
    } catch (err) {
      alert("Erro ao atualizar status");
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-slate-800 text-lg">Pedidos de Oração</h2>

      <form onSubmit={enviarPedido} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
        <textarea
          value={novoPedido}
          onChange={(e) => setNovoPedido(e.target.value)}
          placeholder="Escreva seu pedido de oração..."
          rows={3}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-500">
            <input type="checkbox" checked={anonimo} onChange={(e) => setAnonimo(e.target.checked)} />
            Manter este pedido anônimo
          </label>
          <button
            disabled={enviando}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl px-5 py-2"
          >
            {enviando ? "Enviando..." : "Enviar Pedido"}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
        {carregando ? (
          <p className="text-sm text-slate-400 p-5">Carregando...</p>
        ) : pedidos.length === 0 ? (
          <p className="text-sm text-slate-400 p-5">Nenhum pedido por aqui ainda.</p>
        ) : (
          pedidos.map((p) => (
            <div key={p.id} className="p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-slate-800">{p.pedido}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {p.anonimo ? "Anônimo" : p.nome_solicitante} · {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                </p>
              </div>
              {usuario?.tipo === "admin" ? (
                <select
                  value={p.status}
                  onChange={(e) => atualizarStatus(p.id, e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 shrink-0"
                >
                  <option value="em_oracao">Em oração</option>
                  <option value="respondido">Respondido</option>
                  <option value="encerrado">Encerrado</option>
                </select>
              ) : (
                <span className="text-xs bg-violet-100 text-violet-600 font-medium px-2 py-1 rounded-full shrink-0 capitalize">
                  {p.status.replace("_", " ")}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
