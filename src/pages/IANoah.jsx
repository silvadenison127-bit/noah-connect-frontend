import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Bot, User, AlertCircle } from "lucide-react";
import { obterStatusIA, perguntarIA } from "../services/iaNoahService";

const PERGUNTAS_SUGERIDAS = [
  "Quantos membros ativos temos hoje?",
  "Quantas celulas estao cadastradas?",
  "Qual o total de dizimos deste mes?",
  "Quantos pedidos de oracao estao ativos?",
  "Quantos cultos estao agendados?",
];

function BolhaMensagem({ autor, texto }) {
  const ehUsuario = autor === "usuario";
  return (
    <div className={`flex gap-3 ${ehUsuario ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          ehUsuario ? "bg-white/10 text-slate-300" : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
        }`}
      >
        {ehUsuario ? <User size={15} /> : <Bot size={15} />}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          ehUsuario
            ? "bg-violet-600 text-white rounded-tr-sm"
            : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm"
        }`}
      >
        {texto}
      </div>
    </div>
  );
}

export default function IANoah() {
  const [status, setStatus] = useState(null);
  const [mensagens, setMensagens] = useState([
    { autor: "ia", texto: "Ola! Sou a IA Noah. Pergunte algo sobre os dados da igreja - membros, celulas, dizimos, cultos e pedidos de oracao." },
  ]);
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimDaListaRef = useRef(null);

  useEffect(() => {
    obterStatusIA().then(setStatus).catch(() => setStatus({ modo: "demonstracao" }));
  }, []);

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviarPergunta(textoPergunta) {
    const texto = (textoPergunta ?? pergunta).trim();
    if (!texto || enviando) return;

    const historicoAtual = mensagens.map((m) => ({ autor: m.autor, texto: m.texto }));
    setMensagens((prev) => [...prev, { autor: "usuario", texto }]);
    setPergunta("");
    setEnviando(true);

    try {
      const resultado = await perguntarIA(texto, historicoAtual);
      setMensagens((prev) => [...prev, { autor: "ia", texto: resultado.resposta }]);
      if (resultado.modo) {
        setStatus((prev) => ({ ...prev, modo: resultado.modo }));
      }
    } catch (err) {
      setMensagens((prev) => [
        ...prev,
        { autor: "ia", texto: "Nao consegui processar sua pergunta agora. Tente novamente em instantes." },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  function aoEnviarForm(e) {
    e.preventDefault();
    enviarPergunta();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-white text-lg flex items-center gap-2">
            <Sparkles size={18} className="text-violet-400" />
            IA Noah
          </h2>
          <p className="text-sm text-slate-500">Pergunte em linguagem natural sobre os dados da igreja.</p>
        </div>
        {status?.modo === "demonstracao" && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full">
            <AlertCircle size={13} />
            Modo Demonstracao
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm flex flex-col h-[560px]">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {mensagens.map((m, i) => (
              <BolhaMensagem key={i} autor={m.autor} texto={m.texto} />
            ))}
            {enviando && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={fimDaListaRef} />
          </div>

          <form onSubmit={aoEnviarForm} className="border-t border-white/10 p-4 flex items-center gap-2">
            <input
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Digite sua pergunta..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
            />
            <button
              type="submit"
              disabled={enviando || !pergunta.trim()}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl p-2.5"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Perguntas sugeridas</h3>
            <div className="space-y-2">
              {PERGUNTAS_SUGERIDAS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => enviarPergunta(p)}
                  disabled={enviando}
                  className="w-full text-left text-xs text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 transition-colors disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Sobre a IA Noah</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              As respostas sao geradas com base nos dados reais da plataforma
              {status?.modo === "demonstracao"
                ? ". No momento, o modulo esta em modo demonstracao ate a configuracao da chave de IA."
                : ", usando inteligencia artificial."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}