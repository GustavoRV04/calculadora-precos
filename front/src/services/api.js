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
	let dados = null;
	if (resposta.status !== 204) {
		const contentType = resposta.headers.get("content-type") ?? "";
		if (contentType.includes("json")) {
			try {
				dados = await resposta.json();
			} catch {
				if (resposta.ok) {
					throw new Error("A API retornou uma resposta inválida. Tente novamente.");
				}
			}
		} else if (resposta.ok) {
			throw new Error("A API retornou uma resposta inesperada. Tente novamente.");
		}
	}

	if (!resposta.ok) {
		const mensagem = dados?.detail ?? Object.values(dados ?? {}).flat().join(" ");
		const mensagemPadrao = resposta.status >= 500
			? `O servidor está temporariamente indisponível (HTTP ${resposta.status}). Tente novamente em instantes.`
			: `Não foi possível concluir a operação (HTTP ${resposta.status}).`;
		const erro = new Error(mensagem || mensagemPadrao);
		erro.status = resposta.status;
		throw erro;
	}

	return dados;
}
