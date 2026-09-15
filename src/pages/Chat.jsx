import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api";
import { MessageSquare, Send, CheckCircle, RotateCcw } from "lucide-react";

/**
 * Atendimento do chat dos membros.
 *
 * O aplicativo ja tinha chat completo, mas ninguem no painel via as mensagens.
 * Esta tela e o outro lado da conversa: caixa de entrada a esquerda, conversa
 * aberta a direita.
 *
 * Nao usa Realtime. O painel fala com o backend por axios e nao tem supabase-js;
 * trazer Realtime para ca mudaria a arquitetura inteira por causa de uma tela.
 * Recarga a cada 10 segundos resolve: o pastor nao atende centenas de conversas
 * ao mesmo tempo.
 */

const ROTA = "/chat";
const INTERVALO_MS = 10000;

function formatarHora(iso) {
  if (!iso) return "";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mensagemDeErro(err, alternativa) {
  return err?.response?.data?.erro || alternativa;
}

export default function Chat() {
  const [conversas, setConversas] = useState([]);
  const [filtro, setFiltro] = useState("open");
  const [selecionada, setSelecionada] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const fimDaLista = useRef(null);

  const carregarConversas = useCallback(async (status) => {
    try {
      const { data } = await api.get(ROTA, { params: { status } });
      setConversas(data);
      return data;
    } catch (err) {
      console.error(mensagemDeErro(err, "Erro ao carregar conversas"));
      return [];
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarMensagens = useCallback(async (roomId) => {
    if (!roomId) return;
    try {
      const { data } = await api.get(`${ROTA}/${roomId}/mensagens`);
      setMensagens(data);
    } catch (err) {
      alert(mensagemDeErro(err, "Erro ao carregar mensagens"));
    }
  }, []);

  useEffect(() => {
    setCarregando(true);
    setSelecionada(null);
    setMensagens([]);
    carregarConversas(filtro);
  }, [filtro, carregarConversas]);

  // Recarga periodica: mensagem nova do membro aparece sem o pastor atualizar.
  useEffect(() => {
    const timer = setInterval(() => {
      carregarConversas(filtro);
      if (selecionada) carregarMensagens(selecionada.id);
    }, INTERVALO_MS);
    return () => clearInterval(timer);
  }, [filtro, selecionada, carregarConversas, carregarMensagens]);

  useEffect(() => {
    fimDaLista.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function abrirConversa(conversa) {
    setSelecionada(conversa);
    await carregarMensagens(conversa.id);
    // Abrir a conversa ja marca como lida: o pastor esta lendo agora.
    if (conversa.nao_lidas > 0) {
      try {
        await api.put(`${ROTA}/${conversa.id}/lidas`);
        carregarConversas(filtro);
      } catch (err) {
        console.error(mensagemDeErro(err, "Erro ao marcar como lidas"));
      }
    }
  }

  async function enviar(e) {
    e.preventDefault();
    if (!selecionada || !texto.trim() || enviando) return;
    setEnviando(true);
    try {
      const { data } = await api.post(`${ROTA}/${selecionada.id}/mensagens`, { body: texto });
      setMensagens((atuais) => [...atuais, data]);
      setTexto("");
      carregarConversas(filtro);
    } catch (err) {
      alert(mensagemDeErro(err, "Erro ao enviar mensagem"));
    } finally {
      setEnviando(false);
    }
  }

  async function alterarStatus(status) {
    if (!selecionada) return;
    const acao = status === "closed" ? "encerrar" : "reabrir";
    if (!window.confirm(`Deseja ${acao} esta conversa?`)) return;
    try {
      await api.put(`${ROTA}/${selecionada.id}/status`, { status });
      setSelecionada(null);
      setMensagens([]);
      carregarConversas(filtro);
    } catch (err) {
      alert(mensagemDeErro(err, "Erro ao alterar a conversa"));
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Chat com os membros</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro("open")}
            className={`px-3 py-1.5 rounded-lg text-sm ${filtro === "open" ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
          >
            Abertas
          </button>
          <button
            onClick={() => setFiltro("closed")}
            className={`px-3 py-1.5 rounded-lg text-sm ${filtro === "closed" ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
          >
            Encerradas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 border rounded-xl overflow-hidden dark:border-gray-700">
          <div className="px-4 py-3 border-b dark:border-gray-700 text-sm font-semibold">
            Conversas ({conversas.length})
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {carregando ? (
              <p className="p-4 text-sm text-gray-500">Carregando...</p>
            ) : !conversas.length ? (
              <p className="p-4 text-sm text-gray-500">
                {filtro === "open" ? "Nenhuma conversa aberta." : "Nenhuma conversa encerrada."}
              </p>
            ) : (
              conversas.map((conversa) => (
                <button
                  key={conversa.id}
                  onClick={() => abrirConversa(conversa)}
                  className={`w-full text-left px-4 py-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${selecionada?.id === conversa.id ? "bg-purple-50 dark:bg-gray-800" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">{conversa.membro_nome}</span>
                    {conversa.nao_lidas > 0 && (
                      <span className="shrink-0 bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                        {conversa.nao_lidas}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conversa.subject}</p>
                  <p className="text-xs text-gray-400">{formatarHora(conversa.last_message_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 border rounded-xl flex flex-col dark:border-gray-700 min-h-[70vh]">
          {!selecionada ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
              <MessageSquare size={40} />
              <p className="text-sm">Selecione uma conversa para responder.</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{selecionada.membro_nome}</p>
                  <p className="text-xs text-gray-500 truncate">{selecionada.subject}</p>
                </div>
                {selecionada.status === "open" ? (
                  <button
                    onClick={() => alterarStatus("closed")}
                    className="shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
                  >
                    <CheckCircle size={14} /> Encerrar
                  </button>
                ) : (
                  <button
                    onClick={() => alterarStatus("open")}
                    className="shrink-0 flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
                  >
                    <RotateCcw size={14} /> Reabrir
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[55vh]">
                {!mensagens.length ? (
                  <p className="text-sm text-gray-500">Nenhuma mensagem nesta conversa.</p>
                ) : (
                  mensagens.map((msg) => {
                    const daIgreja = msg.sender_role !== "member";
                    return (
                      <div key={msg.id} className={`flex ${daIgreja ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${daIgreja ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                          <p className={`text-[10px] mt-1 ${daIgreja ? "text-purple-200" : "text-gray-400"}`}>
                            {formatarHora(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={fimDaLista} />
              </div>

              {selecionada.status === "open" ? (
                <form onSubmit={enviar} className="p-3 border-t dark:border-gray-700 flex gap-2">
                  <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Escreva sua resposta..."
                    className="flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
                  />
                  <button
                    type="submit"
                    disabled={enviando || !texto.trim()}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send size={16} /> {enviando ? "Enviando..." : "Enviar"}
                  </button>
                </form>
              ) : (
                <p className="p-3 border-t dark:border-gray-700 text-xs text-gray-500">
                  Conversa encerrada. Reabra para responder.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
