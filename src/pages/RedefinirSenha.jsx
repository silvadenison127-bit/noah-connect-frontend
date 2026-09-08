import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

/**
 * Redefinicao de senha pela web.
 *
 * Existe porque o caminho por deep link (noah://definir-senha) nao se sustenta:
 * o Gmail remove links com esquema personalizado, e passar antes pelo endpoint
 * /auth/v1/verify do Supabase consome o token e redireciona para o app sem
 * nenhum parametro -- o app recebia uma URL vazia e recusava o link.
 *
 * Aqui o token vai direto para esta pagina, sobre https, e a troca acontece no
 * navegador. Funciona mesmo em um aparelho onde o aplicativo nao esta instalado.
 *
 * Rota publica: nao exige sessao do painel. A autorizacao vem do proprio token
 * do e-mail, que e de uso unico e expira.
 */

const SUPABASE_URL = "https://vkkeyyzvqsjljyuhbbut.supabase.co";
const SUPABASE_KEY = "sb_publishable_tXGeDiO_lUiXEXL9jEKz0w_6WHydOJR";

const MIN_SENHA = 8;

// Cliente proprio: o `api` do painel aponta para o backend no Railway e leva o
// JWT do administrador. Nada disso se aplica a esta pagina.
const supabaseHttp = axios.create({
  baseURL: SUPABASE_URL,
  headers: {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
  },
});

/** Le token e tipo tanto da query (?a=b) quanto do fragmento (#a=b). */
function lerParametrosDaUrl() {
  const busca = new URLSearchParams(window.location.search);
  const fragmento = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  const pegar = (chave) => busca.get(chave) ?? fragmento.get(chave);

  return {
    tokenHash: pegar("token_hash") ?? pegar("token"),
    tipo: pegar("type") ?? "recovery",
    erroCodigo: pegar("error_code") ?? pegar("error"),
    erroDescricao: pegar("error_description"),
    accessToken: pegar("access_token"),
  };
}

/** Extrai a mensagem util de um erro do Supabase sem expor detalhes internos. */
function mensagemDoErro(err, padrao) {
  const dados = err?.response?.data;
  const bruta = dados?.msg || dados?.error_description || dados?.message || dados?.error;
  if (!bruta) return padrao;

  const texto = String(bruta);
  if (/expired|otp_expired/i.test(texto)) return "Este link expirou. Solicite um novo.";
  if (/invalid|not found/i.test(texto)) return "Este link não é mais válido. Solicite um novo.";
  if (/same.*password|should be different/i.test(texto))
    return "A nova senha precisa ser diferente da anterior.";
  if (/weak|at least/i.test(texto)) return `Escolha uma senha com pelo menos ${MIN_SENHA} caracteres.`;
  return texto;
}

export default function RedefinirSenha() {
  const parametros = useMemo(lerParametrosDaUrl, []);

  // 'validando' -> troca o token por uma sessao temporaria
  // 'pronto'    -> formulario liberado
  // 'invalido'  -> link expirado, usado ou ausente
  // 'concluido' -> senha salva
  const [etapa, setEtapa] = useState("validando");
  const [problema, setProblema] = useState("");
  const [accessToken, setAccessToken] = useState(null);

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function validar() {
      // O link ja chega com o erro descrito quando expirou ou foi reutilizado.
      if (parametros.erroCodigo) {
        const expirou = /expired|otp_expired/i.test(
          `${parametros.erroCodigo} ${parametros.erroDescricao ?? ""}`
        );
        setProblema(
          expirou
            ? "Este link expirou. Solicite um novo."
            : "Este link não é mais válido. Solicite um novo."
        );
        setEtapa("invalido");
        return;
      }

      // Alguns fluxos entregam a sessao pronta no fragmento da URL.
      if (parametros.accessToken) {
        setAccessToken(parametros.accessToken);
        setEtapa("pronto");
        return;
      }

      if (!parametros.tokenHash) {
        setProblema("Link inválido ou incompleto. Solicite um novo.");
        setEtapa("invalido");
        return;
      }

      try {
        const { data } = await supabaseHttp.post("/auth/v1/verify", {
          type: parametros.tipo,
          token_hash: parametros.tokenHash,
        });

        if (cancelado) return;

        if (!data?.access_token) {
          setProblema("Não foi possível validar o link. Solicite um novo.");
          setEtapa("invalido");
          return;
        }

        setAccessToken(data.access_token);
        setEtapa("pronto");
      } catch (err) {
        if (cancelado) return;
        setProblema(mensagemDoErro(err, "Não foi possível validar o link. Solicite um novo."));
        setEtapa("invalido");
      }
    }

    void validar();
    return () => {
      cancelado = true;
    };
  }, [parametros]);

  async function aoSalvar(e) {
    e.preventDefault();
    setErroForm(null);

    if (senha.length < MIN_SENHA) {
      setErroForm(`A senha precisa ter pelo menos ${MIN_SENHA} caracteres.`);
      return;
    }
    if (senha !== confirmacao) {
      setErroForm("As senhas não coincidem.");
      return;
    }

    setSalvando(true);
    try {
      await supabaseHttp.put(
        "/auth/v1/user",
        { password: senha },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setEtapa("concluido");
    } catch (err) {
      setErroForm(mensagemDoErro(err, "Não foi possível salvar a nova senha."));
    } finally {
      setSalvando(false);
    }
  }

  const caixa =
    "w-full max-w-md bg-[#0F0F1E] border border-white/10 rounded-2xl shadow-xl p-8";
  const campo =
    "w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50";
  const rotulo = "text-xs font-medium text-slate-300 mb-1 block";
  const botao =
    "w-full text-sm font-semibold px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 transition-opacity disabled:opacity-60";

  return (
    <div className="min-h-screen bg-[#08080F] flex items-center justify-center p-4">
      <div className={caixa}>
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.2em] text-violet-400 font-semibold">IGREJA</p>
          <h1 className="text-2xl font-bold text-white leading-tight">Noah</h1>
        </div>

        {etapa === "validando" && (
          <p className="text-sm text-slate-400">Validando o link...</p>
        )}

        {etapa === "invalido" && (
          <>
            <h2 className="text-lg font-semibold text-white">Link não pode ser usado</h2>
            <p className="text-sm text-slate-400 mt-2">{problema}</p>
            <p className="text-xs text-slate-500 mt-4">
              Abra o aplicativo, toque em <span className="text-slate-300">Esqueci minha senha</span>{" "}
              e peça um novo link.
            </p>
          </>
        )}

        {etapa === "concluido" && (
          <>
            <h2 className="text-lg font-semibold text-emerald-400">Senha alterada</h2>
            <p className="text-sm text-slate-400 mt-2">
              Sua senha foi salva. Volte ao aplicativo e entre com a nova senha.
            </p>
          </>
        )}

        {etapa === "pronto" && (
          <form onSubmit={aoSalvar} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Defina sua senha</h2>
              <p className="text-sm text-slate-400 mt-1">
                Escolha uma senha com pelo menos {MIN_SENHA} caracteres.
              </p>
            </div>

            <div>
              <label className={rotulo}>Nova senha</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={campo}
              />
            </div>

            <div>
              <label className={rotulo}>Confirme a senha</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                className={campo}
              />
            </div>

            {erroForm && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                {erroForm}
              </p>
            )}

            <button type="submit" disabled={salvando} className={botao}>
              {salvando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
