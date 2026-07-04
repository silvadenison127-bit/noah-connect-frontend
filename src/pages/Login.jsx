import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Users, Calendar, Heart, BookOpen, Flame, HandMetal } from "lucide-react";

const features = [
  { icone: Users,    titulo: "Comunhão",    desc: "Fortalecendo relacionamentos através da igreja." },
  { icone: Heart,    titulo: "Fé",          desc: "Vivendo a Palavra todos os dias." },
  { icone: Calendar, titulo: "Eventos",     desc: "Cultos, encontros e programações especiais." },
  { icone: BookOpen, titulo: "Discipulado", desc: "Crescimento espiritual para todas as idades." },
  { icone: Flame,    titulo: "Ministérios", desc: "Servindo com propósito e excelência." },
  { icone: HandMetal,titulo: "Oração",      desc: "Compartilhe pedidos e interceda por vidas." },
];

export default function Login() {
  const { login, carregando, erro, usuario } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(true);

  if (usuario) return <Navigate to="/" replace />;

  async function aoEnviar(e) {
    e.preventDefault();
    const ok = await login(email, senha);
    if (ok) navigate("/");
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0D0720 0%, #1B0A3A 40%, #2D1060 100%)" }}
    >
      {/* Efeitos de luz de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #6C3BFF, transparent)" }} />
        {/* Cruz no fundo */}
        <div className="absolute top-8 right-12 opacity-10 text-white">
          <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
            <rect x="30" y="0" width="20" height="100" fill="white" rx="4"/>
            <rect x="0" y="25" width="80" height="20" fill="white" rx="4"/>
          </svg>
        </div>
        {/* Silhueta de pessoas adorando */}
        <div className="absolute bottom-0 right-0 opacity-10">
          <svg width="300" height="250" viewBox="0 0 300 250" fill="white">
            <ellipse cx="150" cy="200" rx="150" ry="50" />
            <circle cx="100" cy="150" r="20" />
            <rect x="85" y="170" width="30" height="60" rx="5" />
            <circle cx="200" cy="140" r="18" />
            <rect x="186" y="158" width="28" height="65" rx="5" />
            <circle cx="150" cy="130" r="22" />
            <rect x="134" y="152" width="32" height="70" rx="5" />
            {/* Braços levantados */}
            <line x1="100" y1="185" x2="70" y2="155" stroke="white" strokeWidth="8" strokeLinecap="round"/>
            <line x1="100" y1="185" x2="130" y2="155" stroke="white" strokeWidth="8" strokeLinecap="round"/>
            <line x1="150" y1="168" x2="120" y2="135" stroke="white" strokeWidth="8" strokeLinecap="round"/>
            <line x1="150" y1="168" x2="180" y2="132" stroke="white" strokeWidth="8" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* LADO ESQUERDO */}
        <div className="text-white space-y-8">
          {/* Logo */}
          <div>
            <p className="text-xs tracking-[0.25em] text-violet-300 font-semibold mb-1">IGREJA</p>
            <p className="text-5xl font-bold italic" style={{ fontFamily: "Georgia, serif" }}>noah</p>
            <div className="w-10 h-0.5 bg-violet-500 mt-2" />
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Conectando<br />pessoas,<br />fortalecendo a{" "}
              <span className="text-violet-400">fé.</span>
            </h1>
            <div className="w-8 h-0.5 bg-violet-500 mb-4" />
            <p className="text-violet-200/70 text-sm leading-relaxed max-w-sm">
              Acesse a plataforma oficial da Igreja Noah para acompanhar membros, eventos, ministérios, pedidos de oração e toda a vida da igreja em um único lugar.
            </p>
          </div>

          {/* Grid de features */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((f) => {
              const Icone = f.icone;
              return (
                <div key={f.titulo} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(108,59,255,0.1)", border: "1px solid rgba(108,59,255,0.2)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(108,59,255,0.3)" }}>
                    <Icone size={16} className="text-violet-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.titulo}</p>
                    <p className="text-xs text-violet-200/60 leading-tight mt-0.5">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rodapé */}
          <div className="flex items-center justify-between pt-2 border-t border-violet-500/20">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">N</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Noah Connect Platform</p>
                <p className="text-[10px] text-violet-300/60">Uma plataforma para conectar pessoas ao propósito de Deus.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-violet-300/50">Desenvolvido por</p>
              <p className="text-xs font-semibold text-violet-400">FS Tech Solutions</p>
            </div>
          </div>
        </div>

        {/* LADO DIREITO — Formulário */}
        <div className="flex items-center justify-center">
          <div
            className="w-full max-w-sm rounded-3xl p-8 space-y-6"
            style={{ background: "rgba(13,7,32,0.85)", border: "1px solid rgba(108,59,255,0.3)", backdropFilter: "blur(20px)" }}
          >
            {/* Ícone */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(108,59,255,0.25)", border: "2px solid rgba(108,59,255,0.5)" }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 4C16 4 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 10 16 4 16 4Z" fill="#7C3AED" opacity="0.8"/>
                  <path d="M16 8C16 8 10 13 10 19C10 22 12.7 24 16 24C19.3 24 22 22 22 19C22 13 16 8 16 8Z" fill="#A855F7"/>
                  <circle cx="16" cy="28" r="2" fill="#7C3AED"/>
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Bem-vindo de volta!</h2>
              <p className="text-sm text-violet-300/60 mt-1">Entre com suas credenciais para acessar o sistema.</p>
            </div>

            <form onSubmit={aoEnviar} className="space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-medium text-violet-300 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@igrejanoah.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-violet-400/40 outline-none focus:ring-2 focus:ring-violet-500"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(108,59,255,0.3)" }}
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="text-xs font-medium text-violet-300 mb-1.5 block">Senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400" />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-violet-400/40 outline-none focus:ring-2 focus:ring-violet-500"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(108,59,255,0.3)" }}
                  />
                  <button type="button" onClick={() => setMostrarSenha(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-violet-400">
                    {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Lembrar + Esqueci */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-violet-300/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lembrar}
                    onChange={(e) => setLembrar(e.target.checked)}
                    className="w-4 h-4 rounded accent-violet-600"
                  />
                  Lembrar de mim
                </label>
                <button type="button" className="text-xs text-violet-400 hover:text-violet-300">
                  Esqueci minha senha
                </button>
              </div>

              {erro && (
                <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{erro}</p>
              )}

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={carregando}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #6C3BFF, #9333EA)" }}
              >
                {carregando ? "Entrando..." : "Entrar"}
                {!carregando && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Divisor Google */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "rgba(108,59,255,0.2)" }} />
              <span className="text-xs text-violet-400/50">ou continue com</span>
              <div className="flex-1 h-px" style={{ background: "rgba(108,59,255,0.2)" }} />
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center py-2.5 rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(108,59,255,0.2)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
