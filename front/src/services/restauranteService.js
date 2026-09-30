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

export async function buscarRestaurantePorEmail(
  email
) {

  const resposta = await fetch(
    `${API_URL}/restaurantes?email=${email}`
  );

  const dados = await resposta.json();

  return dados[0];
}