import { useState } from "react";
import { criarProduto } from "../services/produtoService";

export default function ProdutoForm({ onSaved }) {
  const [nome, setNome] = useState("");

  async function salvar() {
    if (!nome.trim()) return;

    await criarProduto(nome);
    onSaved?.();

    alert("Produto cadastrado!");

    setNome("");
  }

  return (
    <div>
      <h2>Cadastrar Produto</h2>

      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do produto"
      />

      <button onClick={salvar}>Salvar</button>
    </div>
  );
}
