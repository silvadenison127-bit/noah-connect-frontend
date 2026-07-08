import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Church, Lock, Shield, ArrowUp, ArrowDown } from "lucide-react";

export default function Configuracoes() {
  const { usuario } = useAuth();

  // Dados da igreja
  const [igreja, setIgreja] = useState({ nome: "", endereco: "", telefone: "", email: "" });
  const [salvandoIgreja, setSalvandoIgreja] = useState(false);
  const [msgIgreja, setMsgIgreja] = useState(null);

  // Troca de senha
  const [senhas, setSenhas] = useState({ senha_atual: "", senha_nova: "", confirmar: "" });
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [msgSenha, setMsgSenha] = useState(null);

  // Admins
  const [admins, setAdmins] = useState([]);
  const [membros, setMembros] = useState([]);
  const [carregandoAdmins, setCarregandoAdmins] = useState(true);

  useEffect(() => {
    api.get("/configuracoes/igreja").then((res) => {
      if (res.data) setIgreja(res.data);
    }).catch(() => {});

    if (usuario?.tipo === "admin") {
      carregarAdmins();
      api.get("/membros").then((res) => setMembros(res.data)).catch(() => {});
    }
  }, [usuario]);

  function carregarAdmins() {
    setCarregandoAdmins(true);
    api.get("/configuracoes/admins")
      .then((res) => setAdmins(res.data))
      .finally(() => setCarregandoAdmins(false));
  }

  async function salvarIgreja(e) {
    e.preventDefault();
    setSalvandoIgreja(true);
    setMsgIgreja(null);
    try {
      await api.put("/configuracoes/igreja", igreja);
      setMsgIgreja({ tipo: "sucesso", texto: "Dados da igreja atualizados com sucesso." });
    } catch (err) {
      setMsgIgreja({ tipo: "erro", texto: err.response?.data?.erro || "Erro ao salvar dados." });
    } finally {
      setSalvandoIgreja(false);
    }
  }

  async function trocarSenha(e) {
    e.preventDefault();
    setMsgSenha(null);
    if (senhas.senha_nova !== senhas.confirmar) {
      setMsgSenha({ tipo: "erro", texto: "A confirmação não corresponde à nova senha." });
      return;
    }
    setSalvandoSenha(true);
    try {
      await api.put("/configuracoes/senha", {
        senha_atual: senhas.senha_atual,
        senha_nova: senhas.senha_nova,
      });
      setMsgSenha({ tipo: "sucesso", texto: "Senha alterada com sucesso." });
      setSenhas({ senha_atual: "", senha_nova: "", confirmar: "" });
    } catch (err) {
      setMsgSenha({ tipo: "erro", texto: err.response?.data?.erro || "Erro ao trocar senha." });
    } finally {
      setSalvandoSenha(false);
    }
  }

  async function promover(id) {
    try {
      await api.put(`/configuracoes/admins/${id}/promover`);
      carregarAdmins();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao promover usuário");
    }
  }

  async function rebaixar(id) {
    if (!window.confirm("Remover o acesso de administrador deste usuário?")) return;
    try {
      await api.put(`/configuracoes/admins/${id}/rebaixar`);
      carregarAdmins();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao remover acesso");
    }
  }

  const membrosNaoAdmin = membros.filter((m) => m.tipo !== "admin");

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-slate-800 text-lg">Configurações</h2>

      {/* Dados da Igreja */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Church size={18} className="text-violet-600" />
          <h3 className="font-semibold text-slate-800">Dados da Igreja</h3>
        </div>
        <form onSubmit={salvarIgreja} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="Nome da igreja"
            value={igreja.nome || ""}
            onChange={(e) => setIgreja({ ...igreja, nome: e.target.value })}
            disabled={usuario?.tipo !== "admin"}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm sm:col-span-2 disabled:bg-slate-50 disabled:text-slate-400"
          />
          <input
            placeholder="Endereço"
            value={igreja.endereco || ""}
            onChange={(e) => setIgreja({ ...igreja, endereco: e.target.value })}
            disabled={usuario?.tipo !== "admin"}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm sm:col-span-2 disabled:bg-slate-50 disabled:text-slate-400"
          />
          <input
            placeholder="Telefone"
            value={igreja.telefone || ""}
            onChange={(e) => setIgreja({ ...igreja, telefone: e.target.value })}
            disabled={usuario?.tipo !== "admin"}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
          />
          <input
            placeholder="Email de contato"
            type="email"
            value={igreja.email || ""}
            onChange={(e) => setIgreja({ ...igreja, email: e.target.value })}
            disabled={usuario?.tipo !== "admin"}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
          />

          {msgIgreja && (
            <p className={`text-xs sm:col-span-2 px-3 py-2 rounded-lg ${msgIgreja.tipo === "sucesso" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              {msgIgreja.texto}
            </p>
          )}

          {usuario?.tipo === "admin" && (
            <button
              disabled={salvandoIgreja}
              className="sm:col-span-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
            >
              {salvandoIgreja ? "Salvando..." : "Salvar Dados da Igreja"}
            </button>
          )}
        </form>
      </div>

      {/* Trocar Senha */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-violet-600" />
          <h3 className="font-semibold text-slate-800">Trocar Senha</h3>
        </div>
        <form onSubmit={trocarSenha} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            required
            type="password"
            placeholder="Senha atual"
            value={senhas.senha_atual}
            onChange={(e) => setSenhas({ ...senhas, senha_atual: e.target.value })}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            required
            type="password"
            placeholder="Nova senha (mín. 6 caracteres)"
            value={senhas.senha_nova}
            onChange={(e) => setSenhas({ ...senhas, senha_nova: e.target.value })}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
          />
          <input
            required
            type="password"
            placeholder="Confirmar nova senha"
            value={senhas.confirmar}
            onChange={(e) => setSenhas({ ...senhas, confirmar: e.target.value })}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
          />

          {msgSenha && (
            <p className={`text-xs sm:col-span-2 px-3 py-2 rounded-lg ${msgSenha.tipo === "sucesso" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              {msgSenha.texto}
            </p>
          )}

          <button
            disabled={salvandoSenha}
            className="sm:col-span-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
          >
            {salvandoSenha ? "Salvando..." : "Trocar Senha"}
          </button>
        </form>
      </div>

      {/* Gerenciar Admins (só para admin) */}
      {usuario?.tipo === "admin" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-violet-600" />
            <h3 className="font-semibold text-slate-800">Administradores</h3>
          </div>

          {carregandoAdmins ? (
            <p className="text-sm text-slate-400">Carregando...</p>
          ) : (
            <div className="space-y-1 mb-4">
              {admins.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{a.nome}</p>
                    <p className="text-xs text-slate-400 truncate">{a.email}</p>
                  </div>
                  {a.id !== usuario.id && (
                    <button
                      onClick={() => rebaixar(a.id)}
                      className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-medium shrink-0 ml-2"
                    >
                      <ArrowDown size={12} /> Remover admin
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {membrosNaoAdmin.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Promover a admin:</p>
              <div className="space-y-1">
                {membrosNaoAdmin.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{m.nome}</p>
                      <p className="text-xs text-slate-400 truncate">{m.email}</p>
                    </div>
                    <button
                      onClick={() => promover(m.id)}
                      className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium shrink-0 ml-2"
                    >
                      <ArrowUp size={12} /> Promover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
