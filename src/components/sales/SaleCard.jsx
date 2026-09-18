import {
  Check,
  Edit2,
  FolderMinus,
  FolderPlus,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";

import QuantityControls from "../common/QuantityControls";

import {
  UBICACIONES_CR,
} from "../../constants/locations";

import {
  currency,
  formatPhone,
  getThemeColorClass,
} from "../../utils/formatters";

import {
  exportToPDF,
} from "../../utils/pdf";

export default function SaleCard({
  venta,

  inFolder = false,
  folderView,

  editing = false,
  editCache,
  setEditCache,

  provinciaEdit,
  setProvinciaEdit,

  onStartEdit,
  onSaveEdit,
  onDelete,

  onAddToFolder,
  onRemoveFromFolder,

  onEditItem,
  onAddLine,
  onDeleteLine,
}) {
  const data =
    editing && editCache
      ? editCache
      : venta;

  const tienePendientes =
    (data.items || []).some(
      (item) =>
        item.pendiente > 0
    );

  const editValido =
    (data.nombre || "")
      .trim().length > 0 &&
    (data.telefono || "")
      .replace(/\D/g, "")
      .length === 8 &&
    (data.items || []).length >
      0;

  return (
    <div
      className="bg-white rounded-4xl shadow-xl border-l-12 flex flex-col overflow-hidden transition-colors duration-300 font-black"
      style={{
        borderLeftColor:
          tienePendientes
            ? "#F79598"
            : "#8ED4BE",
      }}
    >
      {/* CABECERA */}
      <div className="p-6 lg:p-8 border-b border-slate-50 bg-white z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
          <div className="flex-1 w-full text-slate-800">
            {editing ? (
              <div className="space-y-4">
                <input
                  className="text-xl lg:text-2xl font-black italic border-b-2 outline-none w-full bg-slate-50 p-2 border-[#8ED4BE]"
                  value={
                    data.nombre
                  }
                  onChange={(
                    event
                  ) =>
                    setEditCache({
                      ...editCache,
                      nombre:
                        event
                          .target
                          .value,
                    })
                  }
                />

                <div className="flex flex-wrap gap-3">
                  <input
                    className="text-sm font-bold border-b outline-none w-32 bg-transparent"
                    value={
                      data.telefono
                    }
                    onChange={(
                      event
                    ) =>
                      setEditCache({
                        ...editCache,

                        telefono:
                          formatPhone(
                            event
                              .target
                              .value
                          ),
                      })
                    }
                  />

                  <select
                    className="text-sm font-bold border-b outline-none bg-transparent"
                    value={
                      provinciaEdit
                    }
                    onChange={(
                      event
                    ) =>
                      setProvinciaEdit(
                        event
                          .target
                          .value
                      )
                    }
                  >
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
                    className="text-sm font-bold border-b outline-none bg-transparent"
                    value={
                      data.direccion
                    }
                    onChange={(
                      event
                    ) =>
                      setEditCache({
                        ...editCache,

                        direccion:
                          event
                            .target
                            .value,
                      })
                    }
                  >
                    {(
                      UBICACIONES_CR[
                        provinciaEdit
                      ] || []
                    ).map(
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

                  <select
                    className="text-sm font-bold border-b outline-none bg-transparent text-[#8ED4BE]"
                    value={
                      data.encargado ||
                      "Vendedor..."
                    }
                    onChange={(
                      event
                    ) =>
                      setEditCache({
                        ...editCache,

                        encargado:
                          event
                            .target
                            .value,
                      })
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

                  <select
                    className="text-sm font-bold border-b outline-none bg-transparent text-purple-600"
                    value={
                      data.metodo_pago ||
                      "Pago..."
                    }
                    onChange={(
                      event
                    ) =>
                      setEditCache({
                        ...editCache,

                        metodo_pago:
                          event
                            .target
                            .value,
                      })
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
                      Centro Educativo
                    </option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl lg:text-2xl font-black italic">
                    {data.nombre}
                  </h3>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-black">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md mr-2 text-slate-500 font-black">
                      #{data.id}
                    </span>

                    {data.fecha} •{" "}
                    {data.telefono} •{" "}
                    {data.direccion}
                  </p>
                </div>

                <div className="flex gap-2">
                  {data.encargado &&
                    data.encargado !==
                      "Vendedor..." && (
                      <span className="text-[9px] font-black bg-[#8ED4BE]/10 text-[#8ED4BE] px-3 py-1 rounded-full uppercase tracking-tighter">
                        💼{" "}
                        {
                          data.encargado
                        }
                      </span>
                    )}

                  {data.metodo_pago &&
                    data.metodo_pago !==
                      "Pago..." && (
                      <span className="text-[9px] font-black bg-purple-50 text-purple-600 px-3 py-1 rounded-full uppercase tracking-tighter border border-purple-100">
                        💳{" "}
                        {
                          data.metodo_pago
                        }
                      </span>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* BOTONES */}
          <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-auto lg:gap-2">
            {editing ? (
              <button
                type="button"
                disabled={
                  !editValido
                }
                onClick={
                  onSaveEdit
                }
                className="col-span-2 p-4 bg-emerald-500 text-white rounded-2xl shadow-lg active:scale-95 flex justify-center disabled:opacity-30"
              >
                <Check size={24} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={
                    onStartEdit
                  }
                  className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex justify-center items-center"
                >
                  <Edit2
                    size={18}
                  />
                </button>

                {inFolder ? (
                  <button
                    type="button"
                    onClick={
                      onRemoveFromFolder
                    }
                    className="p-3 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all flex justify-center items-center"
                  >
                    <FolderMinus
                      size={18}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      onAddToFolder
                    }
                    className="p-3 bg-purple-50 text-purple-500 rounded-xl hover:bg-purple-500 hover:text-white transition-all flex justify-center items-center"
                  >
                    <FolderPlus
                      size={18}
                    />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    exportToPDF(
                      venta
                    )
                  }
                  className="p-3 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex justify-center items-center"
                >
                  <Printer
                    size={18}
                  />
                </button>

                <button
                  type="button"
                  onClick={onDelete}
                  className="p-3 bg-red-50 text-red-300 rounded-xl hover:bg-red-500 hover:text-white transition-all flex justify-center items-center"
                >
                  <Trash2
                    size={18}
                  />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCTOS */}
      <div className="overflow-x-auto max-h-75 overflow-y-auto bg-slate-50/40 p-4 scrollbar-thin font-black">
        <table className="w-full min-w-150">
          <thead className="text-[10px] font-black text-slate-300 uppercase">
            <tr>
              <th className="text-left pb-2">
                Cant.
              </th>

              <th className="text-left pb-2">
                Descripción
              </th>

              <th className="text-center pb-2">
                Pend.
              </th>

              <th className="text-right pb-2">
                Subtotal
              </th>

              {editing && (
                <th className="w-10" />
              )}
            </tr>
          </thead>

          <tbody>
            {(data.items || []).map(
              (item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-3">
                    {editing ? (
                      <QuantityControls
                        value={
                          item.cant
                        }
                        onChange={(
                          value
                        ) =>
                          onEditItem(
                            item.id,
                            "cant",
                            value
                          )
                        }
                        min={1}
                        max={99}
                      />
                    ) : (
                      <span className="font-black text-slate-600">
                        {
                          item.cant
                        }
                      </span>
                    )}
                  </td>

                  <td className="py-3 text-[11px] font-black uppercase text-slate-700">
                    {editing ? (
                      <div className="flex flex-col gap-1">
                        <input
                          list="productos-list"
                          className={`
                            border
                            rounded
                            p-1
                            w-full
                            font-black

                            ${
                              item.cat ===
                              "OTROS..."
                                ? "text-purple-600 border-purple-200"
                                : ""
                            }
                          `}
                          value={
                            item.cat
                          }
                          onChange={(
                            event
                          ) =>
                            onEditItem(
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
                            className="border rounded p-1 w-full text-purple-600 font-bold bg-purple-50"
                            value={
                              item.precio
                            }
                            onChange={(
                              event
                            ) =>
                              onEditItem(
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
                          list="temas-list"
                          className="border rounded p-1 w-full font-black"
                          value={
                            item.tema
                          }
                          onChange={(
                            event
                          ) =>
                            onEditItem(
                              item.id,
                              "tema",
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`
                            px-2
                            py-0.5
                            rounded-full
                            text-[8px]
                            font-black

                            ${
                              item.cat ===
                              "OTROS..."
                                ? "bg-purple-50 text-purple-600 border border-purple-100"
                                : getThemeColorClass(
                                    item.cat
                                  )
                            }
                          `}
                        >
                          {
                            item.cat
                          }
                        </span>

                        {
                          item.tema
                        }
                      </div>
                    )}
                  </td>

                  <td className="py-3">
                    {editing ? (
                      <QuantityControls
                        value={
                          item.pendiente
                        }
                        onChange={(
                          value
                        ) =>
                          onEditItem(
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
                    ) : (
                      <div className="flex justify-center">
                        <span
                          className={`
                            px-4
                            py-1.5
                            rounded-xl
                            font-black
                            text-[10px]

                            ${
                              item.pendiente >
                              0
                                ? "bg-red-50 text-red-400"
                                : "bg-emerald-50 text-emerald-500"
                            }
                          `}
                        >
                          {item.pendiente >
                          0
                            ? `${item.pendiente} PEND`
                            : "OK"}
                        </span>
                      </div>
                    )}
                  </td>

                  <td className="py-3 text-right font-black text-slate-400 text-xs">
                    {currency(
                      item.cant *
                        item.precio
                    )}
                  </td>

                  {editing && (
                    <td className="py-3 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          onDeleteLine(
                            item.id
                          )
                        }
                        className="text-red-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </td>
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>

        {editing && (
          <button
            type="button"
            onClick={onAddLine}
            className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black uppercase text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} />

            Agregar Línea
          </button>
        )}

        {/* NOTAS */}
        <div className="mt-4 p-4 bg-white/50 rounded-2xl border border-slate-100">
          <p className="text-[9px] uppercase font-black text-slate-300 mb-2 tracking-widest">
            Notas / Comentarios
          </p>

          {editing ? (
            <textarea
              className="w-full p-3 bg-slate-50 rounded-xl text-[11px] font-black text-slate-700 outline-none border focus:border-[#8ED4BE] min-h-20"
              value={
                data.comentario ||
                ""
              }
              onChange={(
                event
              ) =>
                setEditCache({
                  ...editCache,

                  comentario:
                    event.target
                      .value,
                })
              }
              placeholder="Sin comentarios..."
            />
          ) : (
            <p className="text-[11px] font-black text-slate-500 italic">
              {data.comentario ||
                "Sin notas adicionales."}
            </p>
          )}
        </div>
      </div>

      {/* TOTAL */}
      <div className="p-6 bg-slate-900 flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
          Total Final
        </span>

        <span className="text-xl font-black italic text-[#8ED4BE]">
          {currency(
            data.total
          )}
        </span>
      </div>
    </div>
  );
}