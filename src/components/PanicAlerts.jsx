import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, MapPin, Phone } from "lucide-react";
import api from "../services/api";

/**
 * Alertas do botao de panico (Bloco 5).
 * Consulta o backend a cada 10 segundos e mostra uma faixa vermelha fixa
 * no topo enquanto houver alerta em aberto. So some quando alguem marca
 * "Atendido". O som e melhor esforco: o navegador pode bloquear audio
 * ate o usuario interagir com a pagina.
 */
const INTERVALO_MS = 10000;

function tocarAlarme() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [0, 0.35, 0.7].forEach((inicio) => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.frequency.value = 880;
      vol.gain.value = 0.2;
      osc.connect(vol);
      vol.connect(ctx.destination);
      osc.start(ctx.currentTime + inicio);
      osc.stop(ctx.currentTime + inicio + 0.25);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // sem audio: o aviso visual continua
  }
}

function hora(iso) {
  try {
    return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function PanicAlerts() {
  const [alertas, setAlertas] = useState([]);
  const [atendendo, setAtendendo] = useState(null);
  const vistos = useRef(new Set());

  const buscar = useCallback(() => {
    api.get("/panico/abertos")
      .then(({ data }) => {
        const lista = Array.isArray(data) ? data : [];
        const novo = lista.some((a) => !vistos.current.has(a.id));
        lista.forEach((a) => vistos.current.add(a.id));
        if (novo) tocarAlarme();
        setAlertas(lista);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    buscar();
    const intervalo = setInterval(buscar, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [buscar]);

  async function atender(id) {
    setAtendendo(id);
    try {
      await api.patch(`/panico/${id}/atender`);
      setAlertas((atual) => atual.filter((a) => a.id !== id));
    } catch {
      buscar();
    } finally {
      setAtendendo(null);
    }
  }

  if (alertas.length === 0) return null;

  return (
    <div className="space-y-3">
      {alertas.map((a) => (
        <div key={a.id} className="rounded-xl border-2 border-red-500 bg-red-600/20 p-4 animate-pulse">
          <div className="flex flex-wrap items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
            <div className="flex-1 min-w-[200px]">
              <p className="text-red-200 font-bold">ALERTA DE PÂNICO: {a.nome}</p>
              <p className="text-red-300/80 text-sm">
                {hora(a.criado_em)}
                {a.latitude == null ? " · localização indisponível" : ""}
              </p>
            </div>
            {a.latitude != null && (
              <a
                href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
              >
                <MapPin className="w-4 h-4" /> Ver no mapa
              </a>
            )}
            {a.telefone && (
              <a
                href={`tel:${a.telefone}`}
                className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
              >
                <Phone className="w-4 h-4" /> {a.telefone}
              </a>
            )}
            <button
              type="button"
              onClick={() => atender(a.id)}
              disabled={atendendo === a.id}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {atendendo === a.id ? "Salvando..." : "Marcar como atendido"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
