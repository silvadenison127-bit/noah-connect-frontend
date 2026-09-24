import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RotaProtegida from "./components/RotaProtegida";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import RedefinirSenha from "./pages/RedefinirSenha";
import Dashboard from "./pages/Dashboard";
import Membros from "./pages/Membros";
import Eventos from "./pages/Eventos";
import Oracao from "./pages/Oracao";
import Cultos from "./pages/Cultos";
import Celulas from "./pages/Celulas";
import Dizimos from "./pages/Dizimos";
import Financeiro from "./pages/Financeiro";
import Ministerios from "./pages/Ministerios";
import Noticias from "./pages/Noticias";
import Comunicacoes from "./pages/Comunicacoes";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Cursos from "./pages/Cursos";
import IANoah from "./pages/IANoah";
import ExecutiveBI from "./pages/ExecutiveBI";
import MapaIgreja from "./pages/MapaIgreja";
import AoVivo from "./pages/AoVivo";
import Chat from "./pages/Chat";
import Visitante from "./pages/Visitante";
import Visitantes from "./pages/Visitantes";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Publica: quem chega aqui vem do link do e-mail, sem sessao do painel. */}
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/visitante" element={<Visitante />} />
          <Route
            element={
              <RotaProtegida>
                <Layout />
              </RotaProtegida>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/ia-noah" element={<IANoah />} />
            <Route path="/executive-bi" element={<ExecutiveBI />} />
            <Route path="/mapa" element={<MapaIgreja />} />
            <Route path="/membros" element={<Membros />} />
            <Route path="/ao-vivo" element={<AoVivo />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/agenda" element={<Eventos />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/oracao" element={<Oracao />} />
            <Route path="/cultos" element={<Cultos />} />
            <Route path="/celulas" element={<Celulas />} />
            <Route path="/dizimos" element={<Dizimos />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/ministerios" element={<Ministerios />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/comunicacoes" element={<Comunicacoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/visitantes" element={<Visitantes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}