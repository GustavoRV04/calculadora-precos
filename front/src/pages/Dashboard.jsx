import { BookOpen, ArrowRight, Plus, Search, ShoppingCart, TrendingUp } from "lucide-react";
import { calcularPrato } from "../services/pratoService";
import { calcularPrecoVendaComMargem } from "../utils/calculadoraPreco";
import { formatarMoeda } from "../utils/formatacao";
import Paginacao from "../components/Paginacao";

export default function Dashboard({ pratos, paginacao, busca, carregando, onNavigate, onSelectPrato, onMudarPagina, onBuscar }) {
  const pratosComCusto = pratos.map((prato) => {
    const custo = calcularPrato(prato);
    const precoVenda = calcularPrecoVendaComMargem(
      custo,
      prato.margem_lucro_percentual ?? 20,
    );
    const lucro = precoVenda === null ? null : Number((precoVenda - custo).toFixed(2));
    return { ...prato, custo, precoVenda, lucro };
  });
  const custoMedio = pratosComCusto.length
    ? pratosComCusto.reduce((total, prato) => total + prato.custo, 0) / pratosComCusto.length
    : 0;

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">CARDÁPIO & CUSTOS</p>
          <h1>Meus pratos</h1>
          <p>Custos atualizados com base nas compras registradas.</p>
        </div>
        <span className="heading-mark"><TrendingUp size={21} /></span>
      </section>

      <section className="metrics-grid" aria-label="Resumo do comércio">
        <article className="metric-card">
          <div className="metric-label"><span>Pratos cadastrados</span><BookOpen size={17} /></div>
          <div className="metric-value">{carregando ? "—" : paginacao.count}<span>{paginacao.count === 1 ? "prato" : "pratos"}</span></div>
          <p>Com composição registrada</p>
        </article>
        <article className="metric-card metric-positive">
          <div className="metric-label"><span>Custo médio</span><TrendingUp size={17} /></div>
          <div className="metric-value metric-currency">{carregando ? "—" : formatarMoeda(custoMedio)}</div>
          <p>Por prato cadastrado</p>
        </article>
      </section>

      <section className="quick-actions" aria-label="Ações rápidas">
        <button className="button-primary" type="button" onClick={() => onNavigate("montar")}>
          <Plus size={18} /> Novo prato
        </button>
        <button className="button-secondary" type="button" onClick={() => onNavigate("compras")}>
          <ShoppingCart size={18} /> Registrar compra
        </button>
      </section>

      <section className="list-section">
        <div className="list-toolbar">
          <div>
            <h2>Receitas do comércio</h2>
            <p>{paginacao.count} {paginacao.count === 1 ? "prato cadastrado" : "pratos cadastrados"}</p>
          </div>
          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <input value={busca} onChange={(event) => onBuscar(event.target.value)} placeholder="Buscar prato" aria-label="Buscar prato por nome" />
          </label>
        </div>

        {carregando ? (
          <div className="empty-state"><span className="loader-dot" /><p>Carregando receitas…</p></div>
        ) : pratosComCusto.length ? (
          <div className="dish-list">
            {pratosComCusto.map((prato) => (
              <article className="dish-card" key={prato.id}>
                <span className="dish-icon"><BookOpen size={21} /></span>
                <div className="dish-main">
                  <h3>{prato.nome}</h3>
                  <p>{prato.prato_itens?.length ?? 0} {(prato.prato_itens?.length ?? 0) === 1 ? "ingrediente" : "ingredientes"}</p>
                </div>
                <div className="dish-pricing">
                  <div className="dish-metric dish-metric-cost"><span>Custo de produção</span><strong>{formatarMoeda(prato.custo)}</strong></div>
                  <div className="dish-metric dish-metric-sale"><span>Preço sugerido</span><strong>{prato.precoVenda === null ? "—" : formatarMoeda(prato.precoVenda)}</strong></div>
                  <div className="dish-metric dish-metric-profit"><span>Lucro por venda</span><strong>{prato.lucro === null ? "—" : formatarMoeda(prato.lucro)}</strong></div>
                </div>
                <button className="text-action" type="button" onClick={() => { onSelectPrato(prato.id); onNavigate("ficha"); }}>
                  Ver ficha <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon"><BookOpen size={23} /></span>
            <h3>{busca ? "Nenhum prato encontrado" : "Seu cardápio começa aqui"}</h3>
            <p>{busca ? "Tente outro nome." : "Cadastre um prato e adicione os itens da receita para acompanhar o custo."}</p>
            {!busca && <button className="button-primary" type="button" onClick={() => onNavigate("montar")}><Plus size={17} /> Criar primeiro prato</button>}
          </div>
        )}
        <Paginacao paginacao={paginacao} rotulo="pratos" onAnterior={() => onMudarPagina("pratos", -1)} onProxima={() => onMudarPagina("pratos", 1)} />
      </section>
    </div>
  );
}
