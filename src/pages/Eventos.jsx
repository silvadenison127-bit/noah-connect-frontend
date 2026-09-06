import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus, Pencil, Trash2, X } from "lucide-react";

/**
 * Interpreta data_inicio como horario local, nao como UTC.
 *
 * eventos.data_inicio e TIMESTAMP SEM TIMEZONE e guarda o horario de Curitiba
 * exatamente como o administrador digitou. O driver pg, ao serializar em JSON,
 * anexa o sufixo "Z", e `new Date("...Z")` faz o navegador converter de UTC
 * para o fuso local: 19:00 virava 16:00.
 *
 * A correcao remove o marcador de fuso da string antes de criar o Date. Sem
 * ele, o JavaScript trata o valor como horario local, que e o que ele e.
 *
 * Nao subtraimos horas nem fixamos "-03:00": isso quebraria para quem abrir o
 * painel de outro fuso, e voltaria a errar se o Brasil readotar horario de
 * verao.
 */
function paraHorarioLocal(valor) {
  if (!valor) return null;

  if (typeof valor === "string") {
    // "2026-09-10T19:00:00.000Z" e "2026-09-10 19:00:00+00" -> "2026-09-10T19:00:00"
    const semFuso = valor
      .replace(" ", "T")
      .replace(/(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/, "");
    return new Date(semFuso);
  }

  return new Date(valor);
}

/**
 * Converte a data do servidor para o formato que <input type="datetime-local">
 * exige: "YYYY-MM-DDTHH:mm", sem segundos e sem fuso.
 *
 * Usa os getters locais do Date (nao toISOString, que converteria para UTC e
 * reintroduziria o deslocamento de 3 horas que paraHorarioLocal acabou de
 * evitar).
 */
function paraCampoDataHora(valor) {
  const d = paraHorarioLocal(valor);
  if (!d || Number.isNaN(d.getTime())) return "";

  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

const FORM_VAZIO = { titulo: "", tipo: "evento", data_inicio: "", local: "" };

export default function Eventos() {
  const { usuario } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novo, setNovo] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  // id do evento em edicao. null = criando um novo.
  const [editandoId, setEditandoId] = useState(null);
  const [excluindoId, setExcluindoId] = useState(null);

  // Aviso quando o Railway grava mas o Supabase falha. Sem isto, a falha so
  // aparece no log do servidor e o administrador acha que deu tudo certo.
  const [aviso, setAviso] = useState(null);

  const ehAdmin = usuario?.tipo === "admin";

  function carregar() {
    setCarregando(true);
    api.get("/eventos").then((res) => setEventos(res.data)).finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  /** Le integracao.aviso da resposta e mostra na tela, se houver. */
  function tratarIntegracao(data) {
    if (data?.integracao?.aviso) {
      setAviso(`${data.integracao.aviso} (${data.integracao.status})`);
    } else {
      setAviso(null);
    }
  }

  function abrirNovo() {
    setEditandoId(null);
    setNovo(FORM_VAZIO);
    setMostrarForm((v) => !v);
    setAviso(null);
  }

  function abrirEdicao(ev) {
    setEditandoId(ev.id);
    setNovo({
      titulo: ev.titulo || "",
      tipo: ev.tipo || "evento",
      data_inicio: paraCampoDataHora(ev.data_inicio),
      local: ev.local || "",
    });
    setMostrarForm(true);
    setAviso(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setNovo(FORM_VAZIO);
    setMostrarForm(false);
    setAviso(null);
  }

  async function salvarEvento(e) {
    e.preventDefault();
    setSalvando(true);
    setAviso(null);
    try {
      const { data } = editandoId
        ? await api.put(`/eventos/${editandoId}`, novo)
        : await api.post("/eventos", novo);

      tratarIntegracao(data);
      setNovo(FORM_VAZIO);
      setEditandoId(null);
      setMostrarForm(false);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao salvar evento");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirEvento(ev) {
    const confirmado = window.confirm(
      `Excluir "${ev.titulo}"?\n\nO evento sai do painel e deixa de aparecer no aplicativo dos membros.`
    );
    if (!confirmado) return;

    setExcluindoId(ev.id);
    setAviso(null);
    try {
      const { data } = await api.delete(`/eventos/${ev.id}`);
      tratarIntegracao(data);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao excluir evento");
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white text-lg">Agenda e Eventos</h2>
        {ehAdmin && (
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm font-medium rounded-xl px-4 py-2"
          >
            <Plus size={16} /> Novo Evento
          </button>
        )}
      </div>

      {aviso && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3">
          <span className="text-sm text-amber-300 flex-1">{aviso}</span>
          <button onClick={() => setAviso(null)} className="text-amber-400 hover:text-amber-200">
            <X size={16} />
          </button>
        </div>
      )}

      {mostrarForm && (
        <form onSubmit={salvarEvento} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {editandoId && (
            <p className="sm:col-span-2 text-xs text-violet-400">
              Editando evento #{editandoId}
            </p>
          )}
          <input
            required
            placeholder="Título do evento"
            value={novo.titulo}
            onChange={(e) => setNovo({ ...novo, titulo: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <select
            value={novo.tipo}
            onChange={(e) => setNovo({ ...novo, tipo: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="culto" className="bg-[#0F0F1E]">Culto</option>
            <option value="evento" className="bg-[#0F0F1E]">Evento</option>
            <option value="congresso" className="bg-[#0F0F1E]">Congresso</option>
            <option value="encontro" className="bg-[#0F0F1E]">Encontro</option>
            <option value="celula" className="bg-[#0F0F1E]">Célula</option>
          </select>
          <input
            required
            type="datetime-local"
            value={novo.data_inicio}
            onChange={(e) => setNovo({ ...novo, data_inicio: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50 [color-scheme:dark]"
          />
          <input
            placeholder="Local"
            value={novo.local}
            onChange={(e) => setNovo({ ...novo, local: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <div className="sm:col-span-2 flex gap-2">
            <button
              disabled={salvando}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
            >
              {salvando ? "Salvando..." : editandoId ? "Salvar Alterações" : "Salvar Evento"}
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={cancelarEdicao}
                className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium rounded-xl py-2"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm divide-y divide-white/5">
        {carregando ? (
          <p className="text-sm text-slate-500 p-5">Carregando...</p>
        ) : eventos.length === 0 ? (
          <p className="text-sm text-slate-500 p-5">Nenhum evento cadastrado ainda.</p>
        ) : (
          eventos.map((ev) => {
            const data = paraHorarioLocal(ev.data_inicio);
            return (
              <div key={ev.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
                <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex flex-col items-center justify-center text-violet-400 shrink-0">
                  <span className="text-base font-bold leading-none">{data.toLocaleDateString("pt-BR", { day: "2-digit" })}</span>
                  <span className="text-[10px] leading-none mt-1 uppercase">{data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{ev.titulo}</p>
                  <p className="text-xs text-slate-500">
                    {data.toLocaleString("pt-BR", { weekday: "long", hour: "2-digit", minute: "2-digit" })}
                    {ev.local ? ` · ${ev.local}` : ""}
                  </p>
                </div>
                <span className="text-xs bg-white/5 text-slate-400 px-2 py-1 rounded-full capitalize shrink-0">{ev.tipo}</span>
                {ehAdmin && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => abrirEdicao(ev)}
                      title="Editar evento"
                      className="p-2 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-white/5"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => excluirEvento(ev)}
                      disabled={excluindoId === ev.id}
                      title="Excluir evento"
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
