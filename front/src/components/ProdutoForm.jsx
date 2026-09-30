import { useState } from "react";
import { criarProduto } from "../services/produtoService";

export default function ProdutoForm({restauranteAtivo}) {

  const [nome, setNome] =
    useState("");

  async function salvar() {

    if (!restauranteAtivo) {

      alert(
        "Selecione um restaurante"
      );

      return;
    }

    await criarProduto(
      nome,
      restauranteAtivo
    );

    alert("Produto cadastrado!");

    setNome("");
  }

  return (
    <div>

      <h2>Cadastrar Produto</h2>

      <input
        value={nome}
        onChange={(e) =>
          setNome(e.target.value)
        }
        placeholder="Nome do produto"
      />

      <button onClick={salvar}>
        Salvar
      </button>

    </div>
  );
}