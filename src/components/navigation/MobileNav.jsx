import {
  BarChart3,
  Box,
  Clock3,
  Home,
  Plus,
} from "lucide-react";

import NavItem from "./NavItem";

export default function MobileNav() {
  return (
    <nav
      className="
        lg:hidden
        fixed
        bottom-0
        left-0
        right-0
        z-50
        bg-white/95
        backdrop-blur-xl
        border-t
        border-slate-100
        px-2
        pt-2
        pb-[max(0.5rem,env(safe-area-inset-bottom))]
        shadow-[0_-10px_40px_rgba(15,23,42,0.05)]
      "
    >
      <div
        className="
          max-w-lg
          mx-auto
          flex
          items-center
          gap-1
        "
      >
        <NavItem
          mobile
          to="/"
          icon={Home}
          label="Home"
        />

        <NavItem
          mobile
          to="/cotizar"
          icon={Plus}
          label="Nueva"
        />

        <NavItem
          mobile
          to="/ventas"
          icon={Clock3}
          label="Ventas"
        />

        <NavItem
          mobile
          to="/stats"
          icon={BarChart3}
          label="Stats"
        />

        <NavItem
          mobile
          to="/inventario"
          icon={Box}
          label="Stock"
        />
      </div>
    </nav>
  );
}