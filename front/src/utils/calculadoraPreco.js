import { converterParaBase } from "./conversorMedidas.js";

export function calcularCustoIngrediente(
  precoCompra,
  quantidadeCompra,
  quantidadeUtilizada,
  unidadeCompra = "G",
) {
  const quantidadeTotal = converterParaBase(
    Number(quantidadeCompra),
    unidadeCompra,
  );

  if (!quantidadeTotal) return 0;

  return (
    (Number(precoCompra) / quantidadeTotal) * Number(quantidadeUtilizada)
  );
}