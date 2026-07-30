import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus, GraduationCap, Pencil, Trash2, Users, Search } from "lucide-react";

const ABAS = [
  { id: "turmas", nome: "Turmas" },
  { id: "inscricoes", nome: "Inscricoes" },
  { id: "presenca", nome: "Lista de Presenca" },
];

const STATUS_LABEL = {
  ativa: { texto: "Ativa", cor: "bg-emerald-500/10 text-emerald-400" },
  planejada: { texto: "Planejada", cor: "bg-amber-500/10 text-amber-400" },
  encerrada: { texto: "Encerrada", cor: "bg-slate-500/10 text-slate-400" },
  cancelada: { texto: "Cancelada", cor: "bg-rose-500/10 text-rose-400" },
};

const STATUS_INSCRICAO_LABEL = {
  inscrito: { texto: "Inscrito", cor: "bg-blue-500/10 text-blue-400" },
  confirmado: { texto: "Confirmado", cor: "bg-emerald-500/10 text-emerald-400" },
  cancelado: { texto: "Cancelado", cor: "bg-rose-500/10 text-rose-400" },
  concluido: { texto: "Concluido", cor: "bg-violet-500/10 text-violet-400" },
};

export default function Cursos() {
  const { usuario } = useAuth();
  const ehAdmin = usuario?.tipo === "admin";

  const [abaAtiva, setAbaAtiva] = useState("turmas");
  const [cursos, setCursos] = useState([]);
  const [cursoFiltro, setCursoFiltro] = useState("");

  const [turmas, setTurmas] = useState([]);
  const [carregandoTurmas, setCarregandoTurmas] = useState(true);
  const [mostrarFormTurma, setMostrarFormTurma] = useState(false);
  const [editandoTurmaId, setEditandoTurmaId] = useState(null);
  const [novaTurma, setNovaTurma] = useState({
    curso_id: "", nome: "", professor: "", data_inicio: "", data_fim: "",
    dias_semana: "", horario: "", local: "", max_alunos: "", status: "planejada",
  });
  const [salvandoTurma, setSalvandoTurma] = useState(false);

  const [inscricoes, setInscricoes] = useState([]);
  const [carregandoInscricoes, setCarregandoInscricoes] = useState(true);
  const [buscaInscricao, setBuscaInscricao] = useState("");
  const [statusFiltroInscricao, setStatusFiltroInscricao] = useState("");
  const [mostrarFormInscricao, setMostrarFormInscricao] = useState(false);
  const [editandoInscricaoId, setEditandoInscricaoId] = useState(null);
  const [novaInscricao, setNovaInscricao] = useState({
    turma_id: "", nome_completo: "", telefone: "", email: "", cpf: "", observacoes: "", status: "inscrito",
  });
  const [salvandoInscricao, setSalvandoInscricao] = useState(false);
  const [todasTurmas, setTodasTurmas] = useState([]);

  useEffect(() => {
    api.get("/cursos").then((res) => setCursos(res.data)).catch(() => {});
    api.get("/turmas").then((res) => setTodasTurmas(res.data)).catch(() => {});
  }, []);

  function carregarTurmas() {
    setCarregandoTurmas(true);
    const query = cursoFiltro ? `?curso_id=${cursoFiltro}` : "";
    api.get(`/turmas${query}`)
      .then((res) => setTurmas(res.data))
      .finally(() => setCarregandoTurmas(false));
  }

  useEffect(() => {
    if (abaAtiva === "turmas") carregarTurmas();
  }, [abaAtiva, cursoFiltro]);

  function abrirNovaTurma() {
    setEditandoTurmaId(null);
    setNovaTurma({
      curso_id: cursoFiltro || "", nome: "", professor: "", data_inicio: "", data_fim: "",
      dias_semana: "", horario: "", local: "", max_alunos: "", status: "planejada",
    });
    setMostrarFormTurma(true);
  }

  function abrirEdicaoTurma(turma) {
    setEditandoTurmaId(turma.id);
    setNovaTurma({
      curso_id: turma.curso_id || "",
      nome: turma.nome || "",
      professor: turma.professor || "",
      data_inicio: turma.data_inicio ? turma.data_inicio.substring(0, 10) : "",
      data_fim: turma.data_fim ? turma.data_fim.substring(0, 10) : "",
      dias_semana: turma.dias_semana || "",
      horario: turma.horario || "",
      local: turma.local || "",
      max_alunos: turma.max_alunos || "",
      status: turma.status || "planejada",
    });
    setMostrarFormTurma(true);
  }

  async function salvarTurma(e) {
    e.preventDefault();
    setSalvandoTurma(true);
    try {
      const payload = { ...novaTurma, max_alunos: novaTurma.max_alunos || null };
      if (editandoTurmaId) {
        await api.put(`/turmas/${editandoTurmaId}`, payload);
      } else {
        await api.post("/turmas", payload);
      }
      setMostrarFormTurma(false);
      setEditandoTurmaId(null);
      carregarTurmas();
      api.get("/turmas").then((res) => setTodasTurmas(res.data)).catch(() => {});
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao salvar turma");
    } finally {
      setSalvandoTurma(false);
    }
  }

  async function removerTurma(id) {
    if (!window.confirm("Remover esta turma? Todas as inscricoes vinculadas tambem serao removidas.")) return;
    try {
      await api.delete(`/turmas/${id}`);
      carregarTurmas();
    } catch (err) {
      alert("Erro ao remover turma");
    }
  }

  function carregarInscricoes() {
    setCarregandoInscricoes(true);
    const params = new URLSearchParams();
    if (statusFiltroInscricao) params.append("status", statusFiltroInscricao);
    if (buscaInscricao) params.append("busca", buscaInscricao);
    const query = params.toString() ? `?${params.toString()}` : "";
    api.get(`/inscricoes-cursos${query}`)
      .then((res) => setInscricoes(res.data))
      .finally(() => setCarregandoInscricoes(false));
  }

  useEffect(() => {
    if (abaAtiva === "inscricoes") {
      const timeout = setTimeout(carregarInscricoes, 300);
      return () => clearTimeout(timeout);
    }
  }, [abaAtiva, statusFiltroInscricao, buscaInscricao]);

  function abrirNovaInscricao() {
    setEditandoInscricaoId(null);
    setNovaInscricao({ turma_id: "", nome_completo: "", telefone: "", email: "", cpf: "", observacoes: "", status: "inscrito" });
    setMostrarFormInscricao(true);
  }

  function abrirEdicaoInscricao(inscricao) {
    setEditandoInscricaoId(inscricao.id);
    setNovaInscricao({
      turma_id: inscricao.turma_id || "",
      nome_completo: inscricao.nome_completo || "",
      telefone: inscricao.telefone || "",
      email: inscricao.email || "",
      cpf: inscricao.cpf || "",
      observacoes: inscricao.observacoes || "",
      status: inscricao.status || "inscrito",
    });
    setMostrarFormInscricao(true);
  }

  async function salvarInscricao(e) {
    e.preventDefault();
    setSalvandoInscricao(true);
    try {
      if (editandoInscricaoId) {
        await api.put(`/inscricoes-cursos/${editandoInscricaoId}`, novaInscricao);
      } else {
        await api.post("/inscricoes-cursos", novaInscricao);
      }
      setMostrarFormInscricao(false);
      setEditandoInscricaoId(null);
      carregarInscricoes();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao salvar inscricao");
    } finally {
      setSalvandoInscricao(false);
    }
  }

  async function removerInscricao(id) {
    if (!window.confirm("Remover esta inscricao?")) return;
    try {
      await api.delete(`/inscricoes-cursos/${id}`);
      carregarInscricoes();
    } catch (err) {
      alert("Erro ao remover inscricao");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-white text-lg">Cursos</h2>
          <p className="text-sm text-slate-500">Gerencie todos os cursos da igreja em um unico lugar.</p>
        </div>
        {ehAdmin && abaAtiva === "turmas" && (
          <button
            onClick={abrirNovaTurma}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm font-medium rounded-xl px-4 py-2"
          >
            <Plus size={16} /> Nova Turma
          </button>
        )}
        {ehAdmin && abaAtiva === "inscricoes" && (
          <button
            onClick={abrirNovaInscricao}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm font-medium rounded-xl px-4 py-2"
          >
            <Plus size={16} /> Nova Inscricao
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 border-b border-white/5">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              abaAtiva === aba.id
                ? "border-violet-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {aba.nome}
          </button>
        ))}
      </div>

      {abaAtiva === "turmas" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCursoFiltro("")}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                cursoFiltro === "" ? "bg-violet-600 border-violet-600 text-white" : "border-white/10 text-slate-400 hover:bg-white/5"
              }`}
            >
              Todos os cursos
            </button>
            {cursos.map((c) => (
              <button
                key={c.id}
                onClick={() => setCursoFiltro(String(c.id))}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
                  cursoFiltro === String(c.id) ? "bg-violet-600 border-violet-600 text-white" : "border-white/10 text-slate-400 hover:bg-white/5"
                }`}
              >
                {c.nome}
              </button>
            ))}
          </div>

          {mostrarFormTurma && (
            <form onSubmit={salvarTurma} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                required
                value={novaTurma.curso_id}
                onChange={(e) => setNovaTurma({ ...novaTurma, curso_id: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 sm:col-span-2"
              >
                <option value="" className="bg-[#0F0F1E]">Selecione o curso</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0F0F1E]">{c.nome}</option>
                ))}
              </select>
              <input
                required
                placeholder="Nome da turma"
                value={novaTurma.nome}
                onChange={(e) => setNovaTurma({ ...novaTurma, nome: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 sm:col-span-2"
              />
              <input
                placeholder="Professor"
                value={novaTurma.professor}
                onChange={(e) => setNovaTurma({ ...novaTurma, professor: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <input
                placeholder="Local"
                value={novaTurma.local}
                onChange={(e) => setNovaTurma({ ...novaTurma, local: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <input
                type="date"
                value={novaTurma.data_inicio}
                onChange={(e) => setNovaTurma({ ...novaTurma, data_inicio: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 [color-scheme:dark]"
              />
              <input
                type="date"
                value={novaTurma.data_fim}
                onChange={(e) => setNovaTurma({ ...novaTurma, data_fim: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 [color-scheme:dark]"
              />
              <input
                placeholder="Dias da semana (ex: Ter e Qui)"
                value={novaTurma.dias_semana}
                onChange={(e) => setNovaTurma({ ...novaTurma, dias_semana: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <input
                placeholder="Horario (ex: 19h30)"
                value={novaTurma.horario}
                onChange={(e) => setNovaTurma({ ...novaTurma, horario: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <input
                type="number"
                placeholder="Max. de alunos"
                value={novaTurma.max_alunos}
                onChange={(e) => setNovaTurma({ ...novaTurma, max_alunos: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <select
                value={novaTurma.status}
                onChange={(e) => setNovaTurma({ ...novaTurma, status: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="planejada" className="bg-[#0F0F1E]">Planejada</option>
                <option value="ativa" className="bg-[#0F0F1E]">Ativa</option>
                <option value="encerrada" className="bg-[#0F0F1E]">Encerrada</option>
                <option value="cancelada" className="bg-[#0F0F1E]">Cancelada</option>
              </select>
              <div className="sm:col-span-2 flex gap-2">
                <button
                  disabled={salvandoTurma}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
                >
                  {salvandoTurma ? "Salvando..." : editandoTurmaId ? "Atualizar Turma" : "Salvar Turma"}
                </button>
                <button
                  type="button"
                  onClick={() => { setMostrarFormTurma(false); setEditandoTurmaId(null); }}
                  className="px-4 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm divide-y divide-white/5">
            {carregandoTurmas ? (
              <p className="text-sm text-slate-500 p-5">Carregando...</p>
            ) : turmas.length === 0 ? (
              <p className="text-sm text-slate-500 p-5">Nenhuma turma cadastrada ainda.</p>
            ) : (
              turmas.map((t) => {
                const statusInfo = STATUS_LABEL[t.status] || STATUS_LABEL.planejada;
                return (
                  <div key={t.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
                      <GraduationCap size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{t.nome}</p>
                      <p className="text-xs text-slate-500">
                        {t.curso_nome}
                        {t.professor ? ` · Prof. ${t.professor}` : ""}
                        {t.dias_semana ? ` · ${t.dias_semana}` : ""}
                        {t.horario ? ` as ${t.horario}` : ""}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusInfo.cor}`}>
                      {statusInfo.texto}
                    </span>
                    <span className="text-xs bg-white/5 text-slate-400 px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
                      <Users size={12} /> {t.total_inscritos}{t.max_alunos ? `/${t.max_alunos}` : ""}
                    </span>
                    {ehAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => abrirEdicaoTurma(t)}
                          title="Editar"
                          className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => removerTurma(t.id)}
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
        </div>
      )}

      {abaAtiva === "inscricoes" && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                placeholder="Buscar por nome..."
                value={buscaInscricao}
                onChange={(e) => setBuscaInscricao(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <select
              value={statusFiltroInscricao}
              onChange={(e) => setStatusFiltroInscricao(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="" className="bg-[#0F0F1E]">Todos os status</option>
              <option value="inscrito" className="bg-[#0F0F1E]">Inscrito</option>
              <option value="confirmado" className="bg-[#0F0F1E]">Confirmado</option>
              <option value="cancelado" className="bg-[#0F0F1E]">Cancelado</option>
              <option value="concluido" className="bg-[#0F0F1E]">Concluido</option>
            </select>
          </div>

          {mostrarFormInscricao && (
            <form onSubmit={salvarInscricao} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                required
                value={novaInscricao.turma_id}
                onChange={(e) => setNovaInscricao({ ...novaInscricao, turma_id: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 sm:col-span-2"
              >
                <option value="" className="bg-[#0F0F1E]">Selecione a turma</option>
                {todasTurmas.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0F0F1E]">{t.curso_nome} - {t.nome}</option>
                ))}
              </select>
              <input
                required
                placeholder="Nome completo"
                value={novaInscricao.nome_completo}
                onChange={(e) => setNovaInscricao({ ...novaInscricao, nome_completo: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 sm:col-span-2"
              />
              <input
                placeholder="Telefone"
                value={novaInscricao.telefone}
                onChange={(e) => setNovaInscricao({ ...novaInscricao, telefone: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <input
                placeholder="E-mail"
                type="email"
                value={novaInscricao.email}
                onChange={(e) => setNovaInscricao({ ...novaInscricao, email: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <input
                placeholder="CPF (para certificado)"
                value={novaInscricao.cpf}
                onChange={(e) => setNovaInscricao({ ...novaInscricao, cpf: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <select
                value={novaInscricao.status}
                onChange={(e) => setNovaInscricao({ ...novaInscricao, status: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="inscrito" className="bg-[#0F0F1E]">Inscrito</option>
                <option value="confirmado" className="bg-[#0F0F1E]">Confirmado</option>
                <option value="cancelado" className="bg-[#0F0F1E]">Cancelado</option>
                <option value="concluido" className="bg-[#0F0F1E]">Concluido</option>
              </select>
              <textarea
                placeholder="Observacoes (opcional)"
                value={novaInscricao.observacoes}
                onChange={(e) => setNovaInscricao({ ...novaInscricao, observacoes: e.target.value })}
                rows={2}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50 sm:col-span-2"
              />
              <div className="sm:col-span-2 flex gap-2">
                <button
                  disabled={salvandoInscricao}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
                >
                  {salvandoInscricao ? "Salvando..." : editandoInscricaoId ? "Atualizar Inscricao" : "Salvar Inscricao"}
                </button>
                <button
                  type="button"
                  onClick={() => { setMostrarFormInscricao(false); setEditandoInscricaoId(null); }}
                  className="px-4 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm divide-y divide-white/5">
            {carregandoInscricoes ? (
              <p className="text-sm text-slate-500 p-5">Carregando...</p>
            ) : inscricoes.length === 0 ? (
              <p className="text-sm text-slate-500 p-5">Nenhuma inscricao encontrada.</p>
            ) : (
              inscricoes.map((i) => {
                const statusInfo = STATUS_INSCRICAO_LABEL[i.status] || STATUS_INSCRICAO_LABEL.inscrito;
                return (
                  <div key={i.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0 text-xs font-semibold">
                      {i.nome_completo?.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{i.nome_completo}</p>
                      <p className="text-xs text-slate-500">
                        {i.curso_nome} - {i.turma_nome}
                        {i.cpf ? ` · CPF: ${i.cpf}` : ""}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusInfo.cor}`}>
                      {statusInfo.texto}
                    </span>
                    {ehAdmin && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => abrirEdicaoInscricao(i)}
                          title="Editar"
                          className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => removerInscricao(i.id)}
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
        </div>
      )}

      {abaAtiva === "presenca" && (
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 p-8 text-center text-slate-500 text-sm">
          Aba de Lista de Presenca em construcao.
        </div>
      )}
    </div>
  );
}