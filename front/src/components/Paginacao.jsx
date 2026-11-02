export default function Paginacao({ paginacao, onAnterior, onProxima, rotulo = "registros" }) {
  const { count = 0, offset = 0, limit = 20, next, previous } = paginacao ?? {};
  const paginaAtual = Math.floor(offset / limit) + 1;
  const totalPaginas = Math.max(1, Math.ceil(count / limit));

  if (count <= limit) return null;

  return (
    <nav className="pagination" aria-label={`Paginação de ${rotulo}`}>
      <button className="button-secondary pagination-button" type="button" disabled={!previous} onClick={onAnterior}>
        Anterior
      </button>
      <span aria-live="polite">Página {paginaAtual} de {totalPaginas}</span>
      <button className="button-secondary pagination-button" type="button" disabled={!next} onClick={onProxima}>
        Próxima
      </button>
    </nav>
  );
}
