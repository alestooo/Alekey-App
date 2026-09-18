import {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Package,
  Plus,
  Star,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import StatCard from "../components/common/StatCard";
import ScrollToTop from "../components/common/ScrollToTop";

const currency = (value) => `C ${(value || 0).toLocaleString()}`;

export default function StatisticsPage({
  ventas = [],
}) {
  const [view, setView] =
    useState("general");

  const [
    sortFlujo,
    setSortFlujo,
  ] = useState("top");

  const stats = useMemo(() => {
    if (
      !ventas ||
      !ventas.length
    ) {
      return null;
    }

    const totalDinero =
      ventas.reduce(
        (
          acc,
          venta
        ) =>
          acc +
          (
            venta.total ||
            0
          ),
        0
      );

    const piezasTotales =
      ventas.reduce(
        (
          acc,
          venta
        ) =>
          acc +
          (
            venta.items?.reduce(
              (
                sum,
                item
              ) =>
                sum +
                (
                  item.cant ||
                  0
                ),
              0
            ) || 0
          ),
        0
      );

    const totalPendientes =
      ventas.reduce(
        (
          acc,
          venta
        ) =>
          acc +
          (
            venta.items?.reduce(
              (
                sum,
                item
              ) =>
                sum +
                (
                  item.pendiente ||
                  0
                ),
              0
            ) || 0
          ),
        0
      );

    const productosMap =
      {};

    const temasMap = {};

    const clientesMap =
      {};

    ventas.forEach(
      (venta) => {
        const nombre =
          venta.nombre ||
          "Sin Nombre";

        if (
          !clientesMap[
            nombre
          ]
        ) {
          clientesMap[
            nombre
          ] = {
            nombre,
            tel:
              venta.telefono,
            total: 0,
            fecha:
              venta.fecha,
            rawDate:
              venta.created_at,
          };
        }

        clientesMap[
          nombre
        ].total +=
          venta.total || 0;

        venta.items?.forEach(
          (item) => {
            const cant =
              item.cant || 0;

            temasMap[
              item.tema
            ] =
              (
                temasMap[
                  item.tema
                ] || 0
              ) + cant;

            if (
              !productosMap[
                item.cat
              ]
            ) {
              productosMap[
                item.cat
              ] = {
                total: 0,
                temas: {},
              };
            }

            productosMap[
              item.cat
            ].total += cant;

            productosMap[
              item.cat
            ].temas[
              item.tema
            ] =
              (
                productosMap[
                  item.cat
                ].temas[
                  item.tema
                ] || 0
              ) + cant;
          }
        );
      }
    );

    const topTemas =
      Object.entries(
        temasMap
      )
        .sort(
          (a, b) =>
            b[1] -
            a[1]
        )
        .slice(0, 5);

    const topCategorias =
      Object.entries(
        productosMap
      )
        .sort(
          (a, b) =>
            b[1].total -
            a[1].total
        )
        .slice(0, 5);

    const dataBarras =
      ventas
        .slice(0, 10)
        .reverse()
        .map(
          (venta) => ({
            name: (
              venta.nombre ||
              ""
            ).split(
              " "
            )[0],

            monto:
              venta.total,
          })
        );

    const listaFlujo =
      Object.values(
        clientesMap
      );

    if (
      sortFlujo ===
      "recientes"
    ) {
      listaFlujo.sort(
        (a, b) =>
          new Date(
            b.rawDate
          ) -
          new Date(
            a.rawDate
          )
      );
    } else {
      listaFlujo.sort(
        (a, b) =>
          b.total -
          a.total
      );
    }

    return {
      totalDinero,
      piezasTotales,
      totalPendientes,
      topTemas,
      topCategorias,
      dataBarras,

      allCategorias:
        Object.entries(
          productosMap
        ).sort(
          (a, b) =>
            b[1].total -
            a[1].total
        ),

      allTemas:
        Object.entries(
          temasMap
        ).sort(
          (a, b) =>
            b[1] -
            a[1]
        ),

      listaFlujo,
    };
  }, [
    ventas,
    sortFlujo,
  ]);

  if (!stats) {
    return (
      <div className="p-20 text-center font-black italic opacity-20 text-4xl uppercase text-slate-800">
        Cargando Datos...
      </div>
    );
  }

  /*
   * =========================
   * TODOS LOS TEMAS
   * =========================
   */

  if (
    view === "temas"
  ) {
    return (
      <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in slide-in-from-left duration-300 text-slate-800">
        <ScrollToTop
          trigger={view}
        />

        <button
          onClick={() =>
            setView(
              "general"
            )
          }
          className="mb-8 flex items-center gap-2 font-black uppercase text-xs text-[#8ED4BE] hover:scale-105 transition-all"
        >
          <Plus
            className="rotate-45"
            size={20}
          />

          Volver Atrás
        </button>

        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl">
          <h2 className="text-3xl font-black italic uppercase mb-10">
            Todos los Temas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.allTemas.map(
              (
                [
                  tema,
                  cant,
                ],
                index
              ) => (
                <div
                  key={
                    tema
                  }
                  className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl"
                >
                  <span className="font-black italic text-slate-200 text-2xl">
                    #{" "}
                    {index +
                      1}
                  </span>

                  <span className="font-black uppercase text-[10px] text-slate-600 tracking-wider">
                    {tema}
                  </span>

                  <span className="font-black text-slate-800 text-xs">
                    {cant}{" "}
                    pzs
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================
   * FLUJO DE CLIENTES
   * =========================
   */

  if (
    view === "flujo"
  ) {
    return (
      <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in slide-in-from-left duration-300 text-slate-800">
        <ScrollToTop
          trigger={view}
        />

        <button
          onClick={() =>
            setView(
              "general"
            )
          }
          className="mb-8 flex items-center gap-2 font-black uppercase text-xs text-[#8ED4BE] hover:scale-105 transition-all"
        >
          <Plus
            className="rotate-45"
            size={20}
          />

          Volver Atrás
        </button>

        <div className="bg-white p-6 lg:p-10 rounded-[3.5rem] shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <h2 className="text-2xl lg:text-3xl font-black italic uppercase">
              Lista de Clientes
            </h2>

            <select
              value={
                sortFlujo
              }
              onChange={(
                event
              ) =>
                setSortFlujo(
                  event.target
                    .value
                )
              }
              className="w-full sm:w-auto p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase outline-none border-2 border-transparent focus:border-[#8ED4BE]"
            >
              <option value="top">
                Top Clientes
                (Ventas)
              </option>

              <option value="recientes">
                Más Recientes
              </option>
            </select>
          </div>

          <div className="space-y-4">
            {stats.listaFlujo.map(
              (
                cliente,
                index
              ) => (
                <div
                  key={`${cliente.nombre}-${index}`}
                  className="flex items-center justify-between p-6 bg-slate-50 rounded-4xl border-l-8 border-[#8ED4BE]"
                >
                  <div className="max-w-[60%]">
                    <h4 className="font-black italic uppercase text-slate-800 text-sm sm:text-base truncate">
                      {
                        cliente.nombre
                      }
                    </h4>

                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {
                        cliente.tel
                      }{" "}
                      •{" "}
                      {
                        cliente.fecha
                      }
                    </p>
                  </div>

                  <span className="font-black text-lg sm:text-xl text-[#8ED4BE]">
                    {currency(
                      cliente.total
                    )}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================
   * TODAS LAS CATEGORÍAS
   * =========================
   */

  if (
    view ===
    "categorias"
  ) {
    return (
      <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in slide-in-from-left duration-300 text-slate-800">
        <ScrollToTop
          trigger={view}
        />

        <button
          onClick={() =>
            setView(
              "general"
            )
          }
          className="mb-8 flex items-center gap-2 font-black uppercase text-xs text-[#8ED4BE] hover:scale-105 transition-all"
        >
          <Plus
            className="rotate-45"
            size={20}
          />

          Volver Atrás
        </button>

        <div className="bg-white p-6 lg:p-10 rounded-[3.5rem] shadow-2xl">
          <h2 className="text-3xl font-black italic uppercase mb-10 tracking-tighter">
            Ranking Categorías
            Detallado
          </h2>

          <div className="space-y-10">
            {stats.allCategorias.map(
              (
                [
                  categoria,
                  data,
                ],
                index
              ) => (
                <div
                  key={
                    categoria
                  }
                  className="bg-slate-50 rounded-[3rem] p-6 lg:p-8 border-l-15 border-[#F79598]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-200 pb-4 gap-2">
                    <div className="flex items-center gap-4">
                      <span className="font-black italic text-4xl lg:text-5xl text-slate-200">
                        #{" "}
                        {index +
                          1}
                      </span>

                      <span className="font-black uppercase text-base lg:text-2xl text-slate-700 tracking-tighter leading-tight">
                        {
                          categoria
                        }
                      </span>
                    </div>

                    <span className="font-black text-lg lg:text-3xl text-slate-800">
                      {
                        data.total
                      }{" "}
                      <span className="text-[10px] lg:text-sm opacity-30 italic">
                        pzs
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(
                      data.temas
                    )
                      .sort(
                        (
                          a,
                          b
                        ) =>
                          b[1] -
                          a[1]
                      )
                      .map(
                        ([
                          tema,
                          cantidad,
                        ]) => (
                          <div
                            key={
                              tema
                            }
                            className="flex flex-col justify-center bg-white/60 p-4 rounded-2xl border border-white min-h-15"
                          >
                            <span className="font-black uppercase text-[8px] lg:text-[9px] text-slate-500 tracking-wider leading-tight mb-1 truncate">
                              {
                                tema
                              }
                            </span>

                            <span className="font-black text-[10px] lg:text-[11px] text-[#F79598]">
                              {
                                cantidad
                              }{" "}
                              pzs
                            </span>
                          </div>
                        )
                      )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================
   * VISTA GENERAL
   * =========================
   */

  const topCliente =
    [...stats.listaFlujo].sort(
      (a, b) =>
        b.total -
        a.total
    )[0]?.nombre ||
    "N/A";

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500 text-slate-800">
      <ScrollToTop />

      <header className="mb-10 text-center lg:text-left">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">
          Métricas Alekey
          <span className="text-[#8ED4BE]">
            .
          </span>
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={
            <TrendingUp
              size={24}
              className="text-[#8ED4BE]"
            />
          }
          label="Ingresos"
          val={currency(
            stats.totalDinero
          )}
          borderColor="border-[#8ED4BE]"
        />

        <StatCard
          icon={
            <AlertCircle
              size={24}
              className="text-[#F79598]"
            />
          }
          label="Pendientes"
          val={
            stats.totalPendientes
          }
          borderColor="border-[#F79598]"
        />

        <StatCard
          icon={
            <Package
              size={24}
              className="text-[#C0C976]"
            />
          }
          label="Piezas"
          val={
            stats.piezasTotales
          }
          borderColor="border-[#C0C976]"
        />

        <StatCard
          icon={
            <User
              size={24}
              className="text-slate-800"
            />
          }
          label="Top Cliente"
          val={topCliente}
          borderColor="border-slate-800"
          isClient
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ranking de temas */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black italic uppercase text-xs flex items-center gap-2 text-slate-400">
              <Trophy
                size={16}
                className="text-[#C0C976]"
              />

              Ranking de Temas
            </h4>

            <button
              onClick={() =>
                setView(
                  "temas"
                )
              }
              className="bg-slate-50 px-3 py-1.5 rounded-full font-black text-[9px] uppercase text-slate-400 hover:bg-[#C0C976] hover:text-white transition-all shadow-sm"
            >
              Ver más
            </button>
          </div>

          <div className="space-y-4">
            {stats.topTemas.map(
              (
                [
                  tema,
                  cant,
                ],
                index
              ) => (
                <div
                  key={
                    tema
                  }
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-black italic text-slate-200 text-2xl group-hover:text-[#C0C976] transition-colors">
                      #{" "}
                      {index +
                        1}
                    </span>

                    <span className="font-black uppercase text-[10px] text-slate-600 tracking-wider">
                      {tema}
                    </span>
                  </div>

                  <span className="font-black text-slate-800 text-xs">
                    {cant}{" "}
                    pzs
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Flujo de dinero */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 text-center">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black italic uppercase text-xs text-slate-400">
              Flujo de Dinero
              (Últimas 10)
            </h4>

            <button
              onClick={() =>
                setView(
                  "flujo"
                )
              }
              className="bg-slate-50 px-3 py-1.5 rounded-full font-black text-[9px] uppercase text-slate-400 hover:bg-[#8ED4BE] hover:text-white transition-all shadow-sm"
            >
              Ver
            </button>
          </div>

          <div
            className="h-64"
            style={{
              minHeight:
                "250px",
            }}
          >
            <ResponsiveContainer
              width="99%"
              height="100%"
            >
              <BarChart
                data={
                  stats.dataBarras
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={
                    false
                  }
                  stroke="#f1f5f9"
                />

                <XAxis
                  dataKey="name"
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
                      "black",
                    fill: "#cbd5e1",
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "#f8fafc",
                  }}
                  contentStyle={{
                    borderRadius:
                      "20px",
                    border:
                      "none",
                    boxShadow:
                      "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  formatter={(
                    value
                  ) =>
                    currency(
                      value
                    )
                  }
                />

                <Bar
                  dataKey="monto"
                  fill="#8ED4BE"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking de categorías */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 text-center lg:text-left">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black italic uppercase text-xs flex items-center gap-2 text-slate-400">
              <Star
                size={16}
                className="text-[#F79598]"
              />

              Ranking de
              Categorías
            </h4>

            <button
              onClick={() =>
                setView(
                  "categorias"
                )
              }
              className="bg-slate-50 px-3 py-1.5 rounded-full font-black text-[9px] uppercase text-slate-400 hover:bg-[#F79598] hover:text-white transition-all shadow-sm"
            >
              Ver más
            </button>
          </div>

          <div className="space-y-4">
            {stats.topCategorias.map(
              (
                [
                  categoria,
                  data,
                ],
                index
              ) => (
                <div
                  key={
                    categoria
                  }
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black italic text-slate-300 transition-colors group-hover:text-[#F79598]">
                      #{" "}
                      {index +
                        1}
                    </span>

                    <span className="font-black uppercase text-[10px] text-slate-700">
                      {
                        categoria
                      }
                    </span>
                  </div>

                  <span className="font-black bg-[#F79598]/10 text-[#F79598] px-3 py-1 rounded-full text-[10px]">
                    {
                      data.total
                    }{" "}
                    pzs
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}