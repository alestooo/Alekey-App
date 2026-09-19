import {
  Link,
  useLocation,
} from "react-router-dom";

export default function NavItem({
  to,
  icon: Icon,
  label,
  disabled = false,
  mobile = false,
}) {
  const location =
    useLocation();

  const active =
    !disabled &&
    location.pathname === to;

  /*
   * ========================================
   * DESHABILITADO
   * ========================================
   */

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        title={`${label} - Próximamente`}
        className={`
          relative
          flex
          items-center
          justify-center
          transition-all
          opacity-40
          cursor-not-allowed

          ${
            mobile
              ? `
                flex-col
                gap-1
                flex-1
                py-2
              `
              : `
                w-[72px]
                h-[72px]
                flex-col
                gap-2
                rounded-[22px]
              `
          }
        `}
      >
        <Icon
          size={
            mobile
              ? 20
              : 21
          }
          strokeWidth={1.8}
        />

        <span
          className="
            text-[8px]
            font-black
            uppercase
            tracking-[0.12em]
          "
        >
          {label}
        </span>
      </button>
    );
  }

  /*
   * ========================================
   * NORMAL
   * ========================================
   */

  return (
    <Link
      to={to}
      className={`
        relative
        flex
        items-center
        justify-center
        transition-all
        duration-200
        group

        ${
          mobile
            ? `
              flex-col
              gap-1
              flex-1
              py-2
              rounded-2xl
            `
            : `
              w-[72px]
              h-[72px]
              flex-col
              gap-2
              rounded-[22px]
            `
        }

        ${
          active
            ? `
              bg-[#8ED4BE]/15
              text-[#58B99A]
            `
            : `
              text-slate-300
              hover:text-slate-700
              hover:bg-slate-50
            `
        }
      `}
    >
      {/* INDICADOR DESKTOP */}

      {!mobile &&
        active && (
          <span
            className="
              absolute
              -left-[22px]
              top-1/2
              -translate-y-1/2
              w-1
              h-7
              bg-[#8ED4BE]
              rounded-r-full
            "
          />
        )}

      <Icon
        size={
          mobile
            ? 20
            : 21
        }
        strokeWidth={
          active
            ? 2.3
            : 1.8
        }
        className="
          transition-transform
          group-hover:scale-105
        "
      />

      <span
        className="
          text-[8px]
          font-black
          uppercase
          tracking-[0.12em]
        "
      >
        {label}
      </span>
    </Link>
  );
}