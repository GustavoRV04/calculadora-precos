import { useState } from "react";
import { criarPrato }
from "../services/pratoService";

export default function PratoForm({ onSaved }) {

  const [nome, setNome] =
    useState("");

  async function salvar() {
    if (!nome.trim()) return;

    await criarPrato(nome);
    onSaved?.();

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