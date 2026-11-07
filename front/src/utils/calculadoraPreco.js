import { converterParaBase } from "./conversorMedidas.js";

export function calcularCustoIngrediente(
  precoCompra,
  quantidadeCompra,
  quantidadeUtilizada,
  unidadeCompra = "G",
) {
  const preco = Number(precoCompra);
  const quantidade = Number(quantidadeCompra);
  const utilizada = Number(quantidadeUtilizada);
  if (!Number.isFinite(preco) || preco < 0) {
    throw new RangeError("O preço da compra deve ser um número finito não negativo.");
  }
  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    throw new RangeError("A quantidade comprada deve ser um número finito maior que zero.");
  }
  if (!Number.isFinite(utilizada) || utilizada < 0) {
    throw new RangeError("A quantidade utilizada deve ser um número finito não negativo.");
  }

  const quantidadeTotal = converterParaBase(
    quantidade,
    unidadeCompra,
  );

  return (preco / quantidadeTotal) * utilizada;
}

export function calcularPrecoVendaComMargem(custo, margemPercentual) {
  const percentual = Number(margemPercentual);
  const custoNumerico = Number(custo);
  if (!Number.isFinite(percentual) || percentual < 0 || percentual >= 100 || !Number.isFinite(custoNumerico) || custoNumerico < 0) {
    return null;
  }

  const precoExato = custoNumerico / (1 - percentual / 100);
  if (precoExato === 0) return 0;
  return Math.ceil(precoExato * 100 - 1e-8) / 100;
}