import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
} from "lucide-react";

import Swal from "sweetalert2";

import { supabase } from "../lib/supabase";

import ScrollToTop from "../components/common/ScrollToTop";

import InventoryCard from "../components/inventory/InventoryCard";

import InventoryFilters from "../components/inventory/InventoryFilters";

import {
  openInventoryForm,
} from "../components/inventory/InventoryForm";

const ITEMS_POR_PAGINA = 21;

export default function InventoryPage({
  inventarioCatalog = [],
  setInventarioCatalog,
}) {
  const [
    inventario,
    setInventario,
  ] = useState(
    inventarioCatalog || []
  );

  const [
    catFiltro,
    setCatFiltro,
  ] = useState("Todo");

  const [
    orden,
    setOrden,
  ] = useState(
    "alfabetico"
  );

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    pagina,
    setPagina,
  ] = useState(1);

  useEffect(() => {
    fetchInv();
  }, []);

  /*
   * =========================
   * CARGAR INVENTARIO
   * =========================
   */

  const fetchInv =
    async () => {
      setCargando(true);

      try {
        const TAMANO_BLOQUE =
          1000;

        let desde = 0;

        let todosLosItems =
          [];

        let hayMas = true;

        while (hayMas) {
          const {
            data,
            error,
          } =
            await supabase
              .from(
                "inventario"
              )
              .select("*")
              .order(
                "categoria",
                {
                  ascending:
                    true,
                }
              )
              .order(
                "tema",
                {
                  ascending:
                    true,
                }
              )
              .range(
                desde,
                desde +
                  TAMANO_BLOQUE -
                  1
              );

          if (error) {
            throw error;
          }

          const bloque =
            data || [];

          todosLosItems = [
            ...todosLosItems,
            ...bloque,
          ];

          hayMas =
            bloque.length ===
            TAMANO_BLOQUE;

          desde +=
            TAMANO_BLOQUE;
        }

        setInventario(
          todosLosItems
        );

        if (
          setInventarioCatalog
        ) {
          setInventarioCatalog(
            todosLosItems
          );
        }
      } catch (error) {
        console.error(
          "Error cargando el inventario:",
          error
        );

        Swal.fire({
          title: "Error",

          text:
            "No se pudo cargar el inventario completo.",

          icon: "error",

          confirmButtonColor:
            "#C0C976",
        });
      } finally {
        setCargando(
          false
        );
      }
    };

  /*
   * =========================
   * SINCRONIZAR ESTADO
   * =========================
   */

  const sincronizarInventario = (
    nuevos
  ) => {
    setInventario(
      nuevos
    );

    if (
      setInventarioCatalog
    ) {
      setInventarioCatalog(
        nuevos
      );
    }
  };

  /*
   * =========================
   * ACTUALIZAR STOCK
   * =========================
   */

  const actualizarStock =
    async (
      id,
      nuevoStock
    ) => {
      const limpio =
        Math.max(
          0,
          parseInt(
            nuevoStock
          ) || 0
        );

      const { error } =
        await supabase
          .from(
            "inventario"
          )
          .update({
            stock: limpio,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            id
          );

      if (error) {
        console.error(
          "Error actualizando stock:",
          error
        );

        return;
      }

      const nuevos =
        inventario.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  stock:
                    limpio,
                }
              : item
        );

      sincronizarInventario(
        nuevos
      );
    };

  /*
   * =========================
   * EDITAR STOCK MANUAL
   * =========================
   */

  const editarStockManual =
    async (item) => {
      const { value } =
        await Swal.fire({
          title:
            "Editar Stock Manual",

          input: "number",

          inputValue:
            item.stock || 0,

          inputAttributes: {
            min: 0,
          },

          showCancelButton:
            true,

          confirmButtonColor:
            "#C0C976",
        });

      if (
        value !== undefined
      ) {
        await actualizarStock(
          item.id,

          Math.max(
            0,
            parseInt(value)
          )
        );
      }
    };

  /*
   * =========================
   * AGREGAR PRODUCTO
   * =========================
   */

  const agregarNuevo =
    async () => {
      const categorias =
        [
          ...new Set(
            inventario
              .map(
                (item) =>
                  item.categoria
              )
              .filter(
                Boolean
              )
          ),
        ].sort(
          (a, b) =>
            a.localeCompare(
              b,
              "es",
              {
                sensitivity:
                  "base",
              }
            )
        );

      const formValues =
        await openInventoryForm(
          categorias
        );

      if (
        !formValues ||
        !formValues.categoria ||
        !formValues.tema
      ) {
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from(
          "inventario"
        )
        .insert([
          formValues,
        ])
        .select();

      if (error) {
        Swal.fire({
          title:
            "No se pudo agregar",

          text:
            error.message,

          icon: "error",

          confirmButtonColor:
            "#F79598",
        });

        return;
      }

      if (
        data?.length
      ) {
        const nuevos = [
          ...inventario,
          data[0],
        ];

        sincronizarInventario(
          nuevos
        );
      }
    };

  /*
   * =========================
   * ELIMINAR PRODUCTO
   * =========================
   */

  const borrarItem =
    async (id) => {
      const res =
        await Swal.fire({
          title:
            "¿Eliminar producto?",

          text:
            "El producto se eliminará permanentemente del inventario.",

          icon: "warning",

          showCancelButton:
            true,

          confirmButtonText:
            "Sí, eliminar",

          cancelButtonText:
            "Cancelar",

          confirmButtonColor:
            "#F79598",

          cancelButtonColor:
            "#64748b",
        });

      if (
        !res.isConfirmed
      ) {
        return;
      }

      try {
        const {
          data,
          error,
        } = await supabase
          .from(
            "inventario"
          )
          .delete()
          .eq(
            "id",
            id
          )
          .select();

        if (error) {
          throw error;
        }

        if (
          !data ||
          data.length === 0
        ) {
          throw new Error(
            "Supabase no permitió eliminar el registro. Revisa las políticas RLS."
          );
        }

        const nuevos =
          inventario.filter(
            (item) =>
              item.id !== id
          );

        sincronizarInventario(
          nuevos
        );

        Swal.fire({
          title:
            "Producto eliminado",

          text:
            "El registro fue eliminado correctamente de Supabase.",

          icon: "success",

          confirmButtonColor:
            "#C0C976",
        });
      } catch (error) {
        console.error(
          "Error eliminando producto:",
          error
        );

        Swal.fire({
          title:
            "No se pudo eliminar",

          text:
            error.message ||
            "Ocurrió un error al eliminar el producto.",

          icon: "error",

          confirmButtonColor:
            "#F79598",
        });
      }
    };

  /*
   * =========================
   * CATEGORÍAS
   * =========================
   */

  const categorias =
    useMemo(() => {
      return [
        "Todo",

        ...new Set(
          inventario
            .map(
              (item) =>
                item.categoria
            )
            .filter(
              Boolean
            )
        ),
      ].sort(
        (a, b) => {
          if (
            a === "Todo"
          ) {
            return -1;
          }

          if (
            b === "Todo"
          ) {
            return 1;
          }

          return a.localeCompare(
            b,
            "es",
            {
              sensitivity:
                "base",
            }
          );
        }
      );
    }, [inventario]);

  /*
   * =========================
   * FILTROS Y ORDEN
   * =========================
   */

  const todosLosFiltrados =
    useMemo(() => {
      const textoBusqueda =
        busqueda
          .trim()
          .toLowerCase();

      return (
        catFiltro ===
        "Todo"
          ? inventario
          : inventario.filter(
              (item) =>
                item.categoria ===
                catFiltro
            )
      )
        .filter(
          (item) => {
            if (
              !textoBusqueda
            ) {
              return true;
            }

            return (
              (
                item.tema ||
                ""
              )
                .toLowerCase()
                .includes(
                  textoBusqueda
                ) ||
              (
                item.categoria ||
                ""
              )
                .toLowerCase()
                .includes(
                  textoBusqueda
                )
            );
          }
        )
        .slice()
        .sort(
          (a, b) => {
            if (
              orden ===
              "cantidad"
            ) {
              return (
                (b.stock ||
                  0) -
                (a.stock ||
                  0)
              );
            }

            return (
              a.tema || ""
            ).localeCompare(
              b.tema || "",
              "es",
              {
                sensitivity:
                  "base",
              }
            );
          }
        );
    }, [
      inventario,
      catFiltro,
      busqueda,
      orden,
    ]);

  /*
   * =========================
   * RESUMEN
   * =========================
   */

  const resumenInventario =
    useMemo(() => {
      const categoriasVisibles =
        new Set(
          todosLosFiltrados
            .map(
              (item) =>
                item.categoria
            )
            .filter(
              Boolean
            )
        );

      const totalStock =
        todosLosFiltrados.reduce(
          (
            acumulado,
            item
          ) =>
            acumulado +
            (
              Number(
                item.stock
              ) || 0
            ),
          0
        );

      return {
        totalItems:
          todosLosFiltrados.length,

        totalCategorias:
          categoriasVisibles.size,

        totalStock,
      };
    }, [
      todosLosFiltrados,
    ]);

  /*
   * =========================
   * PAGINACIÓN
   * =========================
   */

  const totalPaginas =
    Math.ceil(
      todosLosFiltrados.length /
        ITEMS_POR_PAGINA
    );

  const filtrados =
    todosLosFiltrados.slice(
      (pagina - 1) *
        ITEMS_POR_PAGINA,

      pagina *
        ITEMS_POR_PAGINA
    );

  /*
   * =========================
   * RENDER
   * =========================
   */

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32 text-slate-800 font-black">
      <ScrollToTop
        trigger={
          catFiltro +
          pagina
        }
      />

      <InventoryFilters
        catFiltro={
          catFiltro
        }
        categorias={
          categorias
        }
        orden={orden}
        busqueda={
          busqueda
        }
        resumen={
          resumenInventario
        }
        onAdd={
          agregarNuevo
        }
        onCategoryChange={(
          categoria
        ) => {
          setCatFiltro(
            categoria
          );

          setPagina(1);
        }}
        onSearchChange={(
          value
        ) => {
          setBusqueda(
            value
          );

          setPagina(1);
        }}
        onOrderChange={(
          value
        ) => {
          setOrden(
            value
          );

          setPagina(1);
        }}
      />

      {cargando ? (
        <div className="p-20 text-center italic opacity-20 text-2xl uppercase font-black">
          Cargando
          Inventario...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map(
              (item) => (
                <InventoryCard
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  showCategory={
                    catFiltro ===
                    "Todo"
                  }
                  onDelete={() =>
                    borrarItem(
                      item.id
                    )
                  }
                  onIncrease={() =>
                    actualizarStock(
                      item.id,
                      (
                        item.stock ||
                        0
                      ) + 1
                    )
                  }
                  onDecrease={() =>
                    actualizarStock(
                      item.id,
                      Math.max(
                        0,
                        (
                          item.stock ||
                          0
                        ) - 1
                      )
                    )
                  }
                  onEdit={() =>
                    editarStockManual(
                      item
                    )
                  }
                />
              )
            )}

            {!filtrados.length && (
              <div className="col-span-full p-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] opacity-20 italic text-2xl uppercase font-black">
                Sin productos
              </div>
            )}
          </div>

          {totalPaginas >
            1 && (
            <div className="flex justify-center items-center gap-3 mt-12 flex-wrap">
              <button
                disabled={
                  pagina === 1
                }
                onClick={() =>
                  setPagina(
                    (page) =>
                      page - 1
                  )
                }
                className="p-4 bg-white rounded-2xl shadow-sm disabled:opacity-20 text-slate-600 font-black"
              >
                <ArrowLeft
                  size={18}
                />
              </button>

              <div className="flex gap-2 flex-wrap justify-center">
                {[
                  ...Array(
                    totalPaginas
                  ),
                ].map(
                  (
                    _,
                    index
                  ) => {
                    const page =
                      index +
                      1;

                    return (
                      <button
                        key={
                          page
                        }
                        onClick={() =>
                          setPagina(
                            page
                          )
                        }
                        className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${
                          pagina ===
                          page
                            ? "bg-slate-900 text-[#C0C976] shadow-xl scale-110"
                            : "bg-white text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {
                          page
                        }
                      </button>
                    );
                  }
                )}
              </div>

              <button
                disabled={
                  pagina ===
                  totalPaginas
                }
                onClick={() =>
                  setPagina(
                    (page) =>
                      page + 1
                  )
                }
                className="p-4 bg-white rounded-2xl shadow-sm disabled:opacity-20 text-slate-600 font-black"
              >
                <div className="rotate-180">
                  <ArrowLeft
                    size={18}
                  />
                </div>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}