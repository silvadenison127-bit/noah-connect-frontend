import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Users, Calendar, Heart, BookOpen, Flame } from "lucide-react";

const features = [
  { icone: Users,    titulo: "Comunhão",    desc: "Fortalecendo relacionamentos através da igreja." },
  { icone: Heart,    titulo: "Fé",          desc: "Vivendo a Palavra todos os dias." },
  { icone: Calendar, titulo: "Eventos",     desc: "Cultos, encontros e programações especiais." },
  { icone: BookOpen, titulo: "Discipulado", desc: "Crescimento espiritual para todas as idades." },
  { icone: Flame,    titulo: "Ministérios", desc: "Servindo com propósito e excelência." },
  { icone: Heart,    titulo: "Oração",      desc: "Compartilhe pedidos e interceda por vidas." },
];

function PrayingCrowd() {
  return (
    <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" style={{position:"absolute",bottom:0,right:0,width:"65%",height:"auto",opacity:0.7}}>
      {/* Glow effect */}
      <defs>
        <radialGradient id="glow" cx="60%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#0D0720" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="crossGlow" cx="80%" cy="20%" r="30%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#0D0720" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="400" fill="url(#glow)"/>
      <rect width="800" height="400" fill="url(#crossGlow)"/>

      {/* Cruz */}
      <rect x="620" y="20" width="18" height="120" rx="3" fill="white" opacity="0.7"/>
      <rect x="590" y="50" width="78" height="18" rx="3" fill="white" opacity="0.7"/>

      {/* Silhuetas da multidão */}
      {/* Pessoa 1 */}
      <ellipse cx="200" cy="380" rx="30" ry="8" fill="#1a0540" opacity="0.8"/>
      <rect x="185" y="290" width="30" height="90" rx="8" fill="#1a0540"/>
      <circle cx="200" cy="275" r="22" fill="#1a0540"/>
      <line x1="200" y1="320" x2="165" y2="270" stroke="#1a0540" strokeWidth="14" strokeLinecap="round"/>
      <line x1="200" y1="320" x2="235" y2="265" stroke="#1a0540" strokeWidth="14" strokeLinecap="round"/>

      {/* Pessoa 2 */}
      <ellipse cx="320" cy="382" rx="28" ry="7" fill="#1a0540" opacity="0.8"/>
      <rect x="306" y="295" width="28" height="88" rx="8" fill="#1a0540"/>
      <circle cx="320" cy="280" r="20" fill="#1a0540"/>
      <line x1="320" y1="325" x2="288" y2="272" stroke="#1a0540" strokeWidth="13" strokeLinecap="round"/>
      <line x1="320" y1="325" x2="352" y2="268" stroke="#1a0540" strokeWidth="13" strokeLinecap="round"/>

      {/* Pessoa 3 - centro/destaque */}
      <ellipse cx="450" cy="378" rx="35" ry="9" fill="#1a0540" opacity="0.8"/>
      <rect x="432" y="285" width="36" height="95" rx="9" fill="#1a0540"/>
      <circle cx="450" cy="268" r="26" fill="#1a0540"/>
      <line x1="450" y1="318" x2="408" y2="258" stroke="#1a0540" strokeWidth="16" strokeLinecap="round"/>
      <line x1="450" y1="318" x2="492" y2="252" stroke="#1a0540" strokeWidth="16" strokeLinecap="round"/>

      {/* Pessoa 4 */}
      <ellipse cx="570" cy="383" rx="26" ry="7" fill="#1a0540" opacity="0.8"/>
      <rect x="557" y="300" width="26" height="84" rx="7" fill="#1a0540"/>
      <circle cx="570" cy="286" r="18" fill="#1a0540"/>
      <line x1="570" y1="328" x2="542" y2="278" stroke="#1a0540" strokeWidth="12" strokeLinecap="round"/>
      <line x1="570" y1="328" x2="598" y2="274" stroke="#1a0540" strokeWidth="12" strokeLinecap="round"/>

      {/* Pessoa 5 */}
      <ellipse cx="680" cy="384" rx="24" ry="6" fill="#1a0540" opacity="0.8"/>
      <rect x="668" y="302" width="24" height="83" rx="7" fill="#1a0540"/>
      <circle cx="680" cy="288" r="17" fill="#1a0540"/>
      <line x1="680" y1="330" x2="655" y2="282" stroke="#1a0540" strokeWidth="11" strokeLinecap="round"/>
      <line x1="680" y1="330" x2="705" y2="278" stroke="#1a0540" strokeWidth="11" strokeLinecap="round"/>

      {/* Pessoas menores ao fundo */}
      <circle cx="130" cy="330" r="14" fill="#1a0540" opacity="0.6"/>
      <rect x="120" y="340" width="20" height="55" rx="5" fill="#1a0540" opacity="0.6"/>
      <line x1="130" y1="355" x2="108" y2="325" stroke="#1a0540" strokeWidth="9" strokeLinecap="round" opacity="0.6"/>
      <line x1="130" y1="355" x2="152" y2="322" stroke="#1a0540" strokeWidth="9" strokeLinecap="round" opacity="0.6"/>

      <circle cx="730" cy="335" r="13" fill="#1a0540" opacity="0.6"/>
      <rect x="720" y="344" width="20" height="52" rx="5" fill="#1a0540" opacity="0.6"/>
      <line x1="730" y1="358" x2="710" y2="328" stroke="#1a0540" strokeWidth="9" strokeLinecap="round" opacity="0.6"/>
      <line x1="730" y1="358" x2="750" y2="325" stroke="#1a0540" strokeWidth="9" strokeLinecap="round" opacity="0.6"/>

      {/* Chão */}
      <rect x="0" y="385" width="800" height="15" fill="#0D0720"/>
    </svg>
  );
}

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
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0D0720 0%, #1a0a3a 35%, #2a0d5e 65%, #1a0840 100%)" }}>

      {/* Efeitos de luz */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{top:"10%",right:"15%",width:"300px",height:"300px",background:"radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)",borderRadius:"50%"}}/>
        <div className="absolute" style={{bottom:"20%",right:"30%",width:"400px",height:"300px",background:"radial-gradient(circle, rgba(109,40,217,0.3) 0%, transparent 70%)",borderRadius:"50%"}}/>
        <div className="absolute" style={{top:"0",left:"30%",width:"200px",height:"200px",background:"radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",borderRadius:"50%"}}/>
      </div>

      {/* Multidão adorando + Cruz */}
      <PrayingCrowd />

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ESQUERDA */}
        <div className="text-white space-y-6">
          <div>
            <p className="text-xs tracking-[0.25em] text-violet-300 font-semibold mb-0.5">IGREJA</p>
            <p className="text-5xl font-bold italic" style={{fontFamily:"Georgia, serif"}}>noah</p>
            <div className="w-10 h-0.5 bg-violet-500 mt-1.5 mb-1"/>
            <p className="text-xs tracking-[0.3em] text-violet-400 font-bold">CURITIBA</p>
          </div>

          <div>
            <h1 className="text-4xl font-bold leading-tight mb-3">
              Conectando<br/>pessoas,<br/>fortalecendo a <span className="text-violet-400">fé.</span>
            </h1>
            <div className="w-8 h-0.5 bg-violet-500 mb-3"/>
            <p className="text-violet-200/70 text-sm leading-relaxed max-w-sm">
              Acesse a plataforma oficial da Igreja Noah Curitiba para acompanhar membros, eventos, ministérios, pedidos de oração e toda a vida da igreja em um único lugar.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {features.map((f) => {
              const Icone = f.icone;
              return (
                <div key={f.titulo} className="flex items-start gap-3 p-3 rounded-xl" style={{background:"rgba(108,59,255,0.12)",border:"1px solid rgba(108,59,255,0.25)"}}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:"rgba(108,59,255,0.3)"}}>
                    <Icone size={15} className="text-violet-300"/>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.titulo}</p>
                    <p className="text-xs text-violet-200/60 leading-tight mt-0.5">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

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

        {/* DIREITA — Card de login */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-sm rounded-3xl p-8 space-y-5"
            style={{background:"rgba(10,5,28,0.88)",border:"1.5px solid rgba(124,58,237,0.5)",backdropFilter:"blur(24px)",boxShadow:"0 0 60px rgba(124,58,237,0.25), inset 0 0 40px rgba(124,58,237,0.05)"}}>

            {/* Ícone */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{background:"rgba(108,59,255,0.2)",border:"2px solid rgba(124,58,237,0.6)",boxShadow:"0 0 20px rgba(124,58,237,0.4)"}}>
                <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
                  <path d="M20 4C20 4 10 12 10 22C10 27.5 14.5 32 20 32C25.5 32 30 27.5 30 22C30 12 20 4 20 4Z" fill="#7C3AED" opacity="0.9"/>
                  <path d="M20 9C20 9 13 15 13 22C13 25.3 16.1 28 20 28C23.9 28 27 25.3 27 22C27 15 20 9 20 9Z" fill="#A855F7"/>
                  <path d="M20 28 L20 36" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M15 34 L25 34" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Bem-vindo de volta!</h2>
              <p className="text-sm text-violet-300/60 mt-1">Entre com suas credenciais para acessar o sistema.</p>
            </div>

            <form onSubmit={aoEnviar} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-violet-300 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400"/>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@igrejanoah.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-violet-400/40 outline-none focus:ring-2 focus:ring-violet-500"
                    style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(124,58,237,0.4)"}}/>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-violet-300 mb-1.5 block">Senha</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-violet-400"/>
                  <input type={mostrarSenha ? "text" : "password"} required value={senha} onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-violet-400/40 outline-none focus:ring-2 focus:ring-violet-500"
                    style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(124,58,237,0.4)"}}/>
                  <button type="button" onClick={() => setMostrarSenha(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-violet-400">
                    {mostrarSenha ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-violet-300/70 cursor-pointer">
                  <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} className="w-4 h-4 rounded accent-violet-600"/>
                  Lembrar de mim
                </label>
                <button type="button" className="text-xs text-violet-400 hover:text-violet-300">Esqueci minha senha</button>
              </div>

              {erro && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{erro}</p>}

              <button type="submit" disabled={carregando}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{background:"linear-gradient(135deg, #6C3BFF, #9333EA)",boxShadow:"0 4px 20px rgba(108,59,255,0.4)"}}>
                {carregando ? "Entrando..." : "Entrar"}
                {!carregando && <ArrowRight size={16}/>}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{background:"rgba(108,59,255,0.2)"}}/>
              <span className="text-xs text-violet-400/50">ou continue com</span>
              <div className="flex-1 h-px" style={{background:"rgba(108,59,255,0.2)"}}/>
            </div>

            <button type="button" className="w-full flex items-center justify-center py-2.5 rounded-xl transition-all"
              style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(108,59,255,0.2)"}}>
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
