import {
  BarChart3,
  Box,
  Clock,
  Home,
  Package,
  Plus,
} from "lucide-react";

import NavItem from "./NavItem";

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-32 bg-white border-r border-slate-100 flex-col items-center py-10 gap-8 z-50 font-black">
      {/* LOGO / ICONO */}
      <div className="w-16 h-16 bg-[#8ED4BE] rounded-[1.8rem] items-center justify-center shadow-lg shadow-[#8ED4BE]/30 mb-6 flex">
        <Package
          className="text-slate-800"
          size={28}
        />
      </div>

      {/* NAVEGACIÓN */}
      <nav className="flex flex-col gap-8 justify-center w-full">
        <NavItem
          to="/"
          icon={
            <Home size={24} />
          }
          label="Home"
        />

        <NavItem
          to="/cotizar"
          icon={
            <Plus size={24} />
          }
          label="Nueva"
        />

        <NavItem
          to="/ventas"
          icon={
            <Clock size={24} />
          }
          label="Ventas"
        />

        <NavItem
          to="/stats"
          icon={
            <BarChart3
              size={24}
            />
          }
          label="Stats"
        />

        <NavItem
          to="/inventario"
          icon={
            <Box size={24} />
          }
          label="Stock"
        />
      </nav>

      {/* USUARIO */}
      <div className="mt-auto p-4 flex flex-col items-center gap-2">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-bold text-[#8ED4BE] text-xs">
          IV
        </div>
      </div>
    </aside>
  );
}