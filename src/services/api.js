import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
});

/** Chaves do localStorage. Mantidas para nao quebrar sessoes existentes. */
const CHAVE_TOKEN = "noah_token";
const CHAVE_REFRESH = "noah_refresh_token";
const CHAVE_USUARIO = "noah_usuario";

// Anexa o token JWT em toda requisicao, se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CHAVE_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function encerrarSessao() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_REFRESH);
  localStorage.removeItem(CHAVE_USUARIO);
  window.location.href = "/login";
}

/**
 * Renovacao compartilhada.
 *
 * O backend faz ROTACAO: cada refresh token vale uma unica vez e e revogado
 * assim que usado. Se tres requisicoes expirarem juntas e cada uma disparar
 * o proprio refresh, a primeira invalida o token e as outras duas derrubam
 * a sessao do usuario.
 *
 * Por isso a promessa e guardada aqui: o primeiro 401 inicia a renovacao,
 * os demais aguardam a mesma promessa.
 */
let renovacaoEmAndamento = null;

async function renovarSessao() {
  const refreshToken = localStorage.getItem(CHAVE_REFRESH);
  if (!refreshToken) return null;

  // Cliente separado: se usasse `api`, o 401 do proprio refresh entraria
  // no interceptor e chamaria refresh de novo, em recursao.
  const clienteLimpo = axios.create({ baseURL: api.defaults.baseURL });

  const { data } = await clienteLimpo.post("/auth/refresh", { refreshToken });

  localStorage.setItem(CHAVE_TOKEN, data.accessToken);
  if (data.refreshToken) {
    localStorage.setItem(CHAVE_REFRESH, data.refreshToken);
  }

  return data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Só tenta renovar em 401, uma unica vez por requisicao, e nunca para a
    // propria rota de refresh ou de login.
    const podeRenovar =
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/auth/refresh") &&
      !original.url?.includes("/auth/login");

    if (!podeRenovar) {
      // 401 em login ou em retry ja tentado: sessao acabou de verdade.
      if (error.response?.status === 401 && !original?.url?.includes("/auth/login")) {
        encerrarSessao();
      }
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      if (!renovacaoEmAndamento) {
        renovacaoEmAndamento = renovarSessao().finally(() => {
          renovacaoEmAndamento = null;
        });
      }

      const novoToken = await renovacaoEmAndamento;

      // Sem refresh token guardado (sessao anterior a esta correcao):
      // nao ha o que renovar.
      if (!novoToken) {
        encerrarSessao();
        return Promise.reject(error);
      }

      original.headers.Authorization = `Bearer ${novoToken}`;
      return api(original);
    } catch (erroRenovacao) {
      // Refresh recusado, expirado ou revogado: encerra de fato.
      encerrarSessao();
      return Promise.reject(erroRenovacao);
    }
  }
);

export default api;
export { CHAVE_TOKEN, CHAVE_REFRESH, CHAVE_USUARIO };