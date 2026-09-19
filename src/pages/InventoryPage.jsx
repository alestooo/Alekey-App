import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import Swal from "sweetalert2";

import {
  supabase,
} from "../lib/supabase";

import {
  useAppSettings,
} from "../contexts/AppSettingsContext";

import ScrollToTop from "../components/common/ScrollToTop";

import InventoryCard from "../components/inventory/InventoryCard";

import InventoryFilters from "../components/inventory/InventoryFilters";

import {
  openInventoryEditForm,
  openInventoryForm,
} from "../components/inventory/InventoryForm";

import {
  currency,
} from "../utils/formatters";

const BLOCK_SIZE = 1000;

const escapeHtml = (
  value = ""
) => {
  return String(value).replace(
    /[&<>"']/g,
    (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };

      return entities[
        character
      ];
    }
  );
};

const getStockStatus = (
  stockValue
) => {
  const stock =
    Number(
      stockValue
    ) || 0;

  if (stock <= 0) {
    return {
      label:
        "Sin stock",

      color:
        "#ef4444",

      background:
        "#fef2f2",
    };
  }

  if (stock <= 4) {
    return {
      label:
        "Stock bajo",

      color:
        "#f59e0b",

      background:
        "#fffbeb",
    };
  }

  return {
    label:
      "En stock",

    color:
      "#10b981",

    background:
      "#ecfdf5",
  };
};

const getVisiblePages = (
  page,
  totalPages
) => {
  if (
    totalPages <= 7
  ) {
    return Array.from(
      {
        length:
          totalPages,
      },
      (_, index) =>
        index + 1
    );
  }

  if (page <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "...",
      totalPages,
    ];
  }

  if (
    page >=
    totalPages - 3
  ) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    page - 1,
    page,
    page + 1,
    "...",
    totalPages,
  ];
};

export default function InventoryPage({
  inventarioCatalog = [],
  setInventarioCatalog,
}) {
  const {
    inventoryPerPage,
    setInventoryPerPage,
  } = useAppSettings();

  const [
    inventario,
    setInventario,
  ] = useState(
    inventarioCatalog ||
      []
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

  const [
    paginaBuscada,
    setPaginaBuscada,
  ] = useState("");

  const updateLocalInventory =
    useCallback(
      (
        nuevosItems
      ) => {
        setInventario(
          nuevosItems
        );

        setInventarioCatalog?.(
          nuevosItems
        );
      },
      [
        setInventarioCatalog,
      ]
    );

  const fetchInventory =
    useCallback(async () => {
      setCargando(true);

      try {
        let desde = 0;
        let todos = [];
        let hayMas = true;

        while (hayMas) {
          const {
            data,
            error,
          } = await supabase
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
                BLOCK_SIZE -
                1
            );

          if (error) {
            throw error;
          }

          const bloque =
            data || [];

          todos = [
            ...todos,
            ...bloque,
          ];

          hayMas =
            bloque.length ===
            BLOCK_SIZE;

          desde +=
            BLOCK_SIZE;
        }

        updateLocalInventory(
          todos
        );
      } catch (error) {
        console.error(
          error
        );

        await Swal.fire(
          "Error",
          "No se pudo cargar el inventario.",
          "error"
        );
      } finally {
        setCargando(
          false
        );
      }
    }, [
      updateLocalInventory,
    ]);

  useEffect(() => {
    fetchInventory();
  }, [
    fetchInventory,
  ]);

  useEffect(() => {
    setPagina(1);
  }, [
    inventoryPerPage,
  ]);

  const categorias =
    useMemo(() => {
      const listado = [
        ...new Set(
          inventario
            .map(
              (item) =>
                item.categoria
            )
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        a.localeCompare(
          b,
          "es",
          {
            sensitivity:
              "base",
          }
        )
      );

      return [
        "Todo",
        ...listado,
      ];
    }, [
      inventario,
    ]);

  const categoryCounts =
    useMemo(() => {
      return inventario.reduce(
        (
          counts,
          item
        ) => {
          const categoria =
            item.categoria ||
            "Sin categoría";

          counts[
            categoria
          ] =
            (counts[
              categoria
            ] || 0) +
            1;

          return counts;
        },
        {}
      );
    }, [
      inventario,
    ]);

  const resumen =
    useMemo(() => {
      const totalStock =
        inventario.reduce(
          (
            total,
            item
          ) =>
            total +
            (Number(
              item.stock
            ) || 0),
          0
        );

      const totalCategorias =
        new Set(
          inventario
            .map(
              (item) =>
                item.categoria
            )
            .filter(Boolean)
        ).size;

      const stockBajo =
        inventario.filter(
          (item) =>
            (Number(
              item.stock
            ) || 0) <= 4
        ).length;

      return {
        totalItems:
          inventario.length,

        totalCategorias,

        totalStock,

        stockBajo,
      };
    }, [
      inventario,
    ]);

  const actualizarStock =
    async (
      id,
      nuevoStock
    ) => {
      const limpio =
        Math.max(
          0,
          Number.parseInt(
            nuevoStock,
            10
          ) || 0
        );

      try {
        const {
          error,
        } = await supabase
          .from(
            "inventario"
          )
          .update({
            stock:
              limpio,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            id
          );

        if (error) {
          throw error;
        }

        updateLocalInventory(
          inventario.map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    stock:
                      limpio,
                  }
                : item
          )
        );
      } catch (error) {
        console.error(
          error
        );

        await Swal.fire(
          "Error",
          "No se pudo actualizar el stock.",
          "error"
        );
      }
    };

  const verProducto =
    async (item) => {
      const stock =
        Number(
          item.stock
        ) || 0;

      const status =
        getStockStatus(
          stock
        );

      await Swal.fire({
        title:
          escapeHtml(
            item.tema ||
              "Producto"
          ),

        html: `
          <div style="text-align:left;padding:8px 4px 0;">
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
              <span style="padding:7px 12px;border-radius:12px;background:#f1f5f9;color:#64748b;font-size:11px;font-weight:800;">
                ${escapeHtml(
                  item.categoria ||
                    "Sin categoría"
                )}
              </span>

              <span style="padding:7px 12px;border-radius:12px;background:${status.background};color:${status.color};font-size:11px;font-weight:800;">
                ${status.label}
              </span>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div style="background:#f8fafc;padding:18px;border-radius:18px;">
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em;font-weight:800;">
                  Stock actual
                </div>

                <div style="font-size:27px;color:${status.color};font-weight:900;margin-top:5px;">
                  ${stock}
                  <span style="font-size:13px;">
                    Pzs
                  </span>
                </div>
              </div>

              <div style="background:#f8fafc;padding:18px;border-radius:18px;">
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.1em;font-weight:800;">
                  Precio
                </div>

                <div style="font-size:22px;color:#0f172a;font-weight:900;margin-top:8px;">
                  ${currency(
                    Number(
                      item.precio
                    ) || 0
                  )}
                </div>
              </div>
            </div>
          </div>
        `,

        confirmButtonText:
          "Cerrar",

        confirmButtonColor:
          "#0F172A",

        width: 520,
      });
    };

  const editarProducto =
    async (item) => {
      const valores =
        await openInventoryEditForm(
          item,
          categorias.filter(
            (categoria) =>
              categoria !==
              "Todo"
          )
        );

      if (!valores) {
        return;
      }

      const cambios = {
        categoria:
          valores.categoria,

        tema:
          valores.tema,

        stock:
          Math.max(
            0,
            Number.parseInt(
              valores.stock,
              10
            ) || 0
          ),

        precio:
          Math.max(
            0,
            Number.parseFloat(
              valores.precio
            ) || 0
          ),

        updated_at:
          new Date().toISOString(),
      };

      try {
        const {
          data,
          error,
        } = await supabase
          .from(
            "inventario"
          )
          .update(
            cambios
          )
          .eq(
            "id",
            item.id
          )
          .select();

        if (error) {
          throw error;
        }

        const actualizado =
          data?.[0] || {
            ...item,
            ...cambios,
          };

        updateLocalInventory(
          inventario.map(
            (producto) =>
              producto.id ===
              item.id
                ? actualizado
                : producto
          )
        );

        await Swal.fire({
          title:
            "Producto actualizado",

          icon:
            "success",

          timer:
            1000,

          showConfirmButton:
            false,
        });
      } catch (error) {
        await Swal.fire(
          "Error",
          error.message ||
            "No se pudo actualizar.",
          "error"
        );
      }
    };

  const agregarNuevo =
    async () => {
      const nuevo =
        await openInventoryForm(
          categorias.filter(
            (categoria) =>
              categoria !==
              "Todo"
          )
        );

      if (!nuevo) {
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
          .insert([
            nuevo,
          ])
          .select();

        if (error) {
          throw error;
        }

        if (
          data?.length
        ) {
          updateLocalInventory([
            ...inventario,
            data[0],
          ]);
        }
      } catch (error) {
        await Swal.fire(
          "Error",
          error.message ||
            "No se pudo agregar.",
          "error"
        );
      }
    };

  const borrarItem =
    async (id) => {
      const producto =
        inventario.find(
          (item) =>
            item.id === id
        );

      const result =
        await Swal.fire({
          title:
            "¿Eliminar producto?",

          text:
            producto?.tema
              ? `"${producto.tema}" se eliminará permanentemente.`
              : "El producto se eliminará permanentemente.",

          icon:
            "warning",

          showCancelButton:
            true,

          confirmButtonText:
            "Sí, eliminar",

          cancelButtonText:
            "Cancelar",

          confirmButtonColor:
            "#F79598",
        });

      if (
        !result.isConfirmed
      ) {
        return;
      }

      try {
        const {
          error,
        } = await supabase
          .from(
            "inventario"
          )
          .delete()
          .eq(
            "id",
            id
          );

        if (error) {
          throw error;
        }

        updateLocalInventory(
          inventario.filter(
            (item) =>
              item.id !== id
          )
        );
      } catch (error) {
        await Swal.fire(
          "Error",
          error.message ||
            "No se pudo eliminar.",
          "error"
        );
      }
    };

  const todosLosFiltrados =
    useMemo(() => {
      const search =
        busqueda
          .trim()
          .toLowerCase();

      return inventario
        .filter(
          (item) => {
            const categoriaOK =
              catFiltro ===
                "Todo" ||
              item.categoria ===
                catFiltro;

            const searchOK =
              !search ||
              (
                item.tema ||
                ""
              )
                .toLowerCase()
                .includes(
                  search
                ) ||
              (
                item.categoria ||
                ""
              )
                .toLowerCase()
                .includes(
                  search
                );

            return (
              categoriaOK &&
              searchOK
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
                (Number(
                  b.stock
                ) || 0) -
                (Number(
                  a.stock
                ) || 0)
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

  const totalPaginas =
    Math.max(
      1,
      Math.ceil(
        todosLosFiltrados.length /
          inventoryPerPage
      )
    );

  const paginaSegura =
    Math.min(
      pagina,
      totalPaginas
    );

  const filtrados =
    todosLosFiltrados.slice(
      (paginaSegura -
        1) *
        inventoryPerPage,

      paginaSegura *
        inventoryPerPage
    );

  useEffect(() => {
    if (
      pagina >
      totalPaginas
    ) {
      setPagina(
        totalPaginas
      );
    }
  }, [
    pagina,
    totalPaginas,
  ]);

  const handleGoToPage =
    (event) => {
      event.preventDefault();

      const numero =
        Number.parseInt(
          paginaBuscada,
          10
        );

      if (
        Number.isNaN(
          numero
        )
      ) {
        return;
      }

      setPagina(
        Math.min(
          totalPaginas,
          Math.max(
            1,
            numero
          )
        )
      );

      setPaginaBuscada(
        ""
      );
    };

  const paginasVisibles =
    getVisiblePages(
      paginaSegura,
      totalPaginas
    );

  return (
    <div
      className="
        p-4
        lg:p-8
        xl:p-10
        max-w-[1550px]
        mx-auto
        pb-28
        text-slate-800
        font-black
      "
    >
      <ScrollToTop
        trigger={`${catFiltro}-${paginaSegura}`}
      />

      <InventoryFilters
        categorias={
          categorias
        }
        categoryCounts={
          categoryCounts
        }
        catFiltro={
          catFiltro
        }
        orden={
          orden
        }
        busqueda={
          busqueda
        }
        resumen={
          resumen
        }
        itemsPerPage={
          inventoryPerPage
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
        onItemsPerPageChange={(
          value
        ) => {
          setInventoryPerPage(
            value
          );

          setPagina(1);
        }}
      />

      {cargando ? (
        <div
          className="
            py-24
            text-center
            text-xl
            italic
            uppercase
            text-slate-200
          "
        >
          Cargando
          inventario...
        </div>
      ) : (
        <>
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-3
              2xl:grid-cols-4
              gap-5
            "
          >
            {filtrados.map(
              (item) => (
                <InventoryCard
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  onView={() =>
                    verProducto(
                      item
                    )
                  }
                  onEdit={() =>
                    editarProducto(
                      item
                    )
                  }
                  onDelete={() =>
                    borrarItem(
                      item.id
                    )
                  }
                  onIncrease={() =>
                    actualizarStock(
                      item.id,
                      (Number(
                        item.stock
                      ) || 0) +
                        1
                    )
                  }
                  onDecrease={() =>
                    actualizarStock(
                      item.id,
                      Math.max(
                        0,
                        (Number(
                          item.stock
                        ) || 0) -
                          1
                      )
                    )
                  }
                />
              )
            )}
          </div>

          {totalPaginas >
            1 && (
            <div
              className="
                mt-10
                bg-white
                rounded-[2rem]
                border
                border-slate-100
                shadow-lg
                p-4
                flex
                flex-col
                xl:flex-row
                items-center
                justify-between
                gap-5
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
                Página{" "}
                <span className="text-slate-800">
                  {
                    paginaSegura
                  }
                </span>{" "}
                de{" "}
                <span className="text-slate-800">
                  {
                    totalPaginas
                  }
                </span>
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-2
                  flex-wrap
                  justify-center
                "
              >
                <button
                  type="button"
                  disabled={
                    paginaSegura ===
                    1
                  }
                  onClick={() =>
                    setPagina(
                      paginaSegura -
                        1
                    )
                  }
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-slate-50
                    flex
                    items-center
                    justify-center
                    disabled:opacity-20
                  "
                >
                  <ArrowLeft
                    size={15}
                  />
                </button>

                {paginasVisibles.map(
                  (
                    page,
                    index
                  ) =>
                    page ===
                    "..." ? (
                      <span
                        key={
                          index
                        }
                        className="text-slate-300"
                      >
                        •••
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={
                          page
                        }
                        onClick={() =>
                          setPagina(
                            page
                          )
                        }
                        className={`
                          min-w-10
                          h-10
                          px-2
                          rounded-xl
                          text-[9px]

                          ${
                            paginaSegura ===
                            page
                              ? "bg-slate-900 text-[#C0C976]"
                              : "bg-slate-50 text-slate-500"
                          }
                        `}
                      >
                        {page}
                      </button>
                    )
                )}

                <button
                  type="button"
                  disabled={
                    paginaSegura ===
                    totalPaginas
                  }
                  onClick={() =>
                    setPagina(
                      paginaSegura +
                        1
                    )
                  }
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-slate-50
                    flex
                    items-center
                    justify-center
                    disabled:opacity-20
                  "
                >
                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>

              <form
                onSubmit={
                  handleGoToPage
                }
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    text-[8px]
                    uppercase
                    text-slate-300
                  "
                >
                  Ir a
                </span>

                <input
                  type="number"
                  min="1"
                  max={
                    totalPaginas
                  }
                  value={
                    paginaBuscada
                  }
                  onChange={(
                    event
                  ) =>
                    setPaginaBuscada(
                      event.target
                        .value
                    )
                  }
                  className="
                    w-14
                    h-10
                    bg-slate-50
                    border
                    border-slate-100
                    rounded-xl
                    text-center
                  "
                />

                <button
                  type="submit"
                  className="
                    h-10
                    px-4
                    bg-[#C0C976]
                    text-slate-900
                    rounded-xl
                    text-[8px]
                    uppercase
                  "
                >
                  Ir
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}