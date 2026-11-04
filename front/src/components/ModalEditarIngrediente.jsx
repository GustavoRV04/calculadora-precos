import ReactDOM from "react-dom";
import { Check, X } from "lucide-react";
import { unidadeBase } from "../utils/conversorMedidas";

export default function ModalEditarIngrediente({
  aberto,
  ingredienteEditando,
  quantidadeEditada,
  setQuantidadeEditada,
  onClose,
  onSave,
  salvando,
}) {
  if (!aberto) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content form-panel">
        <div className="panel-title">
          <div>
            <h2>Editar ingrediente</h2>
            <p>{ingredienteEditando?.item?.produto?.nome}</p>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={19} />
          </button>
        </div>
        <form className="form-grid" onSubmit={onSave}>
          <label className="field-label field-span">
            Nova quantidade (
            {unidadeBase(ingredienteEditando?.item?.unidade_medida) ||
              "unidade"}
            )
            <input
              required
              min="0.001"
              step="0.001"
              type="number"
              value={quantidadeEditada}
              onChange={(event) => setQuantidadeEditada(event.target.value)}
              placeholder="0"
            />
          </label>
          <div
            className="modal-actions field-span"
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <button
              className="button-secondary"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="button-primary"
              disabled={salvando}
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
      </div>
    </div>,
    document.body,
  );
}
