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