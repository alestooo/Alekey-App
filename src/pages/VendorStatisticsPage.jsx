import {
  Box,
  Clock3,
  Layers3,
  ShoppingCart,
} from "lucide-react";

export default function VendorStatisticsPage({
  ventas = [],
}) {
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

  const categorias =
    new Set(
      ventas.flatMap(
        (venta) =>
          (
            venta.items ||
            []
          )
            .map(
              (item) =>
                item.cat
            )
            .filter(
              Boolean
            )
      )
    ).size;

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
      <header>
        <h1
          className="
            text-3xl
            lg:text-4xl

            italic
            uppercase
            tracking-tighter

            text-slate-900
          "
        >
          Estadísticas
          <span className="text-[#8ED4BE]">
            .
          </span>
        </h1>

        <p
          className="
            mt-1

            text-[8px]

            uppercase
            tracking-widest

            text-slate-400
          "
        >
          Resumen operativo
        </p>
      </header>

      <section
        className="
          mt-6

          grid
          grid-cols-2
          lg:grid-cols-4

          gap-4
        "
      >
        <Card
          icon={
            ShoppingCart
          }
          label="Pedidos"
          value={
            pedidos
          }
        />

        <Card
          icon={Box}
          label="Piezas vendidas"
          value={
            piezas
          }
        />

        <Card
          icon={
            Clock3
          }
          label="Pendientes"
          value={
            pendientes
          }
        />

        <Card
          icon={
            Layers3
          }
          label="Categorías"
          value={
            categorias
          }
        />
      </section>

      <section
        className="
          mt-6

          bg-white

          rounded-[2rem]

          border
          border-slate-100

          shadow-[0_14px_34px_rgba(15,23,42,0.07)]

          p-6
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
          Resumen de actividad
        </h2>

        <p
          className="
            mt-2

            text-xs
            font-semibold

            text-slate-400
          "
        >
          Esta vista contiene
          únicamente estadísticas
          operativas.
        </p>
      </section>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
}) {
  return (
    <article
      className="
        bg-white

        rounded-[1.8rem]

        border
        border-slate-100

        shadow-[0_12px_28px_rgba(15,23,42,0.06)]

        p-5
      "
    >
      <Icon
        size={19}
        className="
          text-[#58B99A]
        "
      />

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