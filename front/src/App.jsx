import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import CommerceAccess from "./components/CommerceAccess";
import Header from "./components/Header";
import Compras from "./pages/Compras";
import Dashboard from "./pages/Dashboard";
import FichaTecnica from "./pages/FichaTecnica";
import MontarPrato from "./pages/MontarPrato";
import { listarItens, listarProdutos } from "./services/produtoService";
import { listarPratos } from "./services/pratoService";
import { limparSessao, obterSessao } from "./services/api";

const dadosVazios = { produtos: [], itens: [], pratos: [] };

export default function App() {
  const [sessao, setSessao] = useState(() => obterSessao());
  const [secao, setSecao] = useState("dashboard");
  const [versaoDados, setVersaoDados] = useState(0);
  const [dados, setDados] = useState(dadosVazios);
  const [carregando, setCarregando] = useState(Boolean(obterSessao()));
  const [erroApi, setErroApi] = useState("");
  const [pratoSelecionado, setPratoSelecionado] = useState("");

  useEffect(() => {
    if (!sessao) {
      return undefined;
    }

    let vigente = true;
    Promise.all([listarProdutos(), listarItens(), listarPratos()])
      .then(([produtos, itens, pratos]) => {
        if (!vigente) return;
        setDados({ produtos, itens, pratos });
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
        if (vigente) setCarregando(false);
      });

    return () => { vigente = false; };
  }, [sessao, versaoDados]);

  function atualizarDados() {
    setVersaoDados((versao) => versao + 1);
  }

  function sair() {
    limparSessao();
    setSessao(null);
    setDados(dadosVazios);
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
        {secao === "dashboard" && <Dashboard pratos={dados.pratos} carregando={carregando} onNavigate={setSecao} onSelectPrato={setPratoSelecionado} />}
        {secao === "compras" && <Compras produtos={dados.produtos} itens={dados.itens} carregando={carregando} onSaved={atualizarDados} />}
        {secao === "montar" && <MontarPrato pratos={dados.pratos} itens={dados.itens} onSaved={atualizarDados} onNavigate={setSecao} />}
        {secao === "ficha" && <FichaTecnica pratos={dados.pratos} pratoSelecionado={pratoSelecionado} onSelectPrato={setPratoSelecionado} />}
      </main>
      <BottomNav secaoAtiva={secao} onNavigate={setSecao} />
    </div>
  );
}