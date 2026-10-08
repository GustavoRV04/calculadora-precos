import { useEffect, useState } from "react";
import { criarRestaurante, listarRestaurantes, buscarRestaurantePorEmail, deletarRestaurante, atualizarRestaurante } from "../services/restauranteService";

export default function Header({ restauranteAtivo, setRestauranteAtivo }) {
  const [restaurantes, setRestaurantes] = useState([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [modo, setModo] = useState("entrar"); // "entrar", "cadastrar", "editar"
  const [exibirFormulario, setExibirFormulario] = useState(false);

  async function carregarRestaurantes() {
    const dados = await listarRestaurantes();
    setRestaurantes(dados);
  }

  useEffect(() => {
    carregarRestaurantes();
  }, []);

  function prepararEdicao() {
    const atual = restaurantes.find((r) => r.id === restauranteAtivo);
    if (atual) {
      setNome(atual.nome);
      setEmail(atual.email);
      setSenha(atual.senha);
    }
    setModo("editar");
    setExibirFormulario(true);
  }

  async function handleCadastrar() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      alert("Preencha todos os campos");
      return;
    }

    const nomeExiste = restaurantes.some(
      (r) => r.nome.trim().toLowerCase() === nome.trim().toLowerCase()
    );

    if (nomeExiste) {
      alert("Já existe um comércio cadastrado com este nome. Escolha um nome diferente.");
      return;
    }

    const criado = await criarRestaurante(nome, email, senha);
    setRestauranteAtivo(criado.id);
    await carregarRestaurantes();
    setExibirFormulario(false);
    alert("Restaurante cadastrado!");
  }

  async function handleEditar() {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      alert("Preencha todos os campos");
      return;
    }

    const nomeExiste = restaurantes.some(
      (r) => r.id !== restauranteAtivo && r.nome.trim().toLowerCase() === nome.trim().toLowerCase()
    );

    if (nomeExiste) {
      alert("Já existe outro comércio cadastrado com este nome.");
      return;
    }

    const sucesso = await atualizarRestaurante(restauranteAtivo, { nome, email, senha });
    if (sucesso) {
      await carregarRestaurantes();
      setExibirFormulario(false);
      alert("Comércio atualizado com sucesso!");
    } else {
      alert("Erro ao atualizar o comércio.");
    }
  }

  async function handleEntrar() {
    const restaurante = await buscarRestaurantePorEmail(email);

    if (!restaurante) {
      alert("Restaurante não encontrado");
      return;
    }

    if (restaurante.senha !== senha) {
      alert("Senha inválida");
      return;
    }

    setRestauranteAtivo(restaurante.id);
    setExibirFormulario(false);
    alert(`Bem-vindo ${restaurante.nome}`);
  }

  async function handleDeletar() {
    if (!restauranteAtivo) {
      alert("Nenhum comércio selecionado para excluir.");
      return;
    }

    const confirmado = window.confirm("Tens a certeza que queres eliminar este comércio?");
    if (!confirmado) return;

    const sucesso = await deletarRestaurante(restauranteAtivo);
    if (sucesso) {
      alert("Comércio eliminado com sucesso!");
      setRestauranteAtivo("");
      await carregarRestaurantes();
      setExibirFormulario(false);
    } else {
      alert("Erro ao eliminar o comércio.");
    }
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
          onClick={() => {
            setModo("entrar");
            setExibirFormulario(!exibirFormulario);
          }}
        >
          {exibirFormulario ? "Cancelar" : "Entrar / Gerir"}
        </button>
      </div>

      {exibirFormulario && (
        <div className="restaurante-form-inline" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setModo("entrar")}
              style={{ backgroundColor: modo === "entrar" ? "#4f46e5" : "#64748b" }}
            >
              Entrar
            </button>

            <button
              onClick={() => {
                setNome("");
                setEmail("");
                setSenha("");
                setModo("cadastrar");
              }}
              style={{ backgroundColor: modo === "cadastrar" ? "#4f46e5" : "#64748b" }}
            >
              Cadastrar
            </button>

            {restauranteAtivo && (
              <button
                onClick={prepararEdicao}
                style={{ backgroundColor: modo === "editar" ? "#4f46e5" : "#64748b" }}
              >
                Editar
              </button>
            )}

            {restauranteAtivo && (
              <button
                onClick={handleDeletar}
                style={{ backgroundColor: "#dc2626", color: "#ffffff", marginLeft: "auto" }}
              >
                Deletar Comércio
              </button>
            )}
          </div>

          {modo === "cadastrar" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                type="text"
                placeholder="Nome do Comércio"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email (pode ser o mesmo para várias unidades)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button onClick={handleCadastrar}>
                Salvar Cadastro
              </button>
            </div>
          )}

          {modo === "editar" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                type="text"
                placeholder="Novo Nome do Comércio"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <input
                type="email"
                placeholder="Novo Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Nova Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button onClick={handleEditar} style={{ backgroundColor: "#0284c7" }}>
                Salvar Alterações
              </button>
            </div>
          )}

          {modo === "entrar" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button onClick={handleEntrar}>
                Entrar no Comércio
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}