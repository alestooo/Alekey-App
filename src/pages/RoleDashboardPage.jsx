import {
  AlertCircle,
  Box,
  Clock3,
  Plus,
  ShoppingCart,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  currency,
} from "../utils/formatters";

export default function RoleDashboardPage({
  ventas = [],
}) {
  const {
    profile,
    role,
  } = useAuth();

  const nombre =
    profile?.nombre ||
    "Usuario";

  const firstName =
    nombre
      .trim()
      .split(" ")[0];

  const today =
    new Intl.DateTimeFormat(
      "es-CR",
      {
        day:
          "numeric",

        month:
          "long",
      }
    ).format(
      new Date()
    );

  const pedidos =
    ventas.length;

  const piezas =
    ventas.reduce(
      (
        total,
        venta
      ) =>
        total +
        (
          venta.items ||
          []
        ).reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.cant ||
              0
            ),
          0
        ),
      0
    );

  const pendientes =
    ventas.reduce(
      (
        total,
        venta
      ) =>
        total +
        (
          venta.items ||
          []
        ).reduce(
          (
            sum,
            item
          ) =>
            sum +
            Number(
              item.pendiente ||
              0
            ),
          0
        ),
      0
    );

  /*
   * ========================================
   * USER - WAITING
   * ========================================
   */

  if (
    role ===
    "usuario"
  ) {
    return (
      <div
        className="
          max-w-6xl
          mx-auto

          p-4
          lg:p-8

          pb-28

          font-black
        "
      >
        <Hero
          name={
            firstName
          }
          date={
            today
          }
        />

        <section
          className="
            mt-7

            min-h-[300px]

            bg-white

            rounded-[2.5rem]

            border
            border-slate-100

            shadow-[0_16px_40px_rgba(15,23,42,0.07)]

            flex
            items-center
            justify-center

            p-8
          "
        >
          <div
            className="
              max-w-lg

              text-center
            "
          >
            <div
              className="
                w-16
                h-16

                mx-auto

                rounded-2xl

                bg-[#8ED4BE]/15
                text-[#58B99A]

                flex
                items-center
                justify-center
              "
            >
              <AlertCircle
                size={28}
              />
            </div>

            <h2
              className="
                mt-5

                text-xl
                italic
                uppercase

                text-slate-900
              "
            >
              Cuenta pendiente
              <span className="text-[#8ED4BE]">
                .
              </span>
            </h2>

            <p
              className="
                mt-3

                text-sm
                leading-6

                font-semibold

                text-slate-400
              "
            >
              Tu cuenta fue
              verificada
              correctamente.
              Espera a que uno de
              nuestros encargados
              revise y asigne los
              permisos
              correspondientes.
            </p>

            <p
              className="
                mt-2

                text-xs
                font-semibold

                text-slate-300
              "
            >
              Mientras tanto no
              tendrás acceso a la
              información
              administrativa de
              Alekey.
            </p>

            <Link
              to="/usuario"
              className="
                inline-flex

                mt-6

                px-6
                py-4

                rounded-2xl

                bg-slate-900
                text-white

                text-[8px]
                uppercase
                tracking-widest
              "
            >
              Mi cuenta
            </Link>
          </div>
        </section>
      </div>
    );
  }

  /*
   * ========================================
   * EMPLOYEE / SELLER
   * ========================================
   */

  return (
    <div
      className="
        max-w-7xl
        mx-auto

        p-4
        lg:p-8

        pb-28

        font-black
      "
    >
      <Hero
        name={
          firstName
        }
        date={
          today
        }
      />

      <QuickActions />

      {role ===
        "vendedor" && (
        <section
          className="
            mt-6

            grid
            grid-cols-1
            sm:grid-cols-3

            gap-4
          "
        >
          <MiniStat
            icon={
              ShoppingCart
            }
            label="Pedidos realizados"
            value={
              pedidos
            }
          />

          <MiniStat
            icon={Box}
            label="Piezas vendidas"
            value={
              piezas
            }
          />

          <MiniStat
            icon={
              Clock3
            }
            label="Piezas pendientes"
            value={
              pendientes
            }
          />
        </section>
      )}
    </div>
  );
}

function Hero({
  name,
  date,
}) {
  return (
    <section
      className="
        bg-slate-900

        rounded-[2.5rem]

        px-6
        py-7

        lg:px-10
        lg:py-9

        flex
        flex-col
        sm:flex-row

        sm:items-center
        sm:justify-between

        gap-5

        border
        border-slate-800
      "
    >
      <div>
        <h1
          className="
            text-3xl
            lg:text-4xl

            italic
            uppercase

            tracking-tighter

            text-white
          "
        >
          Hola, {name}
          <span className="text-[#8ED4BE]">
            .
          </span>
        </h1>

        <p
          className="
            mt-1

            text-[7px]

            uppercase
            tracking-[0.25em]

            text-slate-400
          "
        >
          Gestión Administrativa
          2026
        </p>
      </div>

      <div
        className="
          px-5
          py-3

          rounded-2xl

          border-b-2
          border-[#8ED4BE]

          text-center
        "
      >
        <p
          className="
            text-[6px]

            uppercase
            tracking-widest

            text-slate-500
          "
        >
          Hoy es
        </p>

        <p
          className="
            mt-1

            text-sm
            italic

            text-white
          "
        >
          {date}
        </p>
      </div>
    </section>
  );
}

function QuickActions() {
  return (
    <section
      className="
        mt-6

        bg-white

        rounded-[2rem]

        border
        border-slate-100

        shadow-[0_14px_34px_rgba(15,23,42,0.07)]

        p-5
      "
    >
      <h2
        className="
          text-sm
          italic
          uppercase

          text-slate-900
        "
      >
        Acciones rápidas
      </h2>

      <div
        className="
          mt-4

          grid
          grid-cols-1
          sm:grid-cols-3

          gap-3
        "
      >
        <QuickLink
          to="/cotizar"
          icon={Plus}
          label="Nueva venta"
        />

        <QuickLink
          to="/ventas"
          icon={
            ShoppingCart
          }
          label="Ventas"
        />

        <QuickLink
          to="/inventario"
          icon={Box}
          label="Stock"
        />
      </div>
    </section>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}) {
  return (
    <Link
      to={to}
      className="
        min-h-20

        px-4

        rounded-2xl

        bg-slate-50

        border
        border-slate-100

        flex
        items-center
        gap-3

        text-slate-600

        hover:bg-[#8ED4BE]/10
        hover:text-[#58B99A]

        transition-all
      "
    >
      <Icon
        size={19}
      />

      <span
        className="
          text-[8px]
          uppercase
          tracking-widest
        "
      >
        {label}
      </span>
    </Link>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <article
      className="
        bg-white

        rounded-[2rem]

        border
        border-slate-100

        shadow-[0_14px_34px_rgba(15,23,42,0.07)]

        p-5
      "
    >
      <div
        className="
          w-10
          h-10

          rounded-xl

          bg-[#8ED4BE]/15
          text-[#58B99A]

          flex
          items-center
          justify-center
        "
      >
        <Icon
          size={18}
        />
      </div>

      <p
        className="
          mt-4

          text-[7px]

          uppercase
          tracking-widest

          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1

          text-2xl
          italic

          text-slate-900
        "
      >
        {value}
      </p>
    </article>
  );
}