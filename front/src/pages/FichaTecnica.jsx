import { useState } from "react";
import { ChartNoAxesColumnIncreasing, FileText } from "lucide-react";
import { calcularPrato } from "../services/pratoService";
import { calcularCustoIngrediente } from "../utils/calculadoraPreco";
import { unidadeBase } from "../utils/conversorMedidas";
import { formatarMoeda, formatarQuantidade } from "../utils/formatacao";

const cores = ["blue", "mint", "lavender", "coral"];

export default function FichaTecnica({ pratos, pratoSelecionado, onSelectPrato }) {
  const [filtroId, setFiltroId] = useState("");
  const pratoId = filtroId || pratoSelecionado || String(pratos[0]?.id ?? "");
  const prato = pratos.find((registro) => String(registro.id) === String(pratoId));
  const total = calcularPrato(prato);
  const linhas = (prato?.prato_itens ?? []).map((pratoItem, index) => {
    const custo = calcularCustoIngrediente(pratoItem.item.preco_custo, pratoItem.item.quantidade_compra, pratoItem.quantidade, pratoItem.item.unidade_medida);
    return { ...pratoItem, custo, percentual: total ? (custo / total) * 100 : 0, cor: cores[index % cores.length] };
  });

  function selecionar(event) {
    setFiltroId(event.target.value);
    onSelectPrato(event.target.value);
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p className="eyebrow">ANÁLISE DE CUSTO</p><h1>Ficha técnica</h1><p>Composição e participação de cada ingrediente.</p></div>
        <span className="heading-mark"><FileText size={21} /></span>
      </section>

      <section className="form-panel sheet-select-panel">
        <label className="field-label">Prato
          <select value={prato?.id ?? ""} onChange={selecionar}>
            {pratos.length ? pratos.map((registro) => <option key={registro.id} value={registro.id}>{registro.nome}</option>) : <option value="">Nenhum prato cadastrado</option>}
          </select>
        </label>
      </section>

      {prato ? (
        <>
          <section className="sheet-hero">
            <div className="sheet-hero-title"><span className="dish-icon"><FileText size={21} /></span><div><h2>{prato.nome}</h2><p>{linhas.length} {linhas.length === 1 ? "ingrediente" : "ingredientes"} na receita</p></div></div>
            <div className="sheet-total"><span>Custo de produção</span><strong>{formatarMoeda(total)}</strong></div>
            <p className="sheet-note"><ChartNoAxesColumnIncreasing size={16} /> Calculado a partir das últimas compras registradas.</p>
          </section>

          <section className="form-panel breakdown-panel">
            <div className="list-toolbar"><div><h2>Ingredientes do prato</h2><p>Participação no custo total</p></div><span className="count-badge">100%</span></div>
            {linhas.length ? (
              <>
                <div className="cost-bar" aria-label="Distribuição do custo dos ingredientes">
                  {linhas.map((linha) => <span key={linha.id} className={`cost-bar-segment ${linha.cor}`} style={{ width: `${linha.percentual}%` }} title={`${linha.item.produto.nome}: ${linha.percentual.toFixed(1)}%`} />)}
                </div>
                <div className="breakdown-list">
                  {linhas.map((linha) => (
                    <article className="breakdown-row" key={linha.id}>
                      <span className={`breakdown-dot ${linha.cor}`} />
                      <div className="breakdown-main"><h3>{linha.item.produto.nome}</h3><p>{formatarQuantidade(linha.quantidade)} {unidadeBase(linha.item.unidade_medida)} por receita</p></div>
                      <div className="breakdown-value"><strong>{formatarMoeda(linha.custo)}</strong><span>{linha.percentual.toFixed(0)}% do custo</span></div>
                    </article>
                  ))}
                </div>
              </>
            ) : <div className="empty-state inline-empty"><h3>Sem ingredientes nesta receita</h3><p>Adicione itens na área “Montar prato”.</p></div>}
          </section>
        </>
      ) : (
        <div className="empty-state"><span className="empty-icon"><FileText size={23} /></span><h3>Sem ficha técnica para mostrar</h3><p>Cadastre um prato e sua composição para visualizar o custo.</p></div>
      )}
    </div>
  );
}