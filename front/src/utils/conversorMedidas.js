const unidadesEquivalentes = {
  KG: "KG",
  QUILO: "KG",
  QUILOS: "KG",
  QUILOGRAMA: "KG",
  QUILOGRAMAS: "KG",
  G: "G",
  GRAMA: "G",
  GRAMAS: "G",
  L: "L",
  LITRO: "L",
  LITROS: "L",
  ML: "ML",
  MILILITRO: "ML",
  MILILITROS: "ML",
  UN: "UN",
  UNIDADE: "UN",
  UNIDADES: "UN",
};

function normalizarUnidade(unidade) {
  const chave = String(unidade ?? "").trim().toUpperCase();
  if (!Object.hasOwn(unidadesEquivalentes, chave)) {
    throw new RangeError(`Unidade de medida não reconhecida: "${unidade}".`);
  }
  const normalizada = unidadesEquivalentes[chave];
  return normalizada;
}

export function unidadeBase(unidade) {
  if (unidade == null || String(unidade).trim() === "") return undefined;
  const normalizada = normalizarUnidade(unidade);
  if (normalizada === "KG") return "G";
  if (normalizada === "L") return "ML";
  return normalizada;
}

export function converterParaBase(quantidade, unidade) {
  const quantidadeNumerica = Number(quantidade);
  if (!Number.isFinite(quantidadeNumerica) || quantidadeNumerica < 0) {
    throw new RangeError("A quantidade deve ser um número finito não negativo.");
  }

  const normalizada = normalizarUnidade(unidade);
  if (normalizada === "KG" || normalizada === "L") {
    return quantidadeNumerica * 1000;
  }
  return quantidadeNumerica;
}