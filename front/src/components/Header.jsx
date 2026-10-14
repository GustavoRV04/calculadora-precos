import { CookingPot, LogOut, Store } from "lucide-react";

export default function Header({ restaurante, onLogout }) {
  return (
    <header className="topbar">
      <a className="brand" href="#inicio" aria-label="Lucro Certo, início">
        <span className="brand-mark"><CookingPot size={20} strokeWidth={2.4} /></span>
        <span className="brand-name">lucro<span>certo</span></span>
      </a>
      <div className="topbar-actions">
        <span className="commerce-chip"><Store size={16} aria-hidden="true" /><span>{restaurante?.nome}</span></span>
        <button className="icon-button logout-button" type="button" onClick={onLogout} aria-label="Sair do comércio" title="Sair"><LogOut size={18} /></button>
      </div>
    </header>
  );
}