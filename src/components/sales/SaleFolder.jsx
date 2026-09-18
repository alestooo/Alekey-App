import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Folder,
  Trash2,
} from "lucide-react";

import {
  currency,
} from "../../utils/formatters";

export default function SaleFolder({
  folder,
  ordersCount = 0,
  total = 0,

  onOpen,
  onMoveLeft,
  onMoveRight,
  onEdit,
  onDelete,
}) {
  const stopAndRun = (
    event,
    callback
  ) => {
    event.stopPropagation();

    if (callback) {
      callback();
    }
  };

  return (
    <div
      onClick={onOpen}
      className="group bg-white p-8 rounded-[3rem] shadow-xl border-l-10 border-purple-600 cursor-pointer hover:shadow-2xl transition-all relative"
    >
      <div className="absolute top-0 right-0 p-4 flex gap-1 bg-white/60 rounded-bl-3xl z-10">
        <button
          type="button"
          onClick={(event) =>
            stopAndRun(
              event,
              onMoveLeft
            )
          }
          className="p-2 bg-slate-100 rounded-lg"
        >
          <ChevronUp
            className="-rotate-90"
            size={14}
          />
        </button>

        <button
          type="button"
          onClick={(event) =>
            stopAndRun(
              event,
              onMoveRight
            )
          }
          className="p-2 bg-slate-100 rounded-lg"
        >
          <ChevronDown
            className="-rotate-90"
            size={14}
          />
        </button>

        <button
          type="button"
          onClick={(event) =>
            stopAndRun(
              event,
              onEdit
            )
          }
          className="p-2 bg-blue-50 text-blue-400 rounded-lg"
        >
          <Edit2 size={14} />
        </button>

        <button
          type="button"
          onClick={(event) =>
            stopAndRun(
              event,
              onDelete
            )
          }
          className="p-2 bg-red-50 text-red-300 rounded-lg"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="w-16 h-16 bg-purple-50 rounded-3xl flex items-center justify-center mb-6">
        <Folder
          size={32}
          className="text-purple-300"
        />
      </div>

      <h4 className="font-black italic uppercase text-lg mb-2 text-slate-800">
        {folder.nombre}
      </h4>

      <span className="text-[10px] uppercase text-slate-400 font-black">
        {ordersCount}{" "}
        {ordersCount === 1
          ? "pedido"
          : "pedidos"}
      </span>

      <div className="mt-3 text-purple-600 font-black italic">
        {currency(total)}
      </div>
    </div>
  );
}