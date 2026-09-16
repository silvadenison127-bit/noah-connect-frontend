import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { Save, Plus, Trash2, Clock } from "lucide-react";

/**
 * Dados da igreja e horarios dos cultos.
 *
 * Escreve direto no Supabase (via /api/igreja), nao no Railway. O aplicativo le
 * `church_settings` e `church_services`; a tabela `configuracoes_igreja` do
 * Railway tinha apenas 4 campos contra 17 e ficaria divergindo na primeira
 * edicao, entao deixou de ser usada por esta tela.
 *
 * Componente separado em vez de mais um bloco em Configuracoes.jsx: a tela ja
 * tinha 260 linhas e quatro assuntos.
 */

const DIAS = [
  { valor: 0, nome: "Domingo" },
  { valor: 1, nome: "Segunda" },
  { valor: 2, nome: "Terca" },
  { valor: 3, nome: "Quarta" },
  { valor: 4, nome: "Quinta" },
  { valor: 5, nome: "Sexta" },
  { valor: 6, nome: "Sabado" },
];

const CULTO_VAZIO = {
  name: "",
  weekday: 0,
  start_time: "",
  duration_minutes: 90,
  location_name: "",
  description: "",
};

function nomeDoDia(valor) {
  return DIAS.find((d) => d.valor === Number(valor))?.nome || "-";
}

function mensagemDeErro(err, alternativa) {
  return err?.response?.data?.erro || alternativa;
}

export default function DadosIgreja() {
  const [igreja, setIgreja] = useState(null);
  const [cultos, setCultos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [novoCulto, setNovoCulto] = useState(CULTO_VAZIO);
  const [mostrarForm, setMostrarForm] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [dados, horarios] = await Promise.all([
        api.get("/igreja"),
        api.get("/igreja/cultos"),
      ]);
      setIgreja(dados.data);
      setCultos(horarios.data);
    } catch (err) {
      alert(mensagemDeErro(err, "Erro ao carregar os dados da igreja"));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function campo(nome, valor) {
    setIgreja((atual) => ({ ...atual, [nome]: valor }));
  }

  async function salvarIgreja(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const { data } = await api.put("/igreja", igreja);
      setIgreja(data);
      alert("Dados da igreja salvos.");
    } catch (err) {
      alert(mensagemDeErro(err, "Erro ao salvar"));
    } finally {
      setSalvando(false);
    }
  }

  async function adicionarCulto(e) {
    e.preventDefault();
    if (!novoCulto.name.trim() || !novoCulto.start_time) {
      return alert("Informe o nome e o horario do culto.");
    }
    try {
      const { data } = await api.post("/igreja/cultos", novoCulto);
      setCultos((atuais) => [...atuais, data]);
      setNovoCulto(CULTO_VAZIO);
      setMostrarForm(false);
    } catch (err) {
      alert(mensagemDeErro(err, "Erro ao cadastrar o horario"));
    }
  }

  async function alternarAtivo(culto) {
    try {
      const { data } = await api.put(`/igreja/cultos/${culto.id}`, {
        is_active: !culto.is_active,
      });
      setCultos((atuais) => atuais.map((c) => (c.id === data.id ? data : c)));
    } catch (err) {
      alert(mensagemDeErro(err, "Erro ao alterar o horario"));
    }
  }

  async function removerCulto(culto) {
    if (!window.confirm(`Remover "${culto.name}"?`)) return;
    try {
      await api.delete(`/igreja/cultos/${culto.id}`);
      setCultos((atuais) => atuais.filter((c) => c.id !== culto.id));
    } catch (err) {
      alert(mensagemDeErro(err, "Erro ao remover o horario"));
    }
  }

  if (carregando) return <p className="text-sm text-slate-400">Carregando...</p>;
  if (!igreja) return <p className="text-sm text-slate-400">Nenhum cadastro encontrado.</p>;

  const entrada = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50";
  const rotulo = "text-xs text-slate-400 mb-1 block";

  return (
    <div className="space-y-6">
      <form onSubmit={salvarIgreja} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
        <h2 className="font-semibold text-white mb-1">Dados da igreja</h2>
        <p className="text-xs text-slate-400 mb-4">
          Estas informacoes aparecem no aplicativo, nas telas Localizacao e Sobre a Igreja.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className={rotulo}>Nome</label>
            <input className={entrada} value={igreja.name || ""} onChange={(e) => campo("name", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className={rotulo}>Slogan</label>
            <input className={entrada} value={igreja.slogan || ""} onChange={(e) => campo("slogan", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className={rotulo}>Sobre a igreja</label>
            <textarea rows={3} className={entrada} value={igreja.about || ""} onChange={(e) => campo("about", e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className={rotulo}>Endereco (rua e numero)</label>
            <input className={entrada} value={igreja.address_line || ""} onChange={(e) => campo("address_line", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>Bairro</label>
            <input className={entrada} value={igreja.district || ""} onChange={(e) => campo("district", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>Cidade</label>
            <input className={entrada} value={igreja.city || ""} onChange={(e) => campo("city", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>Estado (UF)</label>
            <input className={entrada} value={igreja.state || ""} onChange={(e) => campo("state", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>CEP</label>
            <input className={entrada} value={igreja.postal_code || ""} onChange={(e) => campo("postal_code", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>Latitude</label>
            <input className={entrada} value={igreja.latitude ?? ""} onChange={(e) => campo("latitude", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>Longitude</label>
            <input className={entrada} value={igreja.longitude ?? ""} onChange={(e) => campo("longitude", e.target.value)} />
          </div>

          <div>
            <label className={rotulo}>Telefone</label>
            <input className={entrada} value={igreja.phone || ""} onChange={(e) => campo("phone", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>WhatsApp</label>
            <input className={entrada} value={igreja.whatsapp || ""} onChange={(e) => campo("whatsapp", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>E-mail</label>
            <input className={entrada} value={igreja.email || ""} onChange={(e) => campo("email", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>Site</label>
            <input className={entrada} value={igreja.website || ""} onChange={(e) => campo("website", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>Instagram</label>
            <input className={entrada} value={igreja.instagram || ""} onChange={(e) => campo("instagram", e.target.value)} />
          </div>
          <div>
            <label className={rotulo}>Canal do YouTube (ID)</label>
            <input className={entrada} value={igreja.youtube_channel_id || ""} onChange={(e) => campo("youtube_channel_id", e.target.value)} />
          </div>
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="mt-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl px-4 py-2 flex items-center gap-2"
        >
          <Save size={16} /> {salvando ? "Salvando..." : "Salvar dados da igreja"}
        </button>
      </form>

      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-white">Horarios dos cultos</h2>
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs flex items-center gap-1"
          >
            <Plus size={14} /> Novo horario
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Horarios fixos que aparecem no aplicativo. Para um culto com data marcada, use a tela Cultos.
        </p>

        {mostrarForm && (
          <form onSubmit={adicionarCulto} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="md:col-span-2">
              <label className={rotulo}>Nome do culto</label>
              <input
                className={entrada}
                value={novoCulto.name}
                onChange={(e) => setNovoCulto({ ...novoCulto, name: e.target.value })}
                placeholder="Culto da Familia"
              />
            </div>
            <div>
              <label className={rotulo}>Dia</label>
              <select
                className={entrada}
                value={novoCulto.weekday}
                onChange={(e) => setNovoCulto({ ...novoCulto, weekday: Number(e.target.value) })}
              >
                {DIAS.map((d) => (
                  <option key={d.valor} value={d.valor}>{d.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={rotulo}>Horario</label>
              <input
                type="time"
                className={entrada}
                value={novoCulto.start_time}
                onChange={(e) => setNovoCulto({ ...novoCulto, start_time: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={rotulo}>Local (opcional)</label>
              <input
                className={entrada}
                value={novoCulto.location_name}
                onChange={(e) => setNovoCulto({ ...novoCulto, location_name: e.target.value })}
              />
            </div>
            <div>
              <label className={rotulo}>Duracao (min)</label>
              <input
                type="number"
                className={entrada}
                value={novoCulto.duration_minutes}
                onChange={(e) => setNovoCulto({ ...novoCulto, duration_minutes: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm">
                Adicionar
              </button>
            </div>
          </form>
        )}

        {!cultos.length ? (
          <p className="text-sm text-slate-400">Nenhum horario cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {cultos.map((culto) => (
              <div
                key={culto.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border border-white/10 ${culto.is_active ? "" : "opacity-50"}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Clock size={16} className="shrink-0 text-purple-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{culto.name}</p>
                    <p className="text-xs text-slate-400">
                      {nomeDoDia(culto.weekday)} as {String(culto.start_time).slice(0, 5)}
                      {culto.location_name ? ` - ${culto.location_name}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => alternarAtivo(culto)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300"
                  >
                    {culto.is_active ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    onClick={() => removerCulto(culto)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
