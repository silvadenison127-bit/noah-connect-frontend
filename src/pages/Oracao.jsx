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

  const [respondendoId, setRespondendoId] = useState(null);
  const [textoResposta, setTextoResposta] = useState("");
  const [enviandoResposta, setEnviandoResposta] = useState(false);

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

  function abrirResposta(pedido) {
    setRespondendoId(pedido.id);
    setTextoResposta(pedido.resposta || "");
  }

  async function enviarResposta(id) {
    if (!textoResposta.trim()) return;
    setEnviandoResposta(true);
    try {
      await api.put(`/oracao/${id}/responder`, { resposta: textoResposta });
      setRespondendoId(null);
      setTextoResposta("");
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao enviar resposta");
    } finally {
      setEnviandoResposta(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-white text-lg">Pedidos de Oração</h2>

      <form onSubmit={enviarPedido} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 space-y-3">
        <textarea
          value={novoPedido}
          onChange={(e) => setNovoPedido(e.target.value)}
          placeholder="Escreva seu pedido de oração..."
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" checked={anonimo} onChange={(e) => setAnonimo(e.target.checked)} className="accent-violet-500" />
            Manter este pedido anônimo
          </label>
          <button
            disabled={enviando}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl px-5 py-2"
          >
            {enviando ? "Enviando..." : "Enviar Pedido"}
          </button>
        </div>
      </form>

      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm divide-y divide-white/5">
        {carregando ? (
          <p className="text-sm text-slate-500 p-5">Carregando...</p>
        ) : pedidos.length === 0 ? (
          <p className="text-sm text-slate-500 p-5">Nenhum pedido por aqui ainda.</p>
        ) : (
          pedidos.map((p) => (
            <div key={p.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-slate-100">{p.pedido}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {p.anonimo ? "Anônimo" : p.nome_solicitante} · {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {usuario?.tipo === "admin" ? (
                  <select
                    value={p.status}
                    onChange={(e) => atualizarStatus(p.id, e.target.value)}
                    className="text-xs bg-white/5 border border-white/10 text-slate-200 rounded-lg px-2 py-1 shrink-0"
                  >
                    <option value="em_oracao" className="bg-[#0F0F1E]">Em oração</option>
                    <option value="respondido" className="bg-[#0F0F1E]">Respondido</option>
                    <option value="encerrado" className="bg-[#0F0F1E]">Encerrado</option>
                  </select>
                ) : (
                  <span className="text-xs bg-violet-500/15 text-violet-300 font-medium px-2 py-1 rounded-full shrink-0 capitalize">
                    {p.status.replace("_", " ")}
                  </span>
                )}
              </div>

              {/* Resposta já existente */}
              {p.resposta && respondendoId !== p.id && (
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
                  <p className="text-xs font-semibold text-violet-300 mb-1">Resposta da liderança:</p>
                  <p className="text-sm text-slate-200">{p.resposta}</p>
                  {usuario?.tipo === "admin" && (
                    <button
                      onClick={() => abrirResposta(p)}
                      className="text-xs text-violet-400 hover:text-violet-300 font-medium mt-2"
                    >
                      Editar resposta
                    </button>
                  )}
                </div>
              )}

              {/* Botão para abrir campo de resposta (admin, quando ainda não respondeu) */}
              {usuario?.tipo === "admin" && !p.resposta && respondendoId !== p.id && (
                <button
                  onClick={() => abrirResposta(p)}
                  className="text-xs text-violet-400 hover:text-violet-300 font-medium"
                >
                  + Responder este pedido
                </button>
              )}

              {/* Campo de escrever/editar resposta */}
              {respondendoId === p.id && (
                <div className="space-y-2">
                  <textarea
                    value={textoResposta}
                    onChange={(e) => setTextoResposta(e.target.value)}
                    placeholder="Escreva uma palavra de fé ou atualização para esta pessoa..."
                    rows={3}
                    className="w-full bg-white/5 border border-violet-500/30 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => enviarResposta(p.id)}
                      disabled={enviandoResposta}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-xs font-medium rounded-lg px-4 py-2"
                    >
                      {enviandoResposta ? "Enviando..." : "Enviar Resposta"}
                    </button>
                    <button
                      onClick={() => { setRespondendoId(null); setTextoResposta(""); }}
                      className="text-xs text-slate-400 hover:text-slate-200 px-4 py-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
