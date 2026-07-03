import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
});

// Anexa o token JWT em toda requisição, se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("noah_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o token expirar/for inválido, desloga automaticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("noah_token");
      localStorage.removeItem("noah_usuario");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
