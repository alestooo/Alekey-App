import {
  BarChart3,
  Box,
  CircleHelp,
  Clock3,
  Home,
  Plus,
  Settings,
} from "lucide-react";

import NavItem from "./NavItem";
import UserMenu from "./UserMenu";

import AlertsMenu from "../common/AlertsMenu";

export default function Sidebar({
  ventas = [],
  inventarioCatalog = [],
}) {
  return (
    <aside
      className="
        hidden
        lg:flex
        w-[116px]
        shrink-0
        h-[100dvh]
        bg-white
        border-r
        border-slate-100
        flex-col
        items-center
        py-8
        z-50
      "
    >
      {/* LOGO */}

      <div
        className="
          w-[60px]
          h-[60px]
          rounded-[22px]
          bg-[#8ED4BE]
          text-slate-800
          flex
          items-center
          justify-center
          shadow-xl
          shadow-[#8ED4BE]/20
        "
      >
        <Box
          size={25}
          strokeWidth={2}
        />
      </div>

      {/* ALERTAS */}

      <div className="mt-5 mb-5">
        <AlertsMenu
          ventas={ventas}
          inventario={
            inventarioCatalog
          }
        />
      </div>

      {/* PRINCIPAL */}

      <nav
        className="
          flex
          flex-col
          items-center
          gap-3
          w-full
        "
      >
        <NavItem
          to="/"
          icon={Home}
          label="Home"
        />

        <NavItem
          to="/cotizar"
          icon={Plus}
          label="Nueva"
        />

        <NavItem
          to="/ventas"
          icon={Clock3}
          label="Ventas"
        />

        <NavItem
          to="/stats"
          icon={
            BarChart3
          }
          label="Stats"
        />

        <NavItem
          to="/inventario"
          icon={Box}
          label="Stock"
        />
      </nav>

      {/* SEPARADOR */}

      <div
        className="
          w-12
          h-px
          bg-slate-100
          my-5
        "
      />

      {/* UTILIDADES */}

      <nav
        className="
          flex
          flex-col
          items-center
          gap-3
          w-full
        "
      >
        <NavItem
          to="/ajustes"
          icon={Settings}
          label="Ajustes"
        />

        <NavItem
          to="/ayuda"
          icon={
            CircleHelp
          }
          label="Ayuda"
        />
      </nav>

      <div className="flex-1" />

      <UserMenu />
    </aside>
  );
}