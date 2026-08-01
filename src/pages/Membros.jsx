import React, { useEffect, useState, useRef, useMemo } from "react";
import api from "../services/api";

// Decodifica o payload de um JWT (base64url) de forma segura
function decodificarJWT(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

// Resolve o id do usuário logado: via prop ou, na ausência, pelo token no localStorage
function obterUsuarioLogadoId(idViaProp) {
  if (idViaProp != null) return String(idViaProp);
  const chaves = ["token", "noah_token", "accessToken", "jwt"];
  for (const chave of chaves) {
    const token = localStorage.getItem(chave);
    if (!token) continue;
    const dados = decodificarJWT(token);
    const id = dados?.id ?? dados?.usuario_id ?? dados?.sub;
    if (id != null) return String(id);
  }
  return null;
}

export default function Membros({ usuarioLogadoId: usuarioLogadoIdProp } = {}) {
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState(null);
  const [novo, setNovo] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipo: "membro",
    senha: "",
  });

  // Seleção em massa
  const [selecionados, setSelecionados] = useState(new Set());
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  const selectAllRef = useRef(null);
  const usuarioLogadoId = useMemo(
    () => obterUsuarioLogadoId(usuarioLogadoIdProp),
    [usuarioLogadoIdProp]
  );

  function carregarMembros() {
    setCarregando(true);
    api
      .get("/membros")
      .then((res) => setMembros(res.data))
      .catch(() => setErro("Não foi possível carregar os membros (acesso restrito a administradores)."))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregarMembros();
  }, []);

  function aoMudarCampo(e) {
    setNovo({ ...novo, [e.target.name]: e.target.value });
  }

  async function aoCadastrar(e) {
    e.preventDefault();
    setErroForm(null);
    setSalvando(true);
    try {
      await api.post("/membros", novo);
      setNovo({ nome: "", email: "", telefone: "", tipo: "membro", senha: "" });
      setMostrarForm(false);
      carregarMembros();
    } catch (err) {
      setErroForm(err.response?.data?.erro || "Erro ao cadastrar membro.");
    } finally {
      setSalvando(false);
    }
  }

  // ---- Lógica de seleção ----
  const idsSelecionaveis = useMemo(
    () => membros.filter((m) => String(m.id) !== usuarioLogadoId).map((m) => m.id),
    [membros, usuarioLogadoId]
  );

  const todosSelecionados =
    idsSelecionaveis.length > 0 && idsSelecionaveis.every((id) => selecionados.has(id));
  const algunsSelecionados = selecionados.size > 0 && !todosSelecionados;

  const totalAdmins = useMemo(
    () => membros.filter((m) => m.tipo === "admin").length,
    [membros]
  );
  const adminsSelecionados = useMemo(
    () => membros.filter((m) => m.tipo === "admin" && selecionados.has(m.id)).length,
    [membros, selecionados]
  );
  const removeriaTodosAdmins = totalAdmins > 0 && totalAdmins - adminsSelecionados < 1;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = algunsSelecionados;
  }, [algunsSelecionados]);

  useEffect(() => {
    if (!mensagemSucesso) return;
    const t = setTimeout(() => setMensagemSucesso(null), 4000);
    return () => clearTimeout(t);
  }, [mensagemSucesso]);

  function alternarTodos() {
    setSelecionados(todosSelecionados ? new Set() : new Set(idsSelecionaveis));
  }

  function alternarUm(id) {
    setSelecionados((prev) => {
      const novoSet = new Set(prev);
      if (novoSet.has(id)) novoSet.delete(id);
      else novoSet.add(id);
      return novoSet;
    });
  }

  function limparSelecao() {
    setSelecionados(new Set());
  }

  function fecharConfirmacao() {
    if (excluindo) return;
    setMostrarConfirmacao(false);
    setErroExclusao(null);
  }

  async function confirmarExclusao() {
    setErroExclusao(null);
    setExcluindo(true);
    try {
      const ids = [...selecionados];
      const res = await api.post("/membros/excluir-multiplos", { ids });
      const qtd = res.data?.excluidos ?? ids.length;
      setMostrarConfirmacao(false);
      setSelecionados(new Set());
      setMensagemSucesso(`${qtd} ${qtd === 1 ? "membro excluído" : "membros excluídos"} com sucesso.`);
      carregarMembros();
    } catch (err) {
      setErroExclusao(err.response?.data?.erro || "Erro ao excluir membros.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <h2 className="font-semibold text-white">Membros</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">{membros.length} cadastrados</span>
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
          >
            {mostrarForm ? "Cancelar" : "+ Novo Membro"}
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="px-5 py-3 border-b border-white/10 bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-between">
          <span>{mensagemSucesso}</span>
          <button
            onClick={() => setMensagemSucesso(null)}
            className="text-emerald-400/70 hover:text-emerald-400 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {selecionados.size > 0 && (
        <div className="px-5 py-3 border-b border-white/10 bg-violet-500/[0.06] flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-violet-300">
            Selecionados: {selecionados.size}
          </span>
          <div className="flex-1" />
          <button
            onClick={() => setMostrarConfirmacao(true)}
            disabled={removeriaTodosAdmins}
            title={
              removeriaTodosAdmins
                ? "O sistema precisa de ao menos um administrador."
                : undefined
            }
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Excluir Selecionados
          </button>
          <button
            onClick={limparSelecao}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
          >
            Limpar Seleção
          </button>
        </div>
      )}

      {selecionados.size > 0 && removeriaTodosAdmins && (
        <p className="px-5 py-2 text-[11px] text-amber-400 bg-amber-500/5 border-b border-white/10">
          Desmarque ao menos um administrador para permanecer no sistema.
        </p>
      )}

      {mostrarForm && (
        <form onSubmit={aoCadastrar} className="p-5 border-b border-white/10 bg-white/[0.03] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Nome</label>
              <input
                name="nome"
                required
                value={novo.nome}
                onChange={aoMudarCampo}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Email</label>
              <input
                type="email"
                name="email"
                required
                value={novo.email}
                onChange={aoMudarCampo}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Telefone</label>
              <input
                name="telefone"
                value={novo.telefone}
                onChange={aoMudarCampo}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Tipo</label>
              <select
                name="tipo"
                value={novo.tipo}
                onChange={aoMudarCampo}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="membro" className="bg-[#0F0F1E]">Membro</option>
                <option value="lider" className="bg-[#0F0F1E]">Líder</option>
                <option value="admin" className="bg-[#0F0F1E]">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Senha</label>
              <input
                type="password"
                name="senha"
                required
                value={novo.senha}
                onChange={aoMudarCampo}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>

          {erroForm && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{erroForm}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar Membro"}
          </button>
        </form>
      )}

      {erro && <p className="text-sm text-amber-400 p-5">{erro}</p>}

      {!erro && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-white/10">
              <th className="px-5 py-3 w-10">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={todosSelecionados}
                  onChange={alternarTodos}
                  disabled={idsSelecionaveis.length === 0}
                  className="h-4 w-4 accent-violet-500 cursor-pointer align-middle disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </th>
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Telefone</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td className="px-5 py-4 text-slate-500" colSpan={6}>Carregando...</td></tr>
            ) : membros.length === 0 ? (
              <tr><td className="px-5 py-4 text-slate-500" colSpan={6}>Nenhum membro cadastrado ainda.</td></tr>
            ) : (
              membros.map((m) => {
                const ehUsuarioLogado = String(m.id) === usuarioLogadoId;
                return (
                  <tr key={m.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selecionados.has(m.id)}
                        disabled={ehUsuarioLogado}
                        onChange={() => alternarUm(m.id)}
                        title={ehUsuarioLogado ? "Você não pode excluir o seu próprio usuário." : undefined}
                        className="h-4 w-4 accent-violet-500 cursor-pointer align-middle disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-100">{m.nome}</td>
                    <td className="px-5 py-3 text-slate-400">{m.email}</td>
                    <td className="px-5 py-3 text-slate-400">{m.telefone || "-"}</td>
                    <td className="px-5 py-3 text-slate-400 capitalize">{m.tipo}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${m.ativo ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-500"}`}>
                        {m.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {mostrarConfirmacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0F0F1E] border border-white/10 rounded-2xl shadow-xl p-6">
            <h3 className="text-white font-semibold text-base">Confirmar exclusão</h3>
            <p className="text-sm text-slate-400 mt-2">
              Você está prestes a excluir{" "}
              <span className="text-white font-semibold">{selecionados.size}</span>{" "}
              {selecionados.size === 1 ? "membro" : "membros"}. Esta ação não pode ser desfeita.
            </p>
            {erroExclusao && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2 mt-3">
                {erroExclusao}
              </p>
            )}
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={fecharConfirmacao}
                disabled={excluindo}
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                disabled={excluindo}
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors disabled:opacity-60"
              >
                {excluindo ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}