import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Plus } from "lucide-react";

export default function Eventos() {
  const { usuario } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novo, setNovo] = useState({ titulo: "", tipo: "evento", data_inicio: "", local: "" });
  const [salvando, setSalvando] = useState(false);

  function carregar() {
    setCarregando(true);
    api.get("/eventos").then((res) => setEventos(res.data)).finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  async function criarEvento(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post("/eventos", novo);
      setNovo({ titulo: "", tipo: "evento", data_inicio: "", local: "" });
      setMostrarForm(false);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || "Erro ao criar evento");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white text-lg">Agenda e Eventos</h2>
        {usuario?.tipo === "admin" && (
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white text-sm font-medium rounded-xl px-4 py-2"
          >
            <Plus size={16} /> Novo Evento
          </button>
        )}
      </div>

      {mostrarForm && (
        <form onSubmit={criarEvento} className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <button
            disabled={salvando}
            className="sm:col-span-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 disabled:opacity-60 text-white text-sm font-medium rounded-xl py-2"
          >
            {salvando ? "Salvando..." : "Salvar Evento"}
          </button>
        </form>
      )}

      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm divide-y divide-white/5">
        {carregando ? (
          <p className="text-sm text-slate-500 p-5">Carregando...</p>
        ) : eventos.length === 0 ? (
          <p className="text-sm text-slate-500 p-5">Nenhum evento cadastrado ainda.</p>
        ) : (
          eventos.map((ev) => {
            const data = new Date(ev.data_inicio);
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
