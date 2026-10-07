import { useEffect, useState } from "react";
import {
  listarProdutos,
  criarItem,
} from "../services/produtoService";

export default function ItemForm({
  restauranteAtivo
}) {

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

  const [
    unidadeMedida,
    setUnidadeMedida
  ] = useState("G");

  useEffect(() => {

    if (!restauranteAtivo) return;

    async function carregar() {

      const dados =
        await listarProdutos(
          restauranteAtivo
        );

      setProdutos(dados);

      if (dados.length > 0) {
        setProdutoId(dados[0].id);
      }
    }

    carregar();

  }, [restauranteAtivo]);

  async function salvar() {

    await criarItem(
      produtoId,
      Number(precoCompra.replace(",", ".")),
      Number(quantidadeCompra),
      unidadeMedida,
      restauranteAtivo
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
        placeholder="Quantidade Comprada"
        value={quantidadeCompra}
        onChange={(e) =>
          setQuantidadeCompra(
            e.target.value
          )
        }
      />

      <br /><br />

      <select
        value={unidadeMedida}
        onChange={(e) =>
          setUnidadeMedida(e.target.value)
        }
      >

        <option value="G">
          Gramas (G)
        </option>

        <option value="KG">
          Quilogramas (KG)
        </option>

        <option value="ML">
          Mililitros (ML)
        </option>

        <option value="L">
          Litros (L)
        </option>

        <option value="UN">
          Unidade (UN)
        </option>

      </select>

      <button onClick={salvar}>
        Salvar
      </button>

    </div>
  );
}