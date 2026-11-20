import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CircleAlert, Package, Search, X } from "lucide-react";
import { LIMITE_PAGINACAO, listarItensDoProduto } from "../services/produtoService";
import { calcularCustoIngrediente } from "../utils/calculadoraPreco";
import { formatarCustoUnitario, formatarMoeda, formatarQuantidade } from "../utils/formatacao";
import Paginacao from "./Paginacao";

const ATRASO_BUSCA_MS = 300;

export default function ProdutoItensModal({ produto, onClose }) {
  const [busca, setBusca] = useState("");
  const [buscaAplicada, setBuscaAplicada] = useState("");
  const [offset, setOffset] = useState(0);
  const [pagina, setPagina] = useState({ results: [], count: 0, next: null, previous: null });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setBuscaAplicada(busca);
      setOffset(0);
    }, ATRASO_BUSCA_MS);

    return () => clearTimeout(temporizador);
  }, [busca]);

  useEffect(() => {
    let vigente = true;
    listarItensDoProduto(produto.id, offset, buscaAplicada)
      .then((resposta) => {
        if (vigente) setPagina(resposta);
      })
      .catch((error) => {
        if (vigente) setErro(error.message);
      })
      .finally(() => {
        if (vigente) setCarregando(false);
      });

    return () => {
      vigente = false;
    };
  }, [produto.id, offset, buscaAplicada]);

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function fecharComEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [onClose]);

  function mudarPagina(direcao) {
    setCarregando(true);
    setErro("");
    setOffset((atual) => Math.max(0, atual + direcao * LIMITE_PAGINACAO));
  }

  function buscar(valor) {
    setCarregando(true);
    setErro("");
    setBusca(valor);
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="produto-itens-title"
        aria-modal="true"
        className="modal-content product-history-modal"
        role="dialog"
      >
        <header className="edit-modal-header">
          <span className="section-icon edit-modal-icon"><Package size={19} /></span>
          <div className="edit-modal-heading">
            <h2 id="produto-itens-title">Histórico de compras</h2>
            <p>{produto.nome} · {pagina.count} {pagina.count === 1 ? "registro" : "registros"}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar histórico">
            <X size={19} />
          </button>
        </header>

        <label className="search-box product-history-search">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label={`Buscar compras de ${produto.nome}`}
            onChange={(event) => buscar(event.target.value)}
            placeholder="Buscar neste histórico"
            value={busca}
          />
        </label>

        {erro && <p className="form-error" role="alert"><CircleAlert size={16} />{erro}</p>}
        {carregando ? (
          <div className="empty-state"><span className="loader-dot" /><p>Carregando compras…</p></div>
        ) : pagina.results.length ? (
          <div className="purchase-list product-history-list" aria-live="polite">
            {pagina.results.map((item) => {
              const custoUnitario = calcularCustoIngrediente(
                item.preco_custo,
                item.quantidade_compra,
                1,
                item.unidade_medida,
              );
              return (
                <article className="purchase-row" key={item.id}>
                  <span className="dish-icon"><Package size={19} /></span>
                  <div className="purchase-main">
                    <h3>{formatarQuantidade(item.quantidade_compra)} {item.unidade_medida}</h3>
                    <p>Pago: {formatarMoeda(item.preco_custo)}</p>
                    <p>{item.criado_em ? `Registrado em ${new Date(item.criado_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}` : "Data não registrada"}</p>
                  </div>
                  <div className="dish-cost">
                    <span>Custo unitário</span>
                    <strong>{formatarCustoUnitario(custoUnitario)} / {item.unidade_medida.toLowerCase()}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        ) : !erro ? (
          <div className="empty-state"><span className="empty-icon"><Package size={22} /></span><h3>Nenhuma compra encontrada</h3><p>{busca ? "Tente outro termo de busca." : "Este produto ainda não tem compras registradas."}</p></div>
        ) : null}

        <Paginacao
          paginacao={{ ...pagina, offset, limit: LIMITE_PAGINACAO }}
          rotulo="compras do produto"
          onAnterior={() => mudarPagina(-1)}
          onProxima={() => mudarPagina(1)}
        />
      </section>
    </div>,
    document.body,
  );
}