export function formatarMoeda(valor, casas = 2) {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function formatarQuantidade(valor) {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    maximumFractionDigits: 3,
  });
}