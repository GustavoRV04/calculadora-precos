import { useState } from "react";
import { Check, CircleAlert, PackagePlus, Plus, ReceiptText } from "lucide-react";
import { criarItem, criarProduto } from "../services/produtoService";
import { calcularCustoIngrediente } from "../utils/calculadoraPreco";
import { unidadeBase } from "../utils/conversorMedidas";
import { formatarMoeda, formatarQuantidade } from "../utils/formatacao";

const unidades = [
  { valor: "KG", nome: "Quilogramas (kg)" },
  { valor: "G", nome: "Gramas (g)" },
  { valor: "L", nome: "Litros (L)" },
  { valor: "ML", nome: "Mililitros (ml)" },
  { valor: "UN", nome: "Unidades (un)" },
];

export default function Compras({ produtos, itens, carregando, onSaved }) {
  const [origemProduto, setOrigemProduto] = useState("existente");
  const [produtoId, setProdutoId] = useState("");
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
    if (origemProduto === "existente" && !produtoId) {
      setErro("Selecione um insumo ou cadastre um novo.");
      return;
    }

    setSalvando(true);
    try {
      const produto = origemProduto === "novo"
        ? await criarProduto(nomeProduto.trim())
        : { id: produtoId };
      await criarItem(produto.id, Number(preco), Number(quantidade), unidade);
      setNomeProduto("");
      setPreco("");
      setQuantidade("");
      setOrigemProduto("existente");
      onSaved();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
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
            <label className="field-label field-span">
              Insumo da despensa
              <select required value={produtoId} onChange={(event) => setProdutoId(event.target.value)}>
                <option value="">Selecione um insumo</option>
                {produtos.map((produto) => <option key={produto.id} value={produto.id}>{produto.nome}</option>)}
              </select>
              {!produtos.length && <span className="field-hint">Ainda não há insumos. Use “Novo insumo” para começar.</span>}
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
            <div><span className="preview-label">Custo por {unidadeBase(unidade) === "UN" ? "unidade" : unidadeBase(unidade).toLowerCase()}</span><strong>{custoUnitario === null ? "Preencha os valores" : formatarMoeda(custoUnitario, 3)}</strong></div>
          </div>
          {erro && <p className="form-error field-span" role="alert"><CircleAlert size={16} />{erro}</p>}
          <button className="button-primary field-span submit-button" disabled={salvando || carregando} type="submit">
            {salvando ? <span className="loader-dot" /> : <><Check size={18} /> Salvar compra</>}
          </button>
        </form>
      </section>

      <section className="list-section">
        <div className="list-toolbar"><div><h2>Últimas compras</h2><p>{itens.length} registros neste comércio</p></div><span className="count-badge">{itens.length}</span></div>
        {itens.length ? (
          <div className="purchase-list">
            {[...itens].reverse().map((item) => {
              const unitCost = calcularCustoIngrediente(item.preco_custo, item.quantidade_compra, 1, item.unidade_medida);
              const base = unidadeBase(item.unidade_medida);
              return (
                <article className="purchase-row" key={item.id}>
                  <span className="dish-icon"><ReceiptText size={20} /></span>
                  <div className="purchase-main"><h3>{item.produto?.nome}</h3><p>Comprado: {formatarQuantidade(item.quantidade_compra)} {item.unidade_medida}</p><p>Pago: {formatarMoeda(item.preco_custo)}</p></div>
                  <div className="dish-cost"><span>Custo unitário</span><strong>{formatarMoeda(unitCost, 3)} / {base.toLowerCase()}</strong></div>
                </article>
              );
            })}
          </div>
        ) : <div className="empty-state"><span className="empty-icon"><ShoppingCartIcon /></span><h3>Nenhuma compra registrada</h3><p>Cadastre uma compra para calcular o custo dos pratos.</p></div>}
      </section>
    </div>
  );
}

function ShoppingCartIcon() {
  return <Plus size={22} />;
}