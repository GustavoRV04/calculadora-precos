import { useEffect, useState } from "react";

import {
  listarPratos,
  adicionarIngrediente
} from "../services/pratoService";

import {
  listarProdutos
} from "../services/produtoService";

export default function PratoItemForm() {

  const [pratos, setPratos] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [pratoId, setPratoId] = useState("");
  const [produtoId, setProdutoId] = useState("");

  const [
    quantidadeUtilizada,
    setQuantidadeUtilizada
  ] = useState("");

  useEffect(() => {

    async function carregarDados() {

      const pratosData =
        await listarPratos();

      const produtosData =
        await listarProdutos();

      setPratos(pratosData);
      setProdutos(produtosData);

      if (pratosData.length > 0) {
        setPratoId(pratosData[0].id);
      }

      if (produtosData.length > 0) {
        setProdutoId(produtosData[0].id);
      }

    }

    carregarDados();

  }, []);

  async function salvar() {

    await adicionarIngrediente(
      pratoId,
      produtoId,
      Number(quantidadeUtilizada)
    );

    alert("Ingrediente adicionado!");

    setQuantidadeUtilizada("");

  }

  return (
    <div>

      <h2>
        Adicionar Ingrediente ao Prato
      </h2>

      <select
        value={pratoId}
        onChange={(e) =>
          setPratoId(e.target.value)
        }
      >
        {pratos.map((prato) => (
          <option
            key={prato.id}
            value={prato.id}
          >
            {prato.nome}
          </option>
        ))}
      </select>

      <br /><br />

      <select
        value={produtoId}
        onChange={(e) =>
          setProdutoId(e.target.value)
        }
      >
        {produtos.map((produto) => (
          <option
            key={produto.id}
            value={produto.id}
          >
            {produto.nome}
          </option>
        ))}
      </select>

      <br /><br />

      <input
        type="number"
        placeholder="Quantidade utilizada (g)"
        value={quantidadeUtilizada}
        onChange={(e) =>
          setQuantidadeUtilizada(
            e.target.value
          )
        }
      />

      <br /><br />

      <button onClick={salvar}>
        Adicionar
      </button>

    </div>
  );
}