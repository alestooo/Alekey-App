import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function StockControls({
  onIncrease,
  onDecrease,
  onEdit,
}) {
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onIncrease}
        className="p-2 bg-white rounded-lg shadow-sm text-[#C0C976] hover:bg-[#C0C976] hover:text-white transition-all"
      >
        <ChevronUp
          size={16}
        />
      </button>

      <button
        type="button"
        onClick={onDecrease}
        className="p-2 bg-white rounded-lg shadow-sm text-[#C0C976] hover:bg-[#C0C976] hover:text-white transition-all"
      >
        <ChevronDown
          size={16}
        />
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="text-[9px] uppercase text-slate-400 hover:text-slate-800 mt-1 font-black"
      >
        Editar
      </button>
    </div>
  );
}