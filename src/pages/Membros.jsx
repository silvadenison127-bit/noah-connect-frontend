import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Membros() {
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api
      .get("/membros")
      .then((res) => setMembros(res.data))
      .catch(() => setErro("Não foi possível carregar os membros (acesso restrito a administradores)."))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Membros</h2>
        <span className="text-xs text-slate-400">{membros.length} cadastrados</span>
      </div>

      {erro && <p className="text-sm text-amber-600 p-5">{erro}</p>}

      {!erro && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Telefone</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {carregando ? (
              <tr><td className="px-5 py-4 text-slate-400" colSpan={5}>Carregando...</td></tr>
            ) : membros.length === 0 ? (
              <tr><td className="px-5 py-4 text-slate-400" colSpan={5}>Nenhum membro cadastrado ainda.</td></tr>
            ) : (
              membros.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-700">{m.nome}</td>
                  <td className="px-5 py-3 text-slate-500">{m.email}</td>
                  <td className="px-5 py-3 text-slate-500">{m.telefone || "-"}</td>
                  <td className="px-5 py-3 text-slate-500 capitalize">{m.tipo}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${m.ativo ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                      {m.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
