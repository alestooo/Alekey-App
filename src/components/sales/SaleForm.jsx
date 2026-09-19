import {
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  Box,
  ChevronDown,
  MapPin,
  Package,
  Plus,
  Save,
  ShoppingBag,
  Trash2,
  TrendingUp,
  User,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  supabase,
} from "../../lib/supabase";

import {
  UBICACIONES_CR,
} from "../../constants/locations";

import {
  PAYMENT_OPTIONS,
  PAYMENT_PLACEHOLDER,
  isDebtPayment,
} from "../../constants/payments";

import {
  currency,
  formatPhone,
  generateId,
} from "../../utils/formatters";

import QuantityControls from "../common/QuantityControls";
import ScrollToTop from "../common/ScrollToTop";

/*
 * ========================================
 * CONFIG
 * ========================================
 */

const SELLERS = [
  "Vendedor...",
  "Alejandro",
  "Isabel",
  "Jason",
];

const createEmptyItem =
  () => ({
    id:
      crypto.randomUUID?.() ??
      `${Date.now()}-${Math.random()}`,

    cant: 1,
    cat: "",
    tema: "",
    precio: 0,
    pendiente: 0,
    inventario_id: null,
    stock_disponible: null,
  });

/*
 * ========================================
 * PAGE
 * ========================================
 */

export default function SaleForm({
  alGuardar,
  inventarioCatalog = [],
  refrescarInventario,
}) {
  const navigate =
    useNavigate();

  /*
   * CLIENT
   */

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    tel,
    setTel,
  ] = useState("");

  const [
    provincia,
    setProvincia,
  ] = useState("");

  const [
    direccion,
    setDireccion,
  ] = useState("");

  const [
    encargado,
    setEncargado,
  ] = useState(
    "Vendedor..."
  );

  const [
    metodoPago,
    setMetodoPago,
  ] = useState(
    PAYMENT_PLACEHOLDER
  );

  const [
    comentario,
    setComentario,
  ] = useState("");

  /*
   * PRODUCTS
   */

  const [
    items,
    setItems,
  ] = useState([
    createEmptyItem(),
  ]);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  /*
   * ACTIVE INVENTORY
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

  /*
   * CATEGORIES
   */

  const categoriasInventario =
    useMemo(() => {
      const categorias = [
        ...new Set(
          inventarioActivo
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
        ...categorias,
        "OTROS...",
      ];
    }, [
      inventarioActivo,
    ]);

  /*
   * THEMES
   */

  const temasPorCategoria =
    (categoria) => {
      if (
        !categoria ||
        categoria ===
          "OTROS..."
      ) {
        return [];
      }

      return [
        ...new Set(
          inventarioActivo
            .filter(
              (item) =>
                item.categoria ===
                categoria
            )
            .map(
              (item) =>
                item.tema
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
    };

  /*
   * FIND PRODUCT
   */

  const buscarProducto =
    (
      categoria,
      tema
    ) => {
      if (
        !categoria ||
        !tema ||
        categoria ===
          "OTROS..."
      ) {
        return null;
      }

      return (
        inventarioActivo.find(
          (item) =>
            item.categoria ===
              categoria &&
            item.tema ===
              tema
        ) || null
      );
    };

  /*
   * CATEGORY BASE PRICE
   */

  const precioBaseCategoria =
    (categoria) => {
      if (
        !categoria ||
        categoria ===
          "OTROS..."
      ) {
        return 0;
      }

      const producto =
        inventarioActivo.find(
          (item) =>
            item.categoria ===
              categoria &&
            Number(
              item.precio
            ) > 0
        );

      return (
        Number(
          producto?.precio
        ) || 0
      );
    };

  /*
   * TOTAL
   */

  const total =
    useMemo(() => {
      return items.reduce(
        (
          sum,
          item
        ) =>
          sum +
          (Number(
            item.cant
          ) || 0) *
            (Number(
              item.precio
            ) || 0),
        0
      );
    }, [
      items,
    ]);

  /*
   * PENDING
   */

  const piezasPendientes =
    useMemo(() => {
      return items.reduce(
        (
          sum,
          item
        ) =>
          sum +
          (Number(
            item.pendiente
          ) || 0),
        0
      );
    }, [
      items,
    ]);

  /*
   * VALIDATION
   */

  const telefonoValido =
    tel.replace(
      /\D/g,
      ""
    ).length === 8;

  const itemsValidos =
    items.length >
      0 &&
    items.every(
      (item) => {
        if (
          !item.cat ||
          !item.tema
        ) {
          return false;
        }

        if (
          item.cat ===
          "OTROS..."
        ) {
          return (
            Number(
              item.precio
            ) >= 0
          );
        }

        return Boolean(
          item.inventario_id
        );
      }
    );

  const esValido =
    nombre.trim().length >
      0 &&
    telefonoValido &&
    itemsValidos;

  /*
   * ITEM CRUD
   */

  const agregarLinea =
    () => {
      setItems(
        (previous) => [
          ...previous,
          createEmptyItem(),
        ]
      );
    };

  const borrarLinea =
    (id) => {
      setItems(
        (previous) => {
          if (
            previous.length <=
            1
          ) {
            return previous;
          }

          return previous.filter(
            (item) =>
              item.id !==
              id
          );
        }
      );
    };

  /*
   * UPDATE PRODUCT
   */

  const actualizarItem =
    (
      id,
      field,
      value
    ) => {
      setItems(
        (previous) =>
          previous.map(
            (item) => {
              if (
                item.id !==
                id
              ) {
                return item;
              }

              /*
               * CATEGORY
               */

              if (
                field ===
                "cat"
              ) {
                return {
                  ...item,

                  cat:
                    value,

                  tema:
                    "",

                  precio:
                    value ===
                    "OTROS..."
                      ? 0
                      : precioBaseCategoria(
                          value
                        ),

                  pendiente:
                    0,

                  inventario_id:
                    null,

                  stock_disponible:
                    null,
                };
              }

              /*
               * THEME
               */

              if (
                field ===
                "tema"
              ) {
                if (
                  item.cat ===
                  "OTROS..."
                ) {
                  return {
                    ...item,

                    tema:
                      value,

                    inventario_id:
                      null,

                    stock_disponible:
                      null,

                    pendiente:
                      0,
                  };
                }

                const producto =
                  buscarProducto(
                    item.cat,
                    value
                  );

                if (
                  !producto
                ) {
                  return {
                    ...item,

                    tema:
                      value,

                    inventario_id:
                      null,

                    stock_disponible:
                      0,

                    pendiente:
                      0,
                  };
                }

                const stock =
                  Math.max(
                    0,
                    Number(
                      producto.stock
                    ) || 0
                  );

                const cantidad =
                  Math.max(
                    1,
                    Number(
                      item.cant
                    ) || 1
                  );

                return {
                  ...item,

                  tema:
                    value,

                  precio:
                    Number(
                      producto.precio
                    ) ||
                    precioBaseCategoria(
                      item.cat
                    ),

                  inventario_id:
                    producto.id,

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

              /*
               * QUANTITY
               */

              if (
                field ===
                "cant"
              ) {
                const cantidad =
                  Math.max(
                    1,
                    Math.min(
                      99,
                      Number(
                        value
                      ) || 1
                    )
                  );

                if (
                  item.cat ===
                    "OTROS..." ||
                  !item.inventario_id
                ) {
                  return {
                    ...item,

                    cant:
                      cantidad,

                    pendiente:
                      Math.min(
                        cantidad,
                        Number(
                          item.pendiente
                        ) || 0
                      ),
                  };
                }

                const stock =
                  Math.max(
                    0,
                    Number(
                      item.stock_disponible
                    ) || 0
                  );

                return {
                  ...item,

                  cant:
                    cantidad,

                  pendiente:
                    Math.max(
                      0,
                      cantidad -
                        stock
                    ),
                };
              }

              /*
               * PENDING
               */

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
                        ) || 0,
                        Number(
                          value
                        ) || 0
                      )
                    ),
                };
              }

              /*
               * CUSTOM PRICE
               */

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
                      Number(
                        value
                      ) || 0
                    ),
                };
              }

              return {
                ...item,

                [field]:
                  value,
              };
            }
          )
      );
    };

  /*
   * ========================================
   * INVENTORY DISCOUNT
   * ========================================
   */

  const descontarInventario =
    async () => {
      const cantidades =
        new Map();

      items.forEach(
        (item) => {
          if (
            !item.inventario_id ||
            item.cat ===
              "OTROS..."
          ) {
            return;
          }

          const id =
            String(
              item.inventario_id
            );

          cantidades.set(
            id,
            (cantidades.get(
              id
            ) || 0) +
              (Number(
                item.cant
              ) || 0)
          );
        }
      );

      for (
        const [
          id,
          cantidad,
        ] of cantidades
      ) {
        const producto =
          inventarioActivo.find(
            (item) =>
              String(
                item.id
              ) === id
          );

        if (!producto) {
          continue;
        }

        const stockActual =
          Math.max(
            0,
            Number(
              producto.stock
            ) || 0
          );

        const nuevoStock =
          Math.max(
            0,
            stockActual -
              cantidad
          );

        const {
          error,
        } = await supabase
          .from(
            "inventario"
          )
          .update({
            stock:
              nuevoStock,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            producto.id
          );

        if (error) {
          throw error;
        }
      }

      await refrescarInventario?.();
    };

  /*
   * ========================================
   * SAVE
   * ========================================
   */

  const guardar =
    async () => {
      if (
        !esValido ||
        guardando
      ) {
        return;
      }

      setGuardando(true);

      try {
        const ventaItems =
          items.map(
            (item) => ({
              id:
                item.id,

              cant:
                Number(
                  item.cant
                ) || 1,

              cat:
                item.cat,

              tema:
                item.tema,

              precio:
                Number(
                  item.precio
                ) || 0,

              pendiente:
                Number(
                  item.pendiente
                ) || 0,

              inventario_id:
                item.inventario_id ||
                null,
            })
          );

        const direccionFinal =
          provincia &&
          direccion
            ? `${provincia}, ${direccion}`
            : provincia ||
              "";

        const nueva = {
          id:
            generateId(),

          nombre:
            nombre.trim(),

          telefono:
            tel,

          direccion:
            direccionFinal,

          items:
            ventaItems,

          total,

          encargado,

          metodo_pago:
            metodoPago,

          comentario:
            comentario.trim(),

          fecha:
            new Date().toLocaleDateString(
              "es-CR"
            ),

          created_at:
            new Date().toISOString(),
        };

        const ok =
          await alGuardar(
            nueva
          );

        if (
          ok === false
        ) {
          return;
        }

        await descontarInventario();

        navigate(
          "/ventas"
        );
      } catch (error) {
        console.error(
          "Error guardando venta:",
          error
        );

        await Swal.fire({
          title:
            "No se pudo guardar",

          text:
            error.message ||
            "Ocurrió un error al guardar el pedido.",

          icon:
            "error",

          confirmButtonColor:
            "#F79598",
        });
      } finally {
        setGuardando(
          false
        );
      }
    };

  /*
   * ========================================
   * RENDER
   * ========================================
   */

  return (
    <div
      className="
        p-3
        sm:p-4
        lg:p-10

        max-w-7xl
        mx-auto

        pb-28

        animate-in
        font-black
      "
    >
      <ScrollToTop />

      <div
        className="
          bg-white

          rounded-[2rem]
          sm:rounded-[2.7rem]
          lg:rounded-[4rem]

          shadow-xl

          overflow-hidden

          border
          border-slate-50
        "
      >
        {/* =================================
            HEADER
        ================================= */}

        <header
          className="
            p-5
            sm:p-7
            lg:p-12

            bg-slate-900
            text-white

            flex
            flex-col
            lg:flex-row

            justify-between
            items-center

            gap-5
          "
        >
          <div
            className="
              w-full

              text-left
              lg:w-auto
            "
          >
            <h1
              className="
                text-2xl
                sm:text-3xl
                lg:text-4xl

                italic
                uppercase

                tracking-tighter
              "
            >
              Nueva Venta
              <span className="text-[#8ED4BE]">
                .
              </span>
            </h1>

            <p
              className="
                mt-1

                text-[8px]
                lg:text-[10px]

                uppercase
                tracking-widest

                text-slate-400
              "
            >
              Crear pedido
            </p>
          </div>

          <div
            className="
              w-full
              lg:w-auto

              flex
              items-center
              justify-between
              lg:justify-start

              gap-4

              bg-white/5

              p-4

              rounded-2xl

              border
              border-white/10
            "
          >
            <div>
              <p
                className="
                  text-[7px]
                  uppercase
                  tracking-widest
                  text-slate-400
                "
              >
                Total
              </p>

              <p
                className="
                  mt-1
                  text-xl
                  lg:text-3xl
                  italic
                  text-[#8ED4BE]
                "
              >
                {currency(
                  total
                )}
              </p>
            </div>

            <Package
              size={22}
              className="text-[#8ED4BE]"
            />
          </div>
        </header>

        {/* =================================
            CONTENT
        ================================= */}

        <div
          className="
            p-4
            sm:p-6
            lg:p-12

            space-y-7
            lg:space-y-9

            text-slate-800
          "
        >
          {/* ===============================
              CLIENT
          =============================== */}

          <FormSection
            icon={User}
            title="Cliente"
            subtitle="Datos principales"
          >
            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
              "
            >
              <Field>
                <FieldLabel>
                  Nombre / Cliente
                </FieldLabel>

                <input
                  type="text"
                  value={nombre}
                  onChange={(
                    event
                  ) =>
                    setNombre(
                      event.target
                        .value
                    )
                  }
                  placeholder="Nombre del cliente o institución"
                  className="
                    sale-form-control
                    w-full
                  "
                />
              </Field>

              <Field>
                <FieldLabel>
                  Teléfono
                </FieldLabel>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={tel}
                  onChange={(
                    event
                  ) =>
                    setTel(
                      formatPhone(
                        event.target
                          .value
                      )
                    )
                  }
                  placeholder="8888-8888"
                  className={`
                    sale-form-control
                    w-full

                    ${
                      tel &&
                      !telefonoValido
                        ? "sale-form-control-error"
                        : ""
                    }
                  `}
                />
              </Field>
            </div>
          </FormSection>

          {/* ===============================
              SALE INFO
          =============================== */}

          <FormSection
            icon={ShoppingBag}
            title="Venta"
            subtitle="Vendedor y pago"
          >
            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
              "
            >
              <Field>
                <FieldLabel>
                  Vendedor
                </FieldLabel>

                <SelectShell>
                  <select
                    value={
                      encargado
                    }
                    onChange={(
                      event
                    ) =>
                      setEncargado(
                        event.target
                          .value
                      )
                    }
                    className="
                      sale-form-select
                    "
                  >
                    {SELLERS.map(
                      (
                        seller
                      ) => (
                        <option
                          key={
                            seller
                          }
                          value={
                            seller
                          }
                        >
                          {
                            seller
                          }
                        </option>
                      )
                    )}
                  </select>
                </SelectShell>
              </Field>

              <Field>
                <FieldLabel>
                  Método de Pago
                </FieldLabel>

                <SelectShell
                  danger={isDebtPayment(
                    metodoPago
                  )}
                >
                  <select
                    value={
                      metodoPago
                    }
                    onChange={(
                      event
                    ) =>
                      setMetodoPago(
                        event.target
                          .value
                      )
                    }
                    className={`
                      sale-form-select

                      ${
                        isDebtPayment(
                          metodoPago
                        )
                          ? "sale-form-select-debt"
                          : ""
                      }
                    `}
                  >
                    {PAYMENT_OPTIONS.map(
                      (
                        option
                      ) => (
                        <option
                          key={
                            option
                          }
                          value={
                            option
                          }
                        >
                          {
                            option
                          }
                        </option>
                      )
                    )}
                  </select>
                </SelectShell>
              </Field>
            </div>
          </FormSection>

          {/* DEBE */}

          {isDebtPayment(
            metodoPago
          ) && (
            <div
              className="
                rounded-2xl
                overflow-hidden

                border-2
                border-red-500
              "
            >
              <div
                className="
                  bg-red-600
                  text-white

                  px-4
                  py-3

                  flex
                  items-center
                  gap-3
                "
              >
                <AlertTriangle
                  size={19}
                />

                <div>
                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-wide
                    "
                  >
                    DEBE · Pago
                    pendiente
                  </p>

                  <p
                    className="
                      mt-0.5

                      text-[7px]
                      uppercase
                      tracking-widest

                      text-red-100
                    "
                  >
                    Se agregará
                    automáticamente
                    a DEBE
                  </p>
                </div>
              </div>

              <div
                className="
                  bg-red-50
                  text-red-500

                  px-4
                  py-3

                  flex
                  items-center
                  gap-3
                "
              >
                <WalletCards
                  size={17}
                />

                <p
                  className="
                    text-[8px]
                    uppercase
                    leading-relaxed
                  "
                >
                  Cuando pague,
                  cambia el método
                  desde el historial.
                </p>
              </div>
            </div>
          )}

          {/* ===============================
              LOCATION
          =============================== */}

          <FormSection
            icon={MapPin}
            title="Ubicación"
            subtitle="Opcional"
            soft
          >
            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
              "
            >
              <Field>
                <FieldLabel>
                  Provincia
                </FieldLabel>

                <SelectShell>
                  <select
                    value={
                      provincia
                    }
                    onChange={(
                      event
                    ) => {
                      setProvincia(
                        event.target
                          .value
                      );

                      setDireccion(
                        ""
                      );
                    }}
                    className="
                      sale-form-select
                    "
                  >
                    <option value="">
                      Provincia...
                    </option>

                    {Object.keys(
                      UBICACIONES_CR
                    ).map(
                      (
                        itemProvincia
                      ) => (
                        <option
                          key={
                            itemProvincia
                          }
                          value={
                            itemProvincia
                          }
                        >
                          {
                            itemProvincia
                          }
                        </option>
                      )
                    )}
                  </select>
                </SelectShell>
              </Field>

              <Field>
                <FieldLabel>
                  Cantón
                </FieldLabel>

                <SelectShell
                  disabled={
                    !provincia
                  }
                >
                  <select
                    value={
                      direccion
                    }
                    disabled={
                      !provincia
                    }
                    onChange={(
                      event
                    ) =>
                      setDireccion(
                        event.target
                          .value
                      )
                    }
                    className="
                      sale-form-select
                    "
                  >
                    <option value="">
                      Cantón...
                    </option>

                    {provincia &&
                      UBICACIONES_CR[
                        provincia
                      ]?.map(
                        (
                          canton
                        ) => (
                          <option
                            key={
                              canton
                            }
                            value={
                              canton
                            }
                          >
                            {
                              canton
                            }
                          </option>
                        )
                      )}
                  </select>
                </SelectShell>
              </Field>
            </div>
          </FormSection>

          {/* ===============================
              PRODUCTS
          =============================== */}

          <section>
            <div
              className="
                mb-4

                flex
                items-center
                justify-between
                gap-4
              "
            >
              <SectionTitle
                icon={Box}
                title="Productos"
                subtitle={`${items.length} líneas · ${piezasPendientes} pendientes`}
              />

              <button
                type="button"
                onClick={
                  agregarLinea
                }
                className="
                  shrink-0

                  h-11
                  px-4

                  rounded-2xl

                  bg-slate-900
                  text-white

                  flex
                  items-center
                  justify-center
                  gap-2

                  text-[8px]
                  uppercase

                  hover:bg-[#8ED4BE]
                  hover:text-slate-900

                  transition-all
                "
              >
                <Plus
                  size={15}
                />

                <span
                  className="
                    hidden
                    sm:inline
                  "
                >
                  Agregar
                  producto
                </span>

                <span
                  className="
                    sm:hidden
                  "
                >
                  Agregar
                </span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map(
                (
                  item,
                  index
                ) => (
                  <ProductRow
                    key={
                      item.id
                    }
                    item={
                      item
                    }
                    index={
                      index
                    }
                    categorias={
                      categoriasInventario
                    }
                    temas={
                      temasPorCategoria(
                        item.cat
                      )
                    }
                    canDelete={
                      items.length >
                      1
                    }
                    onChange={(
                      field,
                      value
                    ) =>
                      actualizarItem(
                        item.id,
                        field,
                        value
                      )
                    }
                    onDelete={() =>
                      borrarLinea(
                        item.id
                      )
                    }
                  />
                )
              )}
            </div>
          </section>

          {/* ===============================
              COMMENT
          =============================== */}

          <FormSection
            icon={TrendingUp}
            title="Notas"
            subtitle="Opcional"
          >
            <textarea
              rows={3}
              value={
                comentario
              }
              onChange={(
                event
              ) =>
                setComentario(
                  event.target
                    .value
                )
              }
              placeholder="Notas adicionales..."
              className="
                sale-form-control
                w-full
                resize-none
              "
            />
          </FormSection>

          {/* ===============================
              SUMMARY
          =============================== */}

          <div
            className="
              grid
              grid-cols-3
              gap-2
              sm:gap-3
            "
          >
            <SummaryCard
              label="Líneas"
              value={
                items.length
              }
            />

            <SummaryCard
              label="Pend."
              value={
                piezasPendientes
              }
              danger={
                piezasPendientes >
                0
              }
            />

            <SummaryCard
              label="Total"
              value={currency(
                total
              )}
              highlight
            />
          </div>

          {/* ===============================
              SAVE
          =============================== */}

          <div
            className="
              pt-2

              flex
              flex-col-reverse
              sm:flex-row

              justify-end
              gap-3
            "
          >
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/ventas"
                )
              }
              className="
                px-6
                py-4

                rounded-2xl

                bg-slate-100
                text-slate-500

                text-[9px]
                uppercase
              "
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={
                !esValido ||
                guardando
              }
              onClick={
                guardar
              }
              className={`
                min-w-[200px]

                px-6
                py-4

                rounded-2xl

                flex
                items-center
                justify-center
                gap-2

                text-[9px]
                uppercase

                shadow-lg

                ${
                  isDebtPayment(
                    metodoPago
                  )
                    ? "bg-red-600 text-white"
                    : "bg-[#8ED4BE] text-slate-900"
                }

                disabled:opacity-30
                disabled:pointer-events-none
              `}
            >
              <Save
                size={17}
              />

              {guardando
                ? "Guardando..."
                : isDebtPayment(
                    metodoPago
                  )
                  ? "Guardar DEBE"
                  : "Guardar Venta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * ========================================
 * PRODUCT
 * ========================================
 */

function ProductRow({
  item,
  index,
  categorias,
  temas,
  canDelete,
  onChange,
  onDelete,
}) {
  const pendiente =
    Number(
      item.pendiente
    ) || 0;

  const stock =
    Number(
      item.stock_disponible
    ) || 0;

  const hasStock =
    item.inventario_id !==
      null &&
    item.inventario_id !==
      undefined;

  const subtotal =
    (Number(
      item.cant
    ) || 0) *
    (Number(
      item.precio
    ) || 0);

  return (
    <article
      className={`
        sale-product-card

        ${
          pendiente > 0
            ? "sale-product-card-pending"
            : ""
        }
      `}
    >
      {/* TOP */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
          mb-4
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            min-w-0
          "
        >
          <div
            className="
              w-9
              h-9
              rounded-xl

              bg-white

              flex
              items-center
              justify-center

              text-[9px]
              text-slate-500

              shadow-sm
              shrink-0
            "
          >
            {index + 1}
          </div>

          <div className="min-w-0">
            <p
              className="
                text-[8px]
                uppercase
                tracking-widest
                text-slate-500
              "
            >
              Producto
            </p>

            {hasStock && (
              <p
                className="
                  mt-1
                  text-[7px]
                  uppercase
                  tracking-wide
                  text-slate-300
                "
              >
                Stock disponible:
                {" "}
                {stock}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={
            !canDelete
          }
          onClick={
            onDelete
          }
          className="
            w-9
            h-9

            rounded-xl

            bg-red-50
            text-red-300

            flex
            items-center
            justify-center

            shrink-0

            disabled:opacity-20
          "
        >
          <Trash2
            size={14}
          />
        </button>
      </div>

      {/* CATEGORY / THEME */}

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-3
        "
      >
        <Field compact>
          <FieldLabel>
            Categoría
          </FieldLabel>

          <SelectShell>
            <select
              value={
                item.cat
              }
              onChange={(
                event
              ) =>
                onChange(
                  "cat",
                  event.target
                    .value
                )
              }
              className="
                sale-form-select
              "
            >
              <option value="">
                Seleccionar...
              </option>

              {categorias.map(
                (
                  categoria
                ) => (
                  <option
                    key={
                      categoria
                    }
                    value={
                      categoria
                    }
                  >
                    {
                      categoria
                    }
                  </option>
                )
              )}
            </select>
          </SelectShell>
        </Field>

        <Field compact>
          <FieldLabel>
            Tema
          </FieldLabel>

          {item.cat ===
          "OTROS..." ? (
            <input
              value={
                item.tema
              }
              onChange={(
                event
              ) =>
                onChange(
                  "tema",
                  event.target
                    .value
                )
              }
              placeholder="Descripción..."
              className="
                sale-form-control
                w-full
              "
            />
          ) : (
            <SelectShell
              disabled={
                !item.cat
              }
            >
              <select
                value={
                  item.tema
                }
                disabled={
                  !item.cat
                }
                onChange={(
                  event
                ) =>
                  onChange(
                    "tema",
                    event.target
                      .value
                  )
                }
                className="
                  sale-form-select
                "
              >
                <option value="">
                  Seleccionar...
                </option>

                {temas.map(
                  (tema) => (
                    <option
                      key={
                        tema
                      }
                      value={
                        tema
                      }
                    >
                      {tema}
                    </option>
                  )
                )}
              </select>
            </SelectShell>
          )}
        </Field>
      </div>

      {/* PRICE */}

      <div
        className="
          mt-3
          sale-product-price
        "
      >
        <span
          className="
            text-[7px]
            uppercase
            tracking-widest
            text-slate-400
          "
        >
          Precio
        </span>

        {item.cat ===
        "OTROS..." ? (
          <input
            type="number"
            min="0"
            value={
              item.precio
            }
            onChange={(
              event
            ) =>
              onChange(
                "precio",
                Number.parseFloat(
                  event.target
                    .value
                ) || 0
              )
            }
            className="
              sale-price-input
            "
          />
        ) : (
          <strong
            className="
              text-sm
              italic
              text-slate-700
            "
          >
            {currency(
              Number(
                item.precio
              ) || 0
            )}
          </strong>
        )}
      </div>

      {/* MOBILE-FRIENDLY QUANTITY / PENDING */}

      <div
        className="
          mt-4

          grid
          grid-cols-2
          gap-3
        "
      >
        <div
          className="
            sale-number-box
          "
        >
          <span
            className="
              sale-number-label
            "
          >
            Cantidad
          </span>

          <QuantityControls
            value={
              Number(
                item.cant
              ) || 1
            }
            min={1}
            max={99}
            onChange={(
              value
            ) =>
              onChange(
                "cant",
                value
              )
            }
          />
        </div>

        <div
          className="
            sale-number-box
            items-end
          "
        >
          <span
            className="
              sale-number-label
              text-right
            "
          >
            Pendiente
          </span>

          <QuantityControls
            value={
              pendiente
            }
            min={0}
            max={
              Number(
                item.cant
              ) || 0
            }
            onChange={(
              value
            ) =>
              onChange(
                "pendiente",
                value
              )
            }
          />
        </div>
      </div>

      {/* FOOT */}

      <div
        className="
          mt-4
          pt-3

          border-t
          border-slate-100

          flex
          items-center
          justify-between
          gap-3
        "
      >
        {pendiente > 0 ? (
          <span
            className="
              inline-flex
              items-center
              gap-1.5

              px-3
              py-2

              rounded-xl

              bg-red-500
              text-white

              text-[7px]
              uppercase
            "
          >
            <AlertTriangle
              size={11}
            />

            {pendiente}
            {" "}
            pendiente
          </span>
        ) : (
          <span
            className="
              px-3
              py-2

              rounded-xl

              bg-emerald-50
              text-emerald-500

              text-[7px]
              uppercase
            "
          >
            Disponible
          </span>
        )}

        <span
          className="
            text-xs
            sm:text-sm

            italic
            text-slate-700

            text-right
          "
        >
          Subtotal{" "}
          <strong>
            {currency(
              subtotal
            )}
          </strong>
        </span>
      </div>
    </article>
  );
}

/*
 * ========================================
 * FORM COMPONENTS
 * ========================================
 */

function FormSection({
  icon: Icon,
  title,
  subtitle,
  children,
  soft = false,
}) {
  return (
    <section
      className={`
        sale-form-section

        ${
          soft
            ? "sale-form-section-soft"
            : ""
        }
      `}
    >
      <SectionTitle
        icon={Icon}
        title={title}
        subtitle={
          subtitle
        }
      />

      <div className="mt-4">
        {children}
      </div>
    </section>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
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

          shrink-0
        "
      >
        <Icon
          size={17}
        />
      </div>

      <div className="min-w-0">
        <h2
          className="
            text-xs
            sm:text-sm

            italic
            uppercase

            text-slate-800
          "
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className="
              mt-0.5

              text-[7px]
              uppercase
              tracking-widest

              text-slate-400
            "
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  children,
  compact = false,
}) {
  return (
    <div
      className={
        compact
          ? "space-y-1.5"
          : "space-y-2"
      }
    >
      {children}
    </div>
  );
}

function FieldLabel({
  children,
}) {
  return (
    <label
      className="
        ml-2

        text-[7px]
        sm:text-[8px]

        uppercase
        tracking-widest

        text-slate-400
      "
    >
      {children}
    </label>
  );
}

function SelectShell({
  children,
  danger = false,
  disabled = false,
}) {
  return (
    <div
      className={`
        sale-select-shell

        ${
          danger
            ? "sale-select-shell-danger"
            : ""
        }

        ${
          disabled
            ? "opacity-40"
            : ""
        }
      `}
    >
      {children}

      <ChevronDown
        size={15}
        className="
          sale-select-chevron
        "
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  danger = false,
  highlight = false,
}) {
  return (
    <div
      className={`
        p-3
        sm:p-4

        rounded-2xl

        border

        min-w-0

        ${
          danger
            ? "bg-red-50 border-red-100"
            : highlight
              ? "bg-[#8ED4BE]/10 border-[#8ED4BE]/30"
              : "bg-slate-50 border-slate-100"
        }
      `}
    >
      <p
        className="
          text-[6px]
          sm:text-[8px]

          uppercase
          tracking-widest

          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1

          text-sm
          sm:text-lg

          italic
          truncate

          ${
            danger
              ? "text-red-500"
              : highlight
                ? "text-[#58B99A]"
                : "text-slate-800"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}