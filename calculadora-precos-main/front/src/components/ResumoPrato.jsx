import { useEffect, useState } from "react";

import {
  listarPratos,
  calcularPrato,
  obterIngredientesDoPrato
} from "../services/pratoService";

import {
  buscarProduto
} from "../services/produtoService";

export default function ResumoPrato() {

  const [pratos, setPratos] =
    useState([]);

  const [pratoId, setPratoId] =
    useState("");

  const [ingredientes, setIngredientes] =
    useState([]);

  const [custoTotal, setCustoTotal] =
    useState(0);

  useEffect(() => {

    async function carregar() {

      const lista =
        await listarPratos();

      setPratos(lista);

      if (lista.length > 0) {
        setPratoId(lista[0].id);
      }

    }

    carregar();

  }, []);

  useEffect(() => {

    if (!pratoId) return;

    async function atualizar() {

      const itens =
        await obterIngredientesDoPrato(
          pratoId
        );

      const itensComNome =
        await Promise.all(
          itens.map(async (item) => {

            const produto =
              await buscarProduto(
                item.produtoId
              );

            return {
              ...item,
              nomeProduto:
                produto.nome
            };

          })
        );

      setIngredientes(
        itensComNome
      );

      const total =
        await calcularPrato(
          pratoId
        );

      setCustoTotal(total);

    }

    atualizar();

  }, [pratoId]);

  return (
    <div>

      <h2>Resumo do Prato</h2>

      <select
        value={pratoId}
        onChange={(e) =>
          setPratoId(
            e.target.value
          )
        }
      >
        {pratos.map(prato => (
          <option
            key={prato.id}
            value={prato.id}
          >
            {prato.nome}
          </option>
        ))}
      </select>

      <ul>

        {ingredientes.map(item => (

          <li key={item.id}>

            {item.nomeProduto}
            {" - "}
            {item.quantidadeUtilizada}g

          </li>

        ))}

      </ul>

      <h3>
        Custo Total:
        R$ {custoTotal}
      </h3>

    </div>
  );
}