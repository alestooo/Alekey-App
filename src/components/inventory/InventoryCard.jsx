import {
  Trash2,
} from "lucide-react";

import StockControls from "./StockControls";

import {
  currency,
} from "../../utils/formatters";

export default function InventoryCard({
  item,

  showCategory = false,

  onDelete,
  onIncrease,
  onDecrease,
  onEdit,
}) {
  const stock =
    item.stock || 0;

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-xl border-l-10 border-[#C0C976] relative group font-black">
      <button
        type="button"
        onClick={onDelete}
        className="absolute top-6 right-6 text-red-100 group-hover:text-red-300 transition-colors"
      >
        <Trash2
          size={16}
        />
      </button>

      {showCategory && (
        <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-1 font-black">
          {item.categoria}
        </p>
      )}

      <h4 className="italic uppercase text-lg text-slate-800 mb-4 font-black">
        {item.tema}
      </h4>

      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
        <div>
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">
            Stock Actual
          </p>

          <p
            className={`
              text-2xl
              italic
              font-black

              ${
                stock < 5
                  ? "text-red-400"
                  : "text-slate-800"
              }
            `}
          >
            {stock} Pzs
          </p>

          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-2">
            {currency(
              item.precio || 0
            )}
          </p>
        </div>

        <StockControls
          onIncrease={
            onIncrease
          }
          onDecrease={
            onDecrease
          }
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}