import { useState } from "react";
import { criarPrato }
from "../services/pratoService";

export default function PratoForm() {

  const [nome, setNome] =
    useState("");

  async function salvar() {

    await criarPrato(nome);

    alert("Prato cadastrado!");

    setNome("");
  }

  return (
    <div>

      <h2>Cadastrar Prato</h2>

      <input
        value={nome}
        onChange={(e) =>
          setNome(e.target.value)}
        placeholder="Nome do prato"
      />

      <button onClick={salvar}>
        Salvar
      </button>

    </div>
  );
}