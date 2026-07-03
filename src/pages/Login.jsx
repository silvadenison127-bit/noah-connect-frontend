import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login, carregando, erro, usuario } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  if (usuario) return <Navigate to="/" replace />;

  async function aoEnviar(e) {
    e.preventDefault();
    const ok = await login(email, senha);
    if (ok) navigate("/");
  }

  return (
    <div className="min-h-screen w-full flex bg-[#1B1033]">
      {/* Lado esquerdo - identidade visual */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <p className="text-xs tracking-[0.3em] text-violet-300 font-semibold">IGREJA</p>
          <p className="text-5xl font-bold italic" style={{ fontFamily: "Georgia, serif" }}>noah</p>
        </div>
        <div className="relative z-10 max-w-sm">
          <h2 className="text-2xl font-bold mb-2">Conectando pessoas, fortalecendo a fé.</h2>
          <p className="text-violet-200/70 text-sm">
            Acesse o painel da Igreja Noah para acompanhar membros, eventos, pedidos de oração e muito mais.
          </p>
        </div>
        <p className="relative z-10 text-xs text-violet-300/50">Noah Connect Platform · FS Tech Solutions</p>
      </div>

      {/* Lado direito - formulário */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="lg:hidden text-center mb-6">
            <p className="text-xs tracking-[0.3em] text-violet-500 font-semibold">IGREJA</p>
            <p className="text-3xl font-bold italic text-violet-700" style={{ fontFamily: "Georgia, serif" }}>noah</p>
          </div>

          <h1 className="text-xl font-bold text-slate-800 mb-1">Bem-vindo de volta</h1>
          <p className="text-sm text-slate-500 mb-6">Entre com suas credenciais para acessar o sistema.</p>

          <form onSubmit={aoEnviar} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@igrejanoah.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {erro && (
              <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{erro}</p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2.5 transition-colors"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
