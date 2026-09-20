import {
  useMemo,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  BarChart3,
  Box,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Tags,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ScrollToTop from "../components/common/ScrollToTop";

import logoAlekey from "../assets/images/alekey-logo.jpeg";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  currency,
} from "../utils/formatters";

/*
 * ========================================
 * HELPERS
 * ========================================
 */

const getDateKey = (
  date
) => {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
};

const parseSaleDate = (
  sale
) => {
  if (
    sale?.created_at
  ) {
    const parsed =
      new Date(
        sale.created_at
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
   * Soporte para fechas antiguas
   * guardadas como:
   * 18/9/2026
   */
  if (
    sale?.fecha
  ) {
    const parts =
      String(
        sale.fecha
      )
        .split("/")
        .map(
          Number
        );

    if (
      parts.length ===
      3
    ) {
      const [
        day,
        month,
        year,
      ] = parts;

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

const getLastSevenDays =
  () => {
    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    return Array.from(
      {
        length: 7,
      },
      (
        _,
        index
      ) => {
        const date =
          new Date(
            today
          );

        date.setDate(
          today.getDate() -
            (6 - index)
        );

        return date;
      }
    );
  };

/*
 * ========================================
 * PAGE
 * ========================================
 */

export default function DashboardPage({
  historial = [],
}) {
  const navigate =
    useNavigate();

  const {
    profile,
    user,
  } = useAuth();

  /*
   * ========================================
   * NOMBRE DEL USUARIO
   * ========================================
   */

  const displayName =
    useMemo(() => {
      const profileName =
        String(
          profile?.nombre ||
            ""
        ).trim();

      if (profileName) {
        return profileName;
      }

      const metadataName =
        String(
          user?.user_metadata
            ?.nombre ||
            user?.user_metadata
              ?.full_name ||
            ""
        ).trim();

      if (metadataName) {
        return metadataName;
      }

      const emailName =
        String(
          user?.email ||
            ""
        )
          .split("@")[0]
          .trim();

      if (emailName) {
        return emailName;
      }

      return "Usuario";
    }, [
      profile?.nombre,
      user,
    ]);

  /*
   * ========================================
   * RESUMEN
   * ========================================
   */

  const summary =
    useMemo(() => {
      const ventas =
        historial || [];

      const total =
        ventas.reduce(
          (
            accumulator,
            venta
          ) =>
            accumulator +
            (Number(
              venta.total
            ) || 0),
          0
        );

      const pendientes =
        ventas.reduce(
          (
            accumulator,
            venta
          ) =>
            accumulator +
            (
              venta.items ||
              []
            ).reduce(
              (
                sum,
                item
              ) =>
                sum +
                (Number(
                  item.pendiente
                ) || 0),
              0
            ),
          0
        );

      const piezas =
        ventas.reduce(
          (
            accumulator,
            venta
          ) =>
            accumulator +
            (
              venta.items ||
              []
            ).reduce(
              (
                sum,
                item
              ) =>
                sum +
                (Number(
                  item.cant
                ) || 0),
              0
            ),
          0
        );

      const clientes =
        new Set(
          ventas
            .map(
              (venta) =>
                String(
                  venta.nombre ||
                    ""
                )
                  .trim()
                  .toLowerCase()
            )
            .filter(Boolean)
        ).size;

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
                .filter(Boolean)
          )
        ).size;

      return {
        total,
        pendientes,
        pedidos:
          ventas.length,
        piezas,
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
      const dias =
        getLastSevenDays();

      const totals =
        new Map(
          dias.map(
            (date) => [
              getDateKey(
                date
              ),
              0,
            ]
          )
        );

      (
        historial || []
      ).forEach(
        (venta) => {
          const date =
            parseSaleDate(
              venta
            );

          if (!date) {
            return;
          }

          const key =
            getDateKey(
              date
            );

          if (
            !totals.has(
              key
            )
          ) {
            return;
          }

          totals.set(
            key,
            totals.get(
              key
            ) +
              (Number(
                venta.total
              ) || 0)
          );
        }
      );

      return dias.map(
        (date) => {
          const key =
            getDateKey(
              date
            );

          return {
            date:
              key,

            label:
              date.toLocaleDateString(
                "es-CR",
                {
                  day:
                    "numeric",

                  month:
                    "short",
                }
              ),

            total:
              totals.get(
                key
              ) || 0,
          };
        }
      );
    }, [
      historial,
    ]);

  /*
   * ========================================
   * FECHA HEADER
   * ========================================
   */

  const today =
    new Date().toLocaleDateString(
      "es-CR",
      {
        day:
          "numeric",

        month:
          "long",
      }
    );

  return (
    <div
      className="
        p-3
        sm:p-4
        lg:p-8
        xl:p-10

        max-w-[1380px]
        mx-auto

        pb-28

        font-black
        animate-in
      "
    >
      <ScrollToTop />

      {/* ====================================
          1. HEADER
      ==================================== */}

      <header
        className="
          mb-6
          lg:mb-8

          bg-white

          rounded-[2.5rem]
          lg:rounded-[3.5rem]

          border
          border-slate-100

          shadow-[0_16px_40px_rgba(15,23,42,0.08),0_4px_14px_rgba(15,23,42,0.04)]

          px-5
          py-7
          sm:p-8
          lg:px-10
          lg:py-8
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row

            lg:items-center
            justify-between

            gap-7
          "
        >
          {/* LOGO + SALUDO */}

          <div
            className="
              flex
              items-center
              justify-center
              lg:justify-start

              gap-4
              lg:gap-6
            "
          >
            <div
              className="
                w-16
                h-16
                lg:w-20
                lg:h-20

                bg-slate-900

                rounded-[1.5rem]
                lg:rounded-[1.8rem]

                flex
                items-center
                justify-center

                shadow-xl

                shrink-0
              "
            >
              <img
                src={
                  logoAlekey
                }
                alt="Alekey"
                className="
                  w-12
                  h-12
                  lg:w-14
                  lg:h-14

                  object-contain
                  rounded-xl
                "
              />
            </div>

            <div>
              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  lg:text-4xl

                  italic
                  uppercase
                  tracking-tighter

                  text-slate-900
                "
              >
                Hola,{" "}
                {displayName}
                <span className="text-[#8ED4BE]">
                  .
                </span>
              </h1>

              <p
                className="
                  mt-1

                  text-[7px]
                  sm:text-[8px]
                  lg:text-[9px]

                  uppercase
                  tracking-[0.22em]

                  text-slate-400
                "
              >
                Gestión
                Administrativa{" "}
                {
                  new Date().getFullYear()
                }
              </p>
            </div>
          </div>

          {/* FECHA */}

          <div
            className="
              self-center
              lg:self-auto

              min-w-[180px]

              bg-slate-50

              px-6
              py-4

              rounded-[1.8rem]

              text-center

              border-b-4
              border-[#8ED4BE]
            "
          >
            <p
              className="
                text-[7px]
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
              {today}
            </p>
          </div>
        </div>
      </header>

      {/* ====================================
          2. ACCIONES RÁPIDAS — SOLO MÓVIL
      ==================================== */}

      <div
        className="
          lg:hidden
          mb-6
        "
      >
        <QuickActions
          navigate={
            navigate
          }
          mobile
        />
      </div>

      {/* ====================================
          3. MÉTRICAS
      ==================================== */}

      <section
        className="
          grid
          grid-cols-1
          md:grid-cols-3

          gap-4
          lg:gap-5

          mb-6
          lg:mb-8
        "
      >
        <MetricCard
          icon={
            TrendingUp
          }
          label="Ventas Totales"
          value={currency(
            summary.total
          )}
          iconClass="
            bg-emerald-500/10
            text-emerald-500
          "
          accent="#8ED4BE"
        />

        <MetricCard
          icon={
            AlertCircle
          }
          label="Piezas Pendientes"
          value={
            summary.pendientes
          }
          iconClass="
            bg-red-500/10
            text-[#F79598]
          "
          accent="#F79598"
        />

        <MetricCard
          icon={
            ShoppingBag
          }
          label="Pedidos Realizados"
          value={
            summary.pedidos
          }
          iconClass="
            bg-[#C0C976]/10
            text-[#C0C976]
          "
          accent="#C0C976"
        />
      </section>

      {/* ====================================
          4. GRÁFICA + RESUMEN
      ==================================== */}

      <section
        className="
          grid
          grid-cols-1
          xl:grid-cols-[2fr_1fr]

          gap-5
          lg:gap-6

          mb-6
          lg:mb-8
        "
      >
        {/* GRÁFICA */}

        <article
          className="
            bg-white

            rounded-[2.2rem]
            lg:rounded-[3rem]

            border
            border-slate-100

            shadow-[0_14px_36px_rgba(15,23,42,0.07),0_4px_12px_rgba(15,23,42,0.035)]

            p-5
            sm:p-6
            lg:p-8
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-4

              mb-6
            "
          >
            <div>
              <h2
                className="
                  text-base
                  lg:text-lg

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
                  mt-1

                  text-[7px]
                  uppercase
                  tracking-widest

                  text-slate-400
                "
              >
                Ingresos por día
              </p>
            </div>

            <span
              className="
                hidden
                sm:inline-flex

                px-4
                py-2

                rounded-xl

                bg-emerald-50
                text-emerald-500

                text-[7px]
                uppercase
                tracking-widest
              "
            >
              Últimos 7 días
            </span>
          </div>

          <div
            className="
              h-[240px]
              sm:h-[300px]
              lg:h-[320px]

              w-full
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
                  right: 8,
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
                        0.32
                      }
                    />

                    <stop
                      offset="95%"
                      stopColor="#8ED4BE"
                      stopOpacity={
                        0
                      }
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={
                    false
                  }
                  stroke="#cbd5e1"
                  strokeOpacity={
                    0.35
                  }
                />

                <XAxis
                  dataKey="label"
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  tick={{
                    fontSize:
                      9,

                    fontWeight:
                      800,

                    fill:
                      "#94a3b8",
                  }}
                />

                <YAxis
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  width={56}
                  tick={{
                    fontSize:
                      9,

                    fontWeight:
                      800,

                    fill:
                      "#94a3b8",
                  }}
                  tickFormatter={(
                    value
                  ) => {
                    if (
                      value >=
                      1000000
                    ) {
                      return `₡${(
                        value /
                        1000000
                      ).toFixed(
                        1
                      )}M`;
                    }

                    if (
                      value >=
                      1000
                    ) {
                      return `₡${Math.round(
                        value /
                          1000
                      )}K`;
                    }

                    return `₡${value}`;
                  }}
                />

                <Tooltip
                  cursor={{
                    stroke:
                      "#8ED4BE",

                    strokeWidth:
                      1,

                    strokeDasharray:
                      "4 4",
                  }}
                  contentStyle={{
                    border:
                      "none",

                    borderRadius:
                      "16px",

                    boxShadow:
                      "0 12px 30px rgba(15,23,42,.14)",

                    fontSize:
                      "11px",

                    fontWeight:
                      800,
                  }}
                  formatter={(
                    value
                  ) => [
                    currency(
                      Number(
                        value
                      ) || 0
                    ),

                    "Ventas",
                  ]}
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

                    fill:
                      "#58B99A",

                    stroke:
                      "#ffffff",

                    strokeWidth:
                      3,
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

            rounded-[2.2rem]
            lg:rounded-[3rem]

            border
            border-slate-100

            shadow-[0_14px_36px_rgba(15,23,42,0.07),0_4px_12px_rgba(15,23,42,0.035)]

            p-5
            sm:p-6
            lg:p-8
          "
        >
          <h2
            className="
              text-base
              lg:text-lg

              italic
              uppercase

              text-slate-800

              mb-6
            "
          >
            Resumen rápido
          </h2>

          <div
            className="
              space-y-3
            "
          >
            <QuickSummaryRow
              icon={
                ShoppingBag
              }
              value={
                summary.pedidos
              }
              label="Pedidos"
              iconClass="
                bg-emerald-500/10
                text-emerald-500
              "
            />

            <QuickSummaryRow
              icon={
                Box
              }
              value={
                summary.piezas
              }
              label="Piezas vendidas"
              iconClass="
                bg-amber-500/10
                text-amber-500
              "
            />

            <QuickSummaryRow
              icon={
                Users
              }
              value={
                summary.clientes
              }
              label="Clientes"
              iconClass="
                bg-blue-500/10
                text-blue-500
              "
            />

            <QuickSummaryRow
              icon={
                Tags
              }
              value={
                summary.categorias
              }
              label="Categorías vendidas"
              iconClass="
                bg-purple-500/10
                text-purple-500
              "
            />
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/stats"
              )
            }
            className="
              mt-6

              w-full

              px-4
              py-4

              rounded-2xl

              bg-slate-50
              text-slate-500

              flex
              items-center
              justify-between

              text-[8px]
              uppercase
              tracking-widest

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
          </button>
        </article>
      </section>

      {/* ====================================
          5. ACCIONES RÁPIDAS — PC
      ==================================== */}

      <div
        className="
          hidden
          lg:block
        "
      >
        <QuickActions
          navigate={
            navigate
          }
        />
      </div>
    </div>
  );
}

/*
 * ========================================
 * QUICK ACTIONS
 * ========================================
 */

function QuickActions({
  navigate,
  mobile = false,
}) {
  const actions = [
    {
      title:
        "Nueva Venta",

      subtitle:
        "Crear pedido",

      icon:
        Plus,

      path:
        "/cotizar",

      primary:
        true,
    },

    {
      title:
        "Inventario",

      subtitle:
        "Gestionar stock",

      icon:
        Package,

      path:
        "/inventario",
    },

    {
      title:
        "Historial",

      subtitle:
        "Ver pedidos",

      icon:
        Search,

      path:
        "/ventas",
    },

    {
      title:
        "Estadísticas",

      subtitle:
        "Ver métricas",

      icon:
        BarChart3,

      path:
        "/stats",
    },
  ];

  return (
    <section
      className={`
        bg-white

        rounded-[2.2rem]
        lg:rounded-[3rem]

        border
        border-slate-100

        shadow-[0_14px_36px_rgba(15,23,42,0.07),0_4px_12px_rgba(15,23,42,0.035)]

        ${
          mobile
            ? "p-4"
            : "p-6 lg:p-8"
        }
      `}
    >
      <div
        className="
          flex
          items-center
          gap-3

          mb-4
        "
      >
        <div
          className="
            w-9
            h-9

            rounded-xl

            bg-[#8ED4BE]/15
            text-[#58B99A]

            flex
            items-center
            justify-center
          "
        >
          <Zap
            size={17}
          />
        </div>

        <div>
          <h2
            className="
              text-sm
              lg:text-base

              italic
              uppercase

              text-slate-800
            "
          >
            Acciones rápidas
          </h2>

          {!mobile && (
            <p
              className="
                mt-0.5

                text-[7px]
                uppercase
                tracking-widest

                text-slate-400
              "
            >
              Accesos principales
            </p>
          )}
        </div>
      </div>

      <div
        className="
          grid
          grid-cols-2
          lg:grid-cols-4

          gap-3
        "
      >
        {actions.map(
          ({
            title,
            subtitle,
            icon:
              Icon,
            path,
            primary,
          }) => (
            <button
              type="button"
              key={
                path
              }
              onClick={() =>
                navigate(
                  path
                )
              }
              className={`
                group

                min-h-[105px]
                lg:min-h-[125px]

                p-4
                lg:p-5

                rounded-[1.5rem]
                lg:rounded-[1.8rem]

                text-left

                border

                transition-all

                ${
                  primary
                    ? `
                      bg-slate-900
                      border-slate-900
                      text-white

                      shadow-[0_12px_26px_rgba(15,23,42,0.16)]
                    `
                    : `
                      bg-slate-50
                      border-slate-100
                      text-slate-800

                      hover:bg-white
                      hover:shadow-lg
                    `
                }

                hover:-translate-y-0.5
              `}
            >
              <div
                className={`
                  w-9
                  h-9

                  lg:w-10
                  lg:h-10

                  rounded-xl

                  flex
                  items-center
                  justify-center

                  mb-4

                  ${
                    primary
                      ? "bg-[#8ED4BE] text-slate-900"
                      : "bg-white text-slate-500"
                  }
                `}
              >
                <Icon
                  size={18}
                />
              </div>

              <h3
                className="
                  text-[10px]
                  sm:text-xs
                  lg:text-sm

                  italic
                  uppercase

                  leading-tight
                "
              >
                {title}
              </h3>

              <p
                className={`
                  mt-1

                  text-[6px]
                  sm:text-[7px]

                  uppercase
                  tracking-widest

                  ${
                    primary
                      ? "text-slate-400"
                      : "text-slate-400"
                  }
                `}
              >
                {subtitle}
              </p>
            </button>
          )
        )}
      </div>
    </section>
  );
}

/*
 * ========================================
 * METRIC CARD
 * ========================================
 */

function MetricCard({
  icon: Icon,
  label,
  value,
  iconClass,
  accent,
}) {
  return (
    <article
      style={{
        borderBottomColor:
          accent,
      }}
      className="
        bg-white

        p-5
        sm:p-6

        rounded-[2.2rem]

        border
        border-slate-100
        border-b-[7px]

        shadow-[0_14px_34px_rgba(15,23,42,0.075),0_4px_12px_rgba(15,23,42,0.035)]
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

          mb-5

          ${iconClass}
        `}
      >
        <Icon
          size={20}
        />
      </div>

      <p
        className="
          text-[8px]
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
 * QUICK SUMMARY
 * ========================================
 */

function QuickSummaryRow({
  icon: Icon,
  value,
  label,
  iconClass,
}) {
  return (
    <div
      className="
        flex
        items-center

        gap-4

        p-3

        rounded-2xl

        hover:bg-slate-50

        transition-colors
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

          shrink-0

          ${iconClass}
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
            lg:text-xl

            italic
            text-slate-800
          "
        >
          {value}
        </p>

        <p
          className="
            text-[7px]
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