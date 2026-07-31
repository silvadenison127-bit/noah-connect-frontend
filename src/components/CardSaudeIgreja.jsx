import React from "react";

const LABEL_CATEGORIA_SAUDE = {
  frequenciaCultos: "Frequência em Cultos",
  participacaoCelulas: "Participação em Células",
  participacaoMinisterios: "Participação em Ministérios",
  crescimento: "Crescimento de Membros",
  retencao: "Retenção",
  participacaoEventos: "Participação em Eventos",
};

function GaugeSaude({ percentual }) {
  const valorExibido = percentual ?? 0;
  const valorArco = Math.min(Math.max(valorExibido, 0), 100);
  const raio = 42;
  const circunferencia = 2 * Math.PI * raio;
  const offset = circunferencia - (valorArco / 100) * circunferencia;

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={raio} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={raio} fill="none" stroke="#34D399" strokeWidth="8"
          strokeDasharray={circunferencia} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white">{percentual !== null ? `${percentual}%` : "--"}</span>
        <span className="text-[9px] text-slate-500">Saudável</span>
      </div>
    </div>
  );
}

export default function CardSaudeIgreja({ saude, carregando }) {
  const indicadores = saude?.indicadores ?? {};
  const categorias = Object.keys(LABEL_CATEGORIA_SAUDE).filter((k) => indicadores[k]);

  return (
    <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
      <h3 className="font-semibold text-white mb-1">Saúde da Igreja</h3>
      <p className="text-xs text-slate-500 mb-4">Baseado em dados reais da plataforma</p>
      {carregando ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : (
        <div className="flex items-center gap-5">
          <GaugeSaude percentual={saude?.score ?? null} />
          <div className="flex-1 space-y-2 min-w-0">
            {categorias.map((chave) => {
              const item = indicadores[chave];
              const valor = item?.percentual;
              return (
                <div key={chave}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 truncate">{LABEL_CATEGORIA_SAUDE[chave]}</span>
                    <span className="text-slate-200 font-medium shrink-0 ml-2">
                      {valor === null || valor === undefined ? "Sem dado" : `${valor}%`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full"
                      style={{ width: `${Math.min(Math.max(valor ?? 0, 0), 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {indicadores.pedidosOracaoAtivos && (
              <p className="text-[11px] text-slate-500 pt-1">
                Pedidos de oração ativos: <span className="text-slate-300 font-medium">{indicadores.pedidosOracaoAtivos.total}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}