import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import CommerceAccess from "./components/CommerceAccess";
import Header from "./components/Header";
import Compras from "./pages/Compras";
import Dashboard from "./pages/Dashboard";
import FichaTecnica from "./pages/FichaTecnica";
import MontarPrato from "./pages/MontarPrato";
import { LIMITE_PAGINACAO, listarItens, listarProdutos } from "./services/produtoService";
import { listarPratos } from "./services/pratoService";
import { limparSessao, obterSessao } from "./services/api";

const dadosVazios = { produtos: [], itens: [], pratos: [] };
const offsetsIniciais = { produtos: 0, itens: 0, pratos: 0 };
const ATRASO_BUSCA_MS = 300;
const paginacaoVazia = {
  produtos: { count: 0, next: null, previous: null, offset: 0, limit: LIMITE_PAGINACAO },
  itens: { count: 0, next: null, previous: null, offset: 0, limit: LIMITE_PAGINACAO },
  pratos: { count: 0, next: null, previous: null, offset: 0, limit: LIMITE_PAGINACAO },
};

export default function App() {
  const [sessao, setSessao] = useState(() => obterSessao());
  const [secao, setSecao] = useState("dashboard");
  const [versaoDados, setVersaoDados] = useState(0);
  const [dados, setDados] = useState(dadosVazios);
  const [offsets, setOffsets] = useState(offsetsIniciais);
  const [paginacao, setPaginacao] = useState(paginacaoVazia);
  const [carregamentos, setCarregamentos] = useState({ produtos: false, itens: false, pratos: false });
  const [erroApi, setErroApi] = useState("");
  const [pratoSelecionado, setPratoSelecionado] = useState("");
  const [buscaPratos, setBuscaPratos] = useState("");
  const [buscaPratosAplicada, setBuscaPratosAplicada] = useState("");
  const [buscaItens, setBuscaItens] = useState("");
  const [buscaItensAplicada, setBuscaItensAplicada] = useState("");

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBuscaPratosAplicada(buscaPratos);
      setOffsets((atuais) => ({ ...atuais, pratos: 0 }));
    }, ATRASO_BUSCA_MS);

    return () => clearTimeout(temporizador);
  }, [buscaPratos]);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBuscaItensAplicada(buscaItens);
      setOffsets((atuais) => ({ ...atuais, itens: 0 }));
    }, ATRASO_BUSCA_MS);

    return () => clearTimeout(temporizador);
  }, [buscaItens]);

  useEffect(() => {
    if (!sessao) {
      return undefined;
    }

    let vigente = true;
    setCarregamentos((atuais) => ({ ...atuais, produtos: true }));
    listarProdutos(offsets.produtos)
      .then((produtos) => {
        if (!vigente) return;
        setDados((atuais) => ({ ...atuais, produtos: produtos.results }));
        setPaginacao((atuais) => ({
          ...atuais,
          produtos: { ...produtos, offset: offsets.produtos, limit: LIMITE_PAGINACAO },
        }));
        setErroApi("");
      })
      .catch((error) => {
        if (!vigente) return;
        if (error.status === 401) {
          limparSessao();
          setSessao(null);
          setDados(dadosVazios);
          return;
        }
        setErroApi(error.message);
      })
      .finally(() => {
        if (vigente) setCarregamentos((atuais) => ({ ...atuais, produtos: false }));
      });

    return () => { vigente = false; };
  }, [sessao, versaoDados, offsets.produtos]);

  useEffect(() => {
    if (!sessao) {
      return undefined;
    }

    let vigente = true;
    setCarregamentos((atuais) => ({ ...atuais, itens: true }));
    listarItens(offsets.itens, buscaItensAplicada)
      .then((itens) => {
        if (!vigente) return;
        setDados((atuais) => ({ ...atuais, itens: itens.results }));
        setPaginacao((atuais) => ({
          ...atuais,
          itens: { ...itens, offset: offsets.itens, limit: LIMITE_PAGINACAO },
        }));
        setErroApi("");
      })
      .catch((error) => {
        if (!vigente) return;
        if (error.status === 401) {
          limparSessao();
          setSessao(null);
          setDados(dadosVazios);
          return;
        }
        setErroApi(error.message);
      })
      .finally(() => {
        if (vigente) setCarregamentos((atuais) => ({ ...atuais, itens: false }));
      });

    return () => { vigente = false; };
  }, [sessao, versaoDados, offsets.itens, buscaItensAplicada]);

  useEffect(() => {
    if (!sessao) {
      return undefined;
    }

    let vigente = true;
    setCarregamentos((atuais) => ({ ...atuais, pratos: true }));
    listarPratos(offsets.pratos, buscaPratosAplicada)
      .then((pratos) => {
        if (!vigente) return;
        setDados((atuais) => ({ ...atuais, pratos: pratos.results }));
        setPaginacao((atuais) => ({
          ...atuais,
          pratos: { ...pratos, offset: offsets.pratos, limit: LIMITE_PAGINACAO },
        }));
        setErroApi("");
      })
      .catch((error) => {
        if (!vigente) return;
        if (error.status === 401) {
          limparSessao();
          setSessao(null);
          setDados(dadosVazios);
          return;
        }
        setErroApi(error.message);
      })
      .finally(() => {
        if (vigente) setCarregamentos((atuais) => ({ ...atuais, pratos: false }));
      });

    return () => { vigente = false; };
  }, [sessao, versaoDados, offsets.pratos, buscaPratosAplicada]);

  function atualizarDados() {
    setVersaoDados((versao) => versao + 1);
  }

  function atualizarPrato(pratoAtualizado) {
    setDados((atuais) => ({
      ...atuais,
      pratos: atuais.pratos.map((prato) => (
        String(prato.id) === String(pratoAtualizado.id) ? pratoAtualizado : prato
      )),
    }));
  }

  function mudarPagina(tipo, direcao) {
    setOffsets((atuais) => ({
      ...atuais,
      [tipo]: Math.max(0, atuais[tipo] + direcao * LIMITE_PAGINACAO),
    }));
  }

  function buscarPratos(busca) {
    setBuscaPratos(busca);
  }

  function buscarItens(busca) {
    setBuscaItens(busca);
  }

  function sair() {
    limparSessao();
    setSessao(null);
    setDados(dadosVazios);
    setPaginacao(paginacaoVazia);
    setOffsets(offsetsIniciais);
    setCarregamentos({ produtos: false, itens: false, pratos: false });
    setSecao("dashboard");
  }

  if (!sessao) {
    return <CommerceAccess onAuthenticated={setSessao} />;
  }

  return (
    <div className="app-shell">
      <Header restaurante={sessao.restaurante} onLogout={sair} />
      <main className="main-content">
        {erroApi && <div className="notice-error" role="alert">{erroApi}</div>}
        {secao === "dashboard" && <Dashboard pratos={dados.pratos} paginacao={paginacao.pratos} busca={buscaPratos} carregando={carregamentos.pratos} onNavigate={setSecao} onSelectPrato={setPratoSelecionado} onMudarPagina={mudarPagina} onBuscar={buscarPratos} />}
        {secao === "compras" && <Compras busca={buscaItens} itens={dados.itens} paginacao={paginacao} carregando={carregamentos.produtos || carregamentos.itens} onBuscar={buscarItens} onSaved={atualizarDados} onMudarPagina={mudarPagina} />}
        {secao === "montar" && <MontarPrato pratos={dados.pratos} itens={dados.itens} onSaved={atualizarDados} onPratoAtualizado={atualizarPrato} onNavigate={setSecao} />}
        {secao === "ficha" && <FichaTecnica pratos={dados.pratos} pratoSelecionado={pratoSelecionado} onSelectPrato={setPratoSelecionado} onSaved={atualizarDados} />}
      </main>
      <BottomNav secaoAtiva={secao} onNavigate={setSecao} />
    </div>
  );
}
