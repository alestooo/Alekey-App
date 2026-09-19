import {
  AlertTriangle,
  Box,
  Layers3,
  Plus,
  Search,
  Tags,
} from "lucide-react";

export default function InventoryFilters({
  categorias = [],
  categoryCounts = {},

  catFiltro,
  orden,
  busqueda,

  resumen,

  showAllStats = true,

  itemsPerPage,

  onAdd,
  onCategoryChange,
  onSearchChange,
  onOrderChange,
  onItemsPerPageChange,
}) {
  return (
    <div className="mb-8">
      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          justify-between
          gap-5
          mb-7
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
              text-slate-900
            "
          >
            Inventario
            Alekey
            <span className="text-[#C0C976]">
              .
            </span>
          </h1>

          <p
            className="
              mt-1
              text-[9px]
              uppercase
              tracking-[0.18em]
              text-slate-400
            "
          >
            Control de stock en
            tiempo real
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="
            px-6
            py-4
            bg-[#C0C976]
            text-slate-900
            rounded-2xl

            shadow-[0_12px_28px_rgba(15,23,42,0.10)]

            flex
            items-center
            justify-center
            gap-2
            text-[10px]
            uppercase
            tracking-wide
            hover:scale-105
            hover:shadow-xl
            transition-all
          "
        >
          <Plus
            size={18}
          />

          Agregar Item
        </button>
      </div>

      {/* MÉTRICAS */}

      <div
        className={`
          grid
          grid-cols-2
          gap-3
          lg:gap-4
          mb-7

          ${
            showAllStats
              ? "xl:grid-cols-4"
              : "xl:grid-cols-2"
          }
        `}
      >
        <InventoryStat
          icon={Box}
          label="Total de Items"
          value={
            resumen.totalItems
          }
          color="dark"
        />

        {showAllStats && (
          <InventoryStat
            icon={Tags}
            label="Categorías"
            value={
              resumen.totalCategorias
            }
            color="mint"
          />
        )}

        <InventoryStat
          icon={
            Layers3
          }
          label="Unidades Totales"
          value={
            resumen.totalStock
          }
          color="green"
        />

        {showAllStats && (
          <InventoryStat
            icon={
              AlertTriangle
            }
            label="Stock Bajo"
            value={
              resumen.stockBajo
            }
            color="red"
            subtitle="Requieren reposición"
          />
        )}
      </div>

      {/* BUSCADOR + ORDEN */}

      <div
        className="
          flex
          flex-col
          lg:flex-row
          gap-3
          mb-5
        "
      >
        <div
          className="
            relative
            flex-1
          "
        >
          <Search
            size={18}
            className="
              absolute
              left-5
              top-1/2
              -translate-y-1/2
              text-slate-300
            "
          />

          <input
            type="text"
            value={
              busqueda
            }
            placeholder="Buscar producto o categoría..."
            onChange={(
              event
            ) =>
              onSearchChange(
                event.target
                  .value
              )
            }
            className="
              w-full
              h-14
              pl-13
              pr-5
              bg-white
              border
              border-slate-100
              rounded-2xl

              shadow-[0_9px_24px_rgba(15,23,42,0.065)]

              text-xs
              text-slate-700
              outline-none
              focus:border-[#C0C976]
            "
          />
        </div>

        <div
          className="
            flex
            gap-2
          "
        >
          <button
            type="button"
            onClick={() =>
              onOrderChange(
                "alfabetico"
              )
            }
            className={`
              px-5
              h-14
              rounded-2xl
              text-[9px]
              uppercase
              tracking-wide
              transition-all

              shadow-[0_8px_20px_rgba(15,23,42,0.055)]

              ${
                orden ===
                "alfabetico"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-400 border border-slate-100"
              }
            `}
          >
            Alfabético
          </button>

          <button
            type="button"
            onClick={() =>
              onOrderChange(
                "cantidad"
              )
            }
            className={`
              px-5
              h-14
              rounded-2xl
              text-[9px]
              uppercase
              tracking-wide
              transition-all

              shadow-[0_8px_20px_rgba(15,23,42,0.055)]

              ${
                orden ===
                "cantidad"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-400 border border-slate-100"
              }
            `}
          >
            Cantidad
          </button>
        </div>
      </div>

      {/* CATEGORÍAS */}

      <div
        className="
          overflow-x-auto
          pb-3
          [&::-webkit-scrollbar]:h-2
          [&::-webkit-scrollbar-track]:bg-slate-100
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-[#DDAEB5]
          [&::-webkit-scrollbar-thumb]:rounded-full
        "
      >
        <div
          className="
            flex
            gap-2
            min-w-max
          "
        >
          {categorias.map(
            (categoria) => {
              const active =
                catFiltro ===
                categoria;

              const count =
                categoria ===
                "Todo"
                  ? resumen.totalItems
                  : categoryCounts[
                      categoria
                    ] || 0;

              return (
                <button
                  type="button"
                  key={
                    categoria
                  }
                  onClick={() =>
                    onCategoryChange(
                      categoria
                    )
                  }
                  className={`
                    h-11
                    px-5
                    rounded-xl
                    border
                    text-[8px]
                    uppercase
                    tracking-wide
                    whitespace-nowrap
                    transition-all

                    shadow-[0_5px_14px_rgba(15,23,42,0.035)]

                    ${
                      active
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-700"
                    }
                  `}
                >
                  {categoria}

                  <span
                    className={`
                      ml-2

                      ${
                        active
                          ? "text-[#C0C976]"
                          : "text-slate-300"
                      }
                    `}
                  >
                    ({categoria ===
                    "Todo"
                      ? categoryCounts[
                          categoria
                        ] ??
                        Object.values(
                          categoryCounts
                        ).reduce(
                          (
                            total,
                            value
                          ) =>
                            total +
                            value,
                          0
                        )
                      : count}
                    )
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* ITEMS / PÁGINA */}

      <div
        className="
          mt-3
          flex
          justify-end
          items-center
          gap-3
        "
      >
        <span
          className="
            text-[8px]
            uppercase
            tracking-widest
            text-slate-300
          "
        >
          Items por página
        </span>

        <select
          value={
            itemsPerPage
          }
          onChange={(
            event
          ) =>
            onItemsPerPageChange(
              Number(
                event.target
                  .value
              )
            )
          }
          className="
            h-10
            px-3
            bg-white
            border
            border-slate-100
            rounded-xl

            shadow-[0_6px_16px_rgba(15,23,42,0.045)]

            text-[9px]
            text-slate-600
            outline-none
          "
        >
          <option value={12}>
            12
          </option>

          <option value={20}>
            20
          </option>

          <option value={28}>
            28
          </option>
        </select>
      </div>
    </div>
  );
}

function InventoryStat({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}) {
  const colors = {
    dark: {
      icon:
        "bg-[#8ED4BE]/20 text-slate-900",

      value:
        "text-slate-900",
    },

    mint: {
      icon:
        "bg-emerald-50 text-emerald-500",

      value:
        "text-slate-900",
    },

    green: {
      icon:
        "bg-[#8ED4BE]/20 text-[#58B99A]",

      value:
        "text-[#58B99A]",
    },

    red: {
      icon:
        "bg-red-50 text-[#F79598]",

      value:
        "text-[#F79598]",
    },
  };

  const selected =
    colors[color];

  return (
    <article
      className="
        bg-white

        p-4
        lg:p-5

        rounded-[1.6rem]

        shadow-[0_14px_34px_rgba(15,23,42,0.085),0_4px_12px_rgba(15,23,42,0.04)]

        border
        border-slate-50

        flex
        items-center
        gap-3
      "
    >
      <div
        className={`
          w-11
          h-11
          rounded-2xl
          flex
          items-center
          justify-center
          shrink-0

          ${selected.icon}
        `}
      >
        <Icon
          size={19}
        />
      </div>

      <div className="min-w-0">
        <p
          className="
            text-[8px]
            uppercase
            tracking-widest
            text-slate-400
          "
        >
          {label}
        </p>

        <p
          className={`
            text-xl
            lg:text-2xl
            italic
            mt-0.5

            ${selected.value}
          `}
        >
          {value}
        </p>

        {subtitle && (
          <p
            className="
              text-[7px]
              text-slate-300
              mt-0.5
            "
          >
            {subtitle}
          </p>
        )}
      </div>
    </article>
  );
}