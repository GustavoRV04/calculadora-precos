import { useState } from "react";
import { ChartNoAxesColumnIncreasing, CircleAlert, FileText } from "lucide-react";
import { atualizarMargemPrato, calcularPrato, listarPratos } from "../services/pratoService";
import { calcularCustoIngrediente, calcularPrecoVendaComMargem } from "../utils/calculadoraPreco";
import { unidadeBase } from "../utils/conversorMedidas";
import { formatarMoeda, formatarQuantidade } from "../utils/formatacao";
import SelectBackendPaginado from "../components/SelectBackendPaginado";

const cores = ["blue", "mint", "lavender", "coral"];

export default function FichaTecnica({ pratos, pratoSelecionado, onSelectPrato, onSaved }) {
  const [filtroId, setFiltroId] = useState("");
  const [pratoSelecionadoAsync, setPratoSelecionadoAsync] = useState(null);
  const [margens, setMargens] = useState({});
  const [errosMargem, setErrosMargem] = useState({});
  const [statusMargem, setStatusMargem] = useState({});
  const pratoId = filtroId || pratoSelecionado || String(pratos[0]?.id ?? "");
  const prato = pratoSelecionadoAsync?.registro ?? pratos.find((registro) => String(registro.id) === String(pratoId));
  const opcaoPrato = pratoSelecionadoAsync ?? (prato ? { value: prato.id, label: prato.nome, registro: prato } : null);
  const pratoKey = String(prato?.id ?? "");
  const margem = margens[pratoKey] ?? String(prato?.margem_lucro_percentual ?? "20.00");
  const erroMargem = errosMargem[pratoKey];
  const statusDaMargem = statusMargem[pratoKey];
  const total = calcularPrato(prato);
  const margemNumerica = Number(margem);
  const margemValida = margem.trim() !== "" && Number.isFinite(margemNumerica) && margemNumerica >= 0 && margemNumerica < 100;
  const precoVenda = margemValida ? calcularPrecoVendaComMargem(total, margemNumerica) : null;
  const lucroPorVenda = precoVenda === null ? null : Number((precoVenda - total).toFixed(2));
  const linhas = (prato?.prato_itens ?? []).map((pratoItem, index) => {
    const custo = calcularCustoIngrediente(pratoItem.item.preco_custo, pratoItem.item.quantidade_compra, pratoItem.quantidade, pratoItem.item.unidade_medida);
    return { ...pratoItem, custo, percentual: total ? (custo / total) * 100 : 0, cor: cores[index % cores.length] };
  });

  function selecionar(opcao) {
    const id = String(opcao?.value ?? "");
    setPratoSelecionadoAsync(opcao);
    setFiltroId(id);
    onSelectPrato(id);
  }

  function buscarPratos(busca, offset) {
    return listarPratos(offset, busca);
  }

  function opcaoPratoBackend(registro) {
    return { value: registro.id, label: registro.nome, registro };
  }

  async function salvarMargem(pratoAlvo, margemAlvo) {
    if (!pratoAlvo) return;
    const chave = String(pratoAlvo.id);
    const margemSalva = Number(pratoAlvo.margem_lucro_percentual ?? 20);
    const margemAtual = Number(margemAlvo);
    const margemValida = margemAlvo.trim() !== "" && Number.isFinite(margemAtual) && margemAtual >= 0 && margemAtual < 100;

    if (!margemValida) {
      setMargens((atuais) => {
        const proximas = { ...atuais };
        delete proximas[chave];
        return proximas;
      });
      setErrosMargem((atuais) => ({ ...atuais, [chave]: "Informe uma margem entre 0% e 99,99%." }));
      setStatusMargem((atuais) => ({ ...atuais, [chave]: "" }));
      return;
    }

    setErrosMargem((atuais) => ({ ...atuais, [chave]: "" }));
    if (margemAtual === margemSalva) return;

    setStatusMargem((atuais) => ({ ...atuais, [chave]: "Salvando margem..." }));
    try {
      await atualizarMargemPrato(pratoAlvo.id, margemAtual);
      setStatusMargem((atuais) => ({ ...atuais, [chave]: "Margem salva." }));
      onSaved();
    } catch (error) {
      setMargens((atuais) => {
        const proximas = { ...atuais };
        delete proximas[chave];
        return proximas;
      });
      setStatusMargem((atuais) => ({ ...atuais, [chave]: "" }));
      setErrosMargem((atuais) => ({ ...atuais, [chave]: error.message }));
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p className="eyebrow">ANÁLISE DE CUSTO</p><h1>Ficha técnica</h1><p>Composição e participação de cada ingrediente.</p></div>
        <span className="heading-mark"><FileText size={21} /></span>
      </section>

      <section className="form-panel sheet-select-panel">
        <label className="field-label">Prato
          <SelectBackendPaginado buscarPagina={buscarPratos} inputId="prato-ficha" noOptionsMessage="Nenhum prato encontrado" onChange={selecionar} paraOpcao={opcaoPratoBackend} placeholder="Busque um prato" value={opcaoPrato} />
        </label>
      </section>

      {prato ? (
        <>
          <section className="sheet-hero">
            <div className="sheet-hero-title"><span className="dish-icon"><FileText size={21} /></span><div><h2>{prato.nome}</h2><p>{linhas.length} {linhas.length === 1 ? "ingrediente" : "ingredientes"} na receita</p></div></div>
            <div className="sheet-pricing">
              <label className="field-label sheet-margin">Margem de lucro
                <span className="percentage-input"><input aria-label="Margem de lucro em porcentagem" max="99.99" min="0" onBlur={() => salvarMargem(prato, margem)} onChange={(event) => { setMargens((atuais) => ({ ...atuais, [pratoKey]: event.target.value })); setErrosMargem((atuais) => ({ ...atuais, [pratoKey]: "" })); setStatusMargem((atuais) => ({ ...atuais, [pratoKey]: "" })); }} step="0.01" type="number" value={margem} /><span>%</span></span>
                <span className="field-hint">Sobre o preço de venda. Salva ao sair do campo.</span>
                {statusDaMargem === "Salvando margem..." && <span className="field-hint" aria-live="polite">{statusDaMargem}</span>}
                {statusDaMargem === "Margem salva." && <span className="field-success" aria-live="polite">{statusDaMargem}</span>}
                {erroMargem && <span className="field-error" role="alert"><CircleAlert size={14} />{erroMargem}</span>}
              </label>
              <div className="sheet-total"><span>Custo de produção</span><strong>{formatarMoeda(total)}</strong></div>
              <div className="sheet-total sheet-sale-price"><span>Preço de venda sugerido</span><strong>{precoVenda === null ? "—" : formatarMoeda(precoVenda)}</strong></div>
              <div className="sheet-total sheet-profit"><span>Lucro por venda</span><strong>{lucroPorVenda === null ? "—" : formatarMoeda(lucroPorVenda)}</strong></div>
            </div>
            <p className="sheet-note"><ChartNoAxesColumnIncreasing size={16} /> Lucro estimado: preço sugerido menos custo de produção; outras despesas não incluídas.</p>
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
