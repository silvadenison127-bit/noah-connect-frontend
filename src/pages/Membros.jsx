import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Membros() {
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

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Membros</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400">{membros.length} cadastrados</span>
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            {mostrarForm ? "Cancelar" : "+ Novo Membro"}
          </button>
        </div>
      </div>

      {mostrarForm && (
        <form onSubmit={aoCadastrar} className="p-5 border-b border-slate-100 bg-slate-50 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Nome</label>
              <input
                name="nome"
                required
                value={novo.nome}
                onChange={aoMudarCampo}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Email</label>
              <input
                type="email"
                name="email"
                required
                value={novo.email}
                onChange={aoMudarCampo}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Telefone</label>
              <input
                name="telefone"
                value={novo.telefone}
                onChange={aoMudarCampo}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Tipo</label>
              <select
                name="tipo"
                value={novo.tipo}
                onChange={aoMudarCampo}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="membro">Membro</option>
                <option value="lider">Líder</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Senha</label>
              <input
                type="password"
                name="senha"
                required
                value={novo.senha}
                onChange={aoMudarCampo}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>

          {erroForm && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{erroForm}</p>}

          <button
            type="submit"
            disabled={salvando}
            className="text-sm font-semibold px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar Membro"}
          </button>
        </form>
      )}

      {erro && <p className="text-sm text-amber-600 p-5">{erro}</p>}

      {!erro && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Telefone</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td className="px-5 py-4 text-slate-400" colSpan={5}>Carregando...</td></tr>
            ) : membros.length === 0 ? (
              <tr><td className="px-5 py-4 text-slate-400" colSpan={5}>Nenhum membro cadastrado ainda.</td></tr>
            ) : (
              membros.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-700">{m.nome}</td>
                  <td className="px-5 py-3 text-slate-500">{m.email}</td>
                  <td className="px-5 py-3 text-slate-500">{m.telefone || "-"}</td>
                  <td className="px-5 py-3 text-slate-500 capitalize">{m.tipo}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${m.ativo ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                      {m.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
