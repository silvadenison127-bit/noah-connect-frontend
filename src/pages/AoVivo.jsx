import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

/**
 * Transmissoes ao vivo.
 *
 * Esta tela e o unico lugar onde a igreja sinaliza que esta transmitindo. O
 * aplicativo le a tabela `live_streams` no Supabase e mostra o card "ao vivo"
 * somente enquanto existir um registro com status 'live'.
 *
 * Por isso o botao de colocar no ar e o elemento mais visivel da pagina: e a
 * acao do momento do culto, feita com pressa e muitas vezes do celular.
 */

const ROTA = "/ao-vivo";

/** Converte ISO em texto legivel; devolve travessao quando nao ha data. */
function formatarData(iso) {
  if (!iso) return "â€”";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "â€”";
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Extrai a mensagem util de um erro do axios, com alternativa generica. */
function mensagemDeErro(err, alternativa) {
  return err?.response?.data?.erro || err?.message || alternativa;
}

const FORM_VAZIO = {
  titulo: "",
  link: "",
  descricao: "",
  provider: "youtube",
  agendado_para: "",
};

export default function AoVivo() {
  const [transmissoes, setTransmissoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState(null);

  // Id da transmissao cuja acao esta em andamento. Guardar o id, e nao um
  // booleano, permite desabilitar apenas o botao clicado -- os demais
  // continuam utilizaveis.
  const [acaoEmAndamento, setAcaoEmAndamento] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      const { data } = await api.get(ROTA);
      setTransmissoes(Array.isArray(data) ? data : []);
    } catch (err) {
      setErro(mensagemDeErro(err, "Nao foi possivel carregar as transmissoes."));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const { noAr, agendadas, encerradas } = useMemo(() => {
    const grupos = { noAr: [], agendadas: [], encerradas: [] };
    for (const item of transmissoes) {
      if (item.status === "live") grupos.noAr.push(item);
      else if (item.status === "scheduled") grupos.agendadas.push(item);
      else grupos.encerradas.push(item);
    }
    return grupos;
  }, [transmissoes]);

  const transmitindo = noAr.length > 0;

  function avisar(texto) {
    setMensagem(texto);
    window.setTimeout(() => setMensagem(null), 4000);
  }

  async function criar() {
    if (!form.titulo.trim()) {
      setErroForm("Informe o titulo da transmissao.");
      return;
    }
    if (!form.link.trim()) {
      setErroForm("Cole o link da transmissao.");
      return;
    }

    setSalvando(true);
    setErroForm(null);
    try {
      await api.post(ROTA, form);
      setForm(FORM_VAZIO);
      setMostrarForm(false);
      avisar("Transmissao cadastrada.");
      await carregar();
    } catch (err) {
      setErroForm(mensagemDeErro(err, "Nao foi possivel cadastrar."));
    } finally {
      setSalvando(false);
    }
  }

  /**
   * Executa uma acao de mudanca de estado e recarrega a lista.
   *
   * A lista inteira e recarregada de proposito: colocar uma transmissao no ar
   * encerra as demais no servidor, entao atualizar apenas o item clicado
   * deixaria a tela mostrando duas ao vivo.
   */
  async function executarAcao(id, sufixo, textoSucesso) {
    setAcaoEmAndamento(id);
    setErro(null);
    try {
      await api.post(`${ROTA}/${id}/${sufixo}`);
      avisar(textoSucesso);
      await carregar();
    } catch (err) {
      setErro(mensagemDeErro(err, "A acao nao pode ser concluida."));
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function remover(id, titulo) {
    const confirmado = window.confirm(
      `Excluir a transmissao "${titulo}"? Esta acao nao pode ser desfeita.`,
    );
    if (!confirmado) return;

    setAcaoEmAndamento(id);
    try {
      await api.delete(`${ROTA}/${id}`);
      avisar("Transmissao excluida.");
      await carregar();
    } catch (err) {
      setErro(mensagemDeErro(err, "Nao foi possivel excluir."));
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Faixa de estado: responde de longe a pergunta "estamos no ar?" */}
      <div
        className={`rounded-2xl border p-5 flex flex-wrap items-center gap-4 ${
          transmitindo
            ? "border-emerald-500/40 bg-emerald-500/10"
            : "border-white/10 bg-[#0F0F1E]"
        }`}
      >
        <span className="relative flex h-3 w-3">
          {transmitindo && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              transmitindo ? "bg-emerald-500" : "bg-slate-600"
            }`}
          />
        </span>

        <div className="flex-1 min-w-[200px]">
          <p
            className={`font-semibold ${
              transmitindo ? "text-emerald-300" : "text-slate-300"
            }`}
          >
            {transmitindo ? "No ar agora" : "Fora do ar"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {transmitindo
              ? noAr[0].title
              : "Os membros nao veem transmissao no aplicativo neste momento."}
          </p>
        </div>

        {transmitindo && (
          <button
            type="button"
            onClick={() => executarAcao(noAr[0].id, "encerrar", "Transmissao encerrada.")}
            disabled={acaoEmAndamento === noAr[0].id}
            className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {acaoEmAndamento === noAr[0].id ? "Encerrando..." : "Encerrar transmissao"}
          </button>
        )}
      </div>

      {mensagem && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs px-4 py-3">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs px-4 py-3">
          {erro}
        </div>
      )}

      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white">Transmissoes</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">
              {transmissoes.length} cadastradas
            </span>
            <button
              type="button"
              onClick={() => {
                setMostrarForm((v) => !v);
                setErroForm(null);
              }}
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 transition-opacity"
            >
              {mostrarForm ? "Cancelar" : "Nova transmissao"}
            </button>
          </div>
        </div>

        {mostrarForm && (
          <div className="p-5 border-b border-white/10 bg-violet-500/[0.04] space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-xs text-slate-400">Titulo *</span>
                <input
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Culto de domingo"
                  className="mt-1 w-full rounded-lg bg-[#0B0B18] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60"
                />
              </label>

              <label className="block">
                <span className="text-xs text-slate-400">Plataforma</span>
                <select
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-[#0B0B18] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60"
                >
                  <option value="youtube">YouTube</option>
                  <option value="outro">Outra plataforma</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-xs text-slate-400">
                {form.provider === "youtube"
                  ? "Link do YouTube *"
                  : "Endereco da transmissao *"}
              </span>
              <input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder={
                  form.provider === "youtube"
                    ? "https://www.youtube.com/watch?v=..."
                    : "https://..."
                }
                className="mt-1 w-full rounded-lg bg-[#0B0B18] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60"
              />
              {form.provider === "youtube" && (
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Cole o endereco que aparece na barra do navegador. Qualquer
                  formato do YouTube funciona.
                </span>
              )}
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-xs text-slate-400">Descricao</span>
                <input
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Opcional"
                  className="mt-1 w-full rounded-lg bg-[#0B0B18] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/60"
                />
              </label>

              <label className="block">
                <span className="text-xs text-slate-400">Agendar para</span>
                <input
                  type="datetime-local"
                  value={form.agendado_para}
                  onChange={(e) => setForm({ ...form, agendado_para: e.target.value })}
                  className="mt-1 w-full rounded-lg bg-[#0B0B18] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60"
                />
              </label>
            </div>

            {erroForm && (
              <p className="text-xs text-rose-400">{erroForm}</p>
            )}

            <button
              type="button"
              onClick={criar}
              disabled={salvando}
              className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {salvando ? "Salvando..." : "Cadastrar transmissao"}
            </button>
          </div>
        )}

        <div className="p-5 space-y-6">
          {carregando && (
            <p className="text-xs text-slate-500">Carregando transmissoes...</p>
          )}

          {!carregando && transmissoes.length === 0 && (
            <p className="text-xs text-slate-500">
              Nenhuma transmissao cadastrada. Crie uma para poder coloca-la no ar
              durante o culto.
            </p>
          )}

          {agendadas.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Agendadas
              </h3>
              {agendadas.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-[#0B0B18] p-4 flex flex-wrap items-center gap-3"
                >
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm text-white font-medium">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.scheduled_for
                        ? `Agendada para ${formatarData(item.scheduled_for)}`
                        : "Sem horario definido"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      executarAcao(item.id, "iniciar", "Transmissao no ar.")
                    }
                    disabled={acaoEmAndamento === item.id}
                    className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {acaoEmAndamento === item.id ? "Iniciando..." : "Colocar no ar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => remover(item.id, item.title)}
                    disabled={acaoEmAndamento === item.id}
                    className="text-xs text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </article>
              ))}
            </section>
          )}

          {noAr.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                No ar
              </h3>
              {noAr.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4 flex flex-wrap items-center gap-3"
                >
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm text-white font-medium">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Iniciada em {formatarData(item.started_at)}
                    </p>
                  </div>

                  {item.stream_url && (
                    <a
                      href={item.stream_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Abrir
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      executarAcao(item.id, "encerrar", "Transmissao encerrada.")
                    }
                    disabled={acaoEmAndamento === item.id}
                    className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {acaoEmAndamento === item.id ? "Encerrando..." : "Encerrar"}
                  </button>
                </article>
              ))}
            </section>
          )}

          {encerradas.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Encerradas
              </h3>
              {encerradas.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-white/5 bg-[#0B0B18] p-4 flex flex-wrap items-center gap-3 opacity-70"
                >
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm text-slate-300">{item.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Encerrada em {formatarData(item.ended_at)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      executarAcao(item.id, "reagendar", "Transmissao devolvida para a fila.")
                    }
                    disabled={acaoEmAndamento === item.id}
                    className="text-xs text-slate-500 hover:text-violet-400 transition-colors disabled:opacity-50"
                  >
                    Reagendar
                  </button>

                  <button
                    type="button"
                    onClick={() => remover(item.id, item.title)}
                    disabled={acaoEmAndamento === item.id}
                    className="text-xs text-slate-600 hover:text-rose-400 transition-colors disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </article>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
