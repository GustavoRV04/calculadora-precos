import { useEffect, useState } from "react";
import { criarRestaurante, listarRestaurantes } from "../services/restauranteService";

export default function Header({ restauranteAtivo, setRestauranteAtivo }) {
  const [restaurantes, setRestaurantes] = useState([]);
  const [novoNome, setNovoNome] = useState("");
  const [exibirFormulario, setExibirFormulario] = useState(false);

  async function carregarRestaurantes() {
    const dados = await listarRestaurantes();
    setRestaurantes(dados);
  }

  useEffect(() => {
    carregarRestaurantes();
  }, []);

  async function handleSalvar() {
    if (!novoNome.trim()) {
      alert("Informe o nome do restaurante!");
      return;
    }

    const criado = await criarRestaurante(novoNome);
    alert("Restaurante cadastrado!");
    setNovoNome("");
    setExibirFormulario(false);
    
    const atualizados = await listarRestaurantes();
    setRestaurantes(atualizados);
    setRestauranteAtivo(criado.id);
  }

  return (
    <header className="app-header">
      <div className="app-header-info">
        <span>Comércio selecionado:</span>
        <select
          value={restauranteAtivo || ""}
          onChange={(e) => setRestauranteAtivo(e.target.value)}
          className={!restauranteAtivo ? "select-placeholder" : ""}
        >
          <option value="" className="option-placeholder">
            ---Selecionar Comércio---
          </option>
          {restaurantes.length === 0 && (
            <option value="" disabled>
              Nenhum cadastrado
            </option>
          )}
          {restaurantes.map((r) => (
            <option key={r.id} value={r.id} className="option-item">
              {r.nome}
            </option>
          ))}
        </select>

        <button 
          className="btn-novo" 
          onClick={() => setExibirFormulario(!exibirFormulario)}
        >
          {exibirFormulario ? "Cancelar" : "+ Novo Restaurante"}
        </button>
      </div>

      {exibirFormulario && (
        <div className="restaurante-form-inline">
          <input
            type="text"
            placeholder="Nome do novo restaurante"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
          />
          <button onClick={handleSalvar}>Cadastrar</button>
        </div>
      )}
    </header>
  );
}