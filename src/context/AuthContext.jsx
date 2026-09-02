import React, { createContext, useContext, useState } from "react";
import api, { CHAVE_TOKEN, CHAVE_REFRESH, CHAVE_USUARIO } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const salvo = localStorage.getItem(CHAVE_USUARIO);
    return salvo ? JSON.parse(salvo) : null;
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  async function login(email, senha) {
    setCarregando(true);
    setErro(null);
    try {
      const { data } = await api.post("/auth/login", { email, senha });

      localStorage.setItem(CHAVE_TOKEN, data.accessToken);
      // O access token dura 15 minutos. Sem guardar o refresh, o usuario
      // seria devolvido ao login a cada quinze minutos de uso.
      if (data.refreshToken) {
        localStorage.setItem(CHAVE_REFRESH, data.refreshToken);
      }
      localStorage.setItem(CHAVE_USUARIO, JSON.stringify(data.usuario));

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
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_REFRESH);
    localStorage.removeItem(CHAVE_USUARIO);
    setUsuario(null);
  }

  function atualizarUsuario(dadosNovos) {
    setUsuario((atual) => {
      const atualizado = { ...atual, ...dadosNovos };
      localStorage.setItem(CHAVE_USUARIO, JSON.stringify(atualizado));
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