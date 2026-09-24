export function calcularCustoIngrediente(
  precoCompra,
  quantidadeCompra,
  quantidadeUtilizada
) {
  const valorUnitario =
    precoCompra / quantidadeCompra;

  const total =
    valorUnitario * quantidadeUtilizada;

  return Number(total.toFixed(2));
}