import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, LayersControl, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Users, Home, RefreshCw } from "lucide-react";
import api from "../services/api";

// Curitiba como centro inicial: a igreja fica aqui e o mapa precisa de
// um ponto de partida antes de saber onde estao os membros.
const CENTRO_PADRAO = [-25.4284, -49.2733];

// O Leaflet usa imagens por URL para os marcadores. Em vez de depender
// de arquivos externos, desenhamos o pino em SVG embutido.
function pino(cor) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="38" viewBox="0 0 26 38">' +
    '<path d="M13 0C5.8 0 0 5.8 0 13c0 9.7 13 25 13 25s13-15.3 13-25C26 5.8 20.2 0 13 0z" fill="' + cor + '"/>' +
    '<circle cx="13" cy="13" r="5" fill="#0B0B16"/></svg>';
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [26, 38],
    iconAnchor: [13, 38],
    popupAnchor: [0, -34],
  });
}

const ICONE_MEMBRO = pino("#8B5CF6");
const ICONE_CELULA = pino("#22D3EE");

/** Enquadra o mapa em todos os pontos assim que eles chegam. */
function AjustarEnquadramento({ pontos }) {
  const mapa = useMap();
  useEffect(() => {
    if (!pontos.length) return;
    const limites = L.latLngBounds(pontos.map((p) => [p.latitude, p.longitude]));
    mapa.fitBounds(limites, { padding: [48, 48], maxZoom: 16 });
  }, [pontos, mapa]);
  return null;
}

export default function MapaIgreja() {
  const [dados, setDados] = useState({ membros: [], celulas: [], membrosSemCoordenada: 0 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      const r = await api.get("/mapa/pontos");
      setDados(r.data);
    } catch {
      setErro("Nao foi possivel carregar o mapa. Verifique sua conexao.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const pontos = [...dados.membros, ...dados.celulas];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-white text-lg">Mapa da Igreja</h2>
          <p className="text-xs text-slate-500">Membros e células com endereço cadastrado</p>
        </div>
        <button
          onClick={carregar}
          className="flex items-center gap-2 text-sm text-violet-300 hover:text-white bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        >
          <RefreshCw size={15} />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Users size={20} />
            </div>
            <p className="text-sm text-slate-400">Membros no mapa</p>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{dados.membros.length}</p>
        </div>
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Home size={20} />
            </div>
            <p className="text-sm text-slate-400">Células no mapa</p>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{dados.celulas.length}</p>
        </div>
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <MapPin size={20} />
            </div>
            <p className="text-sm text-slate-400">Sem endereço</p>
          </div>
          <p className="text-2xl font-bold text-white mt-3">{dados.membrosSemCoordenada}</p>
        </div>
      </div>

      {erro ? (
        <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 p-5 text-sm text-rose-300">{erro}</div>
      ) : null}

      <div className="bg-[#0F0F1E] rounded-2xl border border-white/10 shadow-sm overflow-hidden">
        {carregando ? (
          <div className="h-[520px] flex items-center justify-center text-sm text-slate-500">Carregando o mapa...</div>
        ) : pontos.length === 0 ? (
          <div className="h-[520px] flex flex-col items-center justify-center gap-2 px-6 text-center">
            <MapPin size={32} className="text-slate-600" />
            <p className="text-sm text-slate-400">Nenhum endereço cadastrado ainda</p>
            <p className="text-xs text-slate-600 max-w-md">
              Preencha o endereço ao cadastrar um membro ou uma célula e o ponto aparece aqui automaticamente.
            </p>
          </div>
        ) : (
          <MapContainer center={CENTRO_PADRAO} zoom={12} keyboard={false} style={{ height: "calc(100vh - 300px)", minHeight: "420px", width: "100%" }}>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Mapa">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name={"Sat\u00e9lite"}>
                <TileLayer
                  attribution='Imagens &copy; Esri'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxNativeZoom={18}
                  maxZoom={19}
                />
              </LayersControl.BaseLayer>
              <LayersControl.Overlay name="Nomes das ruas">
                <TileLayer
                  url="https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png"
                />
              </LayersControl.Overlay>
            </LayersControl>
            <AjustarEnquadramento pontos={pontos} />

            {dados.membros.map((m) => (
              <Marker key={"m" + m.id} position={[m.latitude, m.longitude]} icon={ICONE_MEMBRO}>
                <Popup>
                  <strong>{m.nome}</strong>
                  <br />
                  {[m.bairro, m.cidade].filter(Boolean).join(" - ")}
                </Popup>
              </Marker>
            ))}

            {dados.celulas.map((c) => (
              <Marker key={"c" + c.id} position={[c.latitude, c.longitude]} icon={ICONE_CELULA}>
                <Popup>
                  <strong>{c.nome}</strong>
                  <br />
                  {c.endereco || [c.bairro, c.cidade].filter(Boolean).join(" - ")}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
