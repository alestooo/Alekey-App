import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Swal from "sweetalert2";

import {
  ArrowLeft,
  Folder,
  FolderPlus,
  Plus,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import ScrollToTop from "../components/common/ScrollToTop";

import SaleCard from "../components/sales/SaleCard";
import SaleFolder from "../components/sales/SaleFolder";
import SaleFilters from "../components/sales/SaleFilters";

const ITEMS_POR_PAGINA = 20;

const currency = (value) => `C ${(value || 0).toLocaleString()}`;

export default function SalesPage({
  ventas = [],
  onDelete,
  onUpdate,
  inventarioCatalog = [],
}) {
  const [mode, setMode] = useState("normal");

  const [filtro, setFiltro] = useState("");
  const [filtroFolder, setFiltroFolder] = useState("");

  const [editId, setEditId] = useState(null);
  const [editCache, setEditCache] = useState(null);

  const [carpetas, setCarpetas] = useState([]);
  const [folderView, setFolderView] = useState(null);

  const [provinciaEdit, setProvinciaEdit] = useState("Heredia");

  const [pagina, setPagina] = useState(1);

  const inventarioActivo = useMemo(
    () =>
      (inventarioCatalog || []).filter(
        (item) => item.activo !== false
      ),
    [inventarioCatalog]
  );

  const obtenerItemInventario = (categoria, tema) => {
    return (
      inventarioActivo.find(
        (item) =>
          item.categoria === categoria &&
          item.tema === tema
      ) || null
    );
  };

  const obtenerPrecioCategoria = (categoria) => {
    if (!categoria || categoria === "OTROS...") {
      return 0;
    }

    const item = inventarioActivo.find(
      (producto) =>
        producto.categoria === categoria &&
        (producto.precio || 0) > 0
    );

    return item ? item.precio || 0 : 0;
  };

  useEffect(() => {
    obtenerCarpetas();
  }, []);

  useEffect(() => {
    const mainContent = document.querySelector("main");

    if (mainContent) {
      mainContent.scrollTo(0, 0);
    }
  }, [folderView, pagina, mode]);

  const obtenerCarpetas = async () => {
    const { data } = await supabase
      .from("carpetas_centros")
      .select("*")
      .order("orden", {
        ascending: true,
      });

    if (data) {
      setCarpetas(data);
    }
  };

  const crearCarpeta = async () => {
    const { value: nombre } = await Swal.fire({
      title: "Nuevo Centro Educativo",
      input: "text",
      inputPlaceholder: "Ej: Escuelita 2026",
      showCancelButton: true,
      confirmButtonColor: "#8ED4BE",
    });

    if (!nombre) {
      return;
    }

    const nuevoOrden =
      carpetas.length > 0
        ? Math.max(
            ...carpetas.map(
              (carpeta) => carpeta.orden || 0
            )
          ) + 1
        : 0;

    const { data } = await supabase
      .from("carpetas_centros")
      .insert([
        {
          nombre,
          ids_ventas: [],
          orden: nuevoOrden,
        },
      ])
      .select();

    if (data) {
      setCarpetas([
        ...carpetas,
        data[0],
      ]);
    }
  };

  const eliminarCarpeta = async (
    id,
    nombre
  ) => {
    const result = await Swal.fire({
      title: "¿Eliminar centro?",
      text: `Se borrará "${nombre}". Los pedidos NO se borran del historial general.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F79598",
    });

    if (!result.isConfirmed) {
      return;
    }

    await supabase
      .from("carpetas_centros")
      .delete()
      .eq("id", id);

    await obtenerCarpetas();

    setFolderView(null);
  };

  const editarNombreCarpeta = async (
    id,
    actual
  ) => {
    const { value: nombre } = await Swal.fire({
      title: "Editar Nombre",
      input: "text",
      inputValue: actual,
      showCancelButton: true,
    });

    if (!nombre) {
      return;
    }

    await supabase
      .from("carpetas_centros")
      .update({
        nombre,
      })
      .eq("id", id);

    await obtenerCarpetas();
  };

  const moverCarpeta = async (
    id,
    direccion
  ) => {
    const index = carpetas.findIndex(
      (carpeta) => carpeta.id === id
    );

    if (
      direccion === "izq" &&
      index === 0
    ) {
      return;
    }

    if (
      direccion === "der" &&
      index === carpetas.length - 1
    ) {
      return;
    }

    const nuevas = [...carpetas];

    const targetIdx =
      direccion === "izq"
        ? index - 1
        : index + 1;

    [
      nuevas[index],
      nuevas[targetIdx],
    ] = [
      nuevas[targetIdx],
      nuevas[index],
    ];

    setCarpetas(nuevas);

    const updates = nuevas.map(
      (carpeta, posicion) =>
        supabase
          .from("carpetas_centros")
          .update({
            orden: posicion,
          })
          .eq("id", carpeta.id)
    );

    await Promise.all(updates);
  };

  const agregarACarpeta = async (
    ventaId
  ) => {
    if (!carpetas.length) {
      return Swal.fire(
        "Error",
        "Primero crea un centro",
        "error"
      );
    }

    const { value: folderId } =
      await Swal.fire({
        title: "Seleccionar Centro",
        input: "select",

        inputOptions:
          Object.fromEntries(
            carpetas.map(
              (carpeta) => [
                carpeta.id,
                carpeta.nombre,
              ]
            )
          ),

        showCancelButton: true,
      });

    if (!folderId) {
      return;
    }

    const folder = carpetas.find(
      (carpeta) =>
        String(carpeta.id) ===
        String(folderId)
    );

    if (!folder) {
      return;
    }

    const idsVentas =
      folder.ids_ventas || [];

    if (
      idsVentas.includes(ventaId)
    ) {
      return;
    }

    const nuevosIds = [
      ...idsVentas,
      ventaId,
    ];

    await supabase
      .from("carpetas_centros")
      .update({
        ids_ventas: nuevosIds,
      })
      .eq("id", folderId);

    await obtenerCarpetas();

    Swal.fire(
      "Agregado",
      "",
      "success"
    );
  };

  const deseleccionarDeCarpeta =
    async (ventaId, folder) => {
      const nuevosIds = (
        folder.ids_ventas || []
      ).filter(
        (id) => id !== ventaId
      );

      await supabase
        .from("carpetas_centros")
        .update({
          ids_ventas: nuevosIds,
        })
        .eq("id", folder.id);

      setFolderView({
        ...folder,
        ids_ventas: nuevosIds,
      });

      await obtenerCarpetas();
    };

  const handleEditItem = (
    itemId,
    field,
    value
  ) => {
    setEditCache((previous) => {
      if (!previous) {
        return previous;
      }

      const updatedItems =
        previous.items.map(
          (item) => {
            if (
              item.id !== itemId
            ) {
              return item;
            }

            if (
              field === "cant"
            ) {
              const cantidad =
                Math.max(
                  1,
                  Math.min(
                    99,
                    value
                  )
                );

              const stockDisponible =
                Math.max(
                  0,
                  item.stock_disponible ??
                    item.stock ??
                    0
                );

              const pendienteAuto =
                Math.max(
                  0,
                  cantidad -
                    stockDisponible
                );

              return {
                ...item,
                cant: cantidad,
                pendiente:
                  pendienteAuto,
              };
            }

            if (
              field ===
              "pendiente"
            ) {
              return {
                ...item,
                pendiente:
                  Math.max(
                    0,
                    Math.min(
                      item.cant,
                      value
                    )
                  ),
              };
            }

            if (
              field ===
                "precio" &&
              item.cat ===
                "OTROS..."
            ) {
              return {
                ...item,
                precio:
                  Math.max(
                    0,
                    value
                  ),
              };
            }

            if (
              field === "cat"
            ) {
              return {
                ...item,
                cat: value,
                tema: "",
                precio:
                  obtenerPrecioCategoria(
                    value
                  ),
                inventario_id:
                  null,
                stock: 0,
                stock_disponible:
                  0,
                pendiente: 0,
              };
            }

            if (
              field === "tema"
            ) {
              const producto =
                obtenerItemInventario(
                  item.cat,
                  value
                );

              const stockDisponible =
                Math.max(
                  0,
                  producto?.stock ??
                    0
                );

              const pendienteAuto =
                Math.max(
                  0,
                  item.cant -
                    stockDisponible
                );

              return {
                ...item,
                tema: value,

                precio:
                  producto?.precio ||
                  item.precio ||
                  obtenerPrecioCategoria(
                    item.cat
                  ),

                inventario_id:
                  producto?.id ||
                  null,

                stock:
                  stockDisponible,

                stock_disponible:
                  stockDisponible,

                pendiente:
                  pendienteAuto,
              };
            }

            return {
              ...item,
              [field]: value,
            };
          }
        );

      return {
        ...previous,

        items:
          updatedItems,

        total:
          updatedItems.reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.cant *
                item.precio,
            0
          ),
      };
    });
  };

  const agregarLineaEnEdicion =
    () => {
      const nuevo = {
        id: Date.now(),
        cant: 1,
        cat: "",
        tema: "",
        precio: 0,
        pendiente: 0,
      };

      setEditCache(
        (previous) => {
          const updatedItems = [
            ...previous.items,
            nuevo,
          ];

          return {
            ...previous,

            items:
              updatedItems,

            total:
              updatedItems.reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  item.cant *
                    item.precio,
                0
              ),
          };
        }
      );
    };

  const borrarLineaEnEdicion =
    (itemId) => {
      setEditCache(
        (previous) => {
          const updatedItems =
            previous.items.filter(
              (item) =>
                item.id !==
                itemId
            );

          return {
            ...previous,

            items:
              updatedItems,

            total:
              updatedItems.reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  item.cant *
                    item.precio,
                0
              ),
          };
        }
      );
    };

  const iniciarEdicion = (
    venta
  ) => {
    setEditId(venta.id);

    setEditCache(
      JSON.parse(
        JSON.stringify(
          venta
        )
      )
    );
  };

  const guardarEdicion =
    async (ventaId) => {
      const resultado =
        await onUpdate(
          ventaId,
          editCache
        );

      if (
        resultado !== false
      ) {
        setEditId(null);
        setEditCache(null);
      }
    };

  /*
   * ==========================================
   * VISTA DE UNA CARPETA / CENTRO EDUCATIVO
   * ==========================================
   */

  if (folderView) {
    const pedidos =
      ventas.filter(
        (venta) =>
          (
            folderView.ids_ventas ||
            []
          ).includes(
            venta.id
          )
      );

    const filtradosFolder =
      pedidos.filter(
        (venta) =>
          (
            venta.nombre || ""
          )
            .toLowerCase()
            .includes(
              filtroFolder.toLowerCase()
            ) ||
          (
            venta.id || ""
          )
            .toString()
            .includes(
              filtroFolder
            ) ||
          (
            venta.telefono || ""
          )
            .toString()
            .includes(
              filtroFolder
            )
      );

    return (
      <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in slide-in-from-bottom duration-300 font-black">
        <ScrollToTop
          trigger={folderView}
        />

        <button
          onClick={() =>
            setFolderView(
              null
            )
          }
          className="mb-8 flex items-center gap-2 uppercase text-xs text-[#8ED4BE] hover:scale-105 transition-all"
        >
          <ArrowLeft
            size={20}
          />

          Volver a Centros
        </button>

        <SaleFilters
          title={
            folderView.nombre
          }
          count={
            pedidos.length
          }
          searchValue={
            filtroFolder
          }
          searchPlaceholder="Buscar en centro..."
          onSearchChange={
            setFiltroFolder
          }
          accentColor="#9333ea"
          rightContent={
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase">
                Total
                Acumulado
              </span>

              <div className="text-2xl font-black italic text-purple-600">
                {currency(
                  pedidos.reduce(
                    (
                      sum,
                      venta
                    ) =>
                      sum +
                      (
                        venta.total ||
                        0
                      ),
                    0
                  )
                )}
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-8">
          {filtradosFolder.length ? (
            filtradosFolder.map(
              (venta) => (
                <SaleCard
                  key={
                    venta.id
                  }
                  venta={
                    venta
                  }
                  inFolder
                  folderView={
                    folderView
                  }
                  editing={
                    editId ===
                    venta.id
                  }
                  editCache={
                    editCache
                  }
                  setEditCache={
                    setEditCache
                  }
                  provinciaEdit={
                    provinciaEdit
                  }
                  setProvinciaEdit={
                    setProvinciaEdit
                  }
                  onStartEdit={() =>
                    iniciarEdicion(
                      venta
                    )
                  }
                  onSaveEdit={() =>
                    guardarEdicion(
                      venta.id
                    )
                  }
                  onDelete={() =>
                    onDelete(
                      venta.id
                    )
                  }
                  onAddToFolder={() =>
                    agregarACarpeta(
                      venta.id
                    )
                  }
                  onRemoveFromFolder={() =>
                    deseleccionarDeCarpeta(
                      venta.id,
                      folderView
                    )
                  }
                  onEditItem={
                    handleEditItem
                  }
                  onAddLine={
                    agregarLineaEnEdicion
                  }
                  onDeleteLine={
                    borrarLineaEnEdicion
                  }
                />
              )
            )
          ) : (
            <div className="p-20 text-center border-4 border-dashed rounded-[3rem] opacity-20 italic text-2xl uppercase">
              Sin coincidencias
            </div>
          )}
        </div>
      </div>
    );
  }

  /*
   * =========================
   * VISTA DE CARPETAS
   * =========================
   */

  if (
    mode === "carpetas"
  ) {
    return (
      <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500 font-black">
        <ScrollToTop
          trigger={mode}
        />

        <SaleFilters
          title="Centros Educativos"
          subtitle="Organiza tus pedidos por instituciones"
          accentColor="#9333ea"
          showSearch={false}
          rightContent={
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setMode(
                    "normal"
                  )
                }
                className="px-6 py-4 bg-white shadow-lg rounded-2xl uppercase text-xs text-slate-400 hover:text-slate-800 font-black"
              >
                Historial
              </button>

              <button
                onClick={
                  crearCarpeta
                }
                className="px-6 py-4 bg-purple-600 text-white shadow-lg rounded-2xl uppercase text-xs flex items-center gap-2 hover:scale-105 font-black"
              >
                <FolderPlus
                  size={18}
                />

                Nuevo Centro
              </button>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carpetas.map(
            (carpeta) => {
              const pedidosEnCarpeta =
                ventas.filter(
                  (venta) =>
                    (
                      carpeta.ids_ventas ||
                      []
                    ).includes(
                      venta.id
                    )
                );

              const totalCarpeta =
                pedidosEnCarpeta.reduce(
                  (
                    sum,
                    venta
                  ) =>
                    sum +
                    (
                      venta.total ||
                      0
                    ),
                  0
                );

              return (
                <SaleFolder
                  key={
                    carpeta.id
                  }
                  folder={
                    carpeta
                  }
                  ordersCount={
                    pedidosEnCarpeta.length
                  }
                  total={
                    totalCarpeta
                  }
                  onOpen={() =>
                    setFolderView(
                      carpeta
                    )
                  }
                  onMoveLeft={() =>
                    moverCarpeta(
                      carpeta.id,
                      "izq"
                    )
                  }
                  onMoveRight={() =>
                    moverCarpeta(
                      carpeta.id,
                      "der"
                    )
                  }
                  onEdit={() =>
                    editarNombreCarpeta(
                      carpeta.id,
                      carpeta.nombre
                    )
                  }
                  onDelete={() =>
                    eliminarCarpeta(
                      carpeta.id,
                      carpeta.nombre
                    )
                  }
                />
              );
            }
          )}
        </div>
      </div>
    );
  }

  /*
   * =========================
   * HISTORIAL NORMAL
   * =========================
   */

  const filtradas =
    ventas.filter(
      (venta) =>
        (
          venta.nombre ||
          ""
        )
          .toLowerCase()
          .includes(
            filtro.toLowerCase()
          ) ||
        (
          venta.id || ""
        )
          .toString()
          .includes(
            filtro
          ) ||
        (
          venta.telefono ||
          ""
        )
          .toString()
          .includes(
            filtro
          )
    );

  const totalPaginas =
    Math.ceil(
      filtradas.length /
        ITEMS_POR_PAGINA
    );

  const inicio =
    (pagina - 1) *
    ITEMS_POR_PAGINA;

  const ventasPagina =
    filtradas.slice(
      inicio,
      inicio +
        ITEMS_POR_PAGINA
    );

  const paginasVisibles =
    () => {
      if (
        pagina === 1
      ) {
        return [
          1,
          2,
          3,
        ].filter(
          (page) =>
            page <=
            totalPaginas
        );
      }

      if (
        pagina === 2
      ) {
        return [
          1,
          2,
          3,
          4,
        ].filter(
          (page) =>
            page <=
            totalPaginas
        );
      }

      if (
        pagina ===
        totalPaginas
      ) {
        return [
          totalPaginas - 2,
          totalPaginas - 1,
          totalPaginas,
        ].filter(
          (page) =>
            page > 0
        );
      }

      return [
        pagina - 1,
        pagina,
        pagina + 1,
      ];
    };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500 font-black">
      <ScrollToTop
        trigger={pagina}
      />

      <SaleFilters
        title="Historial de Ventas"
        subtitle="Control total de pedidos y entregas"
        accentColor="#F79598"
        searchValue={
          filtro
        }
        searchPlaceholder="Buscar por nombre, orden o teléfono..."
        onSearchChange={(
          value
        ) => {
          setFiltro(
            value
          );

          setPagina(1);
        }}
        rightContent={
          <div className="flex gap-3">
            <button
              onClick={() =>
                setMode(
                  "carpetas"
                )
              }
              className="px-6 py-4 bg-white shadow-lg rounded-2xl uppercase text-xs text-slate-400 hover:text-slate-800 flex items-center gap-2 font-black"
            >
              <Folder
                size={18}
              />

              Ver Centros
            </button>

            <Link
              to="/cotizar"
              className="px-6 py-4 bg-[#F79598] text-white shadow-lg rounded-2xl uppercase text-xs flex items-center gap-2 hover:scale-105 font-black"
            >
              <Plus
                size={18}
              />

              Nueva Venta
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-8">
        {ventasPagina.map(
          (venta) => (
            <SaleCard
              key={
                venta.id
              }
              venta={
                venta
              }
              editing={
                editId ===
                venta.id
              }
              editCache={
                editCache
              }
              setEditCache={
                setEditCache
              }
              provinciaEdit={
                provinciaEdit
              }
              setProvinciaEdit={
                setProvinciaEdit
              }
              onStartEdit={() =>
                iniciarEdicion(
                  venta
                )
              }
              onSaveEdit={() =>
                guardarEdicion(
                  venta.id
                )
              }
              onDelete={() =>
                onDelete(
                  venta.id
                )
              }
              onAddToFolder={() =>
                agregarACarpeta(
                  venta.id
                )
              }
              onEditItem={
                handleEditItem
              }
              onAddLine={
                agregarLineaEnEdicion
              }
              onDeleteLine={
                borrarLineaEnEdicion
              }
            />
          )
        )}
      </div>

      {totalPaginas >
        1 && (
        <div className="mt-14 flex justify-center gap-2">
          <button
            onClick={() =>
              setPagina(1)
            }
            className="px-4 py-2 rounded-xl bg-slate-100"
          >
            &laquo;
          </button>

          <button
            onClick={() =>
              setPagina(
                (page) =>
                  Math.max(
                    1,
                    page - 1
                  )
              )
            }
            className="px-4 py-2 rounded-xl bg-slate-100"
          >
            &lsaquo;
          </button>

          {paginasVisibles().map(
            (page) => (
              <button
                key={page}
                onClick={() =>
                  setPagina(
                    page
                  )
                }
                className={`px-4 py-2 rounded-xl ${
                  page ===
                  pagina
                    ? "bg-[#F79598] text-white"
                    : "bg-slate-100 font-black"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() =>
              setPagina(
                (page) =>
                  Math.min(
                    totalPaginas,
                    page + 1
                  )
              )
            }
            className="px-4 py-2 rounded-xl bg-slate-100"
          >
            &rsaquo;
          </button>

          <button
            onClick={() =>
              setPagina(
                totalPaginas
              )
            }
            className="px-4 py-2 rounded-xl bg-slate-100"
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
}