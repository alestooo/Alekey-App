import {
  BarChart3,
  Box,
  Clock3,
  Package,
  Plus,
  Search,
  ShoppingCart,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useMemo,
} from "react";

import logoAlekey from "../assets/images/alekey-logo.jpeg";

import ScrollToTop from "../components/common/ScrollToTop";

import {
  currency,
} from "../utils/formatters";

/*
 * ========================================
 * HELPERS
 * ========================================
 */

const startOfDay = (
  date
) => {
  const copy =
    new Date(date);

  copy.setHours(
    0,
    0,
    0,
    0
  );

  return copy;
};

const getSaleDate = (
  venta
) => {
  if (
    venta.created_at
  ) {
    const parsed =
      new Date(
        venta.created_at
      );

    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {
      return parsed;
    }
  }

  /*
   * Compatibilidad con ventas
   * antiguas que solo tengan
   * fecha como dd/mm/yyyy.
   */

  if (
    venta.fecha
  ) {
    const parts =
      String(
        venta.fecha
      ).split("/");

    if (
      parts.length === 3
    ) {
      const [
        day,
        month,
        year,
      ] = parts.map(
        Number
      );

      const parsed =
        new Date(
          year,
          month - 1,
          day
        );

      if (
        !Number.isNaN(
          parsed.getTime()
        )
      ) {
        return parsed;
      }
    }
  }

  return null;
};

const tienePendientes = (
  venta
) => {
  return (
    venta.items || []
  ).some(
    (item) =>
      Number(
        item.pendiente
      ) > 0
  );
};

/*
 * ========================================
 * COMPONENTE
 * ========================================
 */

export default function DashboardPage({
  historial = [],
}) {
  const now =
    new Date();

  /*
   * ========================================
   * ESTADÍSTICAS GENERALES
   * ========================================
   */

  const stats =
    useMemo(() => {
      const totalVentas =
        historial.reduce(
          (
            total,
            venta
          ) =>
            total +
            (Number(
              venta.total
            ) || 0),
          0
        );

      const pedidos =
        historial.length;

      const piezasVendidas =
        historial.reduce(
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
                subtotal,
                item
              ) =>
                subtotal +
                (Number(
                  item.cant
                ) || 0),
              0
            ),
          0
        );

      const piezasPendientes =
        historial.reduce(
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
                subtotal,
                item
              ) =>
                subtotal +
                (Number(
                  item.pendiente
                ) || 0),
              0
            ),
          0
        );

      const pedidosPendientes =
        historial.filter(
          tienePendientes
        ).length;

      const pedidosListos =
        Math.max(
          0,
          pedidos -
            pedidosPendientes
        );

      const clientes =
        new Set(
          historial
            .map(
              (venta) =>
                venta.nombre
                  ?.trim()
                  .toLowerCase()
            )
            .filter(Boolean)
        ).size;

      const categorias =
        new Set(
          historial.flatMap(
            (venta) =>
              (
                venta.items ||
                []
              )
                .map(
                  (item) =>
                    item.cat
                )
                .filter(Boolean)
          )
        ).size;

      return {
        totalVentas,
        pedidos,
        piezasVendidas,
        piezasPendientes,
        pedidosPendientes,
        pedidosListos,
        clientes,
        categorias,
      };
    }, [
      historial,
    ]);

  /*
   * ========================================
   * ÚLTIMOS 7 DÍAS
   * ========================================
   */

  const chartData =
    useMemo(() => {
      return Array.from(
        {
          length: 7,
        },
        (
          _,
          index
        ) => {
          const date =
            new Date();

          date.setDate(
            date.getDate() -
              (6 - index)
          );

          const dayStart =
            startOfDay(
              date
            );

          const nextDay =
            new Date(
              dayStart
            );

          nextDay.setDate(
            nextDay.getDate() +
              1
          );

          const ventasDia =
            historial.filter(
              (venta) => {
                const saleDate =
                  getSaleDate(
                    venta
                  );

                if (
                  !saleDate
                ) {
                  return false;
                }

                return (
                  saleDate >=
                    dayStart &&
                  saleDate <
                    nextDay
                );
              }
            );

          const total =
            ventasDia.reduce(
              (
                sum,
                venta
              ) =>
                sum +
                (Number(
                  venta.total
                ) || 0),
              0
            );

          return {
            fecha:
              date.toLocaleDateString(
                "es-CR",
                {
                  day:
                    "2-digit",

                  month:
                    "short",
                }
              ),

            total,

            pedidos:
              ventasDia.length,
          };
        }
      );
    }, [
      historial,
    ]);

  /*
   * ========================================
   * TOP CLIENTE
   * ========================================
   */

  const topCliente =
    useMemo(() => {
      const clientes =
        new Map();

      historial.forEach(
        (venta) => {
          const nombre =
            venta.nombre?.trim();

          if (!nombre) {
            return;
          }

          const key =
            nombre.toLowerCase();

          const actual =
            clientes.get(
              key
            ) || {
              nombre,
              total: 0,
              pedidos: 0,
            };

          actual.total +=
            Number(
              venta.total
            ) || 0;

          actual.pedidos +=
            1;

          clientes.set(
            key,
            actual
          );
        }
      );

      return (
        [
          ...clientes.values(),
        ].sort(
          (a, b) =>
            b.total -
            a.total
        )[0] || null
      );
    }, [
      historial,
    ]);

  /*
   * ========================================
   * ÚLTIMOS PEDIDOS
   * ========================================
   */

  const ultimosPedidos =
    useMemo(() => {
      return [
        ...historial,
      ]
        .sort(
          (a, b) => {
            const dateA =
              getSaleDate(
                a
              );

            const dateB =
              getSaleDate(
                b
              );

            return (
              (dateB?.getTime() ||
                0) -
              (dateA?.getTime() ||
                0)
            );
          }
        )
        .slice(
          0,
          5
        );
    }, [
      historial,
    ]);

  /*
   * ========================================
   * RENDER
   * ========================================
   */

  return (
    <div
      className="
        p-4
        lg:p-8
        xl:p-10
        max-w-[1500px]
        mx-auto
        pb-28
        font-black
      "
    >
      <ScrollToTop />

      {/* ===================================
          HERO
      =================================== */}

      <section
        className="
          bg-white
          rounded-[3rem]
          shadow-xl
          border
          border-slate-50
          p-6
          lg:p-8
          xl:p-10
          mb-8

          flex
          flex-col
          lg:flex-row
          items-center
          justify-between
          gap-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-5
            w-full
            lg:w-auto
          "
        >
          <div
            className="
              w-16
              h-16
              lg:w-20
              lg:h-20
              rounded-[1.7rem]
              bg-slate-900
              p-2
              shadow-lg
              shrink-0
            "
          >
            <img
              src={
                logoAlekey
              }
              alt="Alekey"
              className="
                w-full
                h-full
                object-cover
                rounded-[1.2rem]
              "
            />
          </div>

          <div>
            <h1
              className="
                text-3xl
                lg:text-4xl
                xl:text-5xl
                italic
                uppercase
                tracking-tighter
                text-slate-900
              "
            >
              Hola, Alekey
              <span className="text-[#8ED4BE]">
                .
              </span>
            </h1>

            <p
              className="
                mt-1
                text-[9px]
                lg:text-[10px]
                uppercase
                tracking-[0.2em]
                text-slate-400
              "
            >
              Gestión
              Administrativa
              2026
            </p>
          </div>
        </div>

        <div
          className="
            bg-slate-50
            rounded-[1.8rem]
            px-6
            py-4
            text-center
            min-w-[180px]
            border-b-4
            border-[#8ED4BE]
          "
        >
          <p
            className="
              text-[8px]
              uppercase
              tracking-widest
              text-slate-400
            "
          >
            Hoy es
          </p>

          <p
            className="
              mt-1
              text-sm
              italic
              text-slate-800
            "
          >
            {now.toLocaleDateString(
              "es-CR",
              {
                day:
                  "numeric",

                month:
                  "long",
              }
            )}
          </p>
        </div>
      </section>

      {/* ===================================
          KPIs
      =================================== */}

      <section
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-5
          mb-8
        "
      >
        <DashboardStat
          icon={
            TrendingUp
          }
          label="Ventas Totales"
          value={currency(
            stats.totalVentas
          )}
          accent="mint"
        />

        <DashboardStat
          icon={Package}
          label="Piezas Pendientes"
          value={
            stats.piezasPendientes
          }
          accent="pink"
        />

        <DashboardStat
          icon={
            ShoppingCart
          }
          label="Pedidos Realizados"
          value={
            stats.pedidos
          }
          accent="yellow"
        />
      </section>

      {/* ===================================
          GRÁFICA + RESUMEN
      =================================== */}

      <section
        className="
          grid
          grid-cols-1
          xl:grid-cols-[2fr_1fr]
          gap-6
          mb-8
        "
      >
        {/* GRÁFICA */}

        <article
          className="
            bg-white
            rounded-[2.5rem]
            shadow-xl
            border
            border-slate-50
            p-5
            lg:p-7
          "
        >
          <div
            className="
              flex
              flex-col
              sm:flex-row
              justify-between
              items-start
              sm:items-center
              gap-3
              mb-6
            "
          >
            <div>
              <h2
                className="
                  text-lg
                  lg:text-xl
                  italic
                  uppercase
                  text-slate-800
                "
              >
                Ventas de los
                últimos 7 días
              </h2>

              <p
                className="
                  text-[8px]
                  uppercase
                  tracking-widest
                  text-slate-300
                  mt-1
                "
              >
                Ingresos por día
              </p>
            </div>

            <span
              className="
                px-4
                py-2
                bg-emerald-50
                text-emerald-500
                rounded-xl
                text-[9px]
                uppercase
                tracking-widest
              "
            >
              Últimos 7 días
            </span>
          </div>

          <div
            className="
              w-full
              h-[290px]
              lg:h-[330px]
            "
          >
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={
                  chartData
                }
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="dashboardSalesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#8ED4BE"
                      stopOpacity={
                        0.45
                      }
                    />

                    <stop
                      offset="95%"
                      stopColor="#8ED4BE"
                      stopOpacity={
                        0.02
                      }
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />

                <XAxis
                  dataKey="fecha"
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  tick={{
                    fill:
                      "#94A3B8",
                    fontSize: 10,
                  }}
                />

                <YAxis
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  width={65}
                  tick={{
                    fill:
                      "#94A3B8",
                    fontSize: 10,
                  }}
                  tickFormatter={(
                    value
                  ) =>
                    value >=
                    1000000
                      ? `C ${(
                          value /
                          1000000
                        ).toFixed(
                          1
                        )}M`
                      : value >=
                        1000
                      ? `C ${Math.round(
                          value /
                            1000
                        )}K`
                      : `C ${value}`
                  }
                />

                <Tooltip
                  content={
                    <DashboardTooltip />
                  }
                />

                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#58B99A"
                  strokeWidth={
                    3
                  }
                  fill="url(#dashboardSalesGradient)"
                  activeDot={{
                    r: 6,
                    strokeWidth:
                      3,
                    stroke:
                      "#FFFFFF",
                    fill:
                      "#58B99A",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* RESUMEN */}

        <article
          className="
            bg-white
            rounded-[2.5rem]
            shadow-xl
            border
            border-slate-50
            p-5
            lg:p-7
          "
        >
          <h2
            className="
              text-lg
              italic
              uppercase
              text-slate-800
              mb-6
            "
          >
            Resumen rápido
          </h2>

          <div className="space-y-3">
            <SummaryItem
              icon={
                ShoppingCart
              }
              label="Pedidos"
              value={
                stats.pedidos
              }
              color="mint"
            />

            <SummaryItem
              icon={Box}
              label="Piezas vendidas"
              value={
                stats.piezasVendidas
              }
              color="yellow"
            />

            <SummaryItem
              icon={Users}
              label="Clientes"
              value={
                stats.clientes
              }
              color="blue"
            />

            <SummaryItem
              icon={Package}
              label="Categorías vendidas"
              value={
                stats.categorias
              }
              color="purple"
            />
          </div>

          <Link
            to="/stats"
            className="
              mt-5
              w-full
              p-4
              rounded-2xl
              bg-slate-50
              text-[9px]
              uppercase
              tracking-widest
              text-slate-500
              flex
              items-center
              justify-between
              hover:bg-slate-900
              hover:text-white
              transition-all
            "
          >
            Ver más
            estadísticas

            <BarChart3
              size={15}
            />
          </Link>
        </article>
      </section>

      {/* ===================================
          ACCIONES RÁPIDAS
      =================================== */}

      <section
        className="
          bg-white
          rounded-[2.5rem]
          shadow-xl
          border
          border-slate-50
          p-5
          lg:p-7
          mb-8
        "
      >
        <h2
          className="
            text-lg
            italic
            uppercase
            text-slate-800
            mb-5
          "
        >
          Acciones rápidas
        </h2>

        <div
          className="
            grid
            grid-cols-2
            lg:grid-cols-4
            gap-4
          "
        >
          <QuickAction
            to="/cotizar"
            icon={Plus}
            title="Nueva Venta"
            subtitle="Crear cotización"
            primary
          />

          <QuickAction
            to="/inventario"
            icon={Box}
            title="Inventario"
            subtitle="Gestionar stock"
          />

          <QuickAction
            to="/ventas"
            icon={Search}
            title="Historial"
            subtitle="Ver pedidos"
          />

          <QuickAction
            to="/stats"
            icon={
              BarChart3
            }
            title="Estadísticas"
            subtitle="Ver métricas"
          />
        </div>
      </section>

      {/* ===================================
          INFERIOR
      =================================== */}

      <section
        className="
          grid
          grid-cols-1
          xl:grid-cols-[1fr_2fr]
          gap-6
        "
      >
        {/* ESTADO */}

        <article
          className="
            bg-white
            rounded-[2.5rem]
            shadow-xl
            border
            border-slate-50
            p-6
          "
        >
          <h2
            className="
              text-lg
              italic
              uppercase
              text-slate-800
              mb-6
            "
          >
            Estado de pedidos
          </h2>

          <div
            className="
              flex
              flex-col
              sm:flex-row
              xl:flex-col
              2xl:flex-row
              gap-6
              items-center
            "
          >
            <div
              className="
                w-36
                h-36
                rounded-full
                relative
                flex
                items-center
                justify-center
              "
              style={{
                background:
                  stats.pedidos >
                  0
                    ? `conic-gradient(
                        #8ED4BE 0 ${
                          (
                            stats.pedidosListos /
                            stats.pedidos
                          ) *
                          100
                        }%,
                        #F79598 ${
                          (
                            stats.pedidosListos /
                            stats.pedidos
                          ) *
                          100
                        }% 100%
                      )`
                    : "#F1F5F9",
              }}
            >
              <div
                className="
                  absolute
                  inset-[18px]
                  bg-white
                  rounded-full
                  flex
                  flex-col
                  items-center
                  justify-center
                "
              >
                <span
                  className="
                    text-2xl
                    italic
                    text-slate-900
                  "
                >
                  {
                    stats.pedidos
                  }
                </span>

                <span
                  className="
                    text-[8px]
                    uppercase
                    tracking-widest
                    text-slate-400
                  "
                >
                  Pedidos
                </span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-4">
              <OrderStatus
                color="bg-[#8ED4BE]"
                label="Listos"
                value={
                  stats.pedidosListos
                }
                total={
                  stats.pedidos
                }
              />

              <OrderStatus
                color="bg-[#F79598]"
                label="Pendientes"
                value={
                  stats.pedidosPendientes
                }
                total={
                  stats.pedidos
                }
              />
            </div>
          </div>

          {topCliente && (
            <div
              className="
                mt-6
                p-4
                rounded-2xl
                bg-emerald-50
                border
                border-emerald-100
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-emerald-500
                  mb-2
                "
              >
                <Trophy
                  size={15}
                />

                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-widest
                  "
                >
                  Top cliente
                </span>
              </div>

              <p
                className="
                  text-sm
                  italic
                  uppercase
                  text-slate-800
                  break-words
                "
              >
                {
                  topCliente.nombre
                }
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-slate-500
                "
              >
                {currency(
                  topCliente.total
                )}{" "}
                ·{" "}
                {
                  topCliente.pedidos
                }{" "}
                pedidos
              </p>
            </div>
          )}
        </article>

        {/* ÚLTIMOS PEDIDOS */}

        <article
          className="
            bg-white
            rounded-[2.5rem]
            shadow-xl
            border
            border-slate-50
            p-5
            lg:p-6
            overflow-hidden
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              mb-5
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-emerald-50
                  text-emerald-500
                  flex
                  items-center
                  justify-center
                "
              >
                <Clock3
                  size={18}
                />
              </div>

              <h2
                className="
                  text-lg
                  italic
                  uppercase
                  text-slate-800
                "
              >
                Últimos pedidos
              </h2>
            </div>

            <Link
              to="/ventas"
              className="
                px-4
                py-2
                bg-slate-50
                rounded-xl
                text-[8px]
                uppercase
                tracking-widest
                text-slate-500
                hover:bg-slate-900
                hover:text-white
                transition-all
              "
            >
              Ver todos
            </Link>
          </div>

          {ultimosPedidos.length ? (
            <div className="overflow-x-auto">
              <table
                className="
                  w-full
                  min-w-[650px]
                "
              >
                <thead>
                  <tr
                    className="
                      text-[8px]
                      uppercase
                      tracking-widest
                      text-slate-300
                      border-b
                      border-slate-100
                    "
                  >
                    <th className="text-left py-3">
                      Pedido
                    </th>

                    <th className="text-left py-3">
                      Cliente
                    </th>

                    <th className="text-right py-3">
                      Total
                    </th>

                    <th className="text-center py-3">
                      Estado
                    </th>

                    <th className="text-right py-3">
                      Fecha
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ultimosPedidos.map(
                    (venta) => {
                      const pendiente =
                        tienePendientes(
                          venta
                        );

                      return (
                        <tr
                          key={
                            venta.id
                          }
                          className="
                            border-b
                            border-slate-50
                            last:border-0
                          "
                        >
                          <td
                            className="
                              py-4
                              text-[10px]
                              text-slate-400
                            "
                          >
                            #
                            {
                              venta.id
                            }
                          </td>

                          <td
                            className="
                              py-4
                              text-[10px]
                              text-slate-700
                              uppercase
                            "
                          >
                            {
                              venta.nombre
                            }
                          </td>

                          <td
                            className="
                              py-4
                              text-right
                              text-[10px]
                              text-slate-700
                            "
                          >
                            {currency(
                              Number(
                                venta.total
                              ) ||
                                0
                            )}
                          </td>

                          <td className="py-4 text-center">
                            <span
                              className={`
                                inline-flex
                                items-center
                                gap-2
                                px-3
                                py-1.5
                                rounded-xl
                                text-[8px]
                                uppercase

                                ${
                                  pendiente
                                    ? "bg-red-50 text-[#F79598]"
                                    : "bg-emerald-50 text-emerald-500"
                                }
                              `}
                            >
                              <span
                                className={`
                                  w-1.5
                                  h-1.5
                                  rounded-full

                                  ${
                                    pendiente
                                      ? "bg-[#F79598]"
                                      : "bg-emerald-500"
                                  }
                                `}
                              />

                              {pendiente
                                ? "Pendiente"
                                : "Listo"}
                            </span>
                          </td>

                          <td
                            className="
                              py-4
                              text-right
                              text-[9px]
                              text-slate-400
                            "
                          >
                            {
                              venta.fecha
                            }
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className="
                py-16
                text-center
                text-slate-300
                uppercase
                italic
                text-sm
              "
            >
              No hay pedidos
              todavía
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

/*
 * ========================================
 * KPI
 * ========================================
 */

function DashboardStat({
  icon: Icon,
  label,
  value,
  accent,
}) {
  const styles = {
    mint: {
      line:
        "border-[#8ED4BE]",

      icon:
        "bg-emerald-50 text-emerald-400",
    },

    pink: {
      line:
        "border-[#F79598]",

      icon:
        "bg-red-50 text-[#F79598]",
    },

    yellow: {
      line:
        "border-[#C0C976]",

      icon:
        "bg-yellow-50 text-[#AEB64B]",
    },
  };

  const selected =
    styles[accent];

  return (
    <article
      className={`
        bg-white
        rounded-[2.5rem]
        shadow-xl
        border
        border-slate-50
        border-b-[8px]
        p-6
        lg:p-7

        ${selected.line}
      `}
    >
      <div
        className={`
          w-11
          h-11
          rounded-2xl
          flex
          items-center
          justify-center
          mb-5

          ${selected.icon}
        `}
      >
        <Icon
          size={20}
        />
      </div>

      <p
        className="
          text-[9px]
          uppercase
          tracking-[0.18em]
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-2xl
          lg:text-3xl
          italic
          text-slate-900
        "
      >
        {value}
      </p>
    </article>
  );
}

/*
 * ========================================
 * RESUMEN
 * ========================================
 */

function SummaryItem({
  icon: Icon,
  label,
  value,
  color,
}) {
  const colors = {
    mint:
      "bg-emerald-50 text-emerald-500",

    yellow:
      "bg-yellow-50 text-amber-500",

    blue:
      "bg-blue-50 text-blue-500",

    purple:
      "bg-purple-50 text-purple-500",
  };

  return (
    <div
      className="
        flex
        items-center
        gap-4
        p-4
        bg-slate-50
        rounded-2xl
      "
    >
      <div
        className={`
          w-11
          h-11
          rounded-xl
          flex
          items-center
          justify-center

          ${colors[color]}
        `}
      >
        <Icon
          size={19}
        />
      </div>

      <div>
        <p
          className="
            text-lg
            italic
            text-slate-900
          "
        >
          {value}
        </p>

        <p
          className="
            text-[9px]
            uppercase
            tracking-widest
            text-slate-400
          "
        >
          {label}
        </p>
      </div>
    </div>
  );
}

/*
 * ========================================
 * ACCIÓN RÁPIDA
 * ========================================
 */

function QuickAction({
  to,
  icon: Icon,
  title,
  subtitle,
  primary = false,
}) {
  return (
    <Link
      to={to}
      className={`
        p-5
        rounded-2xl
        min-h-[125px]
        flex
        flex-col
        justify-between
        transition-all
        hover:-translate-y-1
        hover:shadow-lg

        ${
          primary
            ? "bg-slate-900 text-white"
            : "bg-slate-50 text-slate-800"
        }
      `}
    >
      <div
        className={`
          w-11
          h-11
          rounded-xl
          flex
          items-center
          justify-center

          ${
            primary
              ? "bg-[#8ED4BE] text-slate-900"
              : "bg-white text-purple-500"
          }
        `}
      >
        <Icon
          size={20}
        />
      </div>

      <div>
        <p
          className="
            text-sm
            italic
            uppercase
          "
        >
          {title}
        </p>

        <p
          className={`
            text-[8px]
            uppercase
            tracking-widest
            mt-1

            ${
              primary
                ? "text-slate-400"
                : "text-slate-400"
            }
          `}
        >
          {subtitle}
        </p>
      </div>
    </Link>
  );
}

/*
 * ========================================
 * ESTADO PEDIDO
 * ========================================
 */

function OrderStatus({
  color,
  label,
  value,
  total,
}) {
  const percent =
    total > 0
      ? Math.round(
          (value /
            total) *
            100
        )
      : 0;

  return (
    <div
      className="
        flex
        items-center
        gap-3
      "
    >
      <span
        className={`
          w-3
          h-3
          rounded-full
          ${color}
        `}
      />

      <div className="flex-1">
        <div
          className="
            flex
            justify-between
            gap-3
          "
        >
          <span
            className="
              text-[10px]
              uppercase
              text-slate-500
            "
          >
            {label}
          </span>

          <span
            className="
              text-[10px]
              text-slate-700
            "
          >
            {percent}%
          </span>
        </div>

        <p
          className="
            text-[9px]
            text-slate-300
            mt-0.5
          "
        >
          {value} pedidos
        </p>
      </div>
    </div>
  );
}

/*
 * ========================================
 * TOOLTIP
 * ========================================
 */

function DashboardTooltip({
  active,
  payload,
  label,
}) {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  const data =
    payload[0]
      ?.payload;

  return (
    <div
      className="
        bg-slate-900
        text-white
        p-3
        rounded-xl
        shadow-xl
        border
        border-white/10
      "
    >
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
        className="
          text-sm
          italic
          text-[#8ED4BE]
          mt-1
        "
      >
        {currency(
          data?.total ||
            0
        )}
      </p>

      <p
        className="
          text-[8px]
          text-slate-400
          mt-1
        "
      >
        {
          data?.pedidos ||
          0
        }{" "}
        pedidos
      </p>
    </div>
  );
}