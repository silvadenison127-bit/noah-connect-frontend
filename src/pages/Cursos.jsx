import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
} from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CardEstatistica from "../components/CardEstatistica";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Plus, GraduationCap, Pencil, Trash2, Users, Search, Check, X as XIcon,
  Clock, FileText, BarChart3, BookOpen, Heart, Shield, UserCheck, Calendar,
  Download, FileSpreadsheet,
} from "lucide-react";

const ABAS = [
  { id: "dashboard", nome: "Dashboard" },
  { id: "turmas", nome: "Turmas" },
  { id: "inscricoes", nome: "Inscricoes" },
  { id: "presenca", nome: "Lista de Presenca" },
  { id: "relatorios", nome: "Relatorios" },
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

const STATUS_PRESENCA_OPCOES = [
  { valor: "presente", label: "Presente", cor: "bg-emerald-600 text-white", icone: Check },
  { valor: "ausente", label: "Ausente", cor: "bg-rose-600 text-white", icone: XIcon },
  { valor: "atrasado", label: "Atrasado", cor: "bg-amber-600 text-white", icone: Clock },
  { valor: "justificado", label: "Justificado", cor: "bg-blue-600 text-white", icone: FileText },
];

const ICONE_CURSO_PADRAO = {
  "Consolidação": BookOpen,
  "CME - Maturidade no Espírito": Shield,
  "CTL - Treinamento de Líderes": UserCheck,
  "Casais Radicais": Heart,
};

const tooltipStyle = {
  contentStyle: { background: "#15152A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 12 },
  labelStyle: { color: "#fff" },
  itemStyle: { color: "#C4B5FD" },
};

function hojeISO() {
  const d = new Date();
  return d.toISOString().substring(0, 10);
}

export default function Cursos() {
  const { usuario } = useAuth();
  const ehAdmin = usuario?.tipo === "admin";

  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [cursos, setCursos] = useState([]);
  const [cursoFiltro, setCursoFiltro] = useState("");
  const [buscaGlobal, setBuscaGlobal] = useState("");

  const [dashboardStats, setDashboardStats] = useState(null);
  const [carregandoDashboard, setCarregandoDashboard] = useState(true);
  const [mostrarFormCurso, setMostrarFormCurso] = useState(false);
  const [novoCurso, setNovoCurso] = useState({ nome: "", descricao: "" });
  const [salvandoCurso, setSalvandoCurso] = useState(false);

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

  const [turmaPresencaId, setTurmaPresencaId] = useState("");
  const [dataAula, setDataAula] = useState(hojeISO());
  const [listaPresenca, setListaPresenca] = useState([]);
  const [carregandoPresenca, setCarregandoPresenca] = useState(false);
  const [salvandoPresenca, setSalvandoPresenca] = useState(false);
  const [frequenciaVisivel, setFrequenciaVisivel] = useState(null);

  const [relatorioTurmaId, setRelatorioTurmaId] = useState("");
  const [relatorioTipo, setRelatorioTipo] = useState("alunos");
  const [relatorioDados, setRelatorioDados] = useState([]);
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);

  function carregarCursos() {
    api.get("/cursos").then((res) => setCursos(res.data)).catch(() => {});
  }

  useEffect(() => {
    carregarCursos();
    api.get("/turmas").then((res) => setTodasTurmas(res.data)).catch(() => {});
  }, []);

  function carregarDashboard() {
    setCarregandoDashboard(true);
    api.get("/cursos/dashboard-stats")
      .then((res) => setDashboardStats(res.data))
      .catch(() => setDashboardStats(null))
      .finally(() => setCarregandoDashboard(false));
  }

  useEffect(() => {
    if (abaAtiva === "dashboard") carregarDashboard();
  }, [abaAtiva]);

  async function salvarCurso(e) {
    e.preventDefault();
    setSalvandoCurso(true);
    try {
      await api.post("/cursos", novoCurso);
      setMostrarFormCurso(false);
      setNovoCurso({ nome: "", descricao: "" });
      carregarCursos();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao criar curso");
    } finally {
      setSalvandoCurso(false);
    }
  }

  function irParaTurmasDoCurso(cursoId) {
    setCursoFiltro(String(cursoId));
    setAbaAtiva("turmas");
  }

  const dadosInscricoesPorMes = (dashboardStats?.inscricoes_por_mes ?? []).map((item) => ({
    mes: new Date(`${item.mes}-01T00:00:00`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
    inscricoes: parseInt(item.total, 10),
  }));

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

  const turmasFiltradasBusca = turmas.filter((t) =>
    !buscaGlobal || t.nome.toLowerCase().includes(buscaGlobal.toLowerCase()) || (t.professor || "").toLowerCase().includes(buscaGlobal.toLowerCase())
  );

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

  function carregarListaPresenca() {
    if (!turmaPresencaId || !dataAula) {
      setListaPresenca([]);
      return;
    }
    setCarregandoPresenca(true);
    api.get(`/presencas-cursos/turma/${turmaPresencaId}?data=${dataAula}`)
      .then((res) => {
        const lista = res.data.map((aluno) => ({
          ...aluno,
          status: aluno.status || "presente",
        }));
        setListaPresenca(lista);
      })
      .catch(() => setListaPresenca([]))
      .finally(() => setCarregandoPresenca(false));
  }

  useEffect(() => {
    if (abaAtiva === "presenca") carregarListaPresenca();
  }, [abaAtiva, turmaPresencaId, dataAula]);

  function alterarStatusAluno(inscricaoId, novoStatus) {
    setListaPresenca((prev) =>
      prev.map((a) => (a.inscricao_id === inscricaoId ? { ...a, status: novoStatus } : a))
    );
  }

  async function salvarPresencas() {
    if (listaPresenca.length === 0) return;
    setSalvandoPresenca(true);
    try {
      const registros = listaPresenca.map((a) => ({ inscricao_id: a.inscricao_id, status: a.status }));
      await api.post("/presencas-cursos/lote", { data_aula: dataAula, registros });
      alert("Presenca salva com sucesso!");
      carregarListaPresenca();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao salvar presenca");
    } finally {
      setSalvandoPresenca(false);
    }
  }

  async function verFrequencia(inscricaoId, nome) {
    try {
      const { data } = await api.get(`/presencas-cursos/frequencia/${inscricaoId}`);
      setFrequenciaVisivel({ nome, ...data });
    } catch (err) {
      alert("Erro ao buscar frequencia");
    }
  }

  function carregarRelatorio() {
    if (!relatorioTurmaId) {
      setRelatorioDados([]);
      return;
    }
    setCarregandoRelatorio(true);
    const rota = relatorioTipo === "alunos"
      ? `/inscricoes-cursos?turma_id=${relatorioTurmaId}`
      : `/presencas-cursos/turma/${relatorioTurmaId}/relatorio-frequencia`;
    api.get(rota)
      .then((res) => setRelatorioDados(res.data))
      .catch(() => setRelatorioDados([]))
      .finally(() => setCarregandoRelatorio(false));
  }

  useEffect(() => {
    if (abaAtiva === "relatorios") carregarRelatorio();
  }, [abaAtiva, relatorioTurmaId, relatorioTipo]);

  function turmaSelecionadaNome() {
    const t = todasTurmas.find((x) => String(x.id) === String(relatorioTurmaId));
    return t ? `${t.curso_nome} - ${t.nome}` : "";
  }

  function colunasRelatorio() {
    if (relatorioTipo === "alunos") {
      return [
        { header: "Nome", key: "nome_completo" },
        { header: "Telefone", key: "telefone" },
        { header: "E-mail", key: "email" },
        { header: "CPF", key: "cpf" },
        { header: "Status", key: "status" },
      ];
    }
    return [
      { header: "Nome", key: "nome_completo" },
      { header: "Presencas", key: "presencas" },
      { header: "Faltas", key: "faltas" },
      { header: "Atrasos", key: "atrasos" },
      { header: "Justificadas", key: "justificadas" },
      { header: "Frequencia", key: "percentual_frequencia" },
    ];
  }

  function exportarPDF() {
    if (relatorioDados.length === 0) return;
    const colunas = colunasRelatorio();
    const doc = new jsPDF();
    const titulo = relatorioTipo === "alunos" ? "Lista de Alunos" : "Relatorio de Frequencia";

    doc.setFontSize(14);
    doc.text(titulo, 14, 15);
    doc.setFontSize(10);
    doc.text(turmaSelecionadaNome(), 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [colunas.map((c) => c.header)],
      body: relatorioDados.map((linha) =>
        colunas.map((c) => {
          const valor = linha[c.key];
          if (c.key === "percentual_frequencia") return `${valor ?? 0}%`;
          return valor ?? "-";
        })
      ),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [139, 92, 246] },
    });

    doc.save(`${titulo.replace(/\s+/g, "_")}.pdf`);
  }

  function exportarExcel() {
    if (relatorioDados.length === 0) return;
    const colunas = colunasRelatorio();
    const linhas = relatorioDados.map((linha) => {
      const obj = {};
      colunas.forEach((c) => {
        const valor = linha[c.key];
        obj[c.header] = c.key === "percentual_frequencia" ? `${valor ?? 0}%` : (valor ?? "-");
      });
      return obj;
    });
    const planilha = XLSX.utils.json_to_sheet(linhas);
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, "Relatorio");
    const titulo = relatorioTipo === "alunos" ? "Lista_de_Alunos" : "Relatorio_de_Frequencia";
    XLSX.writeFile(livro, `${titulo}.xlsx`);
  }

  const resumoPresenca = {
    presentes: listaPresenca.filter((a) => a.status === "presente").length,
    ausentes: listaPresenca.filter((a) => a.status === "ausente").length,
    atrasados: listaPresenca.filter((a) => a.status === "atrasado").length,
    justificados: listaPresenca.filter((a) => a.status === "justificado").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold text-white text-lg">Cursos</h2>
          <p className="text-sm text-slate-500">Gerencie todos os cursos da igreja em um unico lugar.</p>
        </div>
        <div className="flex items-center gap-2">
          {ehAdmin && abaAtiva === "dashboard" && (
            <button
              onClick={() => setMostrarFormCurso(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm font-medium rounded-xl px-4 py-2"
            >
              <Plus size={16} /> Novo Curso
            </button>
          )}
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
      </div>

      {(abaAtiva === "dashboard" || abaAtiva === "turmas") && (
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            placeholder="Buscar turma ou professor..."
            value={buscaGlobal}
            onChange={(e) => setBuscaGlobal(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>
      )}

      {mostrarFormCurso && (
        <form onSubmit={salvarCurso} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 grid grid-cols-1 gap-3">
          <input
            required
            placeholder="Nome do curso"
            value={novoCurso.nome}
            onChange={(e) => setNovoCurso({ ...novoCurso, nome: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <textarea
            placeholder="Descricao (opcional)"
            value={novoCurso.descricao}
            onChange={(e) => setNovoCurso({ ...novoCurso, descricao: e.target.value })}
            rows={2}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <div className="flex gap-2">
            <button
              disabled={salvandoCurso}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
            >
              {salvandoCurso ? "Salvando..." : "Salvar Curso"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarFormCurso(false)}
              className="px-4 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-2 border-b border-white/5 overflow-x-auto">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors shrink-0 ${
              abaAtiva === aba.id
                ? "border-violet-500 text-white"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            {aba.nome}
          </button>
        ))}
      </div>

      {abaAtiva === "dashboard" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Acesso Rapido</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {cursos.map((c) => {
                const Icone = ICONE_CURSO_PADRAO[c.nome] || GraduationCap;
                return (
                  <button
                    key={c.id}
                    onClick={() => irParaTurmasDoCurso(c.id)}
                    className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 flex flex-col items-center gap-2 hover:border-violet-500/40 hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                      <Icone size={20} />
                    </div>
                    <p className="text-xs font-medium text-slate-200 text-center leading-tight">{c.nome}</p>
                    <span className="text-[10px] text-slate-500">{c.total_turmas} turma{c.total_turmas === "1" ? "" : "s"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <CardEstatistica icone={GraduationCap} label="Total de Cursos" valor={dashboardStats?.total_cursos ?? 0} carregando={carregandoDashboard} />
            <CardEstatistica icone={Users} label="Turmas Ativas" valor={dashboardStats?.turmas_ativas ?? 0} carregando={carregandoDashboard} />
            <CardEstatistica icone={UserCheck} label="Alunos Matriculados" valor={dashboardStats?.alunos_matriculados ?? 0} carregando={carregandoDashboard} />
            <CardEstatistica icone={Clock} label="Inscricoes Pendentes" valor={dashboardStats?.inscricoes_pendentes ?? 0} carregando={carregandoDashboard} />
            <CardEstatistica icone={BarChart3} label="Frequencia Media" valor={`${dashboardStats?.frequencia_media ?? 0}%`} carregando={carregandoDashboard} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Inscricoes por Mes</h3>
                <span className="text-[10px] text-slate-500">Ultimos 6 meses</span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosInscricoesPorMes}>
                    <defs>
                      <linearGradient id="gradInscricoes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Area type="monotone" dataKey="inscricoes" stroke="#A78BFA" strokeWidth={2.5} fill="url(#gradInscricoes)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Proximas Aulas</h3>
                <Calendar size={16} className="text-slate-500" />
              </div>
              {carregandoDashboard ? (
                <p className="text-sm text-slate-500">Carregando...</p>
              ) : !dashboardStats?.proximas_turmas || dashboardStats.proximas_turmas.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhuma turma ativa no momento.</p>
              ) : (
                <div className="space-y-3">
                  {dashboardStats.proximas_turmas.map((t) => (
                    <div key={t.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
                        <GraduationCap size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{t.nome}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {t.curso_nome}
                          {t.dias_semana ? ` · ${t.dias_semana}` : ""}
                          {t.horario ? ` as ${t.horario}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
            ) : turmasFiltradasBusca.length === 0 ? (
              <p className="text-sm text-slate-500 p-5">Nenhuma turma cadastrada ainda.</p>
            ) : (
              turmasFiltradasBusca.map((t) => {
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
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap items-end bg-[#0F0F1E] rounded-2xl border border-white/10 p-5">
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs text-slate-400 mb-1 block">Turma</label>
              <select
                value={turmaPresencaId}
                onChange={(e) => setTurmaPresencaId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="" className="bg-[#0F0F1E]">Selecione a turma</option>
                {todasTurmas.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0F0F1E]">{t.curso_nome} - {t.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Data da aula</label>
              <input
                type="date"
                value={dataAula}
                onChange={(e) => setDataAula(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 [color-scheme:dark]"
              />
            </div>
            {ehAdmin && listaPresenca.length > 0 && (
              <button
                onClick={salvarPresencas}
                disabled={salvandoPresenca}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl px-4 py-2"
              >
                {salvandoPresenca ? "Salvando..." : "Salvar Presenca"}
              </button>
            )}
          </div>

          {listaPresenca.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full">
                {resumoPresenca.presentes} presentes
              </span>
              <span className="text-xs bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-full">
                {resumoPresenca.ausentes} ausentes
              </span>
              <span className="text-xs bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full">
                {resumoPresenca.atrasados} atrasados
              </span>
              <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full">
                {resumoPresenca.justificados} justificados
              </span>
            </div>
          )}

          <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm divide-y divide-white/5">
            {!turmaPresencaId ? (
              <p className="text-sm text-slate-500 p-5">Selecione uma turma e uma data para ver a lista de chamada.</p>
            ) : carregandoPresenca ? (
              <p className="text-sm text-slate-500 p-5">Carregando...</p>
            ) : listaPresenca.length === 0 ? (
              <p className="text-sm text-slate-500 p-5">Nenhum aluno matriculado nesta turma.</p>
            ) : (
              listaPresenca.map((aluno) => (
                <div key={aluno.inscricao_id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0 text-xs font-semibold">
                    {aluno.nome_completo?.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <p className="text-sm font-medium text-white flex-1 min-w-0 truncate">{aluno.nome_completo}</p>
                  <div className="flex gap-1 flex-wrap shrink-0">
                    {STATUS_PRESENCA_OPCOES.map((opcao) => {
                      const Icone = opcao.icone;
                      const ativo = aluno.status === opcao.valor;
                      return (
                        <button
                          key={opcao.valor}
                          onClick={() => ehAdmin && alterarStatusAluno(aluno.inscricao_id, opcao.valor)}
                          disabled={!ehAdmin}
                          title={opcao.label}
                          className={`p-2 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                            ativo ? opcao.cor : "bg-white/5 text-slate-400 hover:bg-white/10"
                          }`}
                        >
                          <Icone size={14} />
                        </button>
                      );
                    })}
                    <button
                      onClick={() => verFrequencia(aluno.inscricao_id, aluno.nome_completo)}
                      title="Ver frequencia"
                      className="p-2 rounded-lg text-xs bg-white/5 text-slate-400 hover:bg-white/10"
                    >
                      <BarChart3 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {frequenciaVisivel && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setFrequenciaVisivel(null)}>
              <div className="bg-[#0F0F1E] border border-white/10 rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-semibold text-white mb-4">Frequencia de {frequenciaVisivel.nome}</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-500">Presencas</p>
                    <p className="text-lg font-semibold text-emerald-400">{frequenciaVisivel.presencas}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-500">Faltas</p>
                    <p className="text-lg font-semibold text-rose-400">{frequenciaVisivel.faltas}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-500">Atrasos</p>
                    <p className="text-lg font-semibold text-amber-400">{frequenciaVisivel.atrasos}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-slate-500">Justificadas</p>
                    <p className="text-lg font-semibold text-blue-400">{frequenciaVisivel.justificadas}</p>
                  </div>
                </div>
                <div className="bg-violet-500/10 rounded-xl p-3 text-center mb-4">
                  <p className="text-xs text-slate-400">Percentual de Frequencia</p>
                  <p className="text-2xl font-bold text-violet-400">{frequenciaVisivel.percentual_frequencia}%</p>
                </div>
                <button
                  onClick={() => setFrequenciaVisivel(null)}
                  className="w-full px-4 py-2 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {abaAtiva === "relatorios" && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap items-end bg-[#0F0F1E] rounded-2xl border border-white/10 p-5">
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs text-slate-400 mb-1 block">Turma</label>
              <select
                value={relatorioTurmaId}
                onChange={(e) => setRelatorioTurmaId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="" className="bg-[#0F0F1E]">Selecione a turma</option>
                {todasTurmas.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0F0F1E]">{t.curso_nome} - {t.nome}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[200px]">
              <label className="text-xs text-slate-400 mb-1 block">Tipo de relatorio</label>
              <select
                value={relatorioTipo}
                onChange={(e) => setRelatorioTipo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="alunos" className="bg-[#0F0F1E]">Lista de Alunos</option>
                <option value="frequencia" className="bg-[#0F0F1E]">Frequencia por Turma</option>
              </select>
            </div>
            {relatorioDados.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={exportarPDF}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium rounded-xl px-4 py-2"
                >
                  <Download size={16} /> PDF
                </button>
                <button
                  onClick={exportarExcel}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium rounded-xl px-4 py-2"
                >
                  <FileSpreadsheet size={16} /> Excel
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm overflow-x-auto">
            {!relatorioTurmaId ? (
              <p className="text-sm text-slate-500 p-5">Selecione uma turma para gerar o relatorio.</p>
            ) : carregandoRelatorio ? (
              <p className="text-sm text-slate-500 p-5">Carregando...</p>
            ) : relatorioDados.length === 0 ? (
              <p className="text-sm text-slate-500 p-5">Nenhum dado encontrado para esta turma.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-slate-400">
                    {colunasRelatorio().map((c) => (
                      <th key={c.key} className="px-4 py-3 font-medium whitespace-nowrap">{c.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {relatorioDados.map((linha, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      {colunasRelatorio().map((c) => (
                        <td key={c.key} className="px-4 py-3 text-slate-200 whitespace-nowrap">
                          {c.key === "percentual_frequencia" ? `${linha[c.key] ?? 0}%` : (linha[c.key] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}