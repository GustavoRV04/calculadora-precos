import { useEffect, useState } from "react";
import {
  listarProdutos,
  criarItem
} from "../services/produtoService";

export default function ItemForm() {

  const [produtos, setProdutos] =
    useState([]);

  const [produtoId, setProdutoId] =
    useState("");

  const [precoCompra, setPrecoCompra] =
    useState("");

  const [
    quantidadeCompra,
    setQuantidadeCompra
  ] = useState("");

  useEffect(() => {

    async function carregar() {

      const dados =
        await listarProdutos();

      setProdutos(dados);

      if (dados.length > 0) {
        setProdutoId(dados[0].id);
      }
    }

    carregar();

  }, []);

  async function salvar() {

    await criarItem(
      produtoId,
      Number(precoCompra.replace(",", ".")),
      Number(quantidadeCompra),
      "G"
    );

    alert("Item cadastrado!");
  }

  return (
    <div>

      <h2>Registrar Compra</h2>

      <select
        value={produtoId}
        onChange={(e) =>
          setProdutoId(e.target.value)
        }
      >
        {produtos.map(produto => (
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
        placeholder="Preço"
        value={precoCompra}
        onChange={(e) =>
          setPrecoCompra(e.target.value)
        }
      />

      <br /><br />

      <input
        type="number"
        placeholder="Quantidade (g)"
        value={quantidadeCompra}
        onChange={(e) =>
          setQuantidadeCompra(
            e.target.value
          )
        }
      />

      <br /><br />

      <button onClick={salvar}>
        Salvar
      </button>

    </div>
  );
}