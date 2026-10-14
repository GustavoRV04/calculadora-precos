import { useEffect, useState } from "react";
import { listarPratos, adicionarIngrediente } from "../services/pratoService";
import { listarItens } from "../services/produtoService";
import { unidadeBase } from "../utils/conversorMedidas";

export default function PratoItemForm({ dataVersion, onSaved }) {
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
  }, [dataVersion]);

  const itemSelecionado = itens.find((item) => String(item.id) === String(itemId));

  async function salvar() {
    if (!pratoId || !itemId || !quantidadeUtilizada) return;

    await adicionarIngrediente(
      pratoId,
      Number(itemId),
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

      <select value={itemId} onChange={(e) => setItemId(e.target.value)}>
        {itens.map((item) => (
          <option key={item.id} value={item.id}>
            {item?.produto?.nome} ({item.quantidade_compra} {item.unidade_medida} por R$ {item.preco_custo})
          </option>
        ))}
      </select>

      <br />
      <br />

      <label htmlFor="quantidade-utilizada">
        Quantidade utilizada ({unidadeBase(itemSelecionado?.unidade_medida) ?? "unidade"})
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
