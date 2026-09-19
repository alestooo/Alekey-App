import {
  isValidElement,
} from "react";

import {
  NavLink,
} from "react-router-dom";

export default function NavItem({
  to,
  icon,
  label,
  end = false,
}) {
  /*
   * Acepta:
   *
   * icon={Home}
   *
   * o:
   *
   * icon={<Home size={21} />}
   */

  const renderIcon =
    () => {
      /*
       * Ya viene como JSX:
       * <Home />
       */

      if (
        isValidElement(
          icon
        )
      ) {
        return icon;
      }

      /*
       * Viene como componente:
       * Home
       */

      if (
        typeof icon ===
        "function" ||
        typeof icon ===
        "object"
      ) {
        const Icon =
          icon;

        return (
          <Icon
            size={21}
          />
        );
      }

      return null;
    };

  return (
    <NavLink
      to={to}
      end={end}
      className={({
        isActive,
      }) => `
        group

        relative

        w-full

        flex
        flex-col
        items-center
        justify-center

        gap-1.5

        py-3

        rounded-2xl

        transition-all
        duration-200

        ${
          isActive
            ? `
              bg-[#8ED4BE]/15
              text-[#58B99A]
            `
            : `
              text-slate-300
              hover:bg-slate-50
              hover:text-slate-600
            `
        }
      `}
    >
      {({
        isActive,
      }) => (
        <>
          {/* ACTIVE MARK */}

          {isActive && (
            <span
              className="
                absolute

                -left-2

                w-1
                h-7

                rounded-r-full

                bg-[#8ED4BE]
              "
            />
          )}

          {/* ICON */}

          <div
            className={`
              flex
              items-center
              justify-center

              transition-transform
              duration-200

              group-hover:scale-105

              ${
                isActive
                  ? "text-[#58B99A]"
                  : ""
              }
            `}
          >
            {renderIcon()}
          </div>

          {/* LABEL */}

          <span
            className="
              text-[7px]

              uppercase
              tracking-[0.18em]

              whitespace-nowrap
            "
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}