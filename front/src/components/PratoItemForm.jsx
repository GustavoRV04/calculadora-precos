import { useEffect, useState } from "react";
import { listarPratos, adicionarIngrediente } from "../services/pratoService";
import { listarProdutos } from "../services/produtoService";
import { unidadeBase } from "../utils/conversorMedidas";

export default function PratoItemForm({ dataVersion, onSaved }) {
  const [pratos, setPratos] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [pratoId, setPratoId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidadeUtilizada, setQuantidadeUtilizada] = useState("");

  useEffect(() => {
    async function carregarDados() {
      const { results: pratosData } = await listarPratos();
      setPratos(pratosData);

      const { results: produtosData } = await listarProdutos();
      setProdutos(produtosData);

      if (pratosData.length > 0) {
        setPratoId(pratosData[0].id);
      }

      const produtoComCompra = produtosData.find((produto) => produto.ultimo_item);
      if (produtoComCompra) {
        setProdutoId(produtoComCompra.id);
      }
    }

    carregarDados();
  }, [dataVersion]);

  const produtoSelecionado = produtos.find((produto) => String(produto.id) === String(produtoId));

  async function salvar() {
    if (!pratoId || !produtoId || !quantidadeUtilizada) return;

    await adicionarIngrediente(
      pratoId,
      Number(produtoId),
      Number(quantidadeUtilizada),
    );

    onSaved?.();
    alert("Ingrediente adicionado!");

    setQuantidadeUtilizada("");
  }

  // console.log(itemProdutos);

  return (
    <div>
      <h2>Adicionar Item ao Prato</h2>

      <select value={pratoId} onChange={(e) => setPratoId(e.target.value)}>
        {pratos.map((prato) => (
          <option key={prato.id} value={prato.id}>
            {prato?.nome}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
        {produtos.map((produto) => (
          <option key={produto.id} value={produto.id} disabled={!produto.ultimo_item}>
            {produto.nome} ({produto.ultimo_item ? `${produto.ultimo_item.quantidade_compra} ${produto.ultimo_item.unidade_medida} por R$ ${produto.ultimo_item.preco_custo}` : "sem compra registrada"})
          </option>
        ))}
      </select>

      <br />
      <br />

      <label htmlFor="quantidade-utilizada">
        Quantidade utilizada ({unidadeBase(produtoSelecionado?.ultimo_item?.unidade_medida) ?? "unidade"})
      </label>
      <input
        id="quantidade-utilizada"
        type="number"
        min="0.001"
        step="0.001"
        placeholder="Quantidade"
        value={quantidadeUtilizada}
        onChange={(e) => setQuantidadeUtilizada(e.target.value)}
      />

      <br />
      <br />

      <button onClick={salvar}>Adicionar</button>
    </div>
  );
}
