import {
  AlertTriangle,
  Check,
  Edit2,
  FolderMinus,
  FolderPlus,
  Plus,
  Printer,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

import QuantityControls from "../common/QuantityControls";
import ProductCombobox from "./ProductCombobox";

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
} from "../../utils/formatters";

import {
  exportToPDF,
} from "../../utils/pdf";

export default function SaleCard({
  venta,
  inFolder = false,
  folderView = null,

  editing = false,
  editCache = null,
  setEditCache,

  provinciaEdit = "",
  setProvinciaEdit,

  cantonEdit = "",
  setCantonEdit,

  onStartEdit,
  onCancelEdit,
  onSaveEdit,

  hasChanges = false,

  onDelete,
  onAddToFolder,
  onRemoveFromFolder,

  inventarioCatalog = [],

  onEditItem,
  onAddLine,
  onDeleteLine,
  onEditDiscount,
}) {
  const data =
    editing
      ? editCache
      : venta;

  if (!data) {
    return null;
  }

  const subtotalProductos =
    (
      data.items ||
      []
    ).reduce(
      (
        total,
        item
      ) =>
        total +
        (Number(
          item.cant
        ) || 0) *
          (Number(
            item.precio
          ) || 0),
      0
    );

  const descuentoVenta =
    Math.min(
      subtotalProductos,
      Math.max(
        0,
        Number(
          data.descuento
        ) || 0
      )
    );

  const inventarioActivo =
    (
      inventarioCatalog ||
      []
    ).filter(
      (producto) =>
        producto?.activo !==
        false
    );

  const categorias =
    [
      ...new Set(
        inventarioActivo
          .map(
            (producto) =>
              producto.categoria
          )
          .filter(Boolean)
      ),
    ].sort(
      (a, b) =>
        String(a).localeCompare(
          String(b),
          "es",
          {
            sensitivity:
              "base",
          }
        )
    );

  if (
    !categorias.includes(
      "OTROS..."
    )
  ) {
    categorias.push(
      "OTROS..."
    );
  }

  const obtenerTemas =
    (categoria) =>
      [
        ...new Set(
          inventarioActivo
            .filter(
              (producto) =>
                producto.categoria ===
                categoria
            )
            .map(
              (producto) =>
                producto.tema
            )
            .filter(Boolean)
        ),
      ].sort(
        (a, b) =>
          String(a).localeCompare(
            String(b),
            "es",
            {
              sensitivity:
                "base",
            }
          )
      );

  const tienePendientes =
    (
      data.items ||
      []
    ).some(
      (item) =>
        Number(
          item.pendiente
        ) > 0
    );

  const esDebe =
    isDebtPayment(
      data.metodo_pago
    );

  const borderColor =
    esDebe
      ? "#EF4444"
      : tienePendientes
        ? "#F79598"
        : "#8ED4BE";

  const editValido =
    String(
      data.nombre || ""
    ).trim().length >
      0 &&
    String(
      data.telefono ||
        ""
    ).replace(
      /\D/g,
      ""
    ).length === 8 &&
    (
      data.items ||
      []
    ).length > 0;

  const setField = (
    field,
    value
  ) => {
    setEditCache?.(
      (previous) => ({
        ...previous,
        [field]:
          value,
      })
    );
  };

  const metodoPago =
    data.metodo_pago ||
    PAYMENT_PLACEHOLDER;

  return (
    <article
      style={{
        borderLeftColor:
          borderColor,
      }}
      className={`
        sale-card
        ${
          esDebe
            ? "sale-card--debt"
            : ""
        }

        rounded-[2.4rem]
        border-l-[10px]
        shadow-xl
        overflow-hidden
      `}
    >
      {/* =================================
          DEBE
      ================================= */}

      {esDebe && (
        <button
          type="button"
          onClick={
            editing
              ? undefined
              : onStartEdit
          }
          className="
            sale-debt-banner
            w-full
            px-5
            py-3
            flex
            flex-col
            sm:flex-row
            sm:items-center
            justify-between
            gap-2
            text-left
          "
        >
          <span
            className="
              flex
              items-center
              gap-2
              text-sm
              font-black
              uppercase
              tracking-wide
            "
          >
            <AlertTriangle
              size={18}
            />

            DEBE · PAGO PENDIENTE
          </span>

          {!editing && (
            <span
              className="
                text-[8px]
                uppercase
                tracking-widest
                opacity-80
              "
            >
              Toca para editar
              el pago
            </span>
          )}
        </button>
      )}

      {/* =================================
          HEADER
      ================================= */}

      <div
        className="
          sale-card-header
          p-5
          lg:p-7
          border-b
          border-slate-100
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-start
            justify-between
            gap-5
          "
        >
          <div
            className="
              flex-1
              min-w-0
            "
          >
            {editing ? (
              <div className="space-y-4">
                <input
                  value={
                    data.nombre ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "nombre",
                      event.target
                        .value
                    )
                  }
                  className="
                    sale-edit-input
                    w-full
                    p-3
                    rounded-xl
                    border-2
                    border-[#8ED4BE]
                    text-xl
                    lg:text-2xl
                    italic
                    outline-none
                  "
                />

                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    xl:grid-cols-5
                    gap-3
                  "
                >
                  <input
                    value={
                      data.telefono ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      setField(
                        "telefono",
                        formatPhone(
                          event
                            .target
                            .value
                        )
                      )
                    }
                    placeholder="Teléfono"
                    className="sale-edit-input"
                  />

                  <select
                    value={
                      provinciaEdit
                    }
                    onChange={(
                      event
                    ) => {
                      setProvinciaEdit?.(
                        event.target
                          .value
                      );

                      setCantonEdit?.(
                        ""
                      );
                    }}
                    className="sale-edit-input"
                  >
                    <option value="">
                      Provincia...
                    </option>

                    {Object.keys(
                      UBICACIONES_CR
                    ).map(
                      (
                        provincia
                      ) => (
                        <option
                          key={
                            provincia
                          }
                          value={
                            provincia
                          }
                        >
                          {
                            provincia
                          }
                        </option>
                      )
                    )}
                  </select>

                  <select
                    value={
                      cantonEdit
                    }
                    disabled={
                      !provinciaEdit
                    }
                    onChange={(
                      event
                    ) =>
                      setCantonEdit?.(
                        event.target
                          .value
                      )
                    }
                    className="sale-edit-input"
                  >
                    <option value="">
                      Cantón...
                    </option>

                    {provinciaEdit &&
                      UBICACIONES_CR[
                        provinciaEdit
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

                  <select
                    value={
                      data.encargado ||
                      "Vendedor..."
                    }
                    onChange={(
                      event
                    ) =>
                      setField(
                        "encargado",
                        event.target
                          .value
                      )
                    }
                    className="sale-edit-input"
                  >
                    <option value="Vendedor...">
                      Vendedor...
                    </option>

                    <option value="Alejandro">
                      Alejandro
                    </option>

                    <option value="Isabel">
                      Isabel
                    </option>

                    <option value="Jason">
                      Jason
                    </option>
                  </select>

                  <select
                    value={
                      metodoPago
                    }
                    onChange={(
                      event
                    ) =>
                      setField(
                        "metodo_pago",
                        event.target
                          .value
                      )
                    }
                    className={`
                      sale-edit-input

                      ${
                        isDebtPayment(
                          metodoPago
                        )
                          ? "sale-payment-debt-select"
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
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="
                    flex
                    flex-col
                    xl:flex-row
                    xl:items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <h3
                      className="
                        sale-main
                        text-xl
                        lg:text-2xl
                        italic
                        text-slate-800
                      "
                    >
                      {
                        data.nombre
                      }
                    </h3>

                    <div
                      className="
                        mt-2
                        flex
                        flex-wrap
                        items-center
                        gap-x-2
                        gap-y-1
                        text-[8px]
                        lg:text-[9px]
                        uppercase
                        tracking-widest
                        text-slate-400
                        sale-muted
                      "
                    >
                      <span
                        className="
                          px-2
                          py-1
                          rounded-lg
                          bg-slate-100
                          text-slate-500
                        "
                      >
                        #
                        {
                          data.id
                        }
                      </span>

                      {data.fecha && (
                        <span>
                          {
                            data.fecha
                          }
                        </span>
                      )}

                      {data.telefono && (
                        <>
                          <span>•</span>
                          <span>
                            {
                              data.telefono
                            }
                          </span>
                        </>
                      )}

                      {data.direccion && (
                        <>
                          <span>•</span>
                          <span>
                            {
                              data.direccion
                            }
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    {data.encargado &&
                      data.encargado !==
                        "Vendedor..." && (
                        <span
                          className="
                            px-3
                            py-1.5
                            rounded-full
                            bg-emerald-50
                            text-emerald-500
                            text-[8px]
                            uppercase
                            tracking-wide
                          "
                        >
                          💼{" "}
                          {
                            data.encargado
                          }
                        </span>
                      )}

                    {metodoPago !==
                      PAYMENT_PLACEHOLDER && (
                      <button
                        type="button"
                        onClick={
                          onStartEdit
                        }
                        title="Editar método de pago"
                        className={`
                          px-3
                          py-1.5
                          rounded-full
                          text-[8px]
                          uppercase
                          tracking-wide
                          transition-all

                          ${
                            esDebe
                              ? "sale-debt-badge"
                              : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                          }
                        `}
                      >
                        {esDebe
                          ? "⚠ DEBE"
                          : `💳 ${metodoPago}`}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ACTIONS */}

          <div
            className="
              flex
              items-center
              gap-2
              shrink-0
            "
          >
            {editing ? (
              <>
                <button
                  type="button"
                  disabled={
                    !editValido ||
                    !hasChanges
                  }
                  onClick={
                    onSaveEdit
                  }
                  title={
                    !hasChanges
                      ? "Haz un cambio para guardar"
                      : !editValido
                        ? "Completa los datos requeridos"
                        : "Guardar cambios"
                  }
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-emerald-50
                    text-emerald-500
                    flex
                    items-center
                    justify-center
                    transition-all

                    hover:bg-emerald-500
                    hover:text-white

                    disabled:bg-slate-100
                    disabled:text-slate-300
                    disabled:opacity-100
                    disabled:cursor-not-allowed
                    disabled:hover:bg-slate-100
                    disabled:hover:text-slate-300

                    dark:disabled:bg-slate-800
                    dark:disabled:text-slate-600
                    dark:disabled:hover:bg-slate-800
                    dark:disabled:hover:text-slate-600
                  "
                >
                  <Check
                    size={17}
                  />
                </button>

                <button
                  type="button"
                  onClick={
                    onCancelEdit
                  }
                  title="Cancelar edición"
                  className="
                    w-11
                    h-11
                    rounded-xl

                    bg-red-50
                    text-red-400

                    flex
                    items-center
                    justify-center

                    transition-all

                    hover:bg-red-500
                    hover:text-white

                    dark:bg-red-500/10
                    dark:text-red-300
                    dark:hover:bg-red-500
                    dark:hover:text-white
                  "
                >
                  <X
                    size={17}
                  />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={
                    onStartEdit
                  }
                  title="Editar"
                  className="
                    sale-action-button
                    text-slate-400
                  "
                >
                  <Edit2
                    size={17}
                  />
                </button>

                {inFolder ? (
                  <button
                    type="button"
                    onClick={() =>
                      onRemoveFromFolder?.(
                        venta.id,
                        folderView
                      )
                    }
                    title="Quitar de carpeta"
                    className="
                      sale-action-button
                      text-purple-500
                    "
                  >
                    <FolderMinus
                      size={17}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onAddToFolder?.(
                        venta.id
                      )
                    }
                    title="Agregar a centro"
                    className="
                      sale-action-button
                      text-purple-500
                    "
                  >
                    <FolderPlus
                      size={17}
                    />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    exportToPDF(
                      data
                    )
                  }
                  title="Imprimir PDF"
                  className="
                    sale-action-button
                    text-blue-500
                  "
                >
                  <Printer
                    size={17}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onDelete?.(
                      venta.id
                    )
                  }
                  title="Eliminar"
                  className="
                    sale-action-button
                    text-red-400
                  "
                >
                  <Trash2
                    size={17}
                  />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =================================
          ITEMS
      ================================= */}

      <div
        style={
          editing
            ? {
                minHeight:
                  "430px",
                maxHeight:
                  "620px",
              }
            : undefined
        }
        className={`
          sale-card-body
          overflow-y-auto

          ${
            editing
              ? "overflow-x-hidden sm:overflow-x-auto"
              : "overflow-x-auto max-h-[300px]"
          }
        `}
      >
        <div
          className={
            editing
              ? `
                min-w-0
                px-4

                sm:min-w-[700px]
                sm:px-5

                lg:px-7
              `
              : `
                min-w-[700px]
                px-5
                lg:px-7
              `
          }
        >
          <div
            className={`
              sale-card-table-head

              ${
                editing
                  ? "hidden sm:grid"
                  : "grid"
              }

              grid-cols-[70px_1fr_100px_120px]
              gap-3
              py-4
              text-[8px]
              uppercase
              tracking-widest
              text-slate-300
            `}
          >
            <span>
              Cant.
            </span>

            <span>
              Descripción
            </span>

            <span className="text-center">
              Pend.
            </span>

            <span className="text-right">
              Subtotal
            </span>
          </div>

          {(
            data.items ||
            []
          ).map(
            (item) => {
              const subtotal =
                (Number(
                  item.cant
                ) || 0) *
                (Number(
                  item.precio
                ) || 0);

              return (
                <div
                  key={
                    item.id
                  }
                  className={`
                    sale-card-row
                    grid
                    gap-3
                    py-4
                    border-b
                    border-slate-100

                    ${
                      editing
                        ? `
                          grid-cols-[58px_minmax(0,1fr)]
                          items-start

                          sm:grid-cols-[70px_1fr_100px_120px]
                          sm:items-center
                        `
                        : `
                          grid-cols-[70px_1fr_100px_120px]
                          items-center
                        `
                    }
                  `}
                >
                  {editing ? (
                    <div
                      className="
                        pt-1

                        sm:pt-0
                      "
                    >
                      <span
                        className="
                          block
                          mb-2

                          text-[7px]
                          uppercase
                          tracking-widest
                          text-slate-300

                          sm:hidden
                        "
                      >
                        Cant.
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
                          onEditItem?.(
                            item.id,
                            "cant",
                            value
                          )
                        }
                      />
                    </div>
                  ) : (
                    <span
                      className="
                        sale-main
                        text-sm
                        text-slate-700
                      "
                    >
                      {
                        item.cant
                      }
                    </span>
                  )}

                  <div
                    className="
                      min-w-0
                    "
                  >
                    {editing ? (
                      <div
                        className="
                          space-y-2
                        "
                      >
                        <span
                          className="
                            block
                            mb-2

                            text-[7px]
                            uppercase
                            tracking-widest
                            text-slate-300

                            sm:hidden
                          "
                        >
                          Descripción
                        </span>

                        <div
                          className="
                            grid
                            grid-cols-[minmax(0,1fr)_40px]
                            gap-2
                            items-center

                            sm:grid-cols-[160px_minmax(180px,1fr)_40px]
                          "
                        >
                          <div
                            className="
                              min-w-0
                            "
                          >
                            <ProductCombobox
                            value={
                              item.cat ||
                              ""
                            }
                            options={
                              categorias
                            }
                            onChange={(
                              value
                            ) =>
                              onEditItem?.(
                                item.id,
                                "cat",
                                value
                              )
                            }
                              placeholder="Categoría"
                            />
                          </div>

                          <div
                            className="
                              col-span-2
                              min-w-0

                              sm:col-span-1
                              sm:col-start-2
                              sm:row-start-1
                            "
                          >
                            {item.cat ===
                            "OTROS..." ? (
                              <input
                              type="text"
                              value={
                                item.tema ||
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                onEditItem?.(
                                  item.id,
                                  "tema",
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="Escribe el tema..."
                              className="
                                sale-edit-input
                                sale-custom-option
                                w-full
                              "
                            />
                          ) : (
                            <ProductCombobox
                              value={
                                item.tema ||
                                ""
                              }
                              options={
                                obtenerTemas(
                                  item.cat
                                )
                              }
                              disabled={
                                !item.cat
                              }
                              onChange={(
                                value
                              ) =>
                                onEditItem?.(
                                  item.id,
                                  "tema",
                                  value
                                )
                              }
                              placeholder={
                                item.cat
                                  ? "Seleccionar o escribir..."
                                  : "Primero categoría"
                              }
                                customValue="__NO_CUSTOM__"
                              />
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onDeleteLine?.(
                                item.id
                              )
                            }
                            title="Quitar línea"
                            className="
                              col-start-2
                              row-start-1

                              w-10
                              h-10

                              rounded-xl

                              bg-red-50
                              text-red-400

                              flex
                              items-center
                              justify-center

                              transition-all

                              hover:bg-red-500
                              hover:text-white

                              sm:col-start-3
                              sm:row-start-1

                              dark:bg-red-500/10
                              dark:text-red-300
                              dark:hover:bg-red-500
                              dark:hover:text-white
                            "
                          >
                            <Trash2
                              size={14}
                            />
                          </button>
                        </div>

                        {item.cat ===
                          "OTROS..." && (
                          <div
                            className="
                              sale-edit-custom-price
                            "
                          >
                            <span
                              className="
                                sale-edit-custom-price-label
                              "
                            >
                              Precio manual
                            </span>

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                              "
                            >
                              <span
                                className="
                                  text-xs
                                  font-black
                                "
                              >
                                ₡
                              </span>

                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={
                                  item.precio ||
                                  0
                                }
                                onChange={(
                                  event
                                ) =>
                                  onEditItem?.(
                                    item.id,
                                    "precio",
                                    Number.parseFloat(
                                      event
                                        .target
                                        .value
                                    ) ||
                                      0
                                  )
                                }
                                className="
                                  sale-edit-input
                                  sale-edit-price-input
                                "
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          min-w-0
                        "
                      >
                        <span
                          className={`
                            px-2
                            py-1
                            rounded-lg
                            text-[7px]
                            uppercase
                            whitespace-nowrap

                            ${
                              item.cat ===
                              "OTROS..."
                                ? `
                                  bg-purple-50
                                  text-purple-600
                                  border
                                  border-purple-100

                                  dark:bg-purple-500/10
                                  dark:text-purple-300
                                  dark:border-purple-500/20
                                `
                                : `
                                  bg-slate-100
                                  text-slate-700
                                `
                            }
                          `}
                        >
                          {
                            item.cat
                          }
                        </span>

                        <span
                          className="
                            sale-main
                            truncate
                            text-[10px]
                            uppercase
                            text-slate-700
                          "
                        >
                          {
                            item.tema
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  <div
                    className={
                      editing
                        ? `
                          col-start-1
                          row-start-2

                          pt-2
                          text-center

                          sm:col-auto
                          sm:row-auto
                          sm:pt-0
                        `
                        : "text-center"
                    }
                  >
                    {editing && (
                      <span
                        className="
                          block
                          mb-2

                          text-[7px]
                          uppercase
                          tracking-widest
                          text-slate-300

                          sm:hidden
                        "
                      >
                        Pend.
                      </span>
                    )}

                    {editing ? (
                      <QuantityControls
                        value={
                          Number(
                            item.pendiente
                          ) || 0
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
                          onEditItem?.(
                            item.id,
                            "pendiente",
                            value
                          )
                        }
                      />
                    ) : Number(
                        item.pendiente
                      ) > 0 ? (
                      <span
                        className="
                          inline-flex
                          px-3
                          py-1.5
                          rounded-xl
                          bg-red-50
                          text-[#F79598]
                          text-[8px]
                          uppercase
                        "
                      >
                        {
                          item.pendiente
                        }{" "}
                        pendiente
                      </span>
                    ) : (
                      <span
                        className="
                          inline-flex
                          px-3
                          py-1.5
                          rounded-xl
                          bg-emerald-50
                          text-emerald-500
                          text-[8px]
                          uppercase
                        "
                      >
                        OK
                      </span>
                    )}
                  </div>

                  <div
                    className={`
                      sale-main
                      text-right
                      text-[10px]
                      text-slate-500

                      ${
                        editing
                          ? `
                            col-start-2
                            row-start-2

                            self-end
                            pt-2

                            sm:col-auto
                            sm:row-auto
                            sm:self-auto
                            sm:pt-0
                          `
                          : ""
                      }
                    `}
                  >
                    {editing && (
                      <span
                        className="
                          block
                          mb-2

                          text-[7px]
                          uppercase
                          tracking-widest
                          text-slate-300

                          sm:hidden
                        "
                      >
                        Subtotal
                      </span>
                    )}

                    {currency(
                      subtotal
                    )}
                  </div>
                </div>
              );
            }
          )}

          {editing && (
            <button
              type="button"
              onClick={
                onAddLine
              }
              className="
                my-4
                px-4
                py-3
                rounded-xl
                border
                border-dashed
                border-slate-300
                text-slate-400
                text-[9px]
                uppercase
                flex
                items-center
                gap-2
                hover:border-[#8ED4BE]
                hover:text-[#58B99A]
              "
            >
              <Plus
                size={14}
              />

              Agregar línea
            </button>
          )}
        </div>
      </div>

      {(
        editing ||
        descuentoVenta > 0
      ) && (
        <div
          className="
            px-6
            lg:px-8
            py-4

            border-t
            border-purple-100

            bg-purple-50

            flex
            flex-col
            sm:flex-row
            sm:items-center
            justify-between
            gap-3

            dark:bg-purple-500/10
            dark:border-purple-500/20
          "
        >
          <span
            className="
              text-[8px]
              uppercase
              tracking-[0.18em]
              text-purple-600

              dark:text-purple-300
            "
          >
            Descuento
          </span>

          {editing ? (
            <div
              className="
                min-w-[155px]

                px-3
                py-2

                rounded-xl

                bg-white
                border
                border-purple-200

                flex
                items-center
                gap-2

                dark:bg-[#160d24]
                dark:border-purple-700
              "
            >
              <span
                className="
                  text-sm
                  font-black
                  text-purple-700

                  dark:text-purple-300
                "
              >
                ₡
              </span>

              <input
                type="number"
                min="0"
                max={
                  subtotalProductos
                }
                step="1"
                value={
                  descuentoVenta
                }
                onChange={(
                  event
                ) =>
                  onEditDiscount?.(
                    Number(
                      event.target
                        .value
                    ) || 0
                  )
                }
                className="
                  w-full

                  border-0
                  outline-none

                  bg-transparent

                  text-right
                  text-sm
                  font-black
                  text-slate-900

                  dark:text-purple-100
                "
              />
            </div>
          ) : (
            <strong
              className="
                text-sm
                italic
                text-purple-600

                dark:text-purple-300
              "
            >
              - {currency(
                descuentoVenta
              )}
            </strong>
          )}
        </div>
      )}

      {/* =================================
          FOOTER
      ================================= */}

      <div
        className="
          sale-card-footer
          px-6
          lg:px-8
          py-6
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <span
          className="
            text-[8px]
            uppercase
            tracking-[0.2em]
            text-slate-400
          "
        >
          Total final
        </span>

        <strong
          className={`
            text-xl
            lg:text-2xl
            italic

            ${
              esDebe
                ? "text-red-400"
                : "text-[#8ED4BE]"
            }
          `}
        >
          {currency(
            Number(
              data.total
            ) || 0
          )}
        </strong>
      </div>
    </article>
  );
}