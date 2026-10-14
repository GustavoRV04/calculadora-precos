import { useEffect, useState } from "react";

import {
  listarPratos,
  calcularPrato,
  pratoPorId,
} from "../services/pratoService";
import { unidadeBase } from "../utils/conversorMedidas";

export default function ResumoPrato({ dataVersion }) {
  const [pratos, setPratos] = useState([]);

  const [pratoId, setPratoId] = useState("");

  const [prato, setPrato] = useState();

  const [custoTotal, setCustoTotal] = useState(0);

  useEffect(() => {
    async function carregar() {
      const lista = await listarPratos();

      setPratos(lista);

      if (lista.length > 0) {
        setPratoId(lista[0].id);
      }
    }

    carregar();
  }, [dataVersion]);

  useEffect(() => {
    if (!pratoId) return;

    async function atualizar() {
      const prato = await pratoPorId(pratoId);
      setPrato(prato);

      const total = await calcularPrato(prato);

      setCustoTotal(total);
    }

    atualizar();
  }, [pratoId, dataVersion]);

  return (
    <div>
      <h2>Resumo do Prato</h2>

      <select value={pratoId} onChange={(e) => setPratoId(e.target.value)}>
        {pratos.map((prato) => (
          <option key={prato.id} value={prato.id}>
            {prato.nome}
          </option>
        ))}
      </select>

      <ul>
        {prato?.prato_itens?.map((pratoItem) => (
          <li key={pratoItem.id}>
            {pratoItem.item.produto.nome}
            {" - "}
            {pratoItem.quantidade} {unidadeBase(pratoItem.item.unidade_medida)}
          </li>
        ))}
      </ul>

      <h3>Custo Total: {custoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</h3>
    </div>
  );
}
