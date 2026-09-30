import { useEffect, useState } from "react";
import { criarRestaurante, listarRestaurantes, buscarRestaurantePorEmail } from "../services/restauranteService";

export default function Header({ restauranteAtivo, setRestauranteAtivo }) {
  const [restaurantes, setRestaurantes] = useState([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [modoCadastro, setModoCadastro] =
  useState(false);
  const [exibirFormulario, setExibirFormulario] = useState(false);

  async function carregarRestaurantes() {
    const dados = await listarRestaurantes();
    setRestaurantes(dados);
  }

  useEffect(() => {
    carregarRestaurantes();
  }, []);

  async function handleCadastrar() {

    if (
      !nome.trim() ||
      !email.trim() ||
      !senha.trim()
    ) {
      alert(
        "Preencha todos os campos"
      );

      return;
    }

    const criado =
      await criarRestaurante(
        nome,
        email,
        senha
      );

    setRestauranteAtivo(
      criado.id
    );

    alert(
      "Restaurante cadastrado!"
    );

  }

  async function handleEntrar() {

    const restaurante =
      await buscarRestaurantePorEmail(
        email
      );

    if (!restaurante) {

      alert("Restaurante não encontrado");

      return;
    }

    if (
      restaurante.senha !== senha
    ) {

      alert("Senha inválida");

      return;
    }

    setRestauranteAtivo(
      restaurante.id
    );

    alert(
    `Bem-vindo ${restaurante.nome}`
    );

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
          {exibirFormulario ? "Cancelar" : "Entrar"}
        </button>
      </div>

      {exibirFormulario && (

        <div className="restaurante-form-inline">

          <div>

            <button
              onClick={() =>
                setModoCadastro(false)
              }
            >
              Entrar
            </button>

            <button
              onClick={() =>
                setModoCadastro(true)
              }
            >
              Cadastrar
            </button>

          </div>

          {modoCadastro ? (

            <>
              <input
                type="text"
                placeholder="Nome"
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) =>
                  setSenha(e.target.value)
                }
              />

              <button
                onClick={handleCadastrar}
              >
                Cadastrar
              </button>
            </>

          ) : (

            <>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) =>
                  setSenha(e.target.value)
                }
              />

              <button
                onClick={handleEntrar}
              >
                Entrar
              </button>
            </>

          )}

        </div>

      )}
    </header>
  );
}