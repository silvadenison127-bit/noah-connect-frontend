import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus, Users, Trash2, Pencil, X } from "lucide-react";

export default function Cultos() {
  const { usuario } = useAuth();
  const [cultos, setCultos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [novo, setNovo] = useState({ titulo: "", descricao: "", data_inicio: "", local: "" });
  const [salvando, setSalvando] = useState(false);

  const [presencaCultoId, setPresencaCultoId] = useState(null);
  const [presencas, setPresencas] = useState([]);
  const [carregandoPresencas, setCarregandoPresencas] = useState(false);

  function carregar() {
    setCarregando(true);
    api.get("/cultos").then((res) => setCultos(res.data)).finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  function abrirNovo() {
    setEditandoId(null);
    setNovo({ titulo: "", descricao: "", data_inicio: "", local: "" });
    setMostrarForm(true);
  }

  function abrirEdicao(culto) {
    setEditandoId(culto.id);
    setNovo({
      titulo: culto.titulo,
      descricao: culto.descricao || "",
      data_inicio: culto.data_inicio?.slice(0, 16),
      local: culto.local || "",
    });
    setMostrarForm(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      if (editandoId) {
        await api.put(`/cultos/${editandoId}`, novo);
      } else {
        await api.post("/cultos", novo);
      }
      setMostrarForm(false);
      setEditandoId(null);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao salvar culto");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id) {
    if (!window.confirm("Remover este culto? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/cultos/${id}`);
      carregar();
    } catch (err) {
      alert("Erro ao remover culto");
    }
  }

  async function abrirPresencas(culto) {
    setPresencaCultoId(culto.id);
    setCarregandoPresencas(true);
    try {
      const { data } = await api.get(`/cultos/${culto.id}/presencas`);
      setPresencas(data);
    } catch (err) {
      alert("Erro ao carregar presenças");
    } finally {
      setCarregandoPresencas(false);
    }
  }

  async function alternarPresenca(usuario_id, presenteAtual) {
    const novoValor = !presenteAtual;
    setPresencas((atual) =>
      atual.map((p) => (p.usuario_id === usuario_id ? { ...p, presente: novoValor } : p))
    );
    try {
      await api.post(`/cultos/${presencaCultoId}/presencas`, { usuario_id, presente: novoValor });
    } catch (err) {
      alert("Erro ao registrar presença");
      abrirPresencas({ id: presencaCultoId });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white text-lg">Cultos</h2>
        {usuario?.tipo === "admin" && (
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm font-medium rounded-xl px-4 py-2"
          >
            <Plus size={16} /> Novo Culto
          </button>
        )}
      </div>

      {mostrarForm && (
        <form onSubmit={salvar} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            required
            placeholder="Título do culto"
            value={novo.titulo}
            onChange={(e) => setNovo({ ...novo, titulo: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 sm:col-span-2"
          />
          <input
            required
            type="datetime-local"
            value={novo.data_inicio}
            onChange={(e) => setNovo({ ...novo, data_inicio: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 [color-scheme:dark]"
          />
          <input
            placeholder="Local"
            value={novo.local}
            onChange={(e) => setNovo({ ...novo, local: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
          />
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
              {salvando ? "Salvando..." : editandoId ? "Atualizar Culto" : "Salvar Culto"}
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
        ) : cultos.length === 0 ? (
          <p className="text-sm text-slate-500 p-5">Nenhum culto cadastrado ainda.</p>
        ) : (
          cultos.map((c) => {
            const data = new Date(c.data_inicio);
            return (
              <div key={c.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
                <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex flex-col items-center justify-center text-violet-400 shrink-0">
                  <span className="text-base font-bold leading-none">{data.toLocaleDateString("pt-BR", { day: "2-digit" })}</span>
                  <span className="text-[10px] leading-none mt-1 uppercase">{data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{c.titulo}</p>
                  <p className="text-xs text-slate-500">
                    {data.toLocaleString("pt-BR", { weekday: "long", hour: "2-digit", minute: "2-digit" })}
                    {c.local ? ` · ${c.local}` : ""}
                  </p>
                </div>
                {usuario?.tipo === "admin" && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => abrirPresencas(c)}
                      title="Registrar presença"
                      className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                    >
                      <Users size={16} />
                    </button>
                    <button
                      onClick={() => abrirEdicao(c)}
                      title="Editar"
                      className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => remover(c.id)}
                      title="Remover"
                      className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {presencaCultoId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0F0F1E] border border-white/10 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white">Registrar Presença</h3>
              <button onClick={() => setPresencaCultoId(null)} className="p-1 rounded-lg hover:bg-white/5 text-slate-400">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-3 space-y-1">
              {carregandoPresencas ? (
                <p className="text-sm text-slate-500 p-3">Carregando membros...</p>
              ) : presencas.length === 0 ? (
                <p className="text-sm text-slate-500 p-3">Nenhum membro ativo encontrado.</p>
              ) : (
                presencas.map((p) => (
                  <label
                    key={p.usuario_id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={p.presente}
                      onChange={() => alternarPresenca(p.usuario_id, p.presente)}
                      className="w-4 h-4 rounded accent-violet-500"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">{p.nome}</p>
                      <p className="text-xs text-slate-500 truncate">{p.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
