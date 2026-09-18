import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function QuantityControls({
  value,
  onChange,
  min = 0,
  max = 99,
  colorClass = "bg-white",
  textClass = "text-slate-800",
}) {
  const handleInputChange = (event) => {
    const parsed =
      parseInt(event.target.value) || 0;

    const valueInsideRange =
      Math.max(
        min,
        Math.min(max, parsed)
      );

    onChange(valueInsideRange);
  };

  const increase = () => {
    onChange(
      Math.min(max, value + 1)
    );
  };

  const decrease = () => {
    onChange(
      Math.max(min, value - 1)
    );
  };

  return (
    <div className="flex items-center gap-1 justify-center">
      <input
        type="number"
        className={`
          w-11
          h-10
          sm:w-14
          sm:h-12
          border-2
          rounded-xl
          font-black
          text-center
          outline-none
          transition-all
          focus:border-cyan-400
          ${colorClass}
          ${textClass}
        `}
        value={value}
        min={min}
        max={max}
        onChange={handleInputChange}
      />

      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={increase}
          className="p-1 bg-cyan-100 rounded-md text-cyan-600"
        >
          <ChevronUp size={12} />
        </button>

        <button
          type="button"
          onClick={decrease}
          className="p-1 bg-cyan-100 rounded-md text-cyan-600"
        >
          <ChevronDown size={12} />
        </button>
      </div>
    </div>
  );
}