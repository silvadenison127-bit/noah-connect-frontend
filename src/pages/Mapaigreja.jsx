import React from "react";
import { MapPin } from "lucide-react";

export default function MapaIgreja() {
  return (
    <div className="bg-[#0F0F1E] border border-white/10 rounded-2xl p-10 text-center">
      <MapPin className="mx-auto text-violet-400 mb-4" size={40} />
      <h2 className="text-xl font-semibold text-white">Mapa da Igreja</h2>
      <p className="text-slate-400 text-sm mt-2">
        Distribuição geográfica de membros e células em construção.
      </p>
    </div>
  );
}
