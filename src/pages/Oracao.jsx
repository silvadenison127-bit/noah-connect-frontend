import React, { useEffect, useMemo, useRef, useState } from "react";
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

  const [excluindoId, setExcluindoId] = useState(null);

  // Seleção em massa
  const [selecionados, setSelecionados] = useState(new Set());
  const [excluindoLote, setExcluindoLote] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const selectAllRef = useRef(null);

  const ehAdmin = usuario?.tipo === "admin";

  function carregar() {
    setCarregando(true);
    const endpoint = ehAdmin ? "/oracao" : "/oracao/meus";
    api.get(endpoint).then((res) => setPedidos(res.data)).finally(() => setCarregando(false));
  }

  useEffect(carregar, [usuario]);

  const idsSelecionaveis = useMemo(() => pedidos.map((p) => p.id), [pedidos]);

  const todosSelecionados =
    idsSelecionaveis.length > 0 && idsSelecionaveis.every((id) => selecionados.has(id));
  const algunsSelecionados = selecionados.size > 0 && !todosSelecionados;

  // O estado "indeterminado" da caixinha só existe via JavaScript: o HTML não
  // tem atributo para ele.
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = algunsSelecionados;
  }, [algunsSelecionados]);

  function alternarTodos() {
    setSelecionados(todosSelecionados ? new Set() : new Set(idsSelecionaveis));
  }

  function alternarSelecao(id) {
    setSelecionados((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  function avisar(texto) {
    setMensagem(texto);
    window.setTimeout(() => setMensagem(null), 4000);
  }

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

  /**
   * Exclui um pedido definitivamente.
   *
   * A confirmação mostra um trecho do texto porque pedido de oração é conteúdo
   * pessoal: quem apaga precisa ver o que está apagando, não só um "tem
   * certeza?" genérico.
   */
  async function excluirPedido(pedido) {
    const texto = pedido.pedido || "";
    const trecho = texto.slice(0, 60);
    const confirmado = window.confirm(
      `Excluir este pedido de oração?\n\n"${trecho}${texto.length > 60 ? "..." : ""}"\n\nEsta ação não pode ser desfeita.`
    );
    if (!confirmado) return;

    setExcluindoId(pedido.id);
    try {
      await api.delete(`/oracao/${pedido.id}`);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao excluir pedido");
    } finally {
      setExcluindoId(null);
    }
  }

  /**
   * Exclui os pedidos marcados, um a um.
   *
   * Não existe rota de exclusão em lote: cada pedido é apagado pela mesma rota
   * usada na exclusão individual. Se um falhar, os demais continuam -- e a
   * quantidade de falhas é reportada no fim, em vez de interromper tudo no
   * primeiro erro.
   */
  async function excluirSelecionados() {
    const ids = [...selecionados];
    if (ids.length === 0) return;

    const confirmado = window.confirm(
      `Excluir ${ids.length} ${ids.length === 1 ? "pedido" : "pedidos"} de oração?\n\n` +
        "São mensagens pessoais enviadas por membros. Esta ação não pode ser desfeita."
    );
    if (!confirmado) return;

    setExcluindoLote(true);
    let falhas = 0;

    for (const id of ids) {
      try {
        await api.delete(`/oracao/${id}`);
      } catch (err) {
        falhas += 1;
        console.error("[oracao] falha ao excluir", id, err);
      }
    }

    setExcluindoLote(false);
    setSelecionados(new Set());
    carregar();

    const excluidos = ids.length - falhas;
    avisar(
      falhas === 0
        ? `${excluidos} ${excluidos === 1 ? "pedido excluído" : "pedidos excluídos"}.`
        : `${excluidos} excluídos, ${falhas} com erro.`
    );
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

      {mensagem && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs px-4 py-3">
          {mensagem}
        </div>
      )}

      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm">
        {/* Cabeçalho de seleção: só para admin e só quando há pedidos */}
        {ehAdmin && !carregando && pedidos.length > 0 && (
          <div className="px-4 py-3 border-b border-white/10 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={todosSelecionados}
                onChange={alternarTodos}
                className="accent-violet-500"
              />
              Selecionar todos
            </label>

            <div className="flex-1" />

            {selecionados.size > 0 && (
              <>
                <span className="text-xs font-semibold text-violet-300">
                  {selecionados.size} selecionado{selecionados.size > 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setSelecionados(new Set())}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={excluirSelecionados}
                  disabled={excluindoLote}
                  className="text-xs font-semibold px-3 py-2 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {excluindoLote ? "Excluindo..." : "Excluir selecionados"}
                </button>
              </>
            )}
          </div>
        )}

        <div className="divide-y divide-white/5">
          {carregando ? (
            <p className="text-sm text-slate-500 p-5">Carregando...</p>
          ) : pedidos.length === 0 ? (
            <p className="text-sm text-slate-500 p-5">Nenhum pedido por aqui ainda.</p>
          ) : (
            pedidos.map((p) => (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    {ehAdmin && (
                      <input
                        type="checkbox"
                        checked={selecionados.has(p.id)}
                        onChange={() => alternarSelecao(p.id)}
                        className="accent-violet-500 mt-1 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-slate-100">{p.pedido}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {p.anonimo ? "Anônimo" : p.nome_solicitante} · {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {ehAdmin ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={p.status}
                        onChange={(e) => atualizarStatus(p.id, e.target.value)}
                        className="text-xs bg-white/5 border border-white/10 text-slate-200 rounded-lg px-2 py-1"
                      >
                        <option value="em_oracao" className="bg-[#0F0F1E]">Em oração</option>
                        <option value="respondido" className="bg-[#0F0F1E]">Respondido</option>
                        <option value="encerrado" className="bg-[#0F0F1E]">Encerrado</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => excluirPedido(p)}
                        disabled={excluindoId === p.id}
                        title="Excluir este pedido"
                        className="text-xs text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-50 px-2 py-1"
                      >
                        {excluindoId === p.id ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
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
                    {ehAdmin && (
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
                {ehAdmin && !p.resposta && respondendoId !== p.id && (
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
    </div>
  );
}