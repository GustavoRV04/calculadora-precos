export function unidadeBase(unidade) {
  if (unidade === "KG") return "G";
  if (unidade === "L") return "ML";
  return unidade;
}

export function converterParaBase(
  quantidade,
  unidade
) {

  switch (unidade) {

    case "KG":
      return quantidade * 1000;

    case "L":
      return quantidade * 1000;

    default:
      return quantidade;

  }

}