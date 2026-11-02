import { useState } from "react";
import { Check, CircleAlert, PackagePlus, Plus, ReceiptText, Search } from "lucide-react";
import { criarItem, criarProduto, listarProdutos } from "../services/produtoService";
import { calcularCustoIngrediente } from "../utils/calculadoraPreco";
import { unidadeBase } from "../utils/conversorMedidas";
import { formatarCustoUnitario, formatarMoeda, formatarQuantidade } from "../utils/formatacao";
import Paginacao from "../components/Paginacao";
import SelectBackendPaginado from "../components/SelectBackendPaginado";

const unidades = [
  { valor: "KG", nome: "Quilogramas (kg)" },
  { valor: "G", nome: "Gramas (g)" },
  { valor: "L", nome: "Litros (L)" },
  { valor: "ML", nome: "Mililitros (ml)" },
  { valor: "UN", nome: "Unidades (un)" },
];

export default function Compras({ busca, itens, paginacao, carregando, onBuscar, onSaved, onMudarPagina }) {
  const [origemProduto, setOrigemProduto] = useState("existente");
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [nomeProduto, setNomeProduto] = useState("");
  const [preco, setPreco] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [unidade, setUnidade] = useState("KG");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

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
        <div className="segmented-control" role="group" aria-label="Escolher tipo de insumo">
          <button type="button" className={origemProduto === "existente" ? "selected" : ""} onClick={() => { setOrigemProduto("existente"); setErro(""); }}>Insumo cadastrado</button>
          <button type="button" className={origemProduto === "novo" ? "selected" : ""} onClick={() => { setOrigemProduto("novo"); setErro(""); }}>Novo insumo</button>
        </div>
        <form className="form-grid" onSubmit={salvar}>
          {origemProduto === "novo" ? (
            <label className="field-label field-span">
              Nome do insumo
              <input required maxLength={100} value={nomeProduto} onChange={(event) => setNomeProduto(event.target.value)} placeholder="Ex.: Queijo cheddar" />
            </label>
          ) : (
            <>
              <label className="field-label field-span">
                Insumo da despensa
                <SelectBackendPaginado buscarPagina={buscarProdutos} inputId="produto" noOptionsMessage="Nenhum insumo encontrado" onChange={setProdutoSelecionado} paraOpcao={(produto) => ({ value: produto.id, label: produto.nome })} placeholder="Busque um insumo" value={produtoSelecionado} />
              </label>
            </>
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
            <div><span className="preview-label">Custo por {unidadeBase(unidade) === "UN" ? "unidade" : unidadeBase(unidade).toLowerCase()}</span><strong>{custoUnitario === null ? "Preencha os valores" : formatarCustoUnitario(custoUnitario)}</strong></div>
          </div>
          {erro && <p className="form-error field-span" role="alert"><CircleAlert size={16} />{erro}</p>}
          <button className="button-primary field-span submit-button" disabled={salvando || carregando} type="submit">
            {salvando ? <span className="loader-dot" /> : <><Check size={18} /> Salvar compra</>}
          </button>
        </form>
      </section>

      <section className="list-section">
        <div className="list-toolbar"><div><h2>Últimas compras</h2><p>{paginacao.itens.count} registros neste comércio</p></div><label className="search-box"><Search size={18} aria-hidden="true" /><input value={busca} onChange={(event) => onBuscar(event.target.value)} placeholder="Buscar compra" aria-label="Buscar compra por insumo" /></label><span className="count-badge">{paginacao.itens.count}</span></div>
        <Paginacao paginacao={paginacao.itens} rotulo="compras" onAnterior={() => onMudarPagina("itens", -1)} onProxima={() => onMudarPagina("itens", 1)} />
        {itens.length ? (
          <div className="purchase-list">
            {[...itens].reverse().map((item) => {
              const unitCost = calcularCustoIngrediente(item.preco_custo, item.quantidade_compra, 1, item.unidade_medida);
              const base = unidadeBase(item.unidade_medida);
              return (
                <article className="purchase-row" key={item.id}>
                  <span className="dish-icon"><ReceiptText size={20} /></span>
                  <div className="purchase-main"><h3>{item.produto?.nome}</h3><p>Comprado: {formatarQuantidade(item.quantidade_compra)} {item.unidade_medida}</p><p>Pago: {formatarMoeda(item.preco_custo)}</p></div>
                  <div className="dish-cost"><span>Custo unitário</span><strong>{formatarCustoUnitario(unitCost)} / {base.toLowerCase()}</strong></div>
                </article>
              );
            })}
          </div>
        ) : <div className="empty-state"><span className="empty-icon"><ShoppingCartIcon /></span><h3>Nenhuma compra registrada</h3><p>Cadastre uma compra para calcular o custo dos pratos.</p></div>}
        <Paginacao paginacao={paginacao.itens} rotulo="compras" onAnterior={() => onMudarPagina("itens", -1)} onProxima={() => onMudarPagina("itens", 1)} />
      </section>
    </div>
  );
}

function ShoppingCartIcon() {
  return <Plus size={22} />;
}
