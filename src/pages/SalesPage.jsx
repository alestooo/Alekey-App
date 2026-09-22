import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  ArrowLeft,
  Folder,
  FolderPlus,
  Plus,
  Search,
} from "lucide-react";

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import {
  supabase,
} from "../lib/supabase";

import {
  UBICACIONES_CR,
} from "../constants/locations";

import {
  isDebtPayment,
} from "../constants/payments";

import {
  useAppSettings,
} from "../contexts/AppSettingsContext";

import ScrollToTop from "../components/common/ScrollToTop";
import SaleCard from "../components/sales/SaleCard";
import SaleFolder from "../components/sales/SaleFolder";
import SaleFilters from "../components/sales/SaleFilters";

import {
  currency,
} from "../utils/formatters";

/*
 * ========================================
 * SYSTEM FOLDERS
 * ========================================
 */

const DEBT_FOLDER =
  "DEBE";

const PENDING_FOLDER =
  "PENDIENTES";

const normalizeFolderName =
  (value) =>
    String(value || "")
      .trim()
      .toUpperCase();

const isDebtFolder =
  (folder) =>
    normalizeFolderName(
      folder?.nombre
    ) === DEBT_FOLDER;

const isPendingFolder =
  (folder) =>
    normalizeFolderName(
      folder?.nombre
    ) ===
    PENDING_FOLDER;

const isSystemFolder =
  (folder) =>
    isDebtFolder(
      folder
    ) ||
    isPendingFolder(
      folder
    );

const folderSystemType =
  (folder) => {
    if (
      isDebtFolder(
        folder
      )
    ) {
      return "debt";
    }

    if (
      isPendingFolder(
        folder
      )
    ) {
      return "pending";
    }

    return null;
  };

const tienePendientes =
  (venta) =>
    (
      venta.items ||
      []
    ).some(
      (item) =>
        Number(
          item.pendiente
        ) > 0
    );

const ordenarCarpetas =
  (folders) => {
    return [
      ...folders,
    ].sort(
      (a, b) => {
        if (
          isDebtFolder(a)
        ) {
          return -1;
        }

        if (
          isDebtFolder(b)
        ) {
          return 1;
        }

        if (
          isPendingFolder(a)
        ) {
          return -1;
        }

        if (
          isPendingFolder(b)
        ) {
          return 1;
        }

        return (
          (Number(
            a.orden
          ) || 0) -
          (Number(
            b.orden
          ) || 0)
        );
      }
    );
  };

const paginasVisibles =
  (
    pagina,
    total
  ) => {
    if (total <= 7) {
      return Array.from(
        {
          length: total,
        },
        (_, index) =>
          index + 1
      );
    }

    if (pagina <= 4) {
      return [
        1,
        2,
        3,
        4,
        5,
        "...",
        total,
      ];
    }

    if (
      pagina >=
      total - 3
    ) {
      return [
        1,
        "...",
        total - 4,
        total - 3,
        total - 2,
        total - 1,
        total,
      ];
    }

    return [
      1,
      "...",
      pagina - 1,
      pagina,
      pagina + 1,
      "...",
      total,
    ];
  };

/*
 * ========================================
 * STATUS TABS
 * ========================================
 */

function StatusTabs({
  value,
  onChange,
  ventas = [],
}) {
  const pendientes =
    ventas.filter(
      tienePendientes
    ).length;

  const debe =
    ventas.filter(
      (venta) =>
        isDebtPayment(
          venta.metodo_pago
        )
    ).length;

  const listas =
    ventas.filter(
      (venta) =>
        !tienePendientes(
          venta
        )
    ).length;

  const buttons = [
    {
      id: "todas",
      label: "Todas",
      count:
        ventas.length,
      active:
        "bg-slate-900 text-white",
    },
    {
      id: "listas",
      label: "Listas",
      count:
        listas,
      active:
        "bg-emerald-500 text-white",
    },
    {
      id: "pendientes",
      label:
        "Pendientes",
      count:
        pendientes,
      active:
        "bg-[#F79598] text-white",
    },
    {
      id: "debe",
      label: "DEBE",
      count: debe,
      active:
        "bg-red-600 text-white shadow-red-200",
    },
  ];

  return (
    <div
      className="
        flex
        flex-wrap
        gap-2
      "
    >
      {buttons.map(
        (button) => (
          <button
            type="button"
            key={
              button.id
            }
            onClick={() =>
              onChange(
                button.id
              )
            }
            className={`
              px-4
              py-3
              rounded-2xl
              border
              text-[8px]
              uppercase
              tracking-widest
              flex
              items-center
              gap-2
              transition-all

              ${
                value ===
                button.id
                  ? `${button.active} border-transparent shadow-lg`
                  : "bg-white text-slate-400 border-slate-100"
              }
            `}
          >
            {
              button.label
            }

            <span
              className="
                min-w-6
                h-6
                px-1
                rounded-lg
                bg-black/5
                flex
                items-center
                justify-center
              "
            >
              {
                button.count
              }
            </span>
          </button>
        )
      )}
    </div>
  );
}

/*
 * ========================================
 * PAGINATION
 * ========================================
 */

function PaginationBar({
  page,
  totalPages,
  totalItems,
  itemLabel,
  onPageChange,
}) {
  const [
    input,
    setInput,
  ] = useState("");

  if (
    totalPages <= 1
  ) {
    return null;
  }

  const pages =
    paginasVisibles(
      page,
      totalPages
    );

  const goToPage =
    (event) => {
      event.preventDefault();

      const value =
        Number.parseInt(
          input,
          10
        );

      if (
        Number.isNaN(
          value
        )
      ) {
        return;
      }

      onPageChange(
        Math.min(
          totalPages,
          Math.max(
            1,
            value
          )
        )
      );

      setInput("");
    };

  return (
    <div
      className="
        mt-9
        bg-white
        border
        border-slate-100
        rounded-[2rem]
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
        <strong className="text-slate-800">
          {page}
        </strong>{" "}
        de{" "}
        <strong className="text-slate-800">
          {
            totalPages
          }
        </strong>

        <span className="mx-2">
          •
        </span>

        {totalItems}{" "}
        {itemLabel}
      </p>

      <div
        className="
          flex
          items-center
          justify-center
          gap-2
          flex-wrap
        "
      >
        <button
          type="button"
          disabled={
            page <= 1
          }
          onClick={() =>
            onPageChange(
              page - 1
            )
          }
          className="
            w-10
            h-10
            rounded-xl
            bg-slate-100
            text-slate-500
            disabled:opacity-20
          "
        >
          ‹
        </button>

        {pages.map(
          (
            pageNumber,
            index
          ) =>
            pageNumber ===
            "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="
                  text-slate-300
                  px-1
                "
              >
                •••
              </span>
            ) : (
              <button
                type="button"
                key={
                  pageNumber
                }
                onClick={() =>
                  onPageChange(
                    pageNumber
                  )
                }
                className={`
                  min-w-10
                  h-10
                  px-2
                  rounded-xl
                  text-[9px]

                  ${
                    page ===
                    pageNumber
                      ? "bg-[#F79598] text-white shadow-lg"
                      : "bg-slate-100 text-slate-500"
                  }
                `}
              >
                {
                  pageNumber
                }
              </button>
            )
        )}

        <button
          type="button"
          disabled={
            page >=
            totalPages
          }
          onClick={() =>
            onPageChange(
              page + 1
            )
          }
          className="
            w-10
            h-10
            rounded-xl
            bg-slate-100
            text-slate-500
            disabled:opacity-20
          "
        >
          ›
        </button>
      </div>

      <form
        onSubmit={
          goToPage
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
            totalPages
          }
          value={input}
          onChange={(
            event
          ) =>
            setInput(
              event.target
                .value
            )
          }
          className="
            w-14
            h-10
            rounded-xl
            bg-slate-50
            border
            border-slate-100
            text-center
          "
        />

        <button
          type="submit"
          className="
            h-10
            px-4
            rounded-xl
            bg-slate-900
            text-white
            text-[8px]
            uppercase
          "
        >
          Ir
        </button>
      </form>
    </div>
  );
}

export default function SalesPage({
  ventas = [],
  onDelete,
  onUpdate,
  inventarioCatalog = [],
}) {
  const {
    salesPerPage,
    foldersPerPage,
  } = useAppSettings();

  const [
    mode,
    setMode,
  ] = useState(
    "normal"
  );

  const [
    filtro,
    setFiltro,
  ] = useState("");

  const [
    estadoFiltro,
    setEstadoFiltro,
  ] = useState(
    "todas"
  );

  const [
    filtroFolder,
    setFiltroFolder,
  ] = useState("");

  const [
    estadoFolder,
    setEstadoFolder,
  ] = useState(
    "todas"
  );

  const [
    editId,
    setEditId,
  ] = useState(null);

  const [
    editCache,
    setEditCache,
  ] = useState(null);

  const [
    editInitialSnapshot,
    setEditInitialSnapshot,
  ] = useState(null);

  const [
    carpetas,
    setCarpetas,
  ] = useState([]);

  const [
    folderView,
    setFolderView,
  ] = useState(null);

  const [
    provinciaEdit,
    setProvinciaEdit,
  ] = useState("");

  const [
    cantonEdit,
    setCantonEdit,
  ] = useState("");

  const [
    pagina,
    setPagina,
  ] = useState(1);

  const [
    folderPage,
    setFolderPage,
  ] = useState(1);

  const [
    folderSalesPage,
    setFolderSalesPage,
  ] = useState(1);

  const syncInFlight =
    useRef(false);

  const sensors =
    useSensors(
      useSensor(
        MouseSensor,
        {
          activationConstraint:
            {
              distance: 6,
            },
        }
      ),

      useSensor(
        TouchSensor,
        {
          activationConstraint:
            {
              delay: 220,
              tolerance: 8,
            },
        }
      ),

      useSensor(
        KeyboardSensor,
        {
          coordinateGetter:
            sortableKeyboardCoordinates,
        }
      )
    );

  /*
   * ========================================
   * INVENTORY HELPERS
   * ========================================
   */

  const inventarioActivo =
    useMemo(
      () =>
        (
          inventarioCatalog ||
          []
        ).filter(
          (item) =>
            item.activo !==
            false
        ),
      [
        inventarioCatalog,
      ]
    );

  const obtenerItemInventario =
    (
      categoria,
      tema
    ) =>
      inventarioActivo.find(
        (item) =>
          item.categoria ===
            categoria &&
          item.tema ===
            tema
      ) || null;

  const obtenerPrecioCategoria =
    (categoria) => {
      if (
        !categoria ||
        categoria ===
          "OTROS..."
      ) {
        return 0;
      }

      const item =
        inventarioActivo.find(
          (producto) =>
            producto.categoria ===
              categoria &&
            Number(
              producto.precio
            ) > 0
        );

      return Number(
        item?.precio
      ) || 0;
    };

  /*
   * ========================================
   * FOLDERS
   * ========================================
   */

  const obtenerCarpetas =
    useCallback(
      async () => {
        const {
          data,
          error,
        } = await supabase
          .from(
            "carpetas_centros"
          )
          .select("*")
          .order(
            "orden",
            {
              ascending:
                true,
            }
          );

        if (error) {
          console.error(
            error
          );

          return [];
        }

        const ordenadas =
          ordenarCarpetas(
            data || []
          );

        setCarpetas(
          ordenadas
        );

        setFolderView(
          (current) => {
            if (!current) {
              return null;
            }

            return (
              ordenadas.find(
                (folder) =>
                  String(
                    folder.id
                  ) ===
                  String(
                    current.id
                  )
              ) ||
              current
            );
          }
        );

        return ordenadas;
      },
      []
    );

  /*
   * ========================================
   * AUTOMATIC DEBE / PENDIENTES
   * ========================================
   */

  const sincronizarCarpetasSistema =
    useCallback(
      async () => {
        if (
          syncInFlight.current
        ) {
          return;
        }

        syncInFlight.current =
          true;

        try {
          const {
            data,
            error,
          } = await supabase
            .from(
              "carpetas_centros"
            )
            .select("*");

          if (error) {
            throw error;
          }

          let folders =
            data || [];

          let debt =
            folders.find(
              isDebtFolder
            );

          let pending =
            folders.find(
              isPendingFolder
            );

          if (!debt) {
            const {
              data:
                newDebt,
              error:
                debtError,
            } =
              await supabase
                .from(
                  "carpetas_centros"
                )
                .insert([
                  {
                    nombre:
                      DEBT_FOLDER,
                    ids_ventas:
                      [],
                    orden: 0,
                  },
                ])
                .select()
                .single();

            if (
              debtError
            ) {
              throw debtError;
            }

            debt =
              newDebt;

            folders.push(
              newDebt
            );
          }

          if (!pending) {
            const {
              data:
                newPending,
              error:
                pendingError,
            } =
              await supabase
                .from(
                  "carpetas_centros"
                )
                .insert([
                  {
                    nombre:
                      PENDING_FOLDER,
                    ids_ventas:
                      [],
                    orden: 1,
                  },
                ])
                .select()
                .single();

            if (
              pendingError
            ) {
              throw pendingError;
            }

            pending =
              newPending;

            folders.push(
              newPending
            );
          }

          const debtIds =
            ventas
              .filter(
                (venta) =>
                  isDebtPayment(
                    venta.metodo_pago
                  )
              )
              .map(
                (venta) =>
                  venta.id
              );

          const pendingIds =
            ventas
              .filter(
                tienePendientes
              )
              .map(
                (venta) =>
                  venta.id
              );

          const normales =
            folders
              .filter(
                (folder) =>
                  !isSystemFolder(
                    folder
                  )
              )
              .sort(
                (a, b) =>
                  (Number(
                    a.orden
                  ) ||
                    0) -
                  (Number(
                    b.orden
                  ) ||
                    0)
              );

          const updates = [
            supabase
              .from(
                "carpetas_centros"
              )
              .update({
                ids_ventas:
                  debtIds,
                orden: 0,
              })
              .eq(
                "id",
                debt.id
              ),

            supabase
              .from(
                "carpetas_centros"
              )
              .update({
                ids_ventas:
                  pendingIds,
                orden: 1,
              })
              .eq(
                "id",
                pending.id
              ),

            ...normales.map(
              (
                folder,
                index
              ) =>
                supabase
                  .from(
                    "carpetas_centros"
                  )
                  .update({
                    orden:
                      index +
                      2,
                  })
                  .eq(
                    "id",
                    folder.id
                  )
            ),
          ];

          await Promise.all(
            updates
          );

          await obtenerCarpetas();
        } catch (error) {
          console.error(
            "Error sincronizando carpetas automáticas:",
            error
          );
        } finally {
          syncInFlight.current =
            false;
        }
      },
      [
        ventas,
        obtenerCarpetas,
      ]
    );

  useEffect(() => {
    sincronizarCarpetasSistema();
  }, [
    sincronizarCarpetasSistema,
  ]);

  useEffect(() => {
    setPagina(1);
    setFolderSalesPage(
      1
    );
  }, [
    salesPerPage,
  ]);

  useEffect(() => {
    setFolderPage(1);
  }, [
    foldersPerPage,
  ]);

  useEffect(() => {
    const main =
      document.querySelector(
        "main"
      );

    main?.scrollTo({
      top: 0,
      behavior:
        "instant",
    });
  }, [
    pagina,
    folderPage,
    folderSalesPage,
    folderView,
    mode,
  ]);

  /*
   * ========================================
   * NORMAL FOLDER CRUD
   * ========================================
   */

  const crearCarpeta =
    async () => {
      const {
        value: nombre,
      } =
        await Swal.fire({
          title:
            "Nuevo Centro Educativo",

          input:
            "text",

          inputPlaceholder:
            "Ej: Escuela San José",

          showCancelButton:
            true,

          confirmButtonColor:
            "#8ED4BE",
        });

      if (
        !nombre?.trim()
      ) {
        return;
      }

      if (
        [
          DEBT_FOLDER,
          PENDING_FOLDER,
        ].includes(
          normalizeFolderName(
            nombre
          )
        )
      ) {
        await Swal.fire(
          "Nombre reservado",
          "DEBE y PENDIENTES son carpetas automáticas.",
          "info"
        );

        return;
      }

      const maxOrder =
        carpetas.length
          ? Math.max(
              ...carpetas.map(
                (folder) =>
                  Number(
                    folder.orden
                  ) || 0
              )
            )
          : 1;

      const {
        error,
      } = await supabase
        .from(
          "carpetas_centros"
        )
        .insert([
          {
            nombre:
              nombre.trim(),

            ids_ventas:
              [],

            orden:
              maxOrder +
              1,
          },
        ]);

      if (error) {
        await Swal.fire(
          "Error",
          error.message,
          "error"
        );

        return;
      }

      await obtenerCarpetas();
    };

  const eliminarCarpeta =
    async (
      folder
    ) => {
      if (
        isSystemFolder(
          folder
        )
      ) {
        return;
      }

      const result =
        await Swal.fire({
          title:
            "¿Eliminar centro?",

          text:
            "Los pedidos seguirán existiendo en el historial.",

          icon:
            "warning",

          showCancelButton:
            true,

          confirmButtonColor:
            "#F79598",
        });

      if (
        !result.isConfirmed
      ) {
        return;
      }

      await supabase
        .from(
          "carpetas_centros"
        )
        .delete()
        .eq(
          "id",
          folder.id
        );

      await obtenerCarpetas();
    };

  const editarNombreCarpeta =
    async (
      folder
    ) => {
      if (
        isSystemFolder(
          folder
        )
      ) {
        return;
      }

      const {
        value: nombre,
      } =
        await Swal.fire({
          title:
            "Editar nombre",

          input:
            "text",

          inputValue:
            folder.nombre,

          showCancelButton:
            true,
        });

      if (
        !nombre?.trim()
      ) {
        return;
      }

      await supabase
        .from(
          "carpetas_centros"
        )
        .update({
          nombre:
            nombre.trim(),
        })
        .eq(
          "id",
          folder.id
        );

      await obtenerCarpetas();
    };

  /*
   * ========================================
   * DRAG
   * ========================================
   */

  const handleDragStart =
    () => {
      navigator.vibrate?.(
        25
      );
    };

  const handleDragEnd =
    async ({
      active,
      over,
    }) => {
      if (
        !over ||
        active.id ===
          over.id
      ) {
        return;
      }

      const activeFolder =
        carpetas.find(
          (folder) =>
            String(
              folder.id
            ) ===
            String(
              active.id
            )
        );

      const overFolder =
        carpetas.find(
          (folder) =>
            String(
              folder.id
            ) ===
            String(
              over.id
            )
        );

      if (
        !activeFolder ||
        !overFolder ||
        isSystemFolder(
          activeFolder
        ) ||
        isSystemFolder(
          overFolder
        )
      ) {
        return;
      }

      const normales =
        carpetas.filter(
          (folder) =>
            !isSystemFolder(
              folder
            )
        );

      const oldIndex =
        normales.findIndex(
          (folder) =>
            String(
              folder.id
            ) ===
            String(
              active.id
            )
        );

      const newIndex =
        normales.findIndex(
          (folder) =>
            String(
              folder.id
            ) ===
            String(
              over.id
            )
        );

      const reordered =
        arrayMove(
          normales,
          oldIndex,
          newIndex
        );

      const combined = [
        ...carpetas.filter(
          isSystemFolder
        ),
        ...reordered,
      ];

      setCarpetas(
        ordenarCarpetas(
          combined
        )
      );

      await Promise.all(
        reordered.map(
          (
            folder,
            index
          ) =>
            supabase
              .from(
                "carpetas_centros"
              )
              .update({
                orden:
                  index +
                  2,
              })
              .eq(
                "id",
                folder.id
              )
        )
      );

      await obtenerCarpetas();
    };

  /*
   * ========================================
   * FOLDER SALES
   * ========================================
   */

  const obtenerPedidosCarpeta =
    (folder) => {
      const ids =
        folder?.ids_ventas ||
        [];

      return ventas.filter(
        (venta) =>
          ids.some(
            (id) =>
              String(id) ===
              String(
                venta.id
              )
          )
      );
    };

  const agregarACarpeta =
    async (
      ventaId
    ) => {
      const disponibles =
        carpetas.filter(
          (folder) =>
            !isSystemFolder(
              folder
            )
        );

      if (
        !disponibles.length
      ) {
        await Swal.fire(
          "Sin centros",
          "Primero crea un centro educativo.",
          "info"
        );

        return;
      }

      const options =
        Object.fromEntries(
          disponibles.map(
            (folder) => [
              folder.id,
              folder.nombre,
            ]
          )
        );

      const {
        value:
          folderId,
      } =
        await Swal.fire({
          title:
            "Seleccionar Centro",

          input:
            "select",

          inputOptions:
            options,

          showCancelButton:
            true,

          confirmButtonColor:
            "#8ED4BE",
        });

      if (!folderId) {
        return;
      }

      const folder =
        disponibles.find(
          (item) =>
            String(
              item.id
            ) ===
            String(
              folderId
            )
        );

      if (!folder) {
        return;
      }

      const ids =
        folder.ids_ventas ||
        [];

      if (
        ids.some(
          (id) =>
            String(id) ===
            String(
              ventaId
            )
        )
      ) {
        return;
      }

      await supabase
        .from(
          "carpetas_centros"
        )
        .update({
          ids_ventas: [
            ...ids,
            ventaId,
          ],
        })
        .eq(
          "id",
          folder.id
        );

      await obtenerCarpetas();
    };

  const deseleccionarDeCarpeta =
    async (
      ventaId,
      folder
    ) => {
      if (
        isSystemFolder(
          folder
        )
      ) {
        await Swal.fire({
          title:
            "Carpeta automática",

          text:
            isDebtFolder(
              folder
            )
              ? "Para quitar este pedido de DEBE cambia su método de pago."
              : "Para quitarlo de PENDIENTES debes dejar sus productos sin pendientes.",

          icon:
            "info",

          confirmButtonColor:
            "#8ED4BE",
        });

        return;
      }

      const ids =
        (
          folder.ids_ventas ||
          []
        ).filter(
          (id) =>
            String(id) !==
            String(
              ventaId
            )
        );

      await supabase
        .from(
          "carpetas_centros"
        )
        .update({
          ids_ventas:
            ids,
        })
        .eq(
          "id",
          folder.id
        );

      await obtenerCarpetas();
    };

  /*
   * ========================================
   * LOCATION
   * ========================================
   */

  const obtenerUbicacionVenta =
    (
      direccion = ""
    ) => {
      const limpia =
        direccion.trim();

      if (!limpia) {
        return {
          provincia:
            "",
          canton: "",
        };
      }

      const partes =
        limpia
          .split(",")
          .map(
            (parte) =>
              parte.trim()
          )
          .filter(Boolean);

      if (
        partes.length >=
          2 &&
        UBICACIONES_CR[
          partes[0]
        ]
      ) {
        return {
          provincia:
            partes[0],
          canton:
            partes[1],
        };
      }

      if (
        UBICACIONES_CR[
          limpia
        ]
      ) {
        return {
          provincia:
            limpia,
          canton: "",
        };
      }

      const found =
        Object.entries(
          UBICACIONES_CR
        ).find(
          ([
            ,
            cantones,
          ]) =>
            cantones.includes(
              limpia
            )
        );

      if (found) {
        return {
          provincia:
            found[0],
          canton:
            limpia,
        };
      }

      return {
        provincia: "",
        canton: "",
      };
    };

  /*
   * ========================================
   * EDIT SALE
   * ========================================
   */

  const iniciarEdicion =
    (venta) => {
      const location =
        obtenerUbicacionVenta(
          venta.direccion ||
            ""
        );

      const direccionNormalizada =
        location.provincia &&
        location.canton
          ? `${location.provincia}, ${location.canton}`
          : location.provincia ||
            "";

      const copia =
        structuredClone(
          venta
        );

      setEditCache(
        copia
      );

      setEditInitialSnapshot({
        ...structuredClone(
          venta
        ),
        direccion:
          direccionNormalizada,
      });

      setProvinciaEdit(
        location.provincia
      );

      setCantonEdit(
        location.canton
      );

      setEditId(
        venta.id
      );
    };

  const cancelarEdicion =
    () => {
      setEditId(null);
      setEditCache(null);
      setEditInitialSnapshot(
        null
      );
      setProvinciaEdit("");
      setCantonEdit("");
    };

  const handleEditItem =
    (
      itemId,
      field,
      value
    ) => {
      setEditCache(
        (previous) => {
          if (!previous) {
            return previous;
          }

          const items =
            (
              previous.items ||
              []
            ).map(
              (item) => {
                if (
                  item.id !==
                  itemId
                ) {
                  return item;
                }

                if (
                  field ===
                  "cant"
                ) {
                  const cantidad =
                    Math.max(
                      1,
                      Math.min(
                        99,
                        value
                      )
                    );

                  const producto =
                    item.inventario_id
                      ? inventarioActivo.find(
                          (
                            product
                          ) =>
                            String(
                              product.id
                            ) ===
                            String(
                              item.inventario_id
                            )
                        )
                      : obtenerItemInventario(
                          item.cat,
                          item.tema
                        );

                  const stock =
                    Math.max(
                      0,
                      Number(
                        producto?.stock ??
                          item.stock_disponible ??
                          item.stock ??
                          0
                      )
                    );

                  return {
                    ...item,
                    cant:
                      cantidad,
                    stock_disponible:
                      stock,
                    pendiente:
                      Math.max(
                        0,
                        cantidad -
                          stock
                      ),
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
                          Number(
                            item.cant
                          ) ||
                            0,
                          value
                        )
                      ),
                  };
                }

                if (
                  field ===
                  "precio"
                ) {
                  return {
                    ...item,
                    precio:
                      Math.max(
                        0,
                        Number(
                          value
                        ) || 0
                      ),
                  };
                }

                if (
                  field ===
                  "cat"
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
                    stock_disponible:
                      0,
                    pendiente:
                      0,
                  };
                }

                if (
                  field ===
                  "tema"
                ) {
                  const producto =
                    obtenerItemInventario(
                      item.cat,
                      value
                    );

                  const stock =
                    Math.max(
                      0,
                      Number(
                        producto?.stock
                      ) || 0
                    );

                  return {
                    ...item,
                    tema: value,
                    precio:
                      Number(
                        producto?.precio
                      ) ||
                      Number(
                        item.precio
                      ) ||
                      0,
                    inventario_id:
                      producto?.id ||
                      null,
                    stock_disponible:
                      stock,
                    pendiente:
                      Math.max(
                        0,
                        (Number(
                          item.cant
                        ) ||
                          0) -
                          stock
                      ),
                  };
                }

                return {
                  ...item,
                  [field]:
                    value,
                };
              }
            );

          return {
            ...previous,
            items,
            total:
              items.reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  (Number(
                    item.cant
                  ) ||
                    0) *
                    (Number(
                      item.precio
                    ) ||
                      0),
                0
              ),
          };
        }
      );
    };

  const agregarLineaEnEdicion =
    () => {
      setEditCache(
        (previous) => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,

            items: [
              ...(
                previous.items ||
                []
              ),

              {
                id:
                  Date.now(),
                cant: 1,
                cat: "",
                tema: "",
                precio: 0,
                pendiente:
                  0,
                inventario_id:
                  null,
                stock_disponible:
                  null,
              },
            ],
          };
        }
      );
    };

  const borrarLineaEnEdicion =
    (itemId) => {
      setEditCache(
        (previous) => {
          if (!previous) {
            return previous;
          }

          const items =
            (
              previous.items ||
              []
            ).filter(
              (item) =>
                String(
                  item.id
                ) !==
                String(
                  itemId
                )
            );

          return {
            ...previous,
            items,
            total:
              items.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  (Number(
                    item.cant
                  ) ||
                    0) *
                    (Number(
                      item.precio
                    ) ||
                      0),
                0
              ),
          };
        }
      );
    };

  const hayCambiosEnEdicion =
    () => {
      if (
        !editCache ||
        !editInitialSnapshot
      ) {
        return false;
      }

      const direccionActual =
        provinciaEdit &&
        cantonEdit
          ? `${provinciaEdit}, ${cantonEdit}`
          : provinciaEdit ||
            "";

      const actual = {
        ...editCache,
        direccion:
          direccionActual,
      };

      return (
        JSON.stringify(
          actual
        ) !==
        JSON.stringify(
          editInitialSnapshot
        )
      );
    };

  const guardarEdicion =
    async (id) => {
      if (
        !editCache ||
        !hayCambiosEnEdicion()
      ) {
        return;
      }

      const direccion =
        provinciaEdit &&
        cantonEdit
          ? `${provinciaEdit}, ${cantonEdit}`
          : provinciaEdit ||
            "";

      const result =
        await onUpdate?.(
          id,
          {
            ...editCache,
            direccion,
          }
        );

      if (
        result !== false
      ) {
        cancelarEdicion();
      }
    };

  const renderSaleCard =
    (
      venta,
      inFolder =
        false
    ) => (
      <SaleCard
        key={
          venta.id
        }
        venta={venta}
        inFolder={
          inFolder
        }
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
        cantonEdit={
          cantonEdit
        }
        setCantonEdit={
          setCantonEdit
        }
        onStartEdit={() =>
          iniciarEdicion(
            venta
          )
        }
        onCancelEdit={
          cancelarEdicion
        }
        onSaveEdit={() =>
          guardarEdicion(
            venta.id
          )
        }
        hasChanges={
          editId ===
            venta.id &&
          hayCambiosEnEdicion()
        }
        onDelete={
          onDelete
        }
        onAddToFolder={
          agregarACarpeta
        }
        onRemoveFromFolder={
          deseleccionarDeCarpeta
        }
        inventarioCatalog={
          inventarioCatalog
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
    );

  /*
   * ========================================
   * FOLDER VIEW
   * ========================================
   */

  if (folderView) {
    const pedidos =
      obtenerPedidosCarpeta(
        folderView
      );

    const buscados =
      pedidos.filter(
        (venta) => {
          const term =
            filtroFolder
              .trim()
              .toLowerCase();

          if (!term) {
            return true;
          }

          return [
            venta.nombre,
            venta.id,
            venta.telefono,
            venta.direccion,
          ].some(
            (value) =>
              String(
                value || ""
              )
                .toLowerCase()
                .includes(
                  term
                )
          );
        }
      );

    const filtrados =
      buscados.filter(
        (venta) => {
          if (
            estadoFolder ===
            "todas"
          ) {
            return true;
          }

          if (
            estadoFolder ===
            "pendientes"
          ) {
            return tienePendientes(
              venta
            );
          }

          if (
            estadoFolder ===
            "listas"
          ) {
            return !tienePendientes(
              venta
            );
          }

          if (
            estadoFolder ===
            "debe"
          ) {
            return isDebtPayment(
              venta.metodo_pago
            );
          }

          return true;
        }
      );

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          filtrados.length /
            salesPerPage
        )
      );

    const page =
      Math.min(
        folderSalesPage,
        totalPages
      );

    const pageItems =
      filtrados.slice(
        (page - 1) *
          salesPerPage,
        page *
          salesPerPage
      );

    const total =
      pedidos.reduce(
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

    return (
      <div
        className="
          p-4
          lg:p-10
          max-w-7xl
          mx-auto
          pb-28
          font-black
        "
      >
        <ScrollToTop
          trigger={`${folderView.id}-${page}`}
        />

        <button
          type="button"
          onClick={() => {
            cancelarEdicion();
            setFolderView(
              null
            );
            setFolderSalesPage(
              1
            );
          }}
          className="
            mb-7
            flex
            items-center
            gap-2
            text-purple-500
            text-[10px]
            uppercase
          "
        >
          <ArrowLeft
            size={18}
          />

          Volver a Centros
        </button>

        <div
          className="
            mb-6
            bg-white
            p-6
            lg:p-8
            rounded-[2.5rem]
            shadow-lg
            border
            border-slate-100
            flex
            flex-col
            xl:flex-row
            justify-between
            gap-5
          "
        >
          <div>
            <h2
              className={`
                text-2xl
                lg:text-3xl
                italic
                uppercase

                ${
                  isDebtFolder(
                    folderView
                  )
                    ? "text-red-500"
                    : "text-purple-600"
                }
              `}
            >
              {
                folderView.nombre
              }{" "}
              <span className="opacity-40">
                (
                {
                  pedidos.length
                }
                )
              </span>
            </h2>

            <div
              className="
                relative
                mt-5
                max-w-md
              "
            >
              <Search
                size={15}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-300
                "
              />

              <input
                value={
                  filtroFolder
                }
                onChange={(
                  event
                ) => {
                  setFiltroFolder(
                    event.target
                      .value
                  );

                  setFolderSalesPage(
                    1
                  );
                }}
                placeholder="Buscar pedido..."
                className="
                  w-full
                  pl-11
                  pr-4
                  py-3
                  rounded-xl
                  bg-slate-50
                  border
                  border-slate-100
                  outline-none
                  text-xs
                "
              />
            </div>
          </div>

          <div
            className={`
              p-5
              rounded-2xl
              min-w-[220px]

              ${
                isDebtFolder(
                  folderView
                )
                  ? "bg-red-50"
                  : "bg-purple-50"
              }
            `}
          >
            <p
              className="
                text-[8px]
                uppercase
                tracking-widest
                text-slate-400
              "
            >
              Total acumulado
            </p>

            <p
              className={`
                mt-1
                text-2xl
                italic

                ${
                  isDebtFolder(
                    folderView
                  )
                    ? "text-red-500"
                    : "text-purple-600"
                }
              `}
            >
              {currency(
                total
              )}
            </p>
          </div>
        </div>

        <div
          className="
            mb-7
            flex
            flex-col
            sm:flex-row
            justify-between
            gap-4
          "
        >
          <StatusTabs
            value={
              estadoFolder
            }
            ventas={
              buscados
            }
            onChange={(
              value
            ) => {
              setEstadoFolder(
                value
              );

              setFolderSalesPage(
                1
              );
            }}
          />

          <span
            className="
              text-[8px]
              uppercase
              tracking-widest
              text-slate-300
            "
          >
            {
              filtrados.length
            }{" "}
            resultados
          </span>
        </div>

        <div className="space-y-7">
          {pageItems.map(
            (venta) =>
              renderSaleCard(
                venta,
                true
              )
          )}
        </div>

        <PaginationBar
          page={page}
          totalPages={
            totalPages
          }
          totalItems={
            filtrados.length
          }
          itemLabel="ventas"
          onPageChange={
            setFolderSalesPage
          }
        />
      </div>
    );
  }

  /*
   * ========================================
   * FOLDERS
   * ========================================
   */

  if (
    mode ===
    "carpetas"
  ) {
    const ordenadas =
      ordenarCarpetas(
        carpetas
      );

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          ordenadas.length /
            foldersPerPage
        )
      );

    const page =
      Math.min(
        folderPage,
        totalPages
      );

    const pageItems =
      ordenadas.slice(
        (page - 1) *
          foldersPerPage,
        page *
          foldersPerPage
      );

    return (
      <div
        className="
          p-4
          lg:p-10
          max-w-7xl
          mx-auto
          pb-28
          font-black
        "
      >
        <ScrollToTop
          trigger={`folders-${page}`}
        />

        <SaleFilters
          title="Centros Educativos."
          subtitle="Organiza tus pedidos por instituciones"
          count={
            carpetas.length
          }
          accentColor="text-purple-600"
          showSearch={
            false
          }
          rightContent={
            <div
              className="
                flex
                gap-3
                flex-wrap
              "
            >
              <button
                type="button"
                onClick={() =>
                  setMode(
                    "normal"
                  )
                }
                className="
                  px-5
                  py-4
                  bg-white
                  rounded-2xl
                  shadow-lg
                  text-[9px]
                  uppercase
                  text-slate-400
                  flex
                  items-center
                  gap-2
                "
              >
                <ArrowLeft
                  size={16}
                />

                Historial
              </button>

              <button
                type="button"
                onClick={
                  crearCarpeta
                }
                className="
                  px-5
                  py-4
                  bg-purple-600
                  text-white
                  rounded-2xl
                  shadow-lg
                  text-[9px]
                  uppercase
                  flex
                  items-center
                  gap-2
                "
              >
                <FolderPlus
                  size={16}
                />

                Nuevo Centro
              </button>
            </div>
          }
        />

        <div
          className="
            mb-6
            px-5
            py-4
            rounded-2xl
            bg-purple-50
            text-purple-500
            text-[8px]
            uppercase
            tracking-widest
          "
        >
          DEBE y PENDIENTES
          se administran
          automáticamente.
          Las demás carpetas se
          pueden arrastrar.
        </div>

        <DndContext
          sensors={
            sensors
          }
          collisionDetection={
            closestCenter
          }
          onDragStart={
            handleDragStart
          }
          onDragEnd={
            handleDragEnd
          }
        >
          <SortableContext
            items={pageItems.map(
              (folder) =>
                String(
                  folder.id
                )
            )}
            strategy={
              rectSortingStrategy
            }
          >
            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-6
              "
            >
              {pageItems.map(
                (folder) => {
                  const pedidos =
                    obtenerPedidosCarpeta(
                      folder
                    );

                  const total =
                    pedidos.reduce(
                      (
                        sum,
                        venta
                      ) =>
                        sum +
                        (Number(
                          venta.total
                        ) ||
                          0),
                      0
                    );

                  return (
                    <SaleFolder
                      key={
                        folder.id
                      }
                      folder={
                        folder
                      }
                      count={
                        pedidos.length
                      }
                      total={
                        total
                      }
                      system={
                        isSystemFolder(
                          folder
                        )
                      }
                      systemType={
                        folderSystemType(
                          folder
                        )
                      }
                      onOpen={() => {
                        setFolderView(
                          folder
                        );

                        setFolderSalesPage(
                          1
                        );
                      }}
                      onRename={() =>
                        editarNombreCarpeta(
                          folder
                        )
                      }
                      onDelete={() =>
                        eliminarCarpeta(
                          folder
                        )
                      }
                    />
                  );
                }
              )}
            </div>
          </SortableContext>
        </DndContext>

        <PaginationBar
          page={page}
          totalPages={
            totalPages
          }
          totalItems={
            ordenadas.length
          }
          itemLabel="centros"
          onPageChange={
            setFolderPage
          }
        />
      </div>
    );
  }

  /*
   * ========================================
   * NORMAL HISTORY
   * ========================================
   */

  const buscadas =
    ventas.filter(
      (venta) => {
        const term =
          filtro
            .trim()
            .toLowerCase();

        if (!term) {
          return true;
        }

        return [
          venta.nombre,
          venta.id,
          venta.telefono,
          venta.direccion,
          venta.metodo_pago,
        ].some(
          (value) =>
            String(
              value || ""
            )
              .toLowerCase()
              .includes(term)
        );
      }
    );

  const filtradas =
    buscadas.filter(
      (venta) => {
        if (
          estadoFiltro ===
          "todas"
        ) {
          return true;
        }

        if (
          estadoFiltro ===
          "listas"
        ) {
          return !tienePendientes(
            venta
          );
        }

        if (
          estadoFiltro ===
          "pendientes"
        ) {
          return tienePendientes(
            venta
          );
        }

        if (
          estadoFiltro ===
          "debe"
        ) {
          return isDebtPayment(
            venta.metodo_pago
          );
        }

        return true;
      }
    );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtradas.length /
          salesPerPage
      )
    );

  const currentPage =
    Math.min(
      pagina,
      totalPages
    );

  const pageItems =
    filtradas.slice(
      (currentPage -
        1) *
        salesPerPage,
      currentPage *
        salesPerPage
    );

  return (
    <div
      className="
        p-4
        lg:p-10
        max-w-7xl
        mx-auto
        pb-28
        font-black
      "
    >
      <ScrollToTop
        trigger={
          currentPage
        }
      />

      <SaleFilters
        title="Historial de Ventas."
        subtitle="Control total de pedidos y entregas"
        count={
          filtradas.length
        }
        accentColor="text-[#F79598]"
        searchValue={
          filtro
        }
        searchPlaceholder="Buscar pedido..."
        onSearchChange={(
          value
        ) => {
          setFiltro(
            value
          );

          setPagina(1);
        }}
        showSearch
        rightContent={
          <div
            className="
              flex
              gap-3
              flex-wrap
            "
          >
            <button
              type="button"
              onClick={() =>
                setMode(
                  "carpetas"
                )
              }
              className="
                px-5
                py-4
                bg-white
                shadow-lg
                rounded-2xl
                text-[9px]
                uppercase
                text-slate-400
                flex
                items-center
                gap-2
              "
            >
              <Folder
                size={16}
              />

              Ver Centros
            </button>

            <Link
              to="/cotizar"
              className="
                px-5
                py-4
                bg-[#F79598]
                text-white
                shadow-lg
                rounded-2xl
                text-[9px]
                uppercase
                flex
                items-center
                gap-2
              "
            >
              <Plus
                size={16}
              />

              Nueva Venta
            </Link>
          </div>
        }
      />

      <div
        className="
          mb-7
          flex
          flex-col
          sm:flex-row
          justify-between
          gap-4
        "
      >
        <StatusTabs
          value={
            estadoFiltro
          }
          ventas={
            buscadas
          }
          onChange={(
            value
          ) => {
            setEstadoFiltro(
              value
            );

            setPagina(1);
          }}
        />

        <span
          className="
            text-[8px]
            uppercase
            tracking-widest
            text-slate-300
          "
        >
          {
            filtradas.length
          }{" "}
          resultados
        </span>
      </div>

      <div className="space-y-7">
        {pageItems.map(
          (venta) =>
            renderSaleCard(
              venta
            )
        )}

        {!pageItems.length && (
          <div
            className="
              py-20
              text-center
              border-4
              border-dashed
              border-slate-100
              rounded-[3rem]
              text-slate-300
              italic
              uppercase
            "
          >
            Sin ventas
          </div>
        )}
      </div>

      <PaginationBar
        page={
          currentPage
        }
        totalPages={
          totalPages
        }
        totalItems={
          filtradas.length
        }
        itemLabel="ventas"
        onPageChange={
          setPagina
        }
      />
    </div>
  );
}