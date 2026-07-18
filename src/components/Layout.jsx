import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Calendar, CalendarDays, Church, Users2,
  HeartHandshake, Wallet, CircleDollarSign, Newspaper, Bell,
  FileBarChart2, Settings, Headset, Search, ChevronDown, Menu, LogOut, Camera,
  Sparkles, BarChart3, MapPin, Moon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const menuItens = [
  { icone: LayoutDashboard, nome: "Dashboard", rota: "/" },
  { icone: Sparkles, nome: "IA Noah", rota: "/ia-noah", badge: "Novo" },
  { icone: BarChart3, nome: "Executive BI", rota: "/executive-bi" },
  { icone: MapPin, nome: "Mapa da Igreja", rota: "/mapa" },
  { icone: Users, nome: "Membros", rota: "/membros" },
  { icone: Calendar, nome: "Agenda", rota: "/agenda" },
  { icone: CalendarDays, nome: "Eventos", rota: "/eventos" },
  { icone: Church, nome: "Cultos", rota: "/cultos" },
  { icone: Users2, nome: "Células", rota: "/celulas" },
  { icone: HeartHandshake, nome: "Pedidos de Oração", rota: "/oracao" },
  { icone: Wallet, nome: "Dízimos e Ofertas", rota: "/dizimos" },
  { icone: CircleDollarSign, nome: "Financeiro", rota: "/financeiro" },
  { icone: HeartHandshake, nome: "Ministérios", rota: "/ministerios" },
  { icone: Newspaper, nome: "Notícias", rota: "/noticias" },
  { icone: Bell, nome: "Comunicações", rota: "/comunicacoes" },
  { icone: FileBarChart2, nome: "Relatórios", rota: "/relatorios" },
  { icone: Settings, nome: "Configurações", rota: "/configuracoes" },
];

const WHATSAPP_SUPORTE = "5541997604950";

function Avatar({ nome, fotoUrl, tamanho = 36, onClick, carregando }) {
  const iniciais = nome?.split(" ").map((p) => p[0]).slice(0, 2).join("") || "?";
  return (
    <div
      onClick={onClick}
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.38 }}
      className="rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-semibold shrink-0 relative overflow-hidden cursor-pointer group"
      title="Clique para trocar a foto"
    >
      {fotoUrl ? (
        <img src={fotoUrl} alt={nome} className="w-full h-full object-cover" />
      ) : (
        iniciais
      )}
      {onClick && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Camera size={14} />
        </div>
      )}
      {carregando && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px]">...</div>
      )}
    </div>
  );
}

export default function Layout({ titulo = "Dashboard" }) {
  const { usuario, logout, atualizarUsuario } = useAuth();
  const navigate = useNavigate();
  const inputFotoRef = useRef(null);

  const [menuRecolhido, setMenuRecolhido] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState(null);
  const [naoLidos, setNaoLidos] = useState(0);

  useEffect(() => {
    function buscarNaoLidos() {
      api.get("/comunicados/nao-lidos")
        .then((res) => setNaoLidos(res.data.total))
        .catch(() => {});
    }
    buscarNaoLidos();
    const intervalo = setInterval(buscarNaoLidos, 30000);
    return () => clearInterval(intervalo);
  }, []);

  function aoSair() {
    logout();
    navigate("/login");
  }

  function abrirSuporte() {
    const mensagem = encodeURIComponent(
      `Olá! Sou ${usuario?.nome || "um usuário"} da plataforma Noah Connect e preciso de suporte.`
    );
    window.open(`https://wa.me/${WHATSAPP_SUPORTE}?text=${mensagem}`, "_blank");
  }

  function abrirSeletorFoto() {
    inputFotoRef.current?.click();
  }

  function aoEscolherFoto(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (arquivo.size > 2 * 1024 * 1024) {
      setErroFoto("A imagem deve ter no máximo 2MB.");
      return;
    }

    setErroFoto(null);
    setEnviandoFoto(true);

    const leitor = new FileReader();
    leitor.onload = async () => {
      const base64 = leitor.result;
      try {
        const { data } = await api.put("/membros/perfil", { foto_url: base64 });
        atualizarUsuario({ foto_url: data.foto_url });
      } catch (err) {
        setErroFoto("Erro ao salvar a foto.");
      } finally {
        setEnviandoFoto(false);
      }
    };
    leitor.readAsDataURL(arquivo);
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0A0A14] text-slate-100">
      <aside className={`${menuRecolhido ? "w-20" : "w-64"} shrink-0 bg-[#0B0B16] text-white flex flex-col transition-all duration-200 border-r border-white/5`}>
        <div className="px-6 py-6 border-b border-white/5 overflow-hidden">
          <p className="text-[11px] tracking-[0.2em] text-violet-300 font-semibold">IGREJA</p>
          {!menuRecolhido && (
            <p className="text-3xl font-bold italic -mt-1" style={{ fontFamily: "Georgia, serif" }}>noah</p>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItens.map((item) => {
            const Icone = item.icone;
            return (
              <NavLink
                key={item.nome}
                to={item.rota}
                end={item.rota === "/"}
                title={menuRecolhido ? item.nome : undefined}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-900/40"
                      : "text-violet-200/60 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <div className="relative">
                  <Icone size={18} />
                  {item.rota === "/comunicacoes" && naoLidos > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5">
                      {naoLidos > 9 ? "9+" : naoLidos}
                    </span>
                  )}
                </div>
                {!menuRecolhido && <span className="truncate flex-1">{item.nome}</span>}
                {!menuRecolhido && item.badge && (
                  <span className="text-[9px] font-bold bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded-md border border-violet-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-1">
          <button
            onClick={abrirSuporte}
            title={menuRecolhido ? "Suporte Online" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-violet-200/60 hover:bg-white/5 hover:text-white"
          >
            <Headset size={18} />
            {!menuRecolhido && <span>Suporte Online</span>}
          </button>
          <button
            onClick={aoSair}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-violet-200/60 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} />
            {!menuRecolhido && <span>Sair</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#0B0B16] border-b border-white/5 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuRecolhido((v) => !v)}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-300"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-white">{titulo}</h1>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                placeholder="Buscar por membro, evento, pedido..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-16 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 border border-white/10 rounded px-1.5 py-0.5">
                Ctrl+K
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-white/5 text-slate-300">
              <Moon size={18} />
            </button>
            <button
              onClick={() => navigate("/comunicacoes")}
              className="relative p-2 rounded-lg hover:bg-white/5 text-slate-300"
            >
              <Bell size={20} />
              {naoLidos > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                  {naoLidos > 9 ? "9+" : naoLidos}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <input
                ref={inputFotoRef}
                type="file"
                accept="image/*"
                onChange={aoEscolherFoto}
                className="hidden"
              />
              <Avatar
                nome={usuario?.nome}
                fotoUrl={usuario?.foto_url}
                onClick={abrirSeletorFoto}
                carregando={enviandoFoto}
              />
              <div className="text-sm">
                <p className="font-medium leading-tight text-white">{usuario?.nome}</p>
                <p className="text-xs text-slate-400 leading-tight capitalize">{usuario?.tipo}</p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </div>
          </div>
        </header>

        {erroFoto && (
          <div className="px-6 pt-3">
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2 inline-block">{erroFoto}</p>
          </div>
        )}

        <main className="p-6 space-y-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
