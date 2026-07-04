import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Users, Calendar, Heart, BookOpen, Flame, HandPlatter } from "lucide-react";

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
    <div className="min-h-screen w-full flex relative overflow-hidden"
      style={{ background: "#0a0418" }}>

      {/* FOTO DE FUNDO - lado direito */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Fundo roxo escuro base */}
        <div className="absolute inset-0" style={{background:"linear-gradient(135deg, #0a0418 0%, #150830 40%, #0a0418 100%)"}}/>
        
        {/* Foto de adoração - direita */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&auto=format&fit=crop&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.6
          }}/>
        
        {/* Overlay gradiente sobre a foto */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2"
          style={{background: "linear-gradient(to right, #0a0418 0%, rgba(80,20,160,0.5) 40%, rgba(100,20,180,0.3) 100%)"}}/>
        
        {/* Overlay roxo geral */}
        <div className="absolute inset-0" style={{background:"linear-gradient(to right, #0a0418 35%, transparent 70%)"}}/>

        {/* Efeito de luz roxa no centro */}
        <div className="absolute" style={{top:"20%",right:"20%",width:"500px",height:"500px",background:"radial-gradient(circle, rgba(140,60,255,0.35) 0%, transparent 70%)",borderRadius:"50%"}}/>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-10 py-10 flex items-center gap-16">

        {/* ESQUERDA */}
        <div className="flex-1 text-white space-y-8 max-w-xl">
          {/* Logo */}
          <div>
            <p className="text-xs tracking-[0.25em] text-violet-300 font-semibold">IGREJA</p>
            <p className="text-6xl font-bold italic leading-none" style={{fontFamily:"Georgia, serif"}}>noah</p>
            <div className="w-12 h-0.5 bg-violet-500 mt-2 mb-1.5"/>
            <p className="text-sm tracking-[0.3em] text-violet-400 font-bold">CURITIBA</p>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-5xl font-bold leading-tight mb-4">
              Conectando<br/>pessoas,<br/>fortalecendo a <span className="text-violet-400">fé.</span>
            </h1>
            <p className="text-violet-200/60 text-sm leading-relaxed">
              Acesse a plataforma oficial da Igreja Noah Curitiba para acompanhar membros, eventos, ministérios, pedidos de oração e toda a vida da igreja em um único lugar.
            </p>
          </div>

          {/* Card de features */}
          <div className="rounded-2xl p-5 space-y-4" style={{background:"rgba(80,20,160,0.15)",border:"1px solid rgba(140,60,255,0.2)"}}>
            {[
              { icone: Users,    titulo: "Comunhão",    desc: "Fortalecendo relacionamentos através da igreja." },
              { icone: Calendar, titulo: "Eventos",     desc: "Cultos, encontros e programações especiais." },
              { icone: Users,    titulo: "Ministérios", desc: "Servindo com propósito e excelência." },
              { icone: Heart,    titulo: "Fé",          desc: "Vivendo a Palavra todos os dias." },
              { icone: BookOpen, titulo: "Discipulado", desc: "Crescimento espiritual para todas as idades." },
              { icone: Flame,    titulo: "Oração",      desc: "Compartilhe pedidos e interceda por vidas." },
            ].map((f) => {
              const Icone = f.icone;
              return (
                <div key={f.titulo} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:"rgba(124,58,237,0.3)"}}>
                    <Icone size={16} className="text-violet-300"/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-none">{f.titulo}</p>
                    <p className="text-xs text-violet-200/50 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rodapé */}
          <div className="flex items-center justify-between border-t border-violet-500/20 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{background:"rgba(124,58,237,0.4)",border:"1px solid rgba(124,58,237,0.5)"}}>
                <span className="text-[11px] text-white font-bold">N</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Noah Connect Platform</p>
                <p className="text-[10px] text-violet-300/50">Uma plataforma para conectar pessoas ao propósito de Deus.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-violet-300/40">Desenvolvido por</p>
              <p className="text-xs font-semibold text-violet-400">FS Tech Solutions</p>
            </div>
          </div>
        </div>

        {/* DIREITA — Card de login estilo celular */}
        <div className="shrink-0 w-full max-w-sm">
          <div className="rounded-3xl p-8 space-y-5 relative"
            style={{
              background:"rgba(8,3,22,0.85)",
              border:"1.5px solid rgba(140,60,255,0.6)",
              backdropFilter:"blur(30px)",
              boxShadow:"0 0 80px rgba(124,58,237,0.3), 0 0 30px rgba(124,58,237,0.15), inset 0 0 60px rgba(124,58,237,0.05)"
            }}>

            {/* Brilho no topo do card */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px" style={{background:"linear-gradient(to right, transparent, rgba(180,100,255,0.8), transparent)"}}/>

            {/* Ícone chama + cruz */}
            <div className="flex justify-center">
              <div className="w-18 h-18 rounded-full flex items-center justify-center relative"
                style={{width:72,height:72,background:"linear-gradient(135deg, rgba(124,58,237,0.4), rgba(168,85,247,0.2))",border:"2px solid rgba(168,85,247,0.7)",boxShadow:"0 0 30px rgba(124,58,237,0.5)"}}>
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                  <path d="M20 4C20 4 10 12 10 22C10 27.5 14.5 32 20 32C25.5 32 30 27.5 30 22C30 12 20 4 20 4Z" fill="#9333EA" opacity="0.9"/>
                  <path d="M20 10C20 10 14 15 14 22C14 25 16.7 28 20 28C23.3 28 26 25 26 22C26 15 20 10 20 10Z" fill="#C084FC"/>
                  <path d="M20 28 L20 37" stroke="#9333EA" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M15 35 L25 35" stroke="#9333EA" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Bem-vindo de volta!</h2>
              <p className="text-sm text-violet-300/50 mt-1">Entre com suas credenciais para acessar o sistema.</p>
            </div>

            <form onSubmit={aoEnviar} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-violet-300/80 mb-2 block">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400"/>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="denison@igrejanoah.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-white placeholder-violet-400/30 outline-none focus:ring-2 focus:ring-violet-500"
                    style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(140,60,255,0.35)"}}/>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-violet-300/80 mb-2 block">Senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400"/>
                  <input type={mostrarSenha ? "text" : "password"} required value={senha} onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm text-white placeholder-violet-400/30 outline-none focus:ring-2 focus:ring-violet-500"
                    style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(140,60,255,0.35)"}}/>
                  <button type="button" onClick={() => setMostrarSenha(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-400">
                    {mostrarSenha ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-violet-300/60 cursor-pointer">
                  <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} className="w-4 h-4 rounded accent-violet-600"/>
                  Lembrar de mim
                </label>
                <button type="button" className="text-xs text-violet-400 hover:text-violet-300">Esqueci minha senha</button>
              </div>

              {erro && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{erro}</p>}

              <button type="submit" disabled={carregando}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
                style={{background:"linear-gradient(135deg, #7C3AED, #9333EA)",boxShadow:"0 4px 25px rgba(124,58,237,0.5)"}}>
                {carregando ? "Entrando..." : "Entrar"}
                {!carregando && <ArrowRight size={17}/>}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{background:"rgba(140,60,255,0.2)"}}/>
              <span className="text-xs text-violet-400/40">ou continue com</span>
              <div className="flex-1 h-px" style={{background:"rgba(140,60,255,0.2)"}}/>
            </div>

            <button type="button" className="w-full flex items-center justify-center py-3 rounded-xl transition-all"
              style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(140,60,255,0.25)"}}>
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
