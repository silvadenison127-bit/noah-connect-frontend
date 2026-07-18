import React from "react";
import { Sparkles } from "lucide-react";

export default function IANoah() {
  return (
    <div className="bg-[#0F0F1E] border border-white/10 rounded-2xl p-10 text-center">
      <Sparkles className="mx-auto text-violet-400 mb-4" size={40} />
      <h2 className="text-xl font-semibold text-white">IA Noah</h2>
      <p className="text-slate-400 text-sm mt-2">
        Módulo em construção — em breve você poderá fazer perguntas em linguagem natural sobre os dados da igreja.
      </p>
    </div>
  );
}
