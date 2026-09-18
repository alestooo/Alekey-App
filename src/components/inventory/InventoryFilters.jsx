import {
  Plus,
} from "lucide-react";

export default function InventoryFilters({
  catFiltro,
  categorias = [],

  orden,
  busqueda,

  resumen = {
    totalItems: 0,
    totalCategorias: 0,
    totalStock: 0,
  },

  onAdd,
  onCategoryChange,
  onSearchChange,
  onOrderChange,
}) {
  return (
    <>
      {/* HEADER */}
      <header className="mb-10 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl italic uppercase tracking-tighter font-black">
            Inventario Alekey
            <span className="text-[#C0C976]">
              .
            </span>
          </h2>

          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
            Control de Stock
            en Tiempo Real
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {catFiltro ===
            "Todo" ? (
              <>
                <span className="px-3 py-1 bg-[#C0C976]/15 text-[#909944] rounded-full text-[9px] uppercase tracking-widest">
                  {
                    resumen.totalCategorias
                  }{" "}
                  {resumen.totalCategorias ===
                  1
                    ? "categoría"
                    : "categorías"}
                </span>

                <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] uppercase tracking-widest">
                  {
                    resumen.totalItems
                  }{" "}
                  {resumen.totalItems ===
                  1
                    ? "ítem"
                    : "ítems"}
                </span>

                <span className="px-3 py-1 bg-[#8ED4BE]/15 text-[#529b84] rounded-full text-[9px] uppercase tracking-widest">
                  {
                    resumen.totalStock
                  }{" "}
                  {resumen.totalStock ===
                  1
                    ? "unidad"
                    : "unidades"}
                </span>
              </>
            ) : (
              <>
                <span className="px-3 py-1 bg-[#C0C976]/15 text-[#909944] rounded-full text-[9px] uppercase tracking-widest">
                  Categoría:{" "}
                  {catFiltro}
                </span>

                <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] uppercase tracking-widest">
                  {
                    resumen.totalItems
                  }{" "}
                  {resumen.totalItems ===
                  1
                    ? "ítem"
                    : "ítems"}
                </span>

                <span className="px-3 py-1 bg-[#8ED4BE]/15 text-[#529b84] rounded-full text-[9px] uppercase tracking-widest">
                  {
                    resumen.totalStock
                  }{" "}
                  {resumen.totalStock ===
                  1
                    ? "unidad"
                    : "unidades"}
                </span>
              </>
            )}

            {busqueda.trim() && (
              <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-[9px] uppercase tracking-widest">
                Búsqueda: “
                {busqueda.trim()}
                ”
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="px-8 py-4 bg-[#C0C976] text-slate-800 rounded-2xl uppercase text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
        >
          <Plus size={18} />

          Agregar Item
        </button>
      </header>

      {/* BUSCADOR Y ORDEN */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar diseño o categoría..."
          value={busqueda}
          onChange={(
            event
          ) =>
            onSearchChange(
              event.target.value
            )
          }
          className="flex-1 px-4 py-3 rounded-xl bg-white shadow-sm text-xs uppercase tracking-widest outline-none font-black"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              onOrderChange(
                "alfabetico"
              )
            }
            className={`
              px-4
              py-2
              rounded-lg
              text-[9px]
              uppercase
              font-black

              ${
                orden ===
                "alfabetico"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-400"
              }
            `}
          >
            Alfabético
          </button>

          <button
            type="button"
            onClick={() =>
              onOrderChange(
                "cantidad"
              )
            }
            className={`
              px-4
              py-2
              rounded-lg
              text-[9px]
              uppercase
              font-black

              ${
                orden ===
                "cantidad"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-400"
              }
            `}
          >
            Cantidad
          </button>
        </div>
      </div>

      {/* CATEGORÍAS */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
        {categorias.map(
          (categoria) => (
            <button
              type="button"
              key={categoria}
              onClick={() =>
                onCategoryChange(
                  categoria
                )
              }
              className={`
                px-6
                py-3
                rounded-xl
                text-[10px]
                uppercase
                whitespace-nowrap
                transition-all
                font-black

                ${
                  catFiltro ===
                  categoria
                    ? "bg-slate-900 text-white shadow-xl scale-105"
                    : "bg-white text-slate-400 shadow-sm"
                }
              `}
            >
              {categoria}
            </button>
          )
        )}
      </div>
    </>
  );
}