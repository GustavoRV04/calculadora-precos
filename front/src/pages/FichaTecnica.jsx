import { useEffect, useRef, useState } from "react";
import { ChartNoAxesColumnIncreasing, CircleAlert, FileText, Percent } from "lucide-react";
import { atualizarMargemGeral, atualizarMargemPrato, calcularPrato, listarPratos, obterMargemGeral } from "../services/pratoService";
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
  const [margemGeral, setMargemGeral] = useState("");
  const [carregandoMargemGeral, setCarregandoMargemGeral] = useState(true);
  const [salvandoMargemGeral, setSalvandoMargemGeral] = useState(false);
  const [erroMargemGeral, setErroMargemGeral] = useState("");
  const [statusMargemGeral, setStatusMargemGeral] = useState("");
  const atualizacoesMargemRef = useRef(new Map());
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

  useEffect(() => {
    let vigente = true;
    obterMargemGeral()
      .then((configuracao) => {
        if (vigente) setMargemGeral(String(configuracao.margem_lucro_percentual));
      })
      .catch((error) => {
        if (vigente) setErroMargemGeral(error.message);
      })
      .finally(() => {
        if (vigente) setCarregandoMargemGeral(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

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

  async function aplicarMargemGeral(event) {
    event.preventDefault();
    const valor = Number(margemGeral);
    if (margemGeral.trim() === "" || !Number.isFinite(valor) || valor < 0 || valor >= 100) {
      setErroMargemGeral("Informe uma margem entre 0% e 99,99%.");
      setStatusMargemGeral("");
      return;
    }

    setSalvandoMargemGeral(true);
    setErroMargemGeral("");
    setStatusMargemGeral("");
    try {
      await Promise.all(atualizacoesMargemRef.current.values());
      const resposta = await atualizarMargemGeral(valor);
      const margemSalva = String(resposta.margem_lucro_percentual);
      setMargemGeral(margemSalva);
      if (prato) {
        const chave = String(prato.id);
        setMargens((atuais) => ({ ...atuais, [chave]: margemSalva }));
        setPratoSelecionadoAsync((atual) => atual
          ? {
            ...atual,
            registro: {
              ...atual.registro,
              margem_lucro_percentual: margemSalva,
            },
          }
          : atual);
      }
      setStatusMargemGeral(`Margem aplicada a ${resposta.pratos_atualizados} ${resposta.pratos_atualizados === 1 ? "prato" : "pratos"}.`);
      onSaved();
    } catch (error) {
      setErroMargemGeral(error.message);
    } finally {
      setSalvandoMargemGeral(false);
    }
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
    const atualizacao = atualizarMargemPrato(pratoAlvo.id, margemAtual);
    atualizacoesMargemRef.current.set(chave, atualizacao);
    try {
      await atualizacao;
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
      if (atualizacoesMargemRef.current.get(chave) === atualizacao) {
        atualizacoesMargemRef.current.delete(chave);
      }
    }
  }

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div><p className="eyebrow">ANÁLISE DE CUSTO</p><h1>Ficha técnica</h1><p>Composição e participação de cada ingrediente.</p></div>
        <span className="heading-mark"><FileText size={21} /></span>
      </section>

      <section className="form-panel general-margin-panel">
        <div className="panel-title"><span className="section-icon"><Percent size={19} /></span><div><h2>Margem geral</h2><p>Defina a margem para todos os pratos do comércio.</p></div></div>
        <form className="general-margin-form" onSubmit={aplicarMargemGeral}>
          <label className="field-label general-margin-field">Margem de lucro geral
            <span className="percentage-input"><input aria-label="Margem geral de lucro para todos os pratos" disabled={carregandoMargemGeral || salvandoMargemGeral} max="99.99" min="0" onChange={(event) => { setMargemGeral(event.target.value); setErroMargemGeral(""); setStatusMargemGeral(""); }} step="0.01" type="number" value={margemGeral} /><span>%</span></span>
          </label>
          <button className="button-primary general-margin-submit" disabled={carregandoMargemGeral || salvandoMargemGeral} type="submit">
            {salvandoMargemGeral ? <span className="loader-dot" /> : <><Percent size={16} /> Aplicar a todos</>}
          </button>
        </form>
        <p className="field-hint general-margin-hint">Aplicar substitui a margem atual de todos os pratos. Depois, você pode ajustar cada prato individualmente na ficha.</p>
        {erroMargemGeral && <p className="form-error" role="alert"><CircleAlert size={16} />{erroMargemGeral}</p>}
        {statusMargemGeral && <p className="field-success" aria-live="polite">{statusMargemGeral}</p>}
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
