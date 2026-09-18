export default function StatCard({
  icon,
  label,
  val,
  borderColor,
  isClient = false,
}) {
  return (
    <div
      className={`
        bg-white
        p-8
        rounded-[3rem]
        shadow-xl
        border-b-10
        ${borderColor}
        transition-transform
        hover:scale-[1.02]
      `}
    >
      <div className="mb-4 opacity-40">
        {icon}
      </div>

      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
        {label}
      </p>

      <h4
        className={`
          font-black
          italic
          uppercase
          leading-tight
          ${
            isClient
              ? "text-sm lg:text-md text-slate-800"
              : "text-2xl text-slate-900"
          }
        `}
      >
        {val}
      </h4>
    </div>
  );
}