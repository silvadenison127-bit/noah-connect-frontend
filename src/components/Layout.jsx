import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Calendar, CalendarDays, Church, Users2,
  HeartHandshake, Wallet, CircleDollarSign, Newspaper, Bell,
  FileBarChart2, Settings, Headset, Search, ChevronDown, Menu, LogOut, Camera
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const menuItens = [
  { icone: LayoutDashboard, nome: "Dashboard", rota: "/" },
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

function Avatar({ nome, fotoUrl, tamanho = 36, onClick, carregando }) {
  const iniciais = nome?.split(" ").map((p) => p[0]).slice(0, 2).join("") || "?";
  return (
    <div
      onClick={onClick}
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.38 }}
      className="rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-white flex items-center justify-center font-semibold shrink-0 relative overflow-hidden cursor-pointer group"
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

  const
