import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus, Users, Trash2, Pencil, X, HeartHandshake } from "lucide-react";

export default function Ministerios() {
  const { usuario } = useAuth();
  const [ministerios, setMinisterios] = useState([]);
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [novo, setNovo] = useState({ nome: "", lider_id: "", descricao: "" });
  const [salvando, setSalvando] = useState(false);

  const [ministerioMembrosId, setMinisterioMembrosId] = useState(null);
  const [vinculados, setVinculados] = useState([]);
  const [disponiveis, setDisponiveis] = useState([]);
  const [carregandoMembros, setCarregandoMembros] = useState(false);

  function carregar() {
    setCarregando(true);
    api.get("/ministerios").then((res) => setMinisterios(res.data)).finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
    api.get("/membros").then((res) => setMembros(res.data)).catch(() => {});
  }, []);

  function abrirNovo() {
    setEditandoId(null);
    setNovo({ nome: "", lider_id: "", descricao: "" });
    setMostrarForm(true);
  }

  function abrirEdicao(ministerio) {
    setEditandoId(ministerio.id);
    setNovo({
      nome: ministerio.nome,
      lider_id: ministerio.lider_id || "",
      descricao: ministerio.descricao || "",
    });
    setMostrarForm(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const payload = { ...novo, lider_id: novo.lider_id || null };
      if (editandoId) {
        await api.put(`/ministerios/${editandoId}`, payload);
      } else {
        await api.post("/ministerios", payload);
      }
      setMostrarForm(false);
      setEditandoId(null);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao salvar ministério");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id) {
    if (!window.confirm("Remover este ministério? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/ministerios/${id}`);
      carregar();
    } catch (err) {
      alert("Erro ao remover ministério");
    }
  }

  async function abrirMembros(ministerio) {
    setMinisterioMembrosId(ministerio.id);
    setCarregandoMembros(true);
    try {
      const { data } = await api.get(`/ministerios/${ministerio.id}/membros`);
      setVinculados(data.vinculados);
      setDisponiveis(data.disponiveis);
    } catch (err) {
      alert("Erro ao carregar membros do ministério");
    } finally {
      setCarregandoMembros(false);
    }
  }

  async function vincular(usuario_id) {
    try {
      await api.post(`/ministerios/${ministerioMembrosId}/membros`, { usuario_id });
      abrirMembros({ id: ministerioMembrosId });
      carregar();
    } catch (err) {
      alert("Erro ao vincular membro");
    }
  }

  async function desvincular(usuario_id) {
    try {
      await api.delete(`/ministerios/${ministerioMembrosId}/membros/${usuario_id}`);
      abrirMembros({ id: ministerioMembrosId });
      carregar();
    } catch (err) {
      alert("Erro ao desvincular membro");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white text-lg">Ministérios</h2>
        {usuario?.tipo === "admin" && (
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm font-medium rounded-xl px-4 py-2"
          >
            <Plus size={16} /> Novo Ministério
          </button>
        )}
      </div>

      {mostrarForm && (
        <form onSubmit={salvar} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            required
            placeholder="Nome do ministério"
            value={novo.nome}
            onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 sm:col-span-2"
          />
          <select
            value={novo.lider_id}
            onChange={(e) => setNovo({ ...novo, lider_id: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 sm:col-span-2"
          >
            <option value="" className="bg-[#0F0F1E]">Selecionar líder (opcional)</option>
            {membros.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#0F0F1E]">{m.nome}</option>
            ))}
          </select>
          <textarea
            placeholder="Descrição (opcional)"
            value={novo.descricao}
            onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 sm:col-span-2"
            rows={2}
          />
          <div className="sm:col-span-2 flex gap-2">
            <button
              disabled={salvando}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
            >
              {salvando ? "Salvando..." : editandoId ? "Atualizar Ministério" : "Salvar Ministério"}
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

      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm divide-y divide-white/5">
        {carregando ? (
          <p className="text-sm text-slate-500 p-5">Carregando...</p>
        ) : ministerios.length === 0 ? (
          <p className="text-sm text-slate-500 p-5">Nenhum ministério cadastrado ainda.</p>
        ) : (
          ministerios.map((m) => (
            <div key={m.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
                <HeartHandshake size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{m.nome}</p>
                <p className="text-xs text-slate-500">
                  {m.lider_nome ? `Líder: ${m.lider_nome}` : "Sem líder definido"}
                  {m.descricao ? ` · ${m.descricao}` : ""}
                </p>
              </div>
              <span className="text-xs bg-white/5 text-slate-400 px-2 py-1 rounded-full shrink-0">
                {m.total_membros} {m.total_membros === "1" ? "membro" : "membros"}
              </span>
              {usuario?.tipo === "admin" && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => abrirMembros(m)}
                    title="Gerenciar membros"
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                  >
                    <Users size={16} />
                  </button>
                  <button
                    onClick={() => abrirEdicao(m)}
                    title="Editar"
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => remover(m.id)}
                    title="Remover"
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {ministerioMembrosId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0F0F1E] border border-white/10 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white">Membros do Ministério</h3>
              <button onClick={() => setMinisterioMembrosId(null)} className="p-1 rounded-lg hover:bg-white/5 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-4">
              {carregandoMembros ? (
                <p className="text-sm text-slate-500">Carregando...</p>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2">Vinculados ({vinculados.length})</p>
                    {vinculados.length === 0 ? (
                      <p className="text-xs text-slate-500">Nenhum membro vinculado ainda.</p>
                    ) : (
                      <div className="space-y-1">
                        {vinculados.map((m) => (
                          <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-100 truncate">{m.nome}</p>
                              <p className="text-xs text-slate-500 truncate">{m.email}</p>
                            </div>
                            <button
                              onClick={() => desvincular(m.id)}
                              className="text-xs text-rose-400 hover:text-rose-300 font-medium shrink-0 ml-2"
                            >
                              Remover
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2">Disponíveis ({disponiveis.length})</p>
                    {disponiveis.length === 0 ? (
                      <p className="text-xs text-slate-500">Nenhum membro disponível.</p>
                    ) : (
                      <div className="space-y-1">
                        {disponiveis.map((m) => (
                          <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-100 truncate">{m.nome}</p>
                              <p className="text-xs text-slate-500 truncate">{m.email}</p>
                            </div>
                            <button
                              onClick={() => vincular(m.id)}
                              className="text-xs text-violet-400 hover:text-violet-300 font-medium shrink-0 ml-2"
                            >
                              Adicionar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
