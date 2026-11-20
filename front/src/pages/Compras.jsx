import { useState } from "react";
import { ArrowLeft, Check, CircleAlert, PackagePlus, Plus, ReceiptText, Search } from "lucide-react";
import { criarItem, criarProduto, listarProdutos } from "../services/produtoService";
import { calcularCustoIngrediente } from "../utils/calculadoraPreco";
import { formatarCustoUnitario, formatarMoeda, formatarQuantidade } from "../utils/formatacao";
import Paginacao from "../components/Paginacao";
import ProdutoItensModal from "../components/ProdutoItensModal";
import SelectBackendPaginado from "../components/SelectBackendPaginado";

const unidades = [
  { valor: "KG", nome: "Quilogramas (kg)" },
  { valor: "G", nome: "Gramas (g)" },
  { valor: "L", nome: "Litros (L)" },
  { valor: "ML", nome: "Mililitros (ml)" },
  { valor: "UN", nome: "Unidades (un)" },
];

export default function Compras({ busca, produtos, paginacao, carregando, onBuscar, onSaved, onMudarPagina }) {
  const [origemProduto, setOrigemProduto] = useState("existente");
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [nomeProduto, setNomeProduto] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("KG");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [produtoHistorico, setProdutoHistorico] = useState(null);

  const custoUnitario = preco && quantidade
    ? calcularCustoIngrediente(Number(preco), Number(quantidade), 1, unidade)
    : null;

  async function salvar(event) {
    event.preventDefault();
    setErro("");
    if (Number(preco) <= 0 || Number(quantidade) <= 0) {
      setErro("Informe preço e quantidade maiores que zero.");
      return;
    }
    if (origemProduto === "novo" && !nomeProduto.trim()) {
      setErro("Informe o nome do insumo.");
      return;
    }
    if (origemProduto === "existente" && !produtoSelecionado) {
      setErro("Selecione um insumo ou cadastre um novo.");
      return;
    }

    setSalvando(true);
    try {
      const produto = origemProduto === "novo"
        ? await criarProduto(nomeProduto.trim())
        : { id: produtoSelecionado.value };
      await criarItem(produto.id, Number(preco), Number(quantidade), unidade);
      setNomeProduto("");
      setPreco("");
      setQuantidade("");
      setProdutoSelecionado(null);
      setOrigemProduto("existente");
      onSaved();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  function buscarProdutos(busca, offset) {
    return listarProdutos(offset, busca);
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p className="eyebrow">ESTOQUE & CUSTOS</p><h1>Registrar compra</h1><p>Atualize o custo dos insumos usados nas receitas.</p></div>
        <span className="heading-mark"><ReceiptText size={21} /></span>
      </section>

      <section className="form-panel">
        <div className="panel-title"><span className="section-icon"><PackagePlus size={19} /></span><div><h2>Nova entrada de compra</h2><p>A compra ficará vinculada ao insumo escolhido.</p></div></div>
        <form className="form-grid" onSubmit={salvar}>
          {origemProduto === "novo" ? (
            <div className="field-label field-span">
              <div className="purchase-product-label">
                <span>Novo insumo</span>
                <button className="inline-link" type="button" onClick={() => { setOrigemProduto("existente"); setNomeProduto(""); setErro(""); }}>
                  <ArrowLeft size={15} /> Escolher cadastrado
                </button>
              </div>
              <input aria-label="Nome do novo insumo" autoFocus maxLength={100} required value={nomeProduto} onChange={(event) => setNomeProduto(event.target.value)} placeholder="Ex.: Queijo cheddar" />
            </div>
          ) : (
            <label className="field-label field-span">
              Insumo da despensa
              <SelectBackendPaginado
                buscarPagina={buscarProdutos}
                formatCreateLabel={(valor) => <span className="create-product-option"><Plus size={15} /> Adicionar “{valor.trim()}” como novo insumo</span>}
                inputId="produto"
                noOptionsMessage="Nenhum insumo encontrado"
                onChange={(opcao) => { setProdutoSelecionado(opcao); setErro(""); }}
                onCreateOption={(valor) => {
                  setNomeProduto(valor.trim());
                  setOrigemProduto("novo");
                  setProdutoSelecionado(null);
                  setErro("");
                }}
                paraOpcao={(produto) => ({ value: produto.id, label: produto.nome })}
                placeholder="Busque ou adicione um insumo"
                value={produtoSelecionado}
              />
              <span className="field-hint">Selecione um insumo ou digite um nome e escolha “Adicionar”.</span>
            </label>
          )}
          <label className="field-label">
            Preço pago
            <span className="money-input"><span>R$</span><input required min="0.01" step="0.01" type="number" value={preco} onChange={(event) => setPreco(event.target.value)} placeholder="0,00" /></span>
          </label>
          <div className="field-label">
            Quantidade comprada
            <div className="quantity-fields">
              <input aria-label="Quantidade comprada" required min="0.001" step="0.001" type="number" value={quantidade} onChange={(event) => setQuantidade(event.target.value)} placeholder="1" />
              <select aria-label="Unidade da compra" value={unidade} onChange={(event) => setUnidade(event.target.value)}>
                {unidades.map((opcao) => <option key={opcao.valor} value={opcao.valor}>{opcao.nome}</option>)}
              </select>
            </div>
          </div>
          <div className="cost-preview field-span">
            <span className="preview-icon"><ReceiptText size={20} /></span>
            <div><span className="preview-label">Custo por {unidade === "UN" ? "unidade" : unidade.toLowerCase()}</span><strong>{custoUnitario === null ? "Preencha os valores" : formatarCustoUnitario(custoUnitario)}</strong></div>
          </div>
          {erro && <p className="form-error field-span" role="alert"><CircleAlert size={16} />{erro}</p>}
          <button className="button-primary field-span submit-button" disabled={salvando || carregando} type="submit">
            {salvando ? <span className="loader-dot" /> : <><Check size={18} /> Salvar compra</>}
          </button>
        </form>
      </section>

      <section className="list-section">
        <div className="list-toolbar"><div><h2>Últimas compras</h2><p>{paginacao.produtos.count} registros neste comércio</p></div><label className="search-box"><Search size={18} aria-hidden="true" /><input value={busca} onChange={(event) => onBuscar(event.target.value)} placeholder="Buscar compra" aria-label="Buscar compra por insumo" /></label><span className="count-badge">{paginacao.produtos.count}</span></div>
        <Paginacao paginacao={paginacao.produtos} rotulo="compras" onAnterior={() => onMudarPagina("produtos", -1)} onProxima={() => onMudarPagina("produtos", 1)} />
        {produtos.length ? (
          <div className="purchase-list">
            {produtos.map((produto) => {
              const item = produto.ultimo_item;
              const unitCost = item
                ? calcularCustoIngrediente(item.preco_custo, item.quantidade_compra, 1, item.unidade_medida)
                : null;
              const base = item ? item.unidade_medida : null;
              return (
                <article
                  className="purchase-row product-history-trigger"
                  key={produto.id}
                  onClick={() => setProdutoHistorico(produto)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setProdutoHistorico(produto);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver histórico de compras de ${produto.nome}`}
                >
                  <span className="dish-icon"><ReceiptText size={20} /></span>
                  <div className="purchase-main"><h3>{produto.nome}</h3><p>{item ? `Comprado: ${formatarQuantidade(item.quantidade_compra)} ${item.unidade_medida}` : "Nenhuma compra registrada"}</p>{item && <><p>Pago: {formatarMoeda(item.preco_custo)}</p><p>{item.criado_em ? `Registrado em ${new Date(item.criado_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}` : "Data não registrada"}</p></>}</div>
                  <div className="dish-cost"><span>Custo unitário</span><strong>{item ? `${formatarCustoUnitario(unitCost)} / ${base.toLowerCase()}` : "—"}</strong></div>
                </article>
              );
            })}
          </div>
        ) : <div className="empty-state"><span className="empty-icon"><ShoppingCartIcon /></span><h3>Nenhuma compra registrada</h3><p>Cadastre uma compra para calcular o custo dos pratos.</p></div>}
        <Paginacao paginacao={paginacao.produtos} rotulo="compras" onAnterior={() => onMudarPagina("produtos", -1)} onProxima={() => onMudarPagina("produtos", 1)} />
      </section>
      {produtoHistorico && (
        <ProdutoItensModal produto={produtoHistorico} onClose={() => setProdutoHistorico(null)} />
      )}
    </div>
  );
}

function ShoppingCartIcon() {
  return <Plus size={22} />;
}
