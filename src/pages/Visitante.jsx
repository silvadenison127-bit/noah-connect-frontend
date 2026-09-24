import React, { useState } from "react";
import axios from "axios";
import api from "../services/api";

/**
 * Pagina PUBLICA do visitante (Bloco 6), aberta pelo QR Code da recepcao.
 * Nao exige login. Cliente HTTP proprio: o `api` do painel leva o token do
 * administrador e redireciona para o login em caso de 401.
 */
const http = axios.create({ baseURL: api.defaults.baseURL });

const OPCOES = [
  { valor: "amigo_familia", rotulo: "Amigo ou família" },
  { valor: "redes_sociais", rotulo: "Redes sociais" },
  { valor: "passou_na_frente", rotulo: "Passei na frente" },
  { valor: "evento", rotulo: "Evento da igreja" },
  { valor: "outro", rotulo: "Outro" },
];

export default function Visitante() {
  const [nome, setNome] = useState("");
  const [comoConheceu, setComoConheceu] = useState("");
  const [autoriza, setAutoriza] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    if (nome.trim().length < 2) return setErro("Informe seu nome.");
    if (!comoConheceu) return setErro("Escolha como conheceu a igreja.");
    if (autoriza && telefone.replace(/\D/g, "").length < 10) return setErro("Informe o telefone com DDD.");

    setEnviando(true);
    try {
      await http.post("/visitantes", {
        nome: nome.trim(),
        como_conheceu: comoConheceu,
        autoriza_contato: autoriza,
        telefone: autoriza ? telefone : undefined,
      });
      setEnviado(true);
    } catch (err) {
      setErro(err?.response?.data?.erro || "Não foi possível enviar agora. Tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#120B22] text-white flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.3em] text-violet-300">IGREJA</p>
          <h1 className="text-4xl font-serif font-bold">noah</h1>
        </div>

        {enviado ? (
          <div className="rounded-2xl bg-white/5 border border-violet-400/30 p-6 text-center">
            <p className="text-2xl font-bold mb-2">Seja bem-vindo(a)!</p>
            <p className="text-violet-200">Sua visita foi registrada. Que alegria ter você conosco hoje.</p>
          </div>
        ) : (
          <form onSubmit={enviar} className="rounded-2xl bg-white/5 border border-violet-400/30 p-6 space-y-5">
            <div>
              <p className="text-xl font-bold">Que bom ter você aqui!</p>
              <p className="text-sm text-violet-200">Registre sua visita em poucos segundos.</p>
            </div>

            <label className="block">
              <span className="text-sm text-violet-200">Seu nome</span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={120}
                autoComplete="name"
                className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-3 text-white outline-none focus:border-violet-400"
              />
            </label>

            <fieldset>
              <legend className="text-sm text-violet-200 mb-2">Como conheceu a igreja?</legend>
              <div className="grid grid-cols-1 gap-2">
                {OPCOES.map((o) => (
                  <label
                    key={o.valor}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-3 cursor-pointer ${
                      comoConheceu === o.valor ? "border-violet-400 bg-violet-500/20" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name="como_conheceu"
                      value={o.valor}
                      checked={comoConheceu === o.valor}
                      onChange={() => setComoConheceu(o.valor)}
                      className="accent-violet-500"
                    />
                    {o.rotulo}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoriza}
                onChange={(e) => setAutoriza(e.target.checked)}
                className="mt-1 accent-violet-500"
              />
              <span className="text-sm text-violet-100">
                Autorizo a Igreja Noah a entrar em contato comigo pelo telefone abaixo.
              </span>
            </label>

            {autoriza && (
              <label className="block">
                <span className="text-sm text-violet-200">Telefone com DDD</span>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  className="mt-1 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-3 text-white outline-none focus:border-violet-400"
                />
              </label>
            )}

            {erro && <p className="text-sm text-rose-300">{erro}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-lg bg-violet-600 py-3 font-semibold hover:bg-violet-500 disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Registrar visita"}
            </button>

            <p className="text-[11px] text-violet-300/70 text-center">
              Usamos seus dados só para contar as visitas e, se você autorizar, para entrar em contato.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
