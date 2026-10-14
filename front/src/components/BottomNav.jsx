import { CookingPot, FileText, LayoutDashboard, PackageCheck } from "lucide-react";

const secoes = [
  { id: "dashboard", label: "Dashboard", Icone: LayoutDashboard },
  { id: "compras", label: "Compras", Icone: PackageCheck },
  { id: "montar", label: "Montar prato", Icone: CookingPot },
  { id: "ficha", label: "Ficha técnica", Icone: FileText },
];

export default function BottomNav({ secaoAtiva, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {secoes.map(({ id, label, Icone }) => (
        <button key={id} type="button" className={secaoAtiva === id ? "nav-item active" : "nav-item"} aria-current={secaoAtiva === id ? "page" : undefined} onClick={() => onNavigate(id)}>
          <Icone size={20} strokeWidth={secaoAtiva === id ? 2.4 : 1.8} /><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}