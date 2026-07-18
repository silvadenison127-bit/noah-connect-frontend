import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus, Trash2, Pencil, X, Image as ImageIcon, Newspaper } from "lucide-react";

export default function Noticias() {
  const { usuario } = useAuth();
  const [noticias, setNoticias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const inputImagemRef = useRef(null);

  const [novo, setNovo] = useState({ titulo: "", conteudo: "", imagem_capa: "" });

  function carregar() {
    setCarregando(true);
    api.get("/noticias").then((res) => setNoticias(res.data)).finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  function abrirNovo() {
    setEditandoId(null);
    setNovo({ titulo: "", conteudo: "", imagem_capa: "" });
    setMostrarForm(true);
  }

  function abrirEdicao(noticia) {
    setEditandoId(noticia.id);
    setNovo({
      titulo: noticia.titulo,
      conteudo: noticia.conteudo,
      imagem_capa: noticia.imagem_capa || "",
    });
    setMostrarForm(true);
  }

  function aoEscolherImagem(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (arquivo.size > 3 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 3MB.");
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => setNovo((n) => ({ ...n, imagem_capa: leitor.result }));
    leitor.readAsDataURL(arquivo);
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editandoId) {
        await api.put(`/noticias/${editandoId}`, novo);
      } else {
        await api.post("/noticias", novo);
      }
      setMostrarForm(false);
      setEditandoId(null);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao salvar notícia");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id) {
    if (!window.confirm("Remover esta notícia? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/noticias/${id}`);
      carregar();
    } catch (err) {
      alert("Erro ao remover notícia");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white text-lg">Notícias</h2>
        {usuario?.tipo === "admin" && (
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm font-medium rounded-xl px-4 py-2"
          >
            <Plus size={16} /> Nova Notícia
          </button>
        )}
      </div>

      {mostrarForm && (
        <form onSubmit={salvar} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 space-y-3">
          <input
            required
            placeholder="Título da notícia"
            value={novo.titulo}
            onChange={(e) => setNovo({ ...novo, titulo: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <textarea
            required
            placeholder="Conteúdo da notícia..."
            value={novo.conteudo}
            onChange={(e) => setNovo({ ...novo, conteudo: e.target.value })}
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
          />

          <div>
            <input
              ref={inputImagemRef}
              type="file"
              accept="image/*"
              onChange={aoEscolherImagem}
              className="hidden"
            />
            {novo.imagem_capa ? (
              <div className="relative">
                <img src={novo.imagem_capa} alt="Capa" className="w-full h-40 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => setNovo({ ...novo, imagem_capa: "" })}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-lg hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputImagemRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-500 hover:border-violet-500/40 hover:text-violet-400"
              >
                <ImageIcon size={20} />
                <span className="text-xs">Adicionar imagem de capa (opcional)</span>
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              disabled={salvando}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
            >
              {salvando ? "Salvando..." : editandoId ? "Atualizar Notícia" : "Publicar Notícia"}
            </button>
            <button
              type="button"
              onClick={() => { setMostrarForm(false); setEditandoId(null); }}
              className="px-4 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {carregando ? (
          <p className="text-sm text-slate-500 col-span-2">Carregando...</p>
        ) : noticias.length === 0 ? (
          <div className="col-span-2 bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-10 text-center">
            <Newspaper size={32} className="mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-500">Nenhuma notícia publicada ainda.</p>
          </div>
        ) : (
          noticias.map((n) => (
            <div key={n.id} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm overflow-hidden flex flex-col">
              {n.imagem_capa && (
                <img src={n.imagem_capa} alt={n.titulo} className="w-full h-40 object-cover" />
              )}
              <div className="p-4 flex flex-col flex-1">
                <p className="text-xs text-slate-500 mb-1">
                  {new Date(n.publicado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                  {n.autor_nome ? ` · ${n.autor_nome}` : ""}
                </p>
                <h3 className="font-semibold text-white mb-1">{n.titulo}</h3>
                <p className="text-sm text-slate-400 line-clamp-3 flex-1">{n.conteudo}</p>

                {usuario?.tipo === "admin" && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => abrirEdicao(n)}
                      className="text-xs text-slate-400 hover:text-violet-400 font-medium flex items-center gap-1"
                    >
                      <Pencil size={12} /> Editar
                    </button>
                    <button
                      onClick={() => remover(n.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Remover
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
