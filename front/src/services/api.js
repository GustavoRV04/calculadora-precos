const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const SESSION_KEY = "lucro-certo-session";

export function obterSessao() {
	try {
		return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null");
	} catch {
		localStorage.removeItem(SESSION_KEY);
		return null;
	}
}

export function salvarSessao(sessao) {
	localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
	return sessao;
}

export function limparSessao() {
	localStorage.removeItem(SESSION_KEY);
}

export async function requisicaoApi(caminho, opcoes = {}) {
	const { body, headers: cabecalhosOriginais, autenticada = true, ...opcoesFetch } = opcoes;
	const headers = new Headers(cabecalhosOriginais);
	const sessao = obterSessao();

	if (body !== undefined) headers.set("Content-Type", "application/json");
	if (autenticada && sessao?.token) {
		headers.set("Authorization", `Token ${sessao.token}`);
	}

	const resposta = await fetch(`${API_URL}${caminho}`, {
		...opcoesFetch,
		headers,
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	const dados = resposta.status === 204 ? null : await resposta.json();

	if (!resposta.ok) {
		const mensagem = dados?.detail ?? Object.values(dados ?? {}).flat().join(" ");
		const erro = new Error(mensagem || "Não foi possível concluir a operação.");
		erro.status = resposta.status;
		throw erro;
	}

	return dados;
}
