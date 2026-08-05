import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, X, Loader2, ShieldCheck, UserCog, User, Home, Heart,
  GraduationCap, Calendar, HeartHandshake, Newspaper, Megaphone,
  BookOpen, Wallet, ArrowRight
} from "lucide-react";
import api from "../services/api";

const ICONES = {
  ShieldCheck, UserCog, User, Home, Heart, GraduationCap,
  Calendar, HeartHandshake, Newspaper, Megaphone, BookOpen, Wallet,
};

function IconeResultado({ nome, className }) {
  const Icone = ICONES[nome] || Search;
  return <Icone size={16} className={className} />;
}

function agruparPorModulo(resultados) {
  const grupos = [];
  const indice = {};
  resultados.forEach((r) => {
    if (!(r.modulo in indice)) {
      indice[r.modulo] = grupos.length;
      grupos.push({ modulo: r.modulo, itens: [] });
    }
    grupos[indice[r.modulo]].itens.push(r);
  });
  return grupos;
}

const DEBOUNCE_MS = 300;

export default function GlobalSearch({ aberto, onFechar }) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (aberto) {
      setQuery("");
      setResultados([]);
      setIndiceAtivo(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    clearTimeout(debounceRef.current);

    const termo = query.trim();
    if (termo.length < 2) {
      setResultados([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get("/search", { params: { q: termo } });
        setResultados(data.resultados || []);
        setIndiceAtivo(0);
      } catch {
        setResultados([]);
      } finally {
        setCarregando(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query, aberto]);

  function irPara(resultado) {
    if (!resultado) return;
    navigate(resultado.rota);
    onFechar();
  }

  function aoTecla(e) {
    if (e.key === "Escape") {
      onFechar();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceAtivo((i) => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceAtivo((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      irPara(resultados[indiceAtivo]);
    }
  }

  if (!aberto) return null;

  const grupos = agruparPorModulo(resultados);
  let contadorGlobal = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[#0F0F1E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search size={18} className="text-violet-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={aoTecla}
            placeholder="Buscar por membro, evento, pedido..."
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-500"
          />
          {carregando && <Loader2 size={16} className="animate-spin text-slate-500 shrink-0" />}
          <button onClick={onFechar} className="text-slate-500 hover:text-slate-300 shrink-0">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {query.trim().length < 2 && (
            <p className="px-4 py-6 text-sm text-slate-500 text-center">
              Digite ao menos 2 caracteres para buscar.
            </p>
          )}

          {query.trim().length >= 2 && !carregando && resultados.length === 0 && (
            <p className="px-4 py-6 text-sm text-slate-500 text-center">
              Nenhum resultado encontrado.
            </p>
          )}

          {grupos.map((grupo) => (
            <div key={grupo.modulo} className="py-2">
              <p className="px-4 py-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                {grupo.modulo}
              </p>
              {grupo.itens.map((item) => {
                contadorGlobal += 1;
                const ativo = contadorGlobal === indiceAtivo;
                return (
                  <button
                    key={item.id}
                    onClick={() => irPara(item)}
                    onMouseEnter={() => setIndiceAtivo(contadorGlobal)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      ativo ? "bg-violet-500/15" : "hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      ativo ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-slate-400"
                    }`}>
                      <IconeResultado nome={item.icone} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{item.titulo}</p>
                      {(item.subtitulo || item.descricao) && (
                        <p className="text-xs text-slate-500 truncate">
                          {item.subtitulo || item.descricao}
                        </p>
                      )}
                    </div>
                    {ativo && <ArrowRight size={14} className="text-violet-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t border-white/10 text-[10px] text-slate-500">
          <span>↑↓ navegar</span>
          <span>Enter abrir</span>
          <span>Esc fechar</span>
        </div>
      </div>
    </div>
  );
}