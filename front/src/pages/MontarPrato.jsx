import { useState } from "react";
import { Check, CircleAlert, CookingPot, Plus, Trash2 } from "lucide-react";
import { adicionarIngrediente, calcularPrato, criarPrato, removerIngrediente } from "../services/pratoService";
import { calcularCustoIngrediente } from "../utils/calculadoraPreco";
import { unidadeBase } from "../utils/conversorMedidas";
import { formatarMoeda, formatarQuantidade } from "../utils/formatacao";

export default function MontarPrato({ pratos, itens, onSaved, onNavigate }) {
  const [nomePrato, setNomePrato] = useState("");
  const [pratoId, setPratoId] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const pratoAtivoId = pratoId || String(pratos[0]?.id ?? "");
  const prato = pratos.find((registro) => String(registro.id) === String(pratoAtivoId));
  const item = itens.find((registro) => String(registro.id) === String(itemId));
  const custoParcial = item && quantidade
    ? calcularCustoIngrediente(item.preco_custo, item.quantidade_compra, Number(quantidade), item.unidade_medida)
    : 0;
  const unidadeReceita = unidadeBase(item?.unidade_medida);

  async function salvarPrato(event) {
    event.preventDefault();
    if (!nomePrato.trim()) return;
    setErro("");
    setSalvando(true);
    try {
      const novoPrato = await criarPrato(nomePrato.trim());
      setPratoId(String(novoPrato.id));
      setNomePrato("");
      onSaved();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function incluirItem(event) {
    event.preventDefault();
    setErro("");
    if (!pratoAtivoId) {
      setErro("Crie ou selecione um prato antes de adicionar ingredientes.");
      return;
    }
    if (!itemId || Number(quantidade) <= 0) {
      setErro("Selecione um insumo e informe uma quantidade maior que zero.");
      return;
    }

    setSalvando(true);
    try {
      await adicionarIngrediente(pratoAtivoId, itemId, Number(quantidade));
      setQuantidade("");
      onSaved();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluirItem(pratoItemId) {
    setErro("");
    try {
      await removerIngrediente(pratoItemId);
      onSaved();
    } catch (error) {
      setErro(error.message);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p className="eyebrow">RECEITAS & RENDIMENTO</p><h1>Montar prato</h1><p>Adicione os insumos e acompanhe o custo por receita.</p></div>
        <span className="heading-mark heading-positive"><CookingPot size={21} /></span>
      </section>

      <section className="form-panel compact-panel">
        <div className="panel-title"><span className="section-icon"><Plus size={19} /></span><div><h2>Novo prato</h2><p>Comece pelo nome da receita.</p></div></div>
        <form className="inline-create" onSubmit={salvarPrato}>
          <input maxLength={100} value={nomePrato} onChange={(event) => setNomePrato(event.target.value)} placeholder="Ex.: Hambúrguer da casa" aria-label="Nome do novo prato" />
          <button className="button-primary" disabled={salvando || !nomePrato.trim()} type="submit"><Plus size={17} /> Criar</button>
        </form>
      </section>

      <section className="form-panel">
        <div className="panel-title"><span className="section-icon"><CookingPot size={19} /></span><div><h2>Adicionar ingrediente</h2><p>Selecione o prato e o item comprado que entra na receita.</p></div></div>
        <form className="form-grid" onSubmit={incluirItem}>
          <label className="field-label field-span">Prato
            <select value={pratoAtivoId} onChange={(event) => setPratoId(event.target.value)}>
              <option value="">Selecione um prato</option>
              {pratos.map((registro) => <option key={registro.id} value={registro.id}>{registro.nome}</option>)}
            </select>
          </label>
          <label className="field-label field-span">Insumo comprado
            <select required value={itemId} onChange={(event) => setItemId(event.target.value)}>
              <option value="">Selecione um insumo</option>
              {itens.map((registro) => <option key={registro.id} value={registro.id}>{registro.produto?.nome} · {formatarMoeda(registro.preco_custo)} / {formatarQuantidade(registro.quantidade_compra)} {registro.unidade_medida}</option>)}
            </select>
            {!itens.length && <span className="field-hint">Cadastre uma compra primeiro para escolher os insumos.</span>}
          </label>
          <label className="field-label">Quantidade na receita ({unidadeReceita || "unidade"})
            <input required min="0.001" step="0.001" type="number" value={quantidade} onChange={(event) => setQuantidade(event.target.value)} placeholder="0" />
          </label>
          <div className="cost-preview partial-cost"><div><span className="preview-label">Custo parcial</span><strong>{formatarMoeda(custoParcial)}</strong></div></div>
          {erro && <p className="form-error field-span" role="alert"><CircleAlert size={16} />{erro}</p>}
          <button className="button-primary field-span submit-button" disabled={salvando || !itens.length} type="submit">
            {salvando ? <span className="loader-dot" /> : <><Check size={18} /> Adicionar ao prato</>}
          </button>
        </form>
        {!pratos.length && <button className="inline-link" type="button" onClick={() => onNavigate("compras")}>Ou registre uma compra primeiro <Plus size={15} /></button>}
      </section>

      <section className="list-section">
        <div className="list-toolbar"><div><h2>Ingredientes no prato</h2><p>{prato?.nome ?? "Selecione uma receita"}</p></div><span className="count-badge">{prato?.prato_itens?.length ?? 0}</span></div>
        {prato?.prato_itens?.length ? (
          <>
            <div className="ingredient-list">
              {prato.prato_itens.map((pratoItem) => {
                const custo = calcularCustoIngrediente(pratoItem.item.preco_custo, pratoItem.item.quantidade_compra, pratoItem.quantidade, pratoItem.item.unidade_medida);
                return <article className="ingredient-row" key={pratoItem.id}>
                  <span className="dish-icon"><CookingPot size={19} /></span>
                  <div className="ingredient-main"><h3>{pratoItem.item.produto.nome}</h3><p>{formatarQuantidade(pratoItem.quantidade)} {unidadeBase(pratoItem.item.unidade_medida)}</p></div>
                  <strong className="ingredient-cost">{formatarMoeda(custo)}</strong>
                  <button className="icon-button danger-button" type="button" onClick={() => excluirItem(pratoItem.id)} aria-label={`Remover ${pratoItem.item.produto.nome}`} title="Remover ingrediente"><Trash2 size={17} /></button>
                </article>;
              })}
            </div>
            <div className="total-banner"><div><span>Custo total do prato</span><small>Com base nos itens da receita</small></div><strong>{formatarMoeda(calcularPrato(prato))}</strong></div>
          </>
        ) : (
          <div className="empty-state"><span className="empty-icon"><CookingPot size={23} /></span><h3>{prato ? "Receita sem ingredientes" : "Nenhum prato cadastrado"}</h3><p>{prato ? "Escolha um insumo acima para começar a composição." : "Crie um prato e adicione os ingredientes comprados."}</p></div>
        )}
      </section>
    </div>
  );
}