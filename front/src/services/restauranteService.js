import API_URL from "./api";

export async function listarRestaurantes() {
  const resposta = await fetch(`${API_URL}/restaurantes`);
  return resposta.json();
}

export async function criarRestaurante(
  nome,
  email,
  senha
) {
  const resposta = await fetch(
    `${API_URL}/restaurantes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        email,
        senha
      })
    }
  );

  return resposta.json();
}

export async function atualizarRestaurante(id, dados) {
  const resposta = await fetch(
    `${API_URL}/restaurantes/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    }
  );

  return resposta.ok;
}

export async function buscarRestaurantePorEmail(
  email
) {
  const resposta = await fetch(
    `${API_URL}/restaurantes?email=${email}`
  );

  const dados = await resposta.json();

  return dados[0];
}

export async function deletarRestaurante(id) {
  const resposta = await fetch(
    `${API_URL}/restaurantes/${id}`,
    {
      method: "DELETE"
    }
  );

  return resposta.ok;
}