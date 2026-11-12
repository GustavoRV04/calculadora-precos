import { CookingPot, LogOut, Moon, Store, Sun } from "lucide-react";

export default function Header({ restaurante, onLogout, temaEscuro, onToggleTema }) {
  return (
    <header className="topbar">
      <a className="brand" href="#inicio" aria-label="Lucro Certo, início">
        <span className="brand-mark"><CookingPot size={20} strokeWidth={2.4} /></span>
        <span className="brand-name">lucro<span>certo</span></span>
      </a>
      <div className="topbar-actions">
        <button className="icon-button" type="button" onClick={onToggleTema} aria-label={temaEscuro ? "Ativar modo claro" : "Ativar modo escuro"} title={temaEscuro ? "Modo claro" : "Modo escuro"}>{temaEscuro ? <Sun size={18} /> : <Moon size={18} />}</button>
        <span className="commerce-chip"><Store size={16} aria-hidden="true" /><span>{restaurante?.nome}</span></span>
        <button className="icon-button logout-button" type="button" onClick={onLogout} aria-label="Sair do comércio" title="Sair"><LogOut size={18} /></button>
      </div>
    </header>
  );
}
