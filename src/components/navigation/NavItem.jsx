import {
  Link,
  useLocation,
} from "react-router-dom";

export default function NavItem({
  to,
  icon,
  label,
  isMobile = false,
}) {
  const location =
    useLocation();

  const active =
    location.pathname ===
    to;

  return (
    <Link
      to={to}
      className={`
        flex
        flex-col
        items-center
        gap-1
        group
        relative
        transition-all
        font-black

        ${
          active
            ? "text-[#8ED4BE]"
            : "text-slate-300 hover:text-slate-500"
        }
      `}
    >
      <div
        className={`
          p-3
          rounded-2xl
          transition-all

          ${
            active
              ? "bg-[#8ED4BE]/10 shadow-inner"
              : "group-hover:bg-slate-50"
          }
        `}
      >
        {icon}
      </div>

      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
        {label}
      </span>

      {active &&
        !isMobile && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#8ED4BE] rounded-full hidden lg:block" />
        )}

      {active &&
        isMobile && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#8ED4BE] rounded-full" />
        )}
    </Link>
  );
}