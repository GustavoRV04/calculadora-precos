import { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  ArrowRight,
  Check,
  CircleAlert,
  CookingPot,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  adicionarIngrediente,
  atualizarIngredientePratoService,
  calcularPrato,
  criarPrato,
  listarPratos,
  pratoPorId,
  removerIngrediente,
} from "../services/pratoService";
import { listarProdutos } from "../services/produtoService";
import { calcularCustoIngrediente, calcularCustoIngredienteReceita, unidadeUsoReceita } from "../utils/calculadoraPreco";
import { formatarCustoUnitario, formatarMoeda, formatarQuantidade } from "../utils/formatacao";
import SelectBackendPaginado from "../components/SelectBackendPaginado";

export default function MontarPrato({
  pratos,
  onSaved,
  onPratoAtualizado,
  onNavigate,
}) {
  const [nomePrato, setNomePrato] = useState("");
  const [pratoId, setPratoId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [pratoSelecionado, setPratoSelecionado] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [buscaIngredientes, setBuscaIngredientes] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Estados para o Modal de Edição
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [ingredienteEditando, setIngredienteEditando] = useState(null);
  const [quantidadeEditada, setQuantidadeEditada] = useState("");
  const [erroEdicao, setErroEdicao] = useState("");

  // Certifica-te de que o ID do prato é tratado consistentemente como número se o backend exigir Integer
  const pratoAtivoId = pratoId ? Number(pratoId) : Number(pratos[0]?.id ?? 0);
  const prato =
    pratoSelecionado?.registro ??
    pratos.find((registro) => String(registro.id) === String(pratoAtivoId));
  const produto = produtoSelecionado?.registro;
  console.log("produto", produto)
  const item = produto?.ultimo_item;
  const unidadeQuantidade = unidadeUsoReceita(item?.unidade_medida)?.toLowerCase() || "unidade";
  const passoQuantidade = unidadeQuantidade === "g" || unidadeQuantidade === "ml" ? "1" : "0.001";
  const opcaoPratoSelecionado =
    pratoSelecionado ??
    (prato ? { value: prato.id, label: prato.nome, registro: prato } : null);

  const custoParcial =
    item && quantidade
      ? calcularCustoIngredienteReceita(
        item.preco_custo,
        item.quantidade_compra,
        Number(quantidade),
        item.unidade_medida,
      )
      : 0;
  const quantidadeAtual = Number(ingredienteEditando?.quantidade ?? 0);
  const quantidadeNova = Number(quantidadeEditada);
  const custoAtualizado = ingredienteEditando?.produto?.ultimo_item && quantidadeNova > 0
      ? calcularCustoIngredienteReceita(
      ingredienteEditando.produto.ultimo_item.preco_custo,
      ingredienteEditando.produto.ultimo_item.quantidade_compra,
      quantidadeNova,
      ingredienteEditando.produto.ultimo_item.unidade_medida,
    )
    : null;

  const ingredientesFiltrados = (prato?.prato_produtos ?? []).filter((pratoProduto) =>
    pratoProduto.produto.nome
      .toLocaleLowerCase("pt-BR")
      .includes(buscaIngredientes.trim().toLocaleLowerCase("pt-BR")),
  );

  async function salvarPrato(event) {
    event.preventDefault();
    if (!nomePrato.trim()) return;
    setErro("");
    setSalvando(true);
    try {
      const novoPrato = await criarPrato(nomePrato.trim());
      setPratoId(String(novoPrato.id));
      setPratoSelecionado({
        value: novoPrato.id,
        label: novoPrato.nome,
        registro: novoPrato,
      });
      setNomePrato("");
      onSaved();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  function buscarPratos(busca, offset) {
    return listarPratos(offset, busca);
  }

  function buscarProdutos(busca, offset) {
    return listarProdutos(offset, busca);
  }

  function opcaoPrato(registro) {
    return { value: registro.id, label: registro.nome, registro };
  }

  function opcaoProduto(registro) {
    const itemAtual = registro.ultimo_item;
    return {
      value: registro.id,
      label: itemAtual
        ? `${registro.nome} · ${formatarMoeda(calcularCustoIngrediente(itemAtual.preco_custo, itemAtual.quantidade_compra, 1, itemAtual.unidade_medida))} / ${itemAtual.unidade_medida?.toLowerCase()}`
        : `${registro.nome} · Sem compra registrada`,
      isDisabled: !itemAtual,
      registro,
    };
  }

  async function incluirItem(event) {
    event.preventDefault();
    setErro("");
    if (!pratoAtivoId) {
      setErro("Crie ou selecione um prato antes de adicionar ingredientes.");
      return;
    }
    if (!produtoId || !item || Number(quantidade) <= 0) {
      setErro("Selecione um insumo e informe uma quantidade maior que zero.");
      return;
    }

    setSalvando(true);
    try {
      await adicionarIngrediente(pratoAtivoId, produtoId, Number(quantidade));
      const pratoAtualizado = await pratoPorId(pratoAtivoId);
      setPratoSelecionado(opcaoPrato(pratoAtualizado));
      onPratoAtualizado(pratoAtualizado);
      setQuantidade("");
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluirItem(pratoProdutoId) {
    setErro("");
    try {
      await removerIngrediente(pratoProdutoId);
      const pratoAtualizado = await pratoPorId(pratoAtivoId);
      setPratoSelecionado(opcaoPrato(pratoAtualizado));
      onPratoAtualizado(pratoAtualizado);
    } catch (error) {
      setErro(error.message);
    }
  }

  // Funções de Controle do Modal de Edição
  function abrirModalEdicao(pratoProduto) {
    setIngredienteEditando(pratoProduto);
    setQuantidadeEditada(String(pratoProduto.quantidade));
    setErroEdicao("");
    setModalEdicaoAberto(true);
  }

  const fecharModalEdicao = useCallback(() => {
    if (salvando) return;
    setModalEdicaoAberto(false);
    setIngredienteEditando(null);
    setQuantidadeEditada("");
    setErroEdicao("");
  }, [salvando]);

  useEffect(() => {
    if (!modalEdicaoAberto) return undefined;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function fecharComEscape(event) {
      if (event.key === "Escape" && !salvando) fecharModalEdicao();
    }

    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.removeEventListener("keydown", fecharComEscape);
      document.body.style.overflow = overflowAnterior;
    };
  }, [modalEdicaoAberto, salvando, fecharModalEdicao]);

  async function atualizarIngredientePrato(event) {
    event.preventDefault();
    if (!ingredienteEditando || !Number.isFinite(quantidadeNova) || quantidadeNova <= 0) {
      setErroEdicao("Informe uma quantidade maior que zero.");
      return;
    }

    setErroEdicao("");
    setSalvando(true);
    try {
      await atualizarIngredientePratoService(ingredienteEditando.id, {
        prato_id: pratoAtivoId,
        produto_id: ingredienteEditando.produto.id,
        quantidade: Number(quantidadeEditada),
      });

      const pratoAtualizado = await pratoPorId(pratoAtivoId);
      setPratoSelecionado(opcaoPrato(pratoAtualizado));
      onPratoAtualizado(pratoAtualizado);
      fecharModalEdicao();
    } catch (error) {
      setErro(error.message);
      setErroEdicao(error.message);
    } finally {
      setSalvando(false);
    }
  }
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">RECEITAS & RENDIMENTO</p>
          <h1>Montar prato</h1>
          <p>Adicione os insumos e acompanhe o custo por receita.</p>
        </div>
        <span className="heading-mark heading-positive">
          <CookingPot size={21} />
        </span>
      </section>

      <section className="form-panel compact-panel">
        <div className="panel-title">
          <span className="section-icon">
            <Plus size={19} />
          </span>
          <div>
            <h2>Novo prato</h2>
            <p>Comece pelo nome da receita.</p>
          </div>
        </div>
        <form className="inline-create" onSubmit={salvarPrato}>
          <input
            maxLength={100}
            value={nomePrato}
            onChange={(event) => setNomePrato(event.target.value)}
            placeholder="Ex.: Hambúrguer da casa"
            aria-label="Nome do novo prato"
          />
          <button
            className="button-primary"
            disabled={salvando || !nomePrato.trim()}
            type="submit"
          >
            <Plus size={17} /> Criar
          </button>
        </form>
      </section>

      <section className="form-panel">
        <div className="panel-title">
          <span className="section-icon">
            <CookingPot size={19} />
          </span>
          <div>
            <h2>Adicionar ingrediente</h2>
            <p>Selecione o prato e o item comprado que entra na receita.</p>
          </div>
        </div>
        <form className="form-grid" onSubmit={incluirItem}>
          <label className="field-label field-span">
            Prato
            <SelectBackendPaginado
              buscarPagina={buscarPratos}
              inputId="prato"
              noOptionsMessage="Nenhum prato encontrado"
              onChange={(opcao) => {
                setPratoSelecionado(opcao);
                setPratoId(String(opcao?.value ?? ""));
              }}
              opcaoAtualizada={pratoSelecionado}
              paraOpcao={opcaoPrato}
              placeholder="Busque um prato"
              value={opcaoPratoSelecionado}
            />
          </label>
          <label className="field-label field-span">
            Insumo comprado
            <SelectBackendPaginado
              buscarPagina={buscarProdutos}
              inputId="produto"
              noOptionsMessage="Nenhum insumo encontrado"
              onChange={(opcao) => {
                setProdutoSelecionado(opcao);
                setProdutoId(String(opcao?.value ?? ""));
                setQuantidade("");
              }}
              paraOpcao={opcaoProduto}
              placeholder="Busque um insumo comprado"
              value={produtoSelecionado}
            />
          </label>
          <label className="field-label">
            Quantidade na receita ({unidadeQuantidade})
            <input
              required
              min={passoQuantidade}
              step={passoQuantidade}
              type="number"
              value={quantidade}
              onChange={(event) => setQuantidade(event.target.value)}
              placeholder="0"
            />
          </label>
          <div className="cost-preview partial-cost">
            <div>
              <span className="preview-label">Custo parcial</span>
              <strong>{formatarMoeda(custoParcial)}</strong>
            </div>
          </div>
          {erro && (
            <p className="form-error field-span" role="alert">
              <CircleAlert size={16} />
              {erro}
            </p>
          )}
          <button
            className="button-primary field-span submit-button"
            disabled={salvando || !produtoId || !item}
            type="submit"
          >
            {salvando ? (
              <span className="loader-dot" />
            ) : (
              <>
                <Check size={18} /> Adicionar ao prato
              </>
            )}
          </button>
        </form>
        {!pratos.length && (
          <button
            className="inline-link"
            type="button"
            onClick={() => onNavigate("compras")}
          >
            Ou registre uma compra primeiro <Plus size={15} />
          </button>
        )}
      </section>

      <section className="list-section">
        <div className="list-toolbar">
          <div>
            <h2>Ingredientes no prato</h2>
            <p>{prato?.nome ?? "Selecione uma receita"}</p>
          </div>
          <label className="search-box">
            <Search size={18} aria-hidden="true" />
            <input
              value={buscaIngredientes}
              onChange={(event) => setBuscaIngredientes(event.target.value)}
              placeholder="Buscar ingrediente"
              aria-label="Buscar ingrediente no prato"
            />
          </label>
          <span className="count-badge">{prato?.prato_produtos?.length ?? 0}</span>
        </div>
        {ingredientesFiltrados.length ? (
          <>
            <div className="ingredient-list">
              {ingredientesFiltrados.map((pratoProduto) => {
                const itemAtual = pratoProduto.produto.ultimo_item;
                const custo = itemAtual
                  ? calcularCustoIngredienteReceita(
                    itemAtual.preco_custo,
                    itemAtual.quantidade_compra,
                    pratoProduto.quantidade,
                    itemAtual.unidade_medida,
                  )
                  : null;
                const custoUnitario = itemAtual
                  ? calcularCustoIngrediente(
                    itemAtual.preco_custo,
                    itemAtual.quantidade_compra,
                    1,
                    itemAtual.unidade_medida,
                  )
                  : null;
                return (
                  <article className="ingredient-row" key={pratoProduto.id}>
                    <span className="dish-icon">
                      <CookingPot size={19} />
                    </span>
                    <div className="ingredient-main">
                      <h3>{pratoProduto.produto.nome}</h3>
                      <div className="ingredient-details">
                        <span className="ingredient-quantity">
                          {formatarQuantidade(pratoProduto.quantidade)}{" "}
                          {itemAtual ? unidadeUsoReceita(itemAtual.unidade_medida)?.toLowerCase() : "unidade"}
                        </span>
                        <span className="ingredient-unit-price">
                          {custoUnitario === null
                            ? "Preço unitário indisponível"
                            : `${formatarCustoUnitario(custoUnitario)} / ${itemAtual.unidade_medida?.toLowerCase()}`}
                        </span>
                      </div>
                    </div>
                    <strong className="ingredient-cost">
                      {custo === null ? "—" : formatarMoeda(custo)}
                    </strong>

                    {/* Botão de Editar */}
                    <button
                      className="icon-button"
                      type="button"
                      disabled={!itemAtual}
                      onClick={() => abrirModalEdicao(pratoProduto)}
                      aria-label={`Editar ${pratoProduto.produto.nome}`}
                      title="Editar ingrediente"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      className="icon-button danger-button"
                      type="button"
                      onClick={() => excluirItem(pratoProduto.id)}
                      aria-label={`Remover ${pratoProduto.produto.nome}`}
                      title="Remover ingrediente"
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                );
              })}
            </div>
            <div className="total-banner">
              <div>
                <span>Custo total do prato</span>
                <small>Com base nos itens da receita</small>
              </div>
              <strong>{formatarMoeda(calcularPrato(prato))}</strong>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              <CookingPot size={23} />
            </span>
            <h3>
              {prato
                ? buscaIngredientes
                  ? "Nenhum ingrediente encontrado"
                  : "Receita sem ingredientes"
                : "Nenhum prato cadastrado"}
            </h3>
            <p>
              {prato
                ? buscaIngredientes
                  ? "Tente outro nome."
                  : "Escolha um insumo acima para começar a composição."
                : "Crie um prato e adicione os ingredientes comprados."}
            </p>
          </div>
        )}
      </section>


      {modalEdicaoAberto &&
        ReactDOM.createPortal(
          <div
            className="modal-overlay"
            onClick={(event) => {
              if (event.target === event.currentTarget) fecharModalEdicao();
            }}
          >
            <section
              aria-labelledby="edit-ingredient-title"
              aria-modal="true"
              className="modal-content"
              role="dialog"
            >
              <header className="edit-modal-header">
                <span className="section-icon edit-modal-icon"><Pencil size={19} /></span>
                <div className="edit-modal-heading">
                  <h2 id="edit-ingredient-title">Editar ingrediente</h2>
                  <p>Atualize a quantidade usada nesta receita.</p>
                </div>
                <button
                  className="icon-button"
                  disabled={salvando}
                  type="button"
                  onClick={fecharModalEdicao}
                  aria-label="Fechar edição"
                >
                  <X size={19} />
                </button>
              </header>

              <div className="edit-ingredient-context">
                <span className="dish-icon"><CookingPot size={19} /></span>
                <div>
                  <strong>{ingredienteEditando?.produto?.nome}</strong>
                  <span>Quantidade por receita em {unidadeUsoReceita(ingredienteEditando?.produto?.ultimo_item?.unidade_medida)?.toLowerCase() || "unidade"}</span>
                </div>
              </div>

              <form className="edit-ingredient-form" onSubmit={atualizarIngredientePrato}>
                <label className="field-label">
                  Nova quantidade
                  <input
                    autoFocus
                    required
                    min="0.001"
                    step="0.001"
                    type="number"
                    value={quantidadeEditada}
                    onChange={(event) => {
                      setQuantidadeEditada(event.target.value);
                      setErroEdicao("");
                    }}
                    placeholder="0"
                  />
                </label>
                <div className="edit-cost-preview" aria-live="polite">
                  <div>
                    <span>Antes</span>
                    <strong>{formatarMoeda(calcularCustoIngredienteReceita(
                      ingredienteEditando.produto.ultimo_item.preco_custo,
                      ingredienteEditando.produto.ultimo_item.quantidade_compra,
                      quantidadeAtual,
                      ingredienteEditando.produto.ultimo_item.unidade_medida,
                    ))}</strong>
                  </div>
                  <ArrowRight size={17} aria-hidden="true" />
                  <div className="edit-cost-new">
                    <span>Novo custo estimado</span>
                    <strong>{custoAtualizado === null ? "—" : formatarMoeda(custoAtualizado)}</strong>
                  </div>
                </div>
                {erroEdicao && <p className="form-error edit-modal-error" role="alert"><CircleAlert size={16} />{erroEdicao}</p>}
                <div className="edit-modal-actions">
                  <button
                    className="button-secondary"
                    disabled={salvando}
                    type="button"
                    onClick={fecharModalEdicao}
                  >
                    Cancelar
                  </button>
                  <button
                    className="button-primary"
                    disabled={salvando || custoAtualizado === null}
                    type="submit"
                  >
                    {salvando ? (
                      <span className="loader-dot" />
                    ) : (
                      <>
                        <Check size={18} /> Salvar alterações
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>,
          document.body,
        )}
    </div>
  );
}
