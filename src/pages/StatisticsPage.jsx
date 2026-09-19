import {
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  Box,
  CalendarDays,
  Clock3,
  Package,
  ShoppingCart,
  Star,
  TrendingUp,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ScrollToTop from "../components/common/ScrollToTop";

import {
  currency,
} from "../utils/formatters";

/*
 * ========================================
 * CONFIGURACIÓN
 * ========================================
 */

const PERIODOS = [
  {
    id: "7d",
    label: "7D",
    days: 7,
  },
  {
    id: "30d",
    label: "30D",
    days: 30,
  },
  {
    id: "3m",
    label: "3M",
    days: 90,
  },
  {
    id: "1a",
    label: "1A",
    days: 365,
  },
  {
    id: "todo",
    label: "Todo",
    days: null,
  },
];

const PIE_COLORS = [
  "#8ED4BE",
  "#F79598",
];

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
  /*
   * Preferimos created_at
   * porque tiene fecha y hora
   * real de Supabase.
   */

  if (
    venta?.created_at
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
   * Compatibilidad con:
   * 18/9/2026
   * 18/09/2026
   */

  if (venta?.fecha) {
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

const getPeriodStart = (
  periodo
) => {
  const config =
    PERIODOS.find(
      (item) =>
        item.id ===
        periodo
    );

  if (
    !config ||
    config.days === null
  ) {
    return null;
  }

  const start =
    startOfDay(
      new Date()
    );

  start.setDate(
    start.getDate() -
      (config.days - 1)
  );

  return start;
};

const formatShortDate = (
  date
) => {
  return date.toLocaleDateString(
    "es-CR",
    {
      day: "2-digit",
      month: "short",
    }
  );
};

/*
 * ========================================
 * PÁGINA
 * ========================================
 */

export default function StatisticsPage({
  ventas = [],
}) {
  const [
    periodo,
    setPeriodo,
  ] = useState("30d");

  /*
   * ========================================
   * FILTRO TEMPORAL
   * ========================================
   */

  const ventasFiltradas =
    useMemo(() => {
      const start =
        getPeriodStart(
          periodo
        );

      if (!start) {
        return ventas;
      }

      return ventas.filter(
        (venta) => {
          const date =
            getSaleDate(
              venta
            );

          return (
            date &&
            date >= start
          );
        }
      );
    }, [
      ventas,
      periodo,
    ]);

  /*
   * ========================================
   * ESTADÍSTICAS GENERALES
   * ========================================
   */

  const stats =
    useMemo(() => {
      let ingresos = 0;

      let piezas = 0;

      let piezasPendientes =
        0;

      const clientes =
        new Set();

      const categorias =
        new Set();

      ventasFiltradas.forEach(
        (venta) => {
          ingresos +=
            Number(
              venta.total
            ) || 0;

          if (
            venta.nombre
          ) {
            clientes.add(
              venta.nombre
                .trim()
                .toLowerCase()
            );
          }

          (
            venta.items ||
            []
          ).forEach(
            (item) => {
              piezas +=
                Number(
                  item.cant
                ) || 0;

              piezasPendientes +=
                Number(
                  item.pendiente
                ) || 0;

              if (
                item.cat
              ) {
                categorias.add(
                  item.cat
                );
              }
            }
          );
        }
      );

      const pedidos =
        ventasFiltradas.length;

      const pedidosPendientes =
        ventasFiltradas.filter(
          tienePendientes
        ).length;

      const pedidosListos =
        Math.max(
          0,
          pedidos -
            pedidosPendientes
        );

      return {
        ingresos,
        piezas,
        piezasPendientes,
        pedidos,
        pedidosPendientes,
        pedidosListos,
        clientes:
          clientes.size,
        categorias:
          categorias.size,
      };
    }, [
      ventasFiltradas,
    ]);

  /*
   * ========================================
   * TOP CLIENTES
   * ========================================
   */

  const rankingClientes =
    useMemo(() => {
      const map =
        new Map();

      ventasFiltradas.forEach(
        (venta) => {
          const nombre =
            venta.nombre
              ?.trim();

          if (!nombre) {
            return;
          }

          const key =
            nombre.toLowerCase();

          const actual =
            map.get(key) || {
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

          map.set(
            key,
            actual
          );
        }
      );

      return [
        ...map.values(),
      ].sort(
        (a, b) =>
          b.total -
          a.total
      );
    }, [
      ventasFiltradas,
    ]);

  const topCliente =
    rankingClientes[0] ||
    null;

  /*
   * ========================================
   * RANKING TEMAS
   * ========================================
   */

  const rankingTemas =
    useMemo(() => {
      const map =
        new Map();

      ventasFiltradas.forEach(
        (venta) => {
          (
            venta.items ||
            []
          ).forEach(
            (item) => {
              const tema =
                item.tema
                  ?.trim();

              if (!tema) {
                return;
              }

              const key =
                tema.toLowerCase();

              const actual =
                map.get(
                  key
                ) || {
                  nombre:
                    tema,

                  cantidad:
                    0,
                };

              actual.cantidad +=
                Number(
                  item.cant
                ) || 0;

              map.set(
                key,
                actual
              );
            }
          );
        }
      );

      return [
        ...map.values(),
      ]
        .sort(
          (a, b) =>
            b.cantidad -
            a.cantidad
        )
        .slice(
          0,
          5
        );
    }, [
      ventasFiltradas,
    ]);

  /*
   * ========================================
   * RANKING CATEGORÍAS
   * ========================================
   */

  const rankingCategorias =
    useMemo(() => {
      const map =
        new Map();

      ventasFiltradas.forEach(
        (venta) => {
          (
            venta.items ||
            []
          ).forEach(
            (item) => {
              const categoria =
                item.cat
                  ?.trim();

              if (
                !categoria
              ) {
                return;
              }

              const key =
                categoria.toLowerCase();

              const actual =
                map.get(
                  key
                ) || {
                  nombre:
                    categoria,

                  cantidad:
                    0,
                };

              actual.cantidad +=
                Number(
                  item.cant
                ) || 0;

              map.set(
                key,
                actual
              );
            }
          );
        }
      );

      return [
        ...map.values(),
      ]
        .sort(
          (a, b) =>
            b.cantidad -
            a.cantidad
        )
        .slice(
          0,
          5
        );
    }, [
      ventasFiltradas,
    ]);

  /*
   * ========================================
   * GRÁFICA PRINCIPAL
   * ========================================
   */

  const ventasChart =
    useMemo(() => {
      if (
        !ventasFiltradas.length
      ) {
        return [];
      }

      const porDia =
        new Map();

      ventasFiltradas.forEach(
        (venta) => {
          const date =
            getSaleDate(
              venta
            );

          if (!date) {
            return;
          }

          const day =
            startOfDay(
              date
            );

          const key =
            day.toISOString();

          const actual =
            porDia.get(
              key
            ) || {
              date: day,
              ingresos: 0,
              pedidos: 0,
            };

          actual.ingresos +=
            Number(
              venta.total
            ) || 0;

          actual.pedidos +=
            1;

          porDia.set(
            key,
            actual
          );
        }
      );

      let rows = [
        ...porDia.values(),
      ].sort(
        (a, b) =>
          a.date -
          b.date
      );

      /*
       * Cuando mostramos TODO
       * y hay demasiados días,
       * agrupamos por mes para
       * que la gráfica siga legible.
       */

      if (
        periodo ===
          "todo" &&
        rows.length > 60
      ) {
        const porMes =
          new Map();

        rows.forEach(
          (row) => {
            const monthKey =
              `${row.date.getFullYear()}-${row.date.getMonth()}`;

            const actual =
              porMes.get(
                monthKey
              ) || {
                date:
                  new Date(
                    row.date.getFullYear(),
                    row.date.getMonth(),
                    1
                  ),

                ingresos: 0,
                pedidos: 0,
              };

            actual.ingresos +=
              row.ingresos;

            actual.pedidos +=
              row.pedidos;

            porMes.set(
              monthKey,
              actual
            );
          }
        );

        rows = [
          ...porMes.values(),
        ].sort(
          (a, b) =>
            a.date -
            b.date
        );

        return rows.map(
          (row) => ({
            fecha:
              row.date.toLocaleDateString(
                "es-CR",
                {
                  month:
                    "short",
                  year:
                    "2-digit",
                }
              ),

            ingresos:
              row.ingresos,

            pedidos:
              row.pedidos,
          })
        );
      }

      return rows.map(
        (row) => ({
          fecha:
            formatShortDate(
              row.date
            ),

          ingresos:
            row.ingresos,

          pedidos:
            row.pedidos,
        })
      );
    }, [
      ventasFiltradas,
      periodo,
    ]);

  /*
   * ========================================
   * ÚLTIMOS 10 DÍAS CON VENTAS
   * ========================================
   */

  const flujoDinero =
    useMemo(() => {
      return ventasChart.slice(
        -10
      );
    }, [
      ventasChart,
    ]);

  /*
   * ========================================
   * ESTADO DE PEDIDOS
   * ========================================
   */

  const estadoPedidos =
    useMemo(() => {
      return [
        {
          name: "Listos",
          value:
            stats.pedidosListos,
        },
        {
          name: "Pendientes",
          value:
            stats.pedidosPendientes,
        },
      ];
    }, [
      stats,
    ]);

  /*
   * ========================================
   * ÚLTIMOS PEDIDOS
   * ========================================
   */

  const ultimosPedidos =
    useMemo(() => {
      return [
        ...ventasFiltradas,
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
      ventasFiltradas,
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
          HEADER + PERÍODO
      =================================== */}

      <header
        className="
          mb-8
          flex
          flex-col
          xl:flex-row
          xl:items-center
          justify-between
          gap-5
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
            Métricas Alekey
            <span className="text-[#8ED4BE]">
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
            Análisis y
            estadísticas de
            ventas
          </p>
        </div>

        <div
          className="
            bg-white
            p-2
            rounded-2xl
            shadow-lg
            border
            border-slate-100

            flex
            items-center
            gap-1
            flex-wrap
          "
        >
          <div
            className="
              px-3
              text-slate-300
            "
          >
            <CalendarDays
              size={17}
            />
          </div>

          {PERIODOS.map(
            (item) => (
              <button
                type="button"
                key={
                  item.id
                }
                onClick={() =>
                  setPeriodo(
                    item.id
                  )
                }
                className={`
                  px-4
                  py-3
                  rounded-xl
                  text-[9px]
                  uppercase
                  tracking-widest
                  transition-all

                  ${
                    periodo ===
                    item.id
                      ? "bg-[#58B99A] text-white shadow-lg"
                      : "text-slate-400 hover:bg-slate-50"
                  }
                `}
              >
                {
                  item.label
                }
              </button>
            )
          )}
        </div>
      </header>

      {/* ===================================
          KPIs
      =================================== */}

      <section
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-5
          mb-7
        "
      >
        <MetricCard
          icon={
            TrendingUp
          }
          title="Ingresos"
          value={currency(
            stats.ingresos
          )}
          color="mint"
        />

        <MetricCard
          icon={Clock3}
          title="Pendientes"
          value={
            stats.piezasPendientes
          }
          color="pink"
          subtitle={`${stats.pedidosPendientes} pedidos`}
        />

        <MetricCard
          icon={Box}
          title="Piezas"
          value={
            stats.piezas
          }
          color="yellow"
        />

        <MetricCard
          icon={
            UserRound
          }
          title="Top Cliente"
          value={
            topCliente?.nombre ||
            "Sin datos"
          }
          color="purple"
          textValue
          subtitle={
            topCliente
              ? currency(
                  topCliente.total
                )
              : ""
          }
        />
      </section>

      {/* ===================================
          GRÁFICA + RESUMEN + ESTADO
      =================================== */}

      <section
        className="
          grid
          grid-cols-1
          xl:grid-cols-[1.55fr_0.8fr_0.9fr]
          gap-6
          mb-7
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
              justify-between
              items-start
              gap-4
              mb-6
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <TrendingUp
                  size={18}
                  className="text-[#58B99A]"
                />

                <h2
                  className="
                    text-lg
                    italic
                    uppercase
                    text-slate-800
                  "
                >
                  Ventas en el
                  tiempo
                </h2>
              </div>

              <p
                className="
                  mt-1
                  text-[8px]
                  uppercase
                  tracking-widest
                  text-slate-300
                "
              >
                Según el período
                seleccionado
              </p>
            </div>

            <span
              className="
                bg-emerald-50
                text-emerald-500
                px-3
                py-2
                rounded-xl
                text-[8px]
                uppercase
                tracking-widest
              "
            >
              {
                PERIODOS.find(
                  (item) =>
                    item.id ===
                    periodo
                )?.label
              }
            </span>
          </div>

          <div
            className="
              w-full
              h-[300px]
            "
          >
            {ventasChart.length ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={
                    ventasChart
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
                      id="statsAreaGradient"
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
                    minTickGap={
                      25
                    }
                    tick={{
                      fontSize: 9,
                      fill:
                        "#94A3B8",
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
                      fontSize: 9,
                      fill:
                        "#94A3B8",
                    }}
                    tickFormatter={
                      formatChartCurrency
                    }
                  />

                  <Tooltip
                    content={
                      <StatsTooltip />
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#58B99A"
                    strokeWidth={
                      3
                    }
                    fill="url(#statsAreaGradient)"
                    activeDot={{
                      r: 6,
                      fill:
                        "#58B99A",
                      stroke:
                        "#FFFFFF",
                      strokeWidth:
                        3,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
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
            lg:p-6
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              mb-5
            "
          >
            <BarChart3
              size={18}
              className="text-[#58B99A]"
            />

            <h2
              className="
                text-lg
                italic
                uppercase
                text-slate-800
              "
            >
              Resumen rápido
            </h2>
          </div>

          <div className="space-y-3">
            <QuickStat
              icon={
                ShoppingCart
              }
              label="Pedidos"
              value={
                stats.pedidos
              }
              color="mint"
            />

            <QuickStat
              icon={Package}
              label="Piezas vendidas"
              value={
                stats.piezas
              }
              color="yellow"
            />

            <QuickStat
              icon={Users}
              label="Clientes"
              value={
                stats.clientes
              }
              color="blue"
            />

            <QuickStat
              icon={Box}
              label="Categorías"
              value={
                stats.categorias
              }
              color="purple"
            />
          </div>
        </article>

        {/* ESTADO */}

        <article
          className="
            bg-white
            rounded-[2.5rem]
            shadow-xl
            border
            border-slate-50
            p-5
            lg:p-6
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              mb-5
            "
          >
            <Package
              size={18}
              className="text-purple-500"
            />

            <h2
              className="
                text-lg
                italic
                uppercase
                text-slate-800
              "
            >
              Estado de pedidos
            </h2>
          </div>

          <div
            className="
              h-[190px]
              relative
            "
          >
            {stats.pedidos >
            0 ? (
              <>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        estadoPedidos
                      }
                      dataKey="value"
                      nameKey="name"
                      innerRadius={
                        55
                      }
                      outerRadius={
                        75
                      }
                      paddingAngle={
                        2
                      }
                      stroke="none"
                    >
                      {estadoPedidos.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={
                              entry.name
                            }
                            fill={
                              PIE_COLORS[
                                index %
                                  PIE_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
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
                      text-slate-400
                    "
                  >
                    Pedidos
                  </span>
                </div>
              </>
            ) : (
              <EmptyChart />
            )}
          </div>

          <div className="space-y-3 mt-2">
            <StatusRow
              color="bg-[#8ED4BE]"
              label="Listos"
              value={
                stats.pedidosListos
              }
              total={
                stats.pedidos
              }
            />

            <StatusRow
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
        </article>
      </section>

      {/* ===================================
          RANKINGS + FLUJO
      =================================== */}

      <section
        className="
          grid
          grid-cols-1
          xl:grid-cols-3
          gap-6
          mb-7
        "
      >
        {/* TEMAS */}

        <RankingCard
          icon={Trophy}
          iconColor="text-[#AEB64B]"
          title="Ranking de Temas"
          items={
            rankingTemas
          }
        />

        {/* FLUJO */}

        <article
          className="
            bg-white
            rounded-[2.5rem]
            shadow-xl
            border
            border-slate-50
            p-5
            lg:p-6
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              mb-5
            "
          >
            <BarChart3
              size={18}
              className="text-[#58B99A]"
            />

            <div>
              <h2
                className="
                  text-base
                  italic
                  uppercase
                  text-slate-800
                "
              >
                Flujo de dinero
              </h2>

              <p
                className="
                  text-[8px]
                  uppercase
                  tracking-widest
                  text-slate-300
                "
              >
                Últimos 10
                períodos
              </p>
            </div>
          </div>

          <div
            className="
              h-[260px]
            "
          >
            {flujoDinero.length ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    flujoDinero
                  }
                  margin={{
                    top: 10,
                    right: 5,
                    left: 0,
                    bottom: 0,
                  }}
                >
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
                      fontSize: 8,
                      fill:
                        "#94A3B8",
                    }}
                  />

                  <YAxis
                    axisLine={
                      false
                    }
                    tickLine={
                      false
                    }
                    width={55}
                    tick={{
                      fontSize: 8,
                      fill:
                        "#94A3B8",
                    }}
                    tickFormatter={
                      formatChartCurrency
                    }
                  />

                  <Tooltip
                    content={
                      <StatsTooltip />
                    }
                  />

                  <Bar
                    dataKey="ingresos"
                    fill="#8ED4BE"
                    radius={[
                      7,
                      7,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </article>

        {/* CATEGORÍAS */}

        <RankingCard
          icon={Star}
          iconColor="text-[#F79598]"
          title="Ranking de Categorías"
          items={
            rankingCategorias
          }
          pink
        />
      </section>

      {/* ===================================
          CLIENTES + ÚLTIMOS PEDIDOS
      =================================== */}

      <section
        className="
          grid
          grid-cols-1
          xl:grid-cols-[1fr_1.35fr]
          gap-6
        "
      >
        {/* CLIENTES */}

        <article
          className="
            bg-white
            rounded-[2.5rem]
            shadow-xl
            border
            border-slate-50
            p-5
            lg:p-6
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              mb-5
            "
          >
            <Users
              size={18}
              className="text-[#58B99A]"
            />

            <h2
              className="
                text-lg
                italic
                uppercase
                text-slate-800
              "
            >
              Top 5 Clientes
            </h2>
          </div>

          {rankingClientes.length ? (
            <div className="space-y-3">
              {rankingClientes
                .slice(
                  0,
                  5
                )
                .map(
                  (
                    cliente,
                    index
                  ) => {
                    const max =
                      rankingClientes[
                        0
                      ]?.total ||
                      1;

                    const percent =
                      Math.max(
                        4,
                        (cliente.total /
                          max) *
                          100
                      );

                    return (
                      <div
                        key={
                          cliente.nombre
                        }
                        className="
                          p-3
                          bg-slate-50
                          rounded-2xl
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                        >
                          <div
                            className="
                              min-w-0
                              flex
                              items-center
                              gap-3
                            "
                          >
                            <span
                              className="
                                text-lg
                                italic
                                text-slate-300
                                shrink-0
                              "
                            >
                              #
                              {
                                index +
                                1
                              }
                            </span>

                            <div className="min-w-0">
                              <p
                                className="
                                  text-[10px]
                                  uppercase
                                  text-slate-700
                                  truncate
                                "
                              >
                                {
                                  cliente.nombre
                                }
                              </p>

                              <p
                                className="
                                  text-[8px]
                                  text-slate-400
                                "
                              >
                                {
                                  cliente.pedidos
                                }{" "}
                                pedidos
                              </p>
                            </div>
                          </div>

                          <span
                            className="
                              text-[10px]
                              text-slate-700
                              whitespace-nowrap
                            "
                          >
                            {currency(
                              cliente.total
                            )}
                          </span>
                        </div>

                        <div
                          className="
                            mt-3
                            h-1.5
                            rounded-full
                            bg-slate-200
                            overflow-hidden
                          "
                        >
                          <div
                            className="
                              h-full
                              rounded-full
                              bg-[#8ED4BE]
                            "
                            style={{
                              width: `${percent}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          ) : (
            <EmptyList />
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
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              mb-5
            "
          >
            <Clock3
              size={18}
              className="text-[#58B99A]"
            />

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
                      bg-slate-50
                      text-[8px]
                      uppercase
                      tracking-widest
                      text-slate-300
                    "
                  >
                    <th
                      className="
                        p-3
                        text-left
                        rounded-l-xl
                      "
                    >
                      Pedido
                    </th>

                    <th className="p-3 text-left">
                      Cliente
                    </th>

                    <th className="p-3 text-left">
                      Fecha
                    </th>

                    <th className="p-3 text-right">
                      Total
                    </th>

                    <th
                      className="
                        p-3
                        text-center
                        rounded-r-xl
                      "
                    >
                      Estado
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
                              p-3
                              text-[9px]
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
                              p-3
                              text-[9px]
                              uppercase
                              text-slate-700
                            "
                          >
                            {
                              venta.nombre
                            }
                          </td>

                          <td
                            className="
                              p-3
                              text-[9px]
                              text-slate-400
                            "
                          >
                            {
                              venta.fecha
                            }
                          </td>

                          <td
                            className="
                              p-3
                              text-right
                              text-[9px]
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

                          <td className="p-3 text-center">
                            <span
                              className={`
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
                              {pendiente
                                ? "Pendiente"
                                : "Listo"}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyList />
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

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  textValue = false,
}) {
  const styles = {
    mint: {
      border:
        "border-[#8ED4BE]",

      icon:
        "bg-emerald-50 text-emerald-500",
    },

    pink: {
      border:
        "border-[#F79598]",

      icon:
        "bg-red-50 text-[#F79598]",
    },

    yellow: {
      border:
        "border-[#C0C976]",

      icon:
        "bg-yellow-50 text-[#AEB64B]",
    },

    purple: {
      border:
        "border-purple-400",

      icon:
        "bg-purple-50 text-purple-500",
    },
  };

  const selected =
    styles[color];

  return (
    <article
      className={`
        bg-white
        rounded-[2.3rem]
        shadow-xl
        border
        border-slate-50
        border-b-[7px]
        p-6

        ${selected.border}
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-[9px]
              uppercase
              tracking-widest
              text-slate-400
            "
          >
            {title}
          </p>

          <p
            className={`
              mt-2
              italic
              text-slate-900

              ${
                textValue
                  ? "text-base lg:text-lg uppercase leading-tight break-words"
                  : "text-2xl lg:text-3xl"
              }
            `}
          >
            {value}
          </p>

          {subtitle && (
            <p
              className="
                mt-2
                text-[8px]
                uppercase
                tracking-widest
                text-slate-300
              "
            >
              {subtitle}
            </p>
          )}
        </div>

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
            size={20}
          />
        </div>
      </div>
    </article>
  );
}

/*
 * ========================================
 * RESUMEN
 * ========================================
 */

function QuickStat({
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
        p-3
        bg-slate-50
        rounded-2xl
        flex
        items-center
        gap-3
      "
    >
      <div
        className={`
          w-10
          h-10
          rounded-xl
          flex
          items-center
          justify-center

          ${colors[color]}
        `}
      >
        <Icon
          size={18}
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
            text-[8px]
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
 * RANKING
 * ========================================
 */

function RankingCard({
  icon: Icon,
  iconColor,
  title,
  items,
  pink = false,
}) {
  return (
    <article
      className="
        bg-white
        rounded-[2.5rem]
        shadow-xl
        border
        border-slate-50
        p-5
        lg:p-6
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          mb-5
        "
      >
        <Icon
          size={18}
          className={
            iconColor
          }
        />

        <h2
          className="
            text-base
            italic
            uppercase
            text-slate-800
          "
        >
          {title}
        </h2>
      </div>

      {items.length ? (
        <div className="space-y-2">
          {items.map(
            (
              item,
              index
            ) => (
              <div
                key={
                  item.nombre
                }
                className="
                  p-3
                  rounded-2xl
                  bg-slate-50
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    text-lg
                    italic
                    text-slate-300
                    w-9
                    shrink-0
                  "
                >
                  #
                  {
                    index +
                    1
                  }
                </span>

                <span
                  className="
                    flex-1
                    min-w-0
                    truncate
                    text-[9px]
                    uppercase
                    text-slate-700
                  "
                >
                  {
                    item.nombre
                  }
                </span>

                <span
                  className={`
                    px-3
                    py-1.5
                    rounded-xl
                    text-[8px]
                    whitespace-nowrap

                    ${
                      pink
                        ? "bg-red-50 text-[#F79598]"
                        : "bg-white text-slate-700"
                    }
                  `}
                >
                  {
                    item.cantidad
                  }{" "}
                  pzs
                </span>
              </div>
            )
          )}
        </div>
      ) : (
        <EmptyList />
      )}
    </article>
  );
}

/*
 * ========================================
 * ESTADO
 * ========================================
 */

function StatusRow({
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

      <span
        className="
          flex-1
          text-[9px]
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

      <span
        className="
          text-[8px]
          text-slate-300
        "
      >
        ({value})
      </span>
    </div>
  );
}

/*
 * ========================================
 * TOOLTIP
 * ========================================
 */

function StatsTooltip({
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
        rounded-xl
        p-3
        shadow-2xl
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
          mt-1
          text-sm
          italic
          text-[#8ED4BE]
        "
      >
        {currency(
          Number(
            data?.ingresos
          ) || 0
        )}
      </p>

      <p
        className="
          mt-1
          text-[8px]
          text-slate-400
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

/*
 * ========================================
 * FORMAT
 * ========================================
 */

function formatChartCurrency(
  value
) {
  const number =
    Number(value) ||
    0;

  if (
    number >=
    1000000
  ) {
    return `C ${(
      number /
      1000000
    ).toFixed(1)}M`;
  }

  if (
    number >= 1000
  ) {
    return `C ${Math.round(
      number / 1000
    )}K`;
  }

  return `C ${number}`;
}

/*
 * ========================================
 * EMPTY
 * ========================================
 */

function EmptyChart() {
  return (
    <div
      className="
        w-full
        h-full
        flex
        flex-col
        items-center
        justify-center
        text-slate-200
      "
    >
      <BarChart3
        size={35}
        strokeWidth={1.3}
      />

      <p
        className="
          mt-3
          text-[9px]
          uppercase
          tracking-widest
        "
      >
        Sin datos en este
        período
      </p>
    </div>
  );
}

function EmptyList() {
  return (
    <div
      className="
        py-10
        text-center
        text-[9px]
        uppercase
        tracking-widest
        text-slate-300
      "
    >
      Sin datos disponibles
    </div>
  );
}