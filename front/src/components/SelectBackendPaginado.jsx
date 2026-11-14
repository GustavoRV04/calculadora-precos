import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

const ATRASO_BUSCA_MS = 300;

export default function SelectBackendPaginado({ buscarPagina, paraOpcao, noOptionsMessage, opcaoAtualizada, onCreateOption, formatCreateLabel, ...props }) {
  const [opcoes, setOpcoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [proximaPagina, setProximaPagina] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const requisicaoAtual = useRef(0);
  const temporizadorBusca = useRef(null);

  useEffect(() => () => clearTimeout(temporizadorBusca.current), []);

  async function carregar(buscaAtual, offset, substituir) {
    const requisicao = requisicaoAtual.current + 1;
    requisicaoAtual.current = requisicao;
    setCarregando(true);

    try {
      const resposta = await buscarPagina(buscaAtual, offset);
      if (requisicao !== requisicaoAtual.current) return;

      const novasOpcoes = resposta.results.map(paraOpcao);
      setOpcoes((atuais) => (substituir ? novasOpcoes : [...atuais, ...novasOpcoes]));
      setProximaPagina(resposta.next);
    } finally {
      if (requisicao === requisicaoAtual.current) setCarregando(false);
    }
  }

  function pesquisar(valor, meta) {
    if (meta.action === "input-change") {
      setBusca(valor);
      clearTimeout(temporizadorBusca.current);
      requisicaoAtual.current += 1;
      setCarregando(true);
      temporizadorBusca.current = setTimeout(() => {
        carregar(valor, 0, true);
      }, ATRASO_BUSCA_MS);
    }
    return valor;
  }

  function abrirMenu() {
    if (!opcoes.length && !carregando) carregar(busca, 0, true);
  }

  function carregarProximaPagina() {
    if (!proximaPagina || carregando) return;
    carregar(busca, opcoes.length, false);
  }

  const SelectComponent = onCreateOption ? CreatableSelect : Select;
  const opcoesAtualizadas = opcaoAtualizada
    ? opcoes.map((opcao) => (
      String(opcao.value) === String(opcaoAtualizada.value) ? opcaoAtualizada : opcao
    ))
    : opcoes;

  return (
    <SelectComponent
      {...props}
      classNamePrefix="async-select"
      formatCreateLabel={formatCreateLabel}
      isLoading={carregando}
      noOptionsMessage={() => noOptionsMessage}
      onCreateOption={onCreateOption}
      onInputChange={pesquisar}
      onMenuOpen={abrirMenu}
      onMenuScrollToBottom={carregarProximaPagina}
      options={opcoesAtualizadas}
    />
  );
}
