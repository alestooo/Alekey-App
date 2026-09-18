import {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Check,
  Clock,
  Edit2,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";

import {
  supabase,
} from "../../lib/supabase";

import {
  UBICACIONES_CR,
} from "../../constants/locations";

import {
  currency,
  formatPhone,
  generateId,
} from "../../utils/formatters";

import QuantityControls from "../common/QuantityControls";
import ScrollToTop from "../common/ScrollToTop";

export default function SaleForm({
  alGuardar,
  inventarioCatalog = [],
  refrescarInventario,
}) {
  const navigate =
    useNavigate();

  const [nombre, setNombre] =
    useState("");

  const [tel, setTel] =
    useState("");

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
    "Pago..."
  );

  const [
    comentario,
    setComentario,
  ] = useState("");

  const [items, setItems] =
    useState([
      {
        id: Date.now(),
        cant: 1,
        cat: "",
        tema: "",
        precio: 0,
        pendiente: 0,
        inventario_id:
          null,
        stock_disponible:
          null,
      },
    ]);

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
      [inventarioCatalog]
    );

  const categoriasInventario =
    useMemo(() => {
      const categories = [
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
        ...categories,
        "OTROS...",
      ];
    }, [inventarioActivo]);

  const temasPorCategoria = (
    categoria
  ) => {
    if (
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

  const buscarProducto = (
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
          item.tema === tema
      ) || null
    );
  };

  const precioBaseCategoria = (
    categoria
  ) => {
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
          (producto.precio ||
            0) > 0
      );

    return item
      ? item.precio || 0
      : 0;
  };

  const total = items.reduce(
    (acc, item) =>
      acc +
      item.cant *
        item.precio,
    0
  );

  const esValido =
    nombre.trim().length >
      0 &&
    tel
      .replace(/\D/g, "")
      .length === 8 &&
    items.length > 0 &&
    items.every(
      (item) =>
        item.cat &&
        item.tema &&
        (
          item.cat ===
            "OTROS..." ||
          item.inventario_id
        )
    );

  const agregarLinea = () => {
    setItems([
      ...items,

      {
        id: Date.now(),
        cant: 1,
        cat: "",
        tema: "",
        precio: 0,
        pendiente: 0,
        inventario_id:
          null,
        stock_disponible:
          null,
      },
    ]);
  };

  const borrarLinea = (
    id
  ) => {
    setItems(
      items.filter(
        (item) =>
          item.id !== id
      )
    );
  };

  const updItem = (
    id,
    field,
    value
  ) => {
    setItems(
      items.map((item) => {
        if (
          item.id !== id
        ) {
          return item;
        }

        if (
          field === "cat"
        ) {
          const precio =
            value ===
            "OTROS..."
              ? 0
              : precioBaseCategoria(
                  value
                );

          return {
            ...item,

            cat: value,
            tema: "",
            precio,

            pendiente: 0,

            inventario_id:
              null,

            stock_disponible:
              0,
          };
        }

        if (
          field === "tema"
        ) {
          const producto =
            buscarProducto(
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

          if (producto) {
            return {
              ...item,

              tema: value,

              precio:
                producto.precio ||
                precioBaseCategoria(
                  item.cat
                ),

              inventario_id:
                producto.id,

              stock_disponible:
                stockDisponible,

              pendiente:
                pendienteAuto,
            };
          }

          return {
            ...item,

            tema: value,

            inventario_id:
              null,

            stock_disponible:
              0,

            pendiente: 0,
          };
        }

        if (
          field === "cant"
        ) {
          const newCant =
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
                0
            );

          const pendienteAuto =
            Math.max(
              0,
              newCant -
                stockDisponible
            );

          return {
            ...item,

            cant: newCant,

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

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const descontarInventario =
    async () => {
      const productos =
        items.filter(
          (item) =>
            item.inventario_id &&
            item.cat !==
              "OTROS..."
        );

      for (
        const item of productos
      ) {
        const nuevoStock =
          Math.max(
            0,

            (
              item.stock_disponible ??
              0
            ) -
              (item.cant ||
                0)
          );

        await supabase
          .from("inventario")
          .update({
            stock:
              nuevoStock,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            item.inventario_id
          );
      }

      if (
        refrescarInventario
      ) {
        await refrescarInventario();
      }
    };

  const guardar =
    async () => {
      if (!esValido) {
        return;
      }

      const ventaItems =
        items.map(
          (item) => ({
            id: item.id,

            cant:
              item.cant,

            cat:
              item.cat,

            tema:
              item.tema,

            precio:
              item.precio,

            pendiente:
              item.pendiente,

            inventario_id:
              item.inventario_id ||
              null,
          })
        );

      const nueva = {
        id: generateId(),

        nombre,

        telefono: tel,

        direccion:
          (
            provincia
              ? provincia +
                ", "
              : ""
          ) + direccion,

        items:
          ventaItems,

        total,

        encargado,

        metodo_pago:
          metodoPago,

        comentario,

        fecha:
          new Date().toLocaleDateString(),

        created_at:
          new Date().toISOString(),
      };

      const ok =
        await alGuardar(
          nueva
        );

      if (
        ok !== false
      ) {
        await descontarInventario();

        navigate(
          "/ventas"
        );
      }
    };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in slide-in-from-bottom duration-500 font-black">
      <ScrollToTop />

      {/* DATALIST DE CATEGORÍAS */}
      <datalist id="productos-list">
        {categoriasInventario.map(
          (categoria) => (
            <option
              key={
                categoria
              }
              value={
                categoria
              }
            />
          )
        )}
      </datalist>

      <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-50">
        {/* HEADER */}
        <div className="p-8 lg:p-12 bg-slate-900 text-white flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">
              Nueva Cotización
              <span className="text-[#8ED4BE]">
                .
              </span>
            </h2>

            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">
              Completa los datos
              para generar el
              pedido
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-4xl border border-white/10">
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-slate-400">
                Total Estimado
              </p>

              <p className="text-3xl font-black italic text-[#8ED4BE]">
                {currency(
                  total
                )}
              </p>
            </div>

            <div className="w-12 h-12 bg-[#8ED4BE] rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-[#8ED4BE]/20">
              <Package
                size={24}
              />
            </div>
          </div>
        </div>

        <div className="p-8 lg:p-12 space-y-10 text-slate-800">
          {/* CLIENTE */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2">
                <User
                  size={14}
                />

                Nombre Completo
                / Entidad
              </label>

              <input
                type="text"
                className="w-full p-6 bg-slate-50 rounded-4xl font-black text-slate-700 outline-none border-2 border-transparent focus:border-[#8ED4BE] transition-all"
                placeholder="Nombre, empresa o institución..."
                value={nombre}
                onChange={(
                  event
                ) =>
                  setNombre(
                    event
                      .target
                      .value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2">
                <Clock
                  size={14}
                />

                Teléfono (8
                dígitos)
              </label>

              <input
                type="text"
                className="w-full p-6 bg-slate-50 rounded-4xl font-black text-slate-700 outline-none border-2 border-transparent focus:border-[#8ED4BE] transition-all"
                placeholder="0000-0000"
                value={tel}
                onChange={(
                  event
                ) =>
                  setTel(
                    formatPhone(
                      event
                        .target
                        .value
                    )
                  )
                }
              />
            </div>
          </section>

          {/* RESPONSABLE / PAGO */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2">
                <Check
                  size={14}
                  className="text-[#8ED4BE]"
                />

                Responsable
              </label>

              <select
                className="w-full p-5 bg-white rounded-2xl font-black uppercase text-xs outline-none shadow-sm border-2 border-transparent focus:border-[#8ED4BE] text-slate-700"
                value={
                  encargado
                }
                onChange={(
                  event
                ) =>
                  setEncargado(
                    event
                      .target
                      .value
                  )
                }
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
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2">
                <TrendingUp
                  size={14}
                  className="text-purple-500"
                />

                Método de Pago
              </label>

              <select
                className="w-full p-5 bg-white rounded-2xl font-black uppercase text-xs outline-none shadow-sm border-2 border-transparent focus:border-purple-400 text-purple-600"
                value={
                  metodoPago
                }
                onChange={(
                  event
                ) =>
                  setMetodoPago(
                    event
                      .target
                      .value
                  )
                }
              >
                <option value="Pago...">
                  Pago...
                </option>

                <option value="Efectivo">
                  Efectivo
                </option>

                <option value="Tarjeta">
                  Tarjeta
                </option>

                <option value="Sinpe">
                  Sinpe
                </option>

                <option value="Centro Educativo">
                  Centro
                  Educativo
                </option>
              </select>
            </div>
          </section>

          {/* UBICACIÓN */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">
                Provincia
              </label>

              <select
                className="w-full p-5 bg-white rounded-2xl font-black uppercase text-xs outline-none shadow-sm border-2 border-transparent focus:border-purple-400 text-purple-600"
                value={
                  provincia
                }
                onChange={(
                  event
                ) => {
                  setProvincia(
                    event
                      .target
                      .value
                  );

                  setDireccion(
                    ""
                  );
                }}
              >
                <option
                  value=""
                  disabled
                >
                  Seleccione...
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
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">
                Ubicación
                Específica
              </label>

              <select
                className="w-full p-5 bg-white rounded-2xl font-black uppercase text-xs outline-none shadow-sm border-2 border-transparent focus:border-purple-400 text-purple-600"
                value={
                  direccion
                }
                onChange={(
                  event
                ) =>
                  setDireccion(
                    event
                      .target
                      .value
                  )
                }
              >
                <option
                  value=""
                  disabled
                >
                  Seleccione...
                </option>

                {provincia &&
                  UBICACIONES_CR[
                    provincia
                  ].map(
                    (
                      location
                    ) => (
                      <option
                        key={
                          location
                        }
                        value={
                          location
                        }
                      >
                        {
                          location
                        }
                      </option>
                    )
                  )}
              </select>
            </div>
          </section>

          {/* PRODUCTOS */}
          <section className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h4 className="font-black italic uppercase text-slate-800 flex items-center gap-2 text-sm">
                <ShoppingBag
                  size={18}
                  className="text-[#8ED4BE]"
                />

                Desglose de
                Productos
              </h4>
            </div>

            <div className="space-y-4">
              {items.map(
                (
                  item,
                  index
                ) => {
                  const temasDisponibles =
                    temasPorCategoria(
                      item.cat
                    );

                  return (
                    <div
                      key={
                        item.id
                      }
                      className="group flex flex-col items-stretch lg:flex-row lg:items-center gap-6 p-6 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-[#8ED4BE] transition-all relative"
                    >
                      <span className="font-black italic text-slate-200 text-2xl lg:text-3xl w-10 text-center lg:text-left">
                        #
                        {index +
                          1}
                      </span>

                      <div className="flex-1 w-full grid grid-cols-1 gap-4">
                        <input
                          list="productos-list"
                          className={`
                            w-full
                            p-4
                            bg-slate-50
                            rounded-4xl
                            font-black
                            uppercase
                            text-[10px]
                            outline-none
                            border-2
                            border-transparent
                            focus:border-[#8ED4BE]

                            ${
                              item.cat ===
                              "OTROS..."
                                ? "text-purple-600 border-purple-100"
                                : ""
                            }
                          `}
                          placeholder="Buscar categoría..."
                          value={
                            item.cat
                          }
                          onChange={(
                            event
                          ) =>
                            updItem(
                              item.id,
                              "cat",
                              event
                                .target
                                .value
                            )
                          }
                        />

                        {item.cat ===
                          "OTROS..." && (
                          <input
                            type="number"
                            placeholder="Precio manual"
                            className="w-full p-4 bg-purple-50 rounded-4xl font-black text-purple-600 text-[10px] outline-none border-2 border-purple-100 focus:border-purple-300 animate-in zoom-in-95"
                            value={
                              item.precio ||
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              updItem(
                                item.id,
                                "precio",
                                parseFloat(
                                  event
                                    .target
                                    .value
                                ) ||
                                  0
                              )
                            }
                          />
                        )}

                        <input
                          list={`temas-list-${item.id}`}
                          className="w-full p-4 bg-slate-50 rounded-4xl font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-[#8ED4BE]"
                          placeholder={
                            item.cat
                              ? "Buscar tema..."
                              : "Primero elige categoría..."
                          }
                          value={
                            item.tema
                          }
                          onChange={(
                            event
                          ) =>
                            updItem(
                              item.id,
                              "tema",
                              event
                                .target
                                .value
                            )
                          }
                          disabled={
                            !item.cat
                          }
                        />

                        <datalist
                          id={`temas-list-${item.id}`}
                        >
                          {temasDisponibles.map(
                            (
                              tema
                            ) => (
                              <option
                                key={
                                  tema
                                }
                                value={
                                  tema
                                }
                              />
                            )
                          )}
                        </datalist>

                        {item.cat &&
                          item.cat !==
                            "OTROS..." &&
                          item.tema &&
                          !item.inventario_id && (
                            <p className="text-[9px] text-red-400 uppercase font-black px-4">
                              Ese
                              tema no
                              existe
                              en esta
                              categoría.
                            </p>
                          )}

                        {item.inventario_id && (
                          <p className="text-[9px] text-slate-400 uppercase font-black px-4">
                            Stock
                            actual:{" "}
                            {item.stock_disponible ??
                              0}{" "}
                            pzs •
                            Precio:{" "}
                            {currency(
                              item.precio
                            )}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 items-center gap-2 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0">
                        <div className="flex flex-col items-center flex-1 min-w-17.5">
                          <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase mb-2">
                            Cant.
                          </span>

                          <QuantityControls
                            value={
                              item.cant
                            }
                            onChange={(
                              value
                            ) =>
                              updItem(
                                item.id,
                                "cant",
                                value
                              )
                            }
                            min={1}
                            max={99}
                          />
                        </div>

                        <div className="flex flex-col items-center flex-1 min-w-17.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase mb-2">
                            Pend.
                          </span>

                          <QuantityControls
                            value={
                              item.pendiente
                            }
                            onChange={(
                              value
                            ) =>
                              updItem(
                                item.id,
                                "pendiente",
                                value
                              )
                            }
                            min={0}
                            max={
                              item.cant
                            }
                            colorClass="bg-red-50"
                            textClass="text-red-500"
                          />
                        </div>

                        <div className="flex flex-col items-end flex-1 min-w-22.5 pr-2">
                          <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase">
                            Subtotal
                          </p>

                          <p className="font-black italic text-slate-800 text-sm sm:text-lg whitespace-nowrap">
                            {currency(
                              item.cant *
                                item.precio
                            )}
                          </p>
                        </div>

                        {items.length >
                          1 && (
                          <div className="absolute top-4 right-4 lg:static">
                            <button
                              type="button"
                              onClick={() =>
                                borrarLinea(
                                  item.id
                                )
                              }
                              className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            <div className="flex flex-col gap-6">
              <button
                type="button"
                onClick={
                  agregarLinea
                }
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black uppercase text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />

                Agregar Línea
              </button>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2">
                  <Edit2
                    size={14}
                  />

                  Agregar
                  Comentario
                  (Opcional)
                </label>

                <textarea
                  className="w-full p-8 bg-slate-50 rounded-[3rem] font-black text-slate-700 outline-none border-2 border-transparent focus:border-[#8ED4BE] transition-all min-h-40 resize-none"
                  placeholder="Escribe aquí cualquier detalle adicional..."
                  maxLength={
                    3000
                  }
                  value={
                    comentario
                  }
                  onChange={(
                    event
                  ) =>
                    setComentario(
                      event
                        .target
                        .value
                    )
                  }
                />
              </div>
            </div>
          </section>

          <button
            type="button"
            disabled={
              !esValido
            }
            onClick={guardar}
            className={`
              w-full
              p-8
              rounded-4xl
              font-black
              italic
              uppercase
              text-xl
              shadow-2xl
              transition-all
              flex
              items-center
              justify-center
              gap-4

              ${
                esValido
                  ? "bg-slate-900 text-[#8ED4BE] hover:scale-[1.02] shadow-slate-200"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              }
            `}
          >
            <Check size={32} />

            {esValido
              ? "Confirmar y Guardar Pedido"
              : "Complete los datos"}
          </button>
        </div>
      </div>
    </div>
  );
}