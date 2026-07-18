import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus, Trash2, Bell, Users, HeartHandshake, Megaphone } from "lucide-react";

export default function Comunicacoes() {
  const { usuario } = useAuth();
  const [comunicados, setComunicados] = useState([]);
  const [celulas, setCelulas] = useState([]);
  const [ministerios, setMinisterios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [novo, setNovo] = useState({ titulo: "", mensagem: "", publico_alvo: "todos", alvo_id: "" });

  function carregar() {
    setCarregando(true);
    api.get("/comunicados").then((res) => {
      setComunicados(res.data);
      res.data.forEach((c) => {
        if (!c.lido) api.post(`/comunicados/${c.id}/lido`).catch(() => {});
      });
    }).finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
    if (usuario?.tipo === "admin") {
      api.get("/celulas").then((res) => setCelulas(res.data)).catch(() => {});
      api.get("/ministerios").then((res) => setMinisterios(res.data)).catch(() => {});
    }
  }, [usuario]);

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const payload = { ...novo, alvo_id: novo.publico_alvo === "todos" ? null : novo.alvo_id };
      await api.post("/comunicados", payload);
      setNovo({ titulo: "", mensagem: "", publico_alvo: "todos", alvo_id: "" });
      setMostrarForm(false);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao enviar comunicado");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id) {
    if (!window.confirm("Remover este comunicado?")) return;
    try {
      await api.delete(`/comunicados/${id}`);
      carregar();
    } catch (err) {
      alert("Erro ao remover comunicado");
    }
  }

  function iconePublico(alvo) {
    if (alvo === "celula") return <Users size={14} />;
    if (alvo === "ministerio") return <HeartHandshake size={14} />;
    return <Megaphone size={14} />;
  }

  function labelPublico(c) {
    if (c.publico_alvo === "todos") return "Para todos";
    if (c.publico_alvo === "celula") return "Célula específica";
    if (c.publico_alvo === "ministerio") return "Ministério específico";
    return "";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white text-lg">Comunicações</h2>
        {usuario?.tipo === "admin" && (
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm font-medium rounded-xl px-4 py-2"
          >
            <Plus size={16} /> Novo Comunicado
          </button>
        )}
      </div>

      {mostrarForm && (
        <form onSubmit={salvar} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 space-y-3">
          <input
            required
            placeholder="Título do comunicado"
            value={novo.titulo}
            onChange={(e) => setNovo({ ...novo, titulo: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <textarea
            required
            placeholder="Mensagem..."
            value={novo.mensagem}
            onChange={(e) => setNovo({ ...novo, mensagem: e.target.value })}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={novo.publico_alvo}
              onChange={(e) => setNovo({ ...novo, publico_alvo: e.target.value, alvo_id: "" })}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="todos" className="bg-[#0F0F1E]">Para todos os membros</option>
              <option value="celula" className="bg-[#0F0F1E]">Uma célula específica</option>
              <option value="ministerio" className="bg-[#0F0F1E]">Um ministério específico</option>
            </select>

            {novo.publico_alvo === "celula" && (
              <select
                required
                value={novo.alvo_id}
                onChange={(e) => setNovo({ ...novo, alvo_id: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="" className="bg-[#0F0F1E]">Selecione a célula</option>
                {celulas.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0F0F1E]">{c.nome}</option>
                ))}
              </select>
            )}

            {novo.publico_alvo === "ministerio" && (
              <select
                required
                value={novo.alvo_id}
                onChange={(e) => setNovo({ ...novo, alvo_id: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="" className="bg-[#0F0F1E]">Selecione o ministério</option>
                {ministerios.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0F0F1E]">{m.nome}</option>
                ))}
              </select>
            )}
          </div>

          <button
            disabled={salvando}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
          >
            {salvando ? "Enviando..." : "Enviar Comunicado"}
          </button>
        </form>
      )}

      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm divide-y divide-white/5">
        {carregando ? (
          <p className="text-sm text-slate-500 p-5">Carregando...</p>
        ) : comunicados.length === 0 ? (
          <div className="p-10 text-center">
            <Bell size={32} className="mx-auto text-slate-600 mb-2" />
            <p className="text-sm text-slate-500">Nenhum comunicado ainda.</p>
          </div>
        ) : (
          comunicados.map((c) => (
            <div key={c.id} className="p-4 flex items-start gap-3 hover:bg-white/[0.02]">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0 mt-0.5">
                {iconePublico(c.publico_alvo)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-white">{c.titulo}</p>
                  <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">
                    {labelPublico(c)}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1">{c.mensagem}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {c.autor_nome} · {new Date(c.criado_em).toLocaleDateString("pt-BR")}
                </p>
              </div>
              {usuario?.tipo === "admin" && (
                <button
                  onClick={() => remover(c.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
