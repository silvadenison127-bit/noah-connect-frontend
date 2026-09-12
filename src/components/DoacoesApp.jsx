import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { CheckCircle2, XCircle, Smartphone } from "lucide-react";

/**
 * Doações feitas pelo aplicativo.
 *
 * Estas doações vivem no Supabase, separadas dos lançamentos manuais da
 * tesouraria. Não há integração com o banco: quando o membro gera um PIX o
 * registro nasce "aguardando" e assim permanece até alguém conferir o extrato
 * e dar a baixa aqui.
 */

const CORES = {
  aguardando: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  processando: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  confirmado: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  cancelado: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  falhou: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  estornado: "bg-violet-500/15 text-violet-300 border-violet-500/30",
};

function moeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DoacoesApp() {
  const [doacoes, setDoacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState(null);

  function carregar() {
    setCarregando(true);
    setErro(null);
    api
      .get("/dizimos/app")
      .then((res) => setDoacoes(Array.isArray(res.data) ? res.data : []))
      .catch((err) =>
        setErro(err.response?.data?.erro || "Não foi possível carregar as doações.")
      )
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  // Só o que está confirmado entra no total: dinheiro prometido não é dinheiro
  // recebido, e somar as pendentes daria à tesouraria um número que não existe.
  const totalConfirmado = useMemo(
    () =>
      doacoes
        .filter((d) => d.situacao === "confirmado")
        .reduce((soma, d) => soma + Number(d.valor || 0), 0),
    [doacoes]
  );

  const aguardando = doacoes.filter((d) => d.situacao === "aguardando").length;

  async function executar(id, acao) {
    setAcaoEmAndamento(id);
    try {
      await api.put(`/dizimos/app/${id}/${acao}`);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || "A ação não pôde ser concluída.");
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-white/10 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-violet-400" />
          <h2 className="font-semibold text-white">Doações pelo aplicativo</h2>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-slate-400">
          {aguardando} aguardando · confirmado {moeda(totalConfirmado)}
        </span>
      </div>

      {erro && (
        <div className="px-5 py-3 border-b border-white/10 bg-rose-500/10 text-rose-400 text-xs">
          {erro}
        </div>
      )}

      <div className="divide-y divide-white/5">
        {carregando && (
          <p className="text-sm text-slate-500 p-5">Carregando...</p>
        )}

        {!carregando && doacoes.length === 0 && (
          <p className="text-sm text-slate-500 p-5">
            Nenhuma doação pelo aplicativo até agora.
          </p>
        )}

        {doacoes.map((d) => (
          <div key={d.id} className="p-4 flex flex-wrap items-center gap-3">
            <div className="min-w-[150px]">
              <p className="text-sm text-white font-medium">{moeda(d.valor)}</p>
              <p className="text-xs text-slate-500 mt-0.5 capitalize">
                {d.tipo} · {d.forma_pagamento} · {dataHora(d.criado_em)}
              </p>
            </div>

            <span
              className={`text-xs font-medium px-2 py-1 rounded-full border capitalize ${
                CORES[d.situacao] || CORES.cancelado
              }`}
            >
              {d.situacao}
            </span>

            <div className="flex-1" />

            {d.confirmado_em && (
              <span className="text-xs text-slate-500">
                Baixa em {dataHora(d.confirmado_em)}
              </span>
            )}

            {d.situacao !== "confirmado" && (
              <button
                type="button"
                onClick={() => executar(d.id, "confirmar")}
                disabled={acaoEmAndamento === d.id}
                className="text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                {acaoEmAndamento === d.id ? "..." : "Confirmar"}
              </button>
            )}

            {d.situacao !== "cancelado" && (
              <button
                type="button"
                onClick={() => executar(d.id, "cancelar")}
                disabled={acaoEmAndamento === d.id}
                className="text-xs text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <XCircle size={14} />
                Cancelar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}