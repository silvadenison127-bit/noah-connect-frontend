import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus, Users, Trash2, Pencil, X } from "lucide-react";

export default function Celulas() {
  const { usuario } = useAuth();
  const [celulas, setCelulas] = useState([]);
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [novo, setNovo] = useState({ nome: "", lider_id: "", dia_semana: "", horario: "", endereco: "" });
  const [salvando, setSalvando] = useState(false);

  const [celulaMembrosId, setCelulaMembrosId] = useState(null);
  const [vinculados, setVinculados] = useState([]);
  const [disponiveis, setDisponiveis] = useState([]);
  const [carregandoMembros, setCarregandoMembros] = useState(false);

  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  function carregar() {
    setCarregando(true);
    api.get("/celulas").then((res) => setCelulas(res.data)).finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
    api.get("/membros").then((res) => setMembros(res.data)).catch(() => {});
  }, []);

  function abrirNovo() {
    setEditandoId(null);
    setNovo({ nome: "", lider_id: "", dia_semana: "", horario: "", endereco: "" });
    setMostrarForm(true);
  }

  function abrirEdicao(celula) {
    setEditandoId(celula.id);
    setNovo({
      nome: celula.nome,
      lider_id: celula.lider_id || "",
      dia_semana: celula.dia_semana || "",
      horario: celula.horario || "",
      endereco: celula.endereco || "",
    });
    setMostrarForm(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const payload = { ...novo, lider_id: novo.lider_id || null };
      if (editandoId) {
        await api.put(`/celulas/${editandoId}`, payload);
      } else {
        await api.post("/celulas", payload);
      }
      setMostrarForm(false);
      setEditandoId(null);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao salvar célula");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id) {
    if (!window.confirm("Remover esta célula? Esta ação não pode ser desfeita.")) return;
    try {
      await api.delete(`/celulas/${id}`);
      carregar();
    } catch (err) {
      alert("Erro ao remover célula");
    }
  }

  async function abrirMembros(celula) {
    setCelulaMembrosId(celula.id);
    setCarregandoMembros(true);
    try {
      const { data } = await api.get(`/celulas/${celula.id}/membros`);
      setVinculados(data.vinculados);
      setDisponiveis(data.disponiveis);
    } catch (err) {
      alert("Erro ao carregar membros da célula");
    } finally {
      setCarregandoMembros(false);
    }
  }

  async function vincular(usuario_id) {
    try {
      await api.post(`/celulas/${celulaMembrosId}/membros`, { usuario_id });
      abrirMembros({ id: celulaMembrosId });
      carregar();
    } catch (err) {
      alert("Erro ao vincular membro");
    }
  }

  async function desvincular(usuario_id) {
    try {
      await api.delete(`/celulas/${celulaMembrosId}/membros/${usuario_id}`);
      abrirMembros({ id: celulaMembrosId });
      carregar();
    } catch (err) {
      alert("Erro ao desvincular membro");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white text-lg">Células</h2>
        {usuario?.tipo === "admin" && (
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm font-medium rounded-xl px-4 py-2"
          >
            <Plus size={16} /> Nova Célula
          </button>
        )}
      </div>

      {mostrarForm && (
        <form onSubmit={salvar} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            required
            placeholder="Nome da célula"
            value={novo.nome}
            onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 sm:col-span-2"
          />
          <select
            value={novo.lider_id}
            onChange={(e) => setNovo({ ...novo, lider_id: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="" className="bg-[#0F0F1E]">Selecionar líder (opcional)</option>
            {membros.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#0F0F1E]">{m.nome}</option>
            ))}
          </select>
          <select
            value={novo.dia_semana}
            onChange={(e) => setNovo({ ...novo, dia_semana: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="" className="bg-[#0F0F1E]">Dia da semana</option>
            {diasSemana.map((d) => (
              <option key={d} value={d} className="bg-[#0F0F1E]">{d}</option>
            ))}
          </select>
          <input
            type="time"
            value={novo.horario}
            onChange={(e) => setNovo({ ...novo, horario: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 [color-scheme:dark]"
          />
          <input
            placeholder="Endereço"
            value={novo.endereco}
            onChange={(e) => setNovo({ ...novo, endereco: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <div className="sm:col-span-2 flex gap-2">
            <button
              disabled={salvando}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
            >
              {salvando ? "Salvando..." : editandoId ? "Atualizar Célula" : "Salvar Célula"}
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
        ) : celulas.length === 0 ? (
          <p className="text-sm text-slate-500 p-5">Nenhuma célula cadastrada ainda.</p>
        ) : (
          celulas.map((c) => (
            <div key={c.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
                <Users size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{c.nome}</p>
                <p className="text-xs text-slate-500">
                  {c.lider_nome ? `Líder: ${c.lider_nome}` : "Sem líder definido"}
                  {c.dia_semana ? ` · ${c.dia_semana}` : ""}
                  {c.horario ? ` às ${c.horario}` : ""}
                  {c.endereco ? ` · ${c.endereco}` : ""}
                </p>
              </div>
              <span className="text-xs bg-white/5 text-slate-400 px-2 py-1 rounded-full shrink-0">
                {c.total_membros} {c.total_membros === "1" ? "membro" : "membros"}
              </span>
              {usuario?.tipo === "admin" && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => abrirMembros(c)}
                    title="Gerenciar membros"
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
          ))
        )}
      </div>

      {celulaMembrosId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0F0F1E] border border-white/10 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white">Membros da Célula</h3>
              <button onClick={() => setCelulaMembrosId(null)} className="p-1 rounded-lg hover:bg-white/5 text-slate-400">
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
