import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RotaProtegida from "./components/RotaProtegida";
import Layout from "./components/Layout";
import Login from "./pages/Login";
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
import EmBreve from "./pages/EmBreve";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RotaProtegida>
                <Layout />
              </RotaProtegida>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/membros" element={<Membros />} />
            <Route path="/agenda" element={<Eventos />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/oracao" element={<Oracao />} />
            <Route path="/cultos" element={<Cultos />} />
            <Route path="/celulas" element={<Celulas />} />
            <Route path="/dizimos" element={<Dizimos />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/ministerios" element={<Ministerios />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/comunicacoes" element={<EmBreve titulo="Comunicações" />} />
            <Route path="/relatorios" element={<EmBreve titulo="Relatórios" />} />
            <Route path="/configuracoes" element={<EmBreve titulo="Configurações" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
