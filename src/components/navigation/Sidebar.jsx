import {
  BarChart3,
  Box,
  CircleHelp,
  Clock3,
  Home,
  Package,
  Plus,
  Settings,
  ShieldCheck,
} from "lucide-react";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  hasPermission,
  PERMISSIONS,
} from "../../constants/roles";

import NavItem from "./NavItem";
import UserMenu from "./UserMenu";

import AlertsMenu from "../common/AlertsMenu";

export default function Sidebar({
  ventas = [],
  inventarioCatalog = [],
}) {
  const {
    role,
  } = useAuth();

  const canSales =
    hasPermission(
      role,
      PERMISSIONS
        .SALES_VIEW
    );

  const canCreateSale =
    hasPermission(
      role,
      PERMISSIONS
        .SALES_CREATE
    );

  const canStats =
    hasPermission(
      role,
      PERMISSIONS
        .STATS_VIEW
    );

  const canInventory =
    hasPermission(
      role,
      PERMISSIONS
        .INVENTORY_VIEW
    );

  const canAdmin =
    hasPermission(
      role,
      PERMISSIONS
        .ADMIN_VIEW
    );

  const showAlerts =
    role !==
    "usuario";

  return (
    <aside
      className="
        hidden
        lg:flex

        w-32
        min-w-32

        h-[100dvh]

        bg-white

        border-r
        border-slate-100

        shadow-[8px_0_28px_rgba(15,23,42,0.04)]

        flex-col
        items-center

        py-7

        z-50

        font-black
      "
    >
      <div
        className="
          w-16
          h-16

          mb-7

          rounded-[1.8rem]

          bg-[#8ED4BE]

          shadow-lg
          shadow-[#8ED4BE]/25

          flex
          items-center
          justify-center

          text-slate-900
        "
      >
        <Package
          size={28}
        />
      </div>

      <nav
        className="
          w-full

          flex
          flex-col
          items-center

          gap-2

          px-2
        "
      >
        <NavItem
          to="/"
          end
          icon={
            <Home
              size={21}
            />
          }
          label="Home"
        />

        {canCreateSale && (
          <NavItem
            to="/cotizar"
            icon={
              <Plus
                size={21}
              />
            }
            label="Nueva"
          />
        )}

        {canSales && (
          <NavItem
            to="/ventas"
            icon={
              <Clock3
                size={21}
              />
            }
            label="Ventas"
          />
        )}

        {canStats && (
          <NavItem
            to="/stats"
            icon={
              <BarChart3
                size={21}
              />
            }
            label="Stats"
          />
        )}

        {canInventory && (
          <NavItem
            to="/inventario"
            icon={
              <Box
                size={21}
              />
            }
            label="Stock"
          />
        )}
      </nav>

      <div
        className="
          w-14
          h-px

          bg-slate-100

          my-4
        "
      />

      <nav
        className="
          w-full

          flex
          flex-col
          items-center

          gap-2

          px-2
        "
      >
        {canAdmin && (
          <NavItem
            to="/admin/usuarios"
            icon={
              <ShieldCheck
                size={21}
              />
            }
            label="Admin"
          />
        )}

        <NavItem
          to="/ajustes"
          icon={
            <Settings
              size={21}
            />
          }
          label="Ajustes"
        />

        <NavItem
          to="/ayuda"
          icon={
            <CircleHelp
              size={21}
            />
          }
          label="Ayuda"
        />
      </nav>

      <div
        className="
          mt-auto

          w-full

          px-3

          flex
          flex-col
          items-center

          gap-3
        "
      >
        {showAlerts && (
          <AlertsMenu
            ventas={
              ventas
            }
            inventarioCatalog={
              inventarioCatalog
            }
          />
        )}

        <UserMenu />
      </div>
    </aside>
  );
}