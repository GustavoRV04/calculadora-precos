import { useState } from "react";
import { ArrowRight, CookingPot, LoaderCircle, LockKeyhole, Mail, Store } from "lucide-react";
import { cadastrarRestaurante, entrarNoRestaurante } from "../services/restauranteService";

export default function CommerceAccess({ onAuthenticated }) {
  const [modo, setModo] = useState("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function enviar(event) {
    event.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const sessao = modo === "cadastro"
        ? await cadastrarRestaurante({ nome: nome.trim(), email: email.trim(), senha })
        : await entrarNoRestaurante({ email: email.trim(), senha });
      onAuthenticated(sessao);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="access-screen">
      <section className="access-panel">
        <div className="access-brand"><span className="brand-mark brand-mark-large"><CookingPot size={24} strokeWidth={2.4} /></span><span className="brand-name">lucro<span>certo</span></span></div>
        <div className="access-heading"><p className="eyebrow">GESTÃO DE CUSTOS</p><h1>{modo === "cadastro" ? "Cadastre seu comércio" : "Acesse seu comércio"}</h1><p>Organize compras, receitas e custos em um só lugar.</p></div>
        <div className="access-switch" role="tablist" aria-label="Acesso ou cadastro">
          <button type="button" role="tab" aria-selected={modo === "entrar"} className={modo === "entrar" ? "active" : ""} onClick={() => { setModo("entrar"); setErro(""); }}>Entrar</button>
          <button type="button" role="tab" aria-selected={modo === "cadastro"} className={modo === "cadastro" ? "active" : ""} onClick={() => { setModo("cadastro"); setErro(""); }}>Criar comércio</button>
        </div>
        <form className="access-form" onSubmit={enviar}>
          {modo === "cadastro" && <label className="field-label">Nome do comércio<span className="input-wrap"><Store size={17} /><input autoComplete="organization" maxLength={100} required value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Ex.: Hamburgueria Artesanal" /></span></label>}
          <label className="field-label">E-mail<span className="input-wrap"><Mail size={17} /><input autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@comercio.com" /></span></label>
          <label className="field-label">Senha<span className="input-wrap"><LockKeyhole size={17} /><input autoComplete={modo === "cadastro" ? "new-password" : "current-password"} type="password" minLength={modo === "cadastro" ? 8 : undefined} required value={senha} onChange={(event) => setSenha(event.target.value)} placeholder={modo === "cadastro" ? "Mínimo de 8 caracteres" : "Sua senha"} /></span></label>
          {erro && <p className="form-error" role="alert">{erro}</p>}
          <button className="button-primary access-submit" type="submit" disabled={salvando}>{salvando ? <LoaderCircle className="spin" size={18} /> : <>{modo === "cadastro" ? "Criar comércio" : "Entrar"}<ArrowRight size={18} /></>}</button>
        </form>
        <p className="access-footnote">Cada comércio acessa seus próprios produtos, compras e pratos.</p>
      </section>
    </main>
  );
}