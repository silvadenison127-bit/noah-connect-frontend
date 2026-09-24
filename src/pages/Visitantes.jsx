import React, { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Printer, QrCode, UserPlus } from "lucide-react";
import api from "../services/api";
import { URL_VISITANTE, svgQrVisitante } from "../components/qrVisitante";

/** Visitantes por QR Code (Bloco 6): resumo, grafico, lista e QR para imprimir. */
const ROTULO_ORIGEM = {
  amigo_familia: "Amigo ou família",
  redes_sociais: "Redes sociais",
  passou_na_frente: "Passou na frente",
  evento: "Evento da igreja",
  outro: "Outro",
};

function dataCurta(texto) {
  if (!texto) return "";
  const [data, hora] = texto.split("T");
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}${hora ? ` ${hora}` : ""}`;
}

function imprimirQr() {
  const janela = window.open("", "_blank", "width=600,height=800");
  if (!janela) return;
  janela.document.write(`<!doctype html><html><head><title>QR Code - Visitantes</title>
    <style>body{font-family:Arial,sans-serif;text-align:center;padding:40px}h1{font-size:30px;margin:0 0 8px}p{font-size:18px;margin:0 0 24px}</style>
    </head><body><h1>Seja bem-vindo(a)!</h1><p>Aponte a câmera do celular e registre sua visita</p>
    ${svgQrVisitante(420)}<p style="margin-top:20px;font-size:14px">${URL_VISITANTE}</p></body></html>`);
  janela.document.close();
  janela.focus();
  setTimeout(() => janela.print(), 300);
}

export default function Visitantes() {
  const [resumo, setResumo] = useState(null);
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const [r, l] = await Promise.all([api.get("/visitantes/resumo"), api.get("/visitantes")]);
      setResumo(r.data);
      setLista(Array.isArray(l.data) ? l.data : []);
    } catch {
      setErro("Não foi possível carregar os visitantes.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const grafico = (resumo?.por_culto || [])
    .slice()
    .reverse()
    .map((c) => ({ nome: `${c.titulo} ${dataCurta(c.data_inicio).split(" ")[0]}`, Membros: c.membros, Visitantes: c.visitantes }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-violet-400" /> Visitantes
          </h1>
          <p className="text-xs text-slate-400">Registros feitos pelo QR Code da recepção</p>
        </div>
        <button onClick={carregar} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-violet-300 hover:bg-white/5">
          Atualizar
        </button>
      </div>

      {erro && <p className="text-sm text-rose-400">{erro}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#141023] p-5">
          <p className="text-sm font-semibold text-white mb-1">Membros x visitantes por culto</p>
          <p className="text-xs text-slate-400 mb-4">Últimos 12 cultos cadastrados</p>
          {carregando ? (
            <p className="text-sm text-slate-400">Carregando...</p>
          ) : grafico.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum culto cadastrado ainda. Cadastre os cultos em Cultos para ver o gráfico.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2440" />
                  <XAxis dataKey="nome" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1b1130", border: "1px solid #3b2d63" }} />
                  <Legend />
                  <Bar dataKey="Membros" fill="#7C3AED" />
                  <Bar dataKey="Visitantes" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[#141023] p-5 flex flex-col items-center text-center">
          <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-violet-400" /> QR Code da recepção
          </p>
          <div className="rounded-lg bg-white p-2" dangerouslySetInnerHTML={{ __html: svgQrVisitante(200) }} />
          <p className="text-[11px] text-slate-400 mt-2 break-all">{URL_VISITANTE}</p>
          <button
            onClick={imprimirQr}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
          >
            <Printer className="w-4 h-4" /> Imprimir QR Code
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#141023] p-5">
          <p className="text-sm font-semibold text-white mb-3">Como conheceram a igreja</p>
          {(resumo?.como_conheceu || []).length === 0 ? (
            <p className="text-sm text-slate-400">Sem visitas registradas ainda.</p>
          ) : (
            <ul className="space-y-2">
              {resumo.como_conheceu.map((o) => (
                <li key={o.como_conheceu} className="flex justify-between text-sm text-slate-300">
                  <span>{ROTULO_ORIGEM[o.como_conheceu] || o.como_conheceu}</span>
                  <span className="font-semibold text-white">{o.total}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#141023] p-5 overflow-x-auto">
          <p className="text-sm font-semibold text-white mb-3">Últimas visitas</p>
          {lista.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma visita registrada ainda.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="py-2 pr-3">Nome</th>
                  <th className="py-2 pr-3">Telefone</th>
                  <th className="py-2 pr-3">Como conheceu</th>
                  <th className="py-2 pr-3">Culto</th>
                  <th className="py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((v) => (
                  <tr key={v.id} className="border-t border-white/5 text-slate-300">
                    <td className="py-2 pr-3 text-white">{v.nome}</td>
                    <td className="py-2 pr-3">{v.telefone || "—"}</td>
                    <td className="py-2 pr-3">{ROTULO_ORIGEM[v.como_conheceu] || v.como_conheceu}</td>
                    <td className="py-2 pr-3">{v.culto || "Sem culto cadastrado"}</td>
                    <td className="py-2">{dataCurta(v.criado_em)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
