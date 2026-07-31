import api from "./api";

export async function obterStatusIA() {
  const { data } = await api.get("/ia-noah/status");
  return data;
}

export async function perguntarIA(pergunta, historico = []) {
  const { data } = await api.post("/ia-noah/perguntar", { pergunta, historico });
  return data;
}