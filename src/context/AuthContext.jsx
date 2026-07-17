import React, { createContext, useContext, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem("noah_usuario");
    return salvo ? JSON.parse(salvo) : null;
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  async function login(email, senha) {
    setCarregando(true);
    setErro(null);
    try {
      const { data } = await api.post("/auth/login", { email, senha });
      localStorage.setItem("noah_token", data.accessToken);
      localStorage.setItem("noah_usuario", JSON.stringify(data.usuario));
      setUsuario(data.usuario);
      return true;
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao fazer login");
      return false;
    } finally {
      setCarregando(false);
    }
  }
  function logout() {
    localStorage.removeItem("noah_token");
    localStorage.removeItem("noah_usuario");
    setUsuario(null);
  }
  function atualizarUsuario(dadosNovos) {
    setUsuario((atual) => {
      const atualizado = { ...atual, ...dadosNovos };
      localStorage.setItem("noah_usuario", JSON.stringify(atualizado));
      return atualizado;
    });
  }
  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando, erro, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
