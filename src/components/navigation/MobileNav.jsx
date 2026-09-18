import {
  BarChart3,
  Box,
  Clock,
  Home,
  Plus,
} from "lucide-react";

import NavItem from "./NavItem";

export default function MobileNav() {
  return (
    <footer className="lg:hidden w-full bg-white border-t border-slate-100 flex items-center justify-around py-4 px-2 z-50 font-black">
      <nav className="flex w-full justify-around items-center">
        <NavItem
          to="/"
          icon={
            <Home size={22} />
          }
          label="Home"
          isMobile
        />

        <NavItem
          to="/cotizar"
          icon={
            <Plus size={22} />
          }
          label="Nueva"
          isMobile
        />

        <NavItem
          to="/ventas"
          icon={
            <Clock size={22} />
          }
          label="Ventas"
          isMobile
        />

        <NavItem
          to="/stats"
          icon={
            <BarChart3
              size={22}
            />
          }
          label="Stats"
          isMobile
        />

        <NavItem
          to="/inventario"
          icon={
            <Box size={22} />
          }
          label="Stock"
          isMobile
        />
      </nav>
    </footer>
  );
}