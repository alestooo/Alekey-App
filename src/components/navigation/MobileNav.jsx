import {
  BarChart3,
  Box,
  Clock3,
  Home,
  Plus,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  hasPermission,
  PERMISSIONS,
} from "../../constants/roles";

export default function MobileNav() {
  const {
    role,
  } = useAuth();

  const items = [
    {
      to:
        "/",

      label:
        "Home",

      icon:
        Home,

      show:
        true,

      end:
        true,
    },

    {
      to:
        "/cotizar",

      label:
        "Nueva",

      icon:
        Plus,

      show:
        hasPermission(
          role,
          PERMISSIONS
            .SALES_CREATE
        ),
    },

    {
      to:
        "/ventas",

      label:
        "Ventas",

      icon:
        Clock3,

      show:
        hasPermission(
          role,
          PERMISSIONS
            .SALES_VIEW
        ),
    },

    {
      to:
        "/stats",

      label:
        "Stats",

      icon:
        BarChart3,

      show:
        hasPermission(
          role,
          PERMISSIONS
            .STATS_VIEW
        ),
    },

    {
      to:
        "/inventario",

      label:
        "Stock",

      icon:
        Box,

      show:
        hasPermission(
          role,
          PERMISSIONS
            .INVENTORY_VIEW
        ),
    },
  ].filter(
    (item) =>
      item.show
  );

  return (
    <nav
      className="
        lg:hidden

        fixed
        bottom-0
        left-0
        right-0

        z-[80]

        h-16

        bg-white

        border-t
        border-slate-100

        shadow-[0_-10px_30px_rgba(15,23,42,0.08)]

        flex
        items-center
        justify-around

        px-2
      "
    >
      {items.map(
        ({
          to,
          label,
          icon: Icon,
          end,
        }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({
              isActive,
            }) => `
              min-w-[56px]

              px-3
              py-2

              rounded-2xl

              flex
              flex-col
              items-center
              justify-center

              gap-1

              transition-all

              ${
                isActive
                  ? "bg-[#8ED4BE]/15 text-[#58B99A]"
                  : "text-slate-400"
              }
            `}
          >
            <Icon
              size={19}
            />

            <span
              className="
                text-[6px]

                uppercase
                tracking-widest

                font-black
              "
            >
              {label}
            </span>
          </NavLink>
        )
      )}
    </nav>
  );
}