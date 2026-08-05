import React, { useState } from "react";
import {
  MapPin, Users, Users2, Church, Eye, Layers, Database,
  Flame, Satellite, CircleDot, Crosshair, Sparkles,
  Filter, ChevronDown, ChevronLeft, ChevronRight, Clock, FileText,
} from "lucide-react";
import CardIndicador from "../components/CardIndicador";

const RESUMO_TERRITORIAL = [
  { icone: Users, label: "Membros", valor: "0", cor: "violet" },
  { icone: Users2, label: "Celulas", valor: "0", cor: "cyan" },
  { icone: Church, label: "Congregacoes", valor: "0", cor: "amber" },
  { icone: Eye, label: "Visitantes", valor: "0", cor: "emerald" },
  { icone: Layers, label: "Regioes", valor: "0", cor: "violet" },
];

const FERRAMENTAS_MAPA = [
  { label: "Marcadores", icone: MapPin },
  { label: "Heatmap", icone: Flame },
  { label: "Satelite", icone: Satellite },
  { label: "Clusters", icone: CircleDot },
  { label: "Centralizar", icone: Crosshair },
];

const LEGENDA_MAPA = [
  { label: "Membros", cor: "#A78BFA" },
  { label: "Celulas", cor: "#22D3EE" },
  { label: "Congregacoes", cor: "#FBBF24" },
  { label: "Visitantes", cor: "#34D399" },
];

const CAMPOS_FILTRO = ["Cidade", "Bairro", "Congregacao", "Celula", "Ministerio", "Status", "Periodo"];

const CAMADAS_MAPA = ["Membros", "Celulas", "Congregacoes", "Visitantes", "Ministerios", "Eventos", "Evangelismo"];

const CAMPOS_DETALHE = ["Nome", "Endereco", "Telefone", "Celula", "Congregacao", "Ministerio", "Data de cadastro"];

export default function MapaIgreja() {
  const [filtrosAbertos, setFiltrosAbertos] = useState(true);

  return (
    <div className="space-y-4">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-[#0F0F1E] to-[#0F0F1E]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.10),transparent_60%)]" />
        <div className="relative flex items-center gap-3 px-5 py-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-900/40 shrink-0">
            <MapPin size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white">Mapa da Igreja</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Distribuicao geografica de membros, celulas e congregacoes.
            </p>
          </div>
        </div>
      </div>

      {/* FILTROS/CAMADAS + MAPA + PAINEL LATERAL */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* PAINEL RECOLHIVEL: FILTROS + CAMADAS */}
        <div
          className={`bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm shrink-0 overflow-hidden transition-all duration-300 ${
            filtrosAbertos ? "w-full lg:w-64 p-4" : "w-full lg:w-14 p-2"
          }`}
        >
          <button
            onClick={() => setFiltrosAbertos((v) => !v)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-full"
            title={filtrosAbertos ? "Recolher" : "Expandir filtros"}
          >
            <Filter size={16} className="shrink-0" />
            {filtrosAbertos && <span className="text-xs font-semibold flex-1 text-left">Filtros</span>}
            {filtrosAbertos ? <ChevronLeft size={14} /> : null}
            {!filtrosAbertos && <ChevronRight size={14} className="mx-auto" />}
          </button>

          {filtrosAbertos && (
            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                {CAMPOS_FILTRO.map((campo) => (
                  <div
                    key={campo}
                    className="flex items-center justify-between text-[11px] text-slate-500 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 opacity-60 cursor-not-allowed"
                  >
                    {campo}
                    <ChevronDown size={12} />
                  </div>
                ))}
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
                  <Layers size={13} /> Camadas
                </p>
                <div className="space-y-1.5">
                  {CAMADAS_MAPA.map((camada) => (
                    <div key={camada} className="flex items-center gap-2 text-[11px] text-slate-500 opacity-60 cursor-not-allowed">
                      <span className="w-3.5 h-3.5 rounded border border-white/20 shrink-0" />
                      {camada}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MAPA SIMULADO - GIS */}
        <div className="relative bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm overflow-hidden h-[550px] flex-1 transition-shadow duration-200 hover:shadow-lg hover:shadow-violet-900/10">
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap justify-end max-w-[70%]">
            {FERRAMENTAS_MAPA.map((f) => {
              const Icone = f.icone;
              return (
                <button
                  key={f.label}
                  disabled
                  className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-[#0B0B16]/80 backdrop-blur border border-white/10 rounded-lg px-2.5 py-1.5 opacity-60 cursor-not-allowed"
                >
                  <Icone size={12} />
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="absolute bottom-3 left-3 bg-[#0B0B16]/80 backdrop-blur border border-white/10 rounded-xl p-2.5 flex flex-col gap-1.5">
            {LEGENDA_MAPA.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.cor }} />
                <span className="text-[10px] text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <MapPin size={26} className="text-violet-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 mt-1">Mapa aguardando dados</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Os marcadores aparecerao automaticamente quando existirem membros, celulas,
              congregacoes e visitantes cadastrados.
            </p>
          </div>
        </div>

        {/* PAINEL LATERAL DIREITO */}
        <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-3">
          <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 flex flex-col gap-3 transition-shadow duration-200 hover:shadow-lg hover:shadow-violet-900/10">
            <h3 className="text-xs font-semibold text-slate-300">Resumo Territorial</h3>
            <div className="grid grid-cols-1 gap-2.5">
              {RESUMO_TERRITORIAL.map((item) => (
                <CardIndicador
                  key={item.label}
                  icone={item.icone}
                  label={item.label}
                  valor={item.valor}
                  cor={item.cor}
                />
              ))}
            </div>
          </div>

          <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 transition-shadow duration-200 hover:shadow-lg hover:shadow-violet-900/10">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
              <FileText size={13} /> Painel de Detalhes
            </p>
            <p className="text-xs text-slate-500 mb-2">Nenhum marcador selecionado.</p>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Ao selecionar um marcador, este painel exibira: {CAMPOS_DETALHE.join(", ")}.
            </p>
          </div>

          <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 transition-shadow duration-200 hover:shadow-lg hover:shadow-violet-900/10">
            <h3 className="text-xs font-semibold text-slate-300 mb-2">Ultima atividade</h3>
            <p className="text-xs text-slate-500">Nenhuma movimentacao registrada.</p>
          </div>

          <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 transition-shadow duration-200 hover:shadow-lg hover:shadow-violet-900/10">
            <h3 className="text-xs font-semibold text-slate-300 mb-2">Proxima sincronizacao</h3>
            <p className="text-xs text-slate-500">Aguardando conexao.</p>
          </div>
        </div>
      </div>

      {/* PARTE INFERIOR - 3 CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 transition-shadow duration-200 hover:shadow-lg hover:shadow-violet-900/10">
          <h3 className="text-xs font-semibold text-slate-300 mb-3">Distribuicao por Bairro</h3>
          <p className="text-xs text-slate-500">Nenhum dado disponivel.</p>
        </div>

        <div className="bg-[#0F0F1E] rounded-2xl border border-violet-500/20 shadow-sm p-4 transition-shadow duration-200 hover:shadow-lg hover:shadow-violet-900/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-violet-400" />
            <h3 className="text-xs font-semibold text-slate-300">Oportunidades Territoriais</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nenhuma regiao identificada. A IA Noah analisara automaticamente bairros com
            potencial para abertura de novas celulas, congregacoes e acoes evangelisticas
            quando houver dados suficientes.
          </p>
        </div>

        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 transition-shadow duration-200 hover:shadow-lg hover:shadow-violet-900/10">
          <h3 className="text-xs font-semibold text-slate-300 mb-3">Celulas</h3>
          <p className="text-xs text-slate-500">Nenhuma celula cadastrada.</p>
        </div>
      </div>

      {/* LINHA DO TEMPO + IA NOAH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-4 transition-shadow duration-200 hover:shadow-lg hover:shadow-violet-900/10">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-slate-400" />
            <h3 className="text-xs font-semibold text-slate-300">Movimentacoes</h3>
          </div>
          <p className="text-xs text-slate-500">Nenhuma movimentacao registrada.</p>
        </div>

        <div className="bg-[#0F0F1E] rounded-2xl border border-violet-500/20 shadow-sm p-4 transition-shadow duration-200 hover:shadow-lg hover:shadow-violet-900/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-violet-400" />
            <h3 className="text-xs font-semibold text-slate-300">Analise Inteligente</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            A IA Noah analisara automaticamente o crescimento territorial, bairros sem
            cobertura, regioes prioritarias e oportunidades para abertura de novas celulas.
          </p>
        </div>
      </div>

      {/* ESTADO VAZIO ELEGANTE */}
      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm px-6 py-8 flex flex-col items-center text-center gap-2">
        <Database size={26} className="text-slate-600 mb-1" />
        <h3 className="text-sm font-semibold text-slate-300">Nenhum dado geografico disponivel</h3>
        <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
          Assim que membros, celulas e congregacoes forem cadastrados, o mapa sera preenchido
          automaticamente.
        </p>
      </div>

      {/* RODAPE INFORMATIVO */}
      <div className="text-center pt-1 space-y-0.5">
        <p className="text-[10px] text-slate-500 font-medium">Fonte dos dados</p>
        <p className="text-[10px] text-slate-600">
          Membros • Celulas • Congregacoes • IA Noah
        </p>
      </div>
    </div>
  );
}