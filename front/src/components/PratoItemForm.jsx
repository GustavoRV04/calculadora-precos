import { useEffect, useState } from "react";
import { listarPratos, adicionarIngrediente } from "../services/pratoService";
import { buscarProdutoPorItem, listarItens } from "../services/produtoService";

export default function PratoItemForm() {
  const [pratos, setPratos] = useState([]);
  const [itens, setItens] = useState([]);

  const [pratoId, setPratoId] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantidadeUtilizada, setQuantidadeUtilizada] = useState("");

  useEffect(() => {
    async function carregarDados() {
      const pratosData = await listarPratos();
      setPratos(pratosData);

      const itensData = await listarItens();
      setItens(itensData);

      console.log("todos os itens: ", itensData);

      if (pratosData.length > 0) {
        setPratoId(pratosData[0].id);
      }

      if (itensData.length > 0) {
        setItemId(itensData[0].id);
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

      <select value={itemId} onChange={(e) => setItemId(e.target.value)}>
        {itens.map((item) => (
          <option key={item.id} value={item.id}>
            {item?.produto?.nome}
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
