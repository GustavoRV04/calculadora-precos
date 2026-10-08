import { useEffect, useState } from "react";
import { listarPratos, adicionarIngrediente } from "../services/pratoService";
import { buscarProdutoPorItem, listarItens } from "../services/produtoService";

export default function PratoItemForm() {
  const [pratos, setPratos] = useState([]);
  // const [itens, setItens] = useState([]);
  const [itemProdutos, setItemProdutos] = useState([]);

  const [pratoId, setPratoId] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantidadeUtilizada, setQuantidadeUtilizada] = useState("");

  useEffect(() => {
    async function carregarDados() {
      const pratosData = await listarPratos();
      const itensData = await listarItens();

      const itemProdutosData = await Promise.all(
        itensData.map(async (item) => {
          const produtoData = await buscarProdutoPorItem(item.produto);

          return {
            ...produtoData,
            itemId: item.id,
          };
        }),
      );

      setItemProdutos(itemProdutosData);
      setPratos(pratosData);
      // setItens(itensData);

      if (pratosData.length > 0) {
        setPratoId(pratosData[0].id);
      }

      if (itemProdutosData.length > 0) {
        setItemId(itemProdutosData[0].id);
      }
    }

    carregarDados();
  }, []);

  async function salvar() {
    await adicionarIngrediente(
      pratoId,
      Number(itemId),
      Number(quantidadeUtilizada),
    );

    alert("Ingrediente adicionado!");

    setQuantidadeUtilizada("");
  }

  console.log(itemProdutos);

  return (
    <div>
      <h2>Adicionar Item ao Prato</h2>

      <select value={pratoId} onChange={(e) => setPratoId(e.target.value)}>
        {pratos.map((prato) => (
          <option key={prato.id} value={prato.id}>
            {prato.nome}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select value={itemId} onChange={(e) => setItemId(e.target.value)}>
        {itemProdutos.map((item) => (
          <option key={item.id} value={item.itemId}>
            {item.nome}
          </option>
        ))}
      </select>

      <br />
      <br />

      <input
        type="number"
        placeholder="Quantidade utilizada (g)"
        value={quantidadeUtilizada}
        onChange={(e) => setQuantidadeUtilizada(e.target.value)}
      />

      <br />
      <br />

      <button onClick={salvar}>Adicionar</button>
    </div>
  );
}
