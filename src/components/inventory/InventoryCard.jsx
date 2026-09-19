import {
  Eye,
  Minus,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  currency,
} from "../../utils/formatters";

export default function InventoryCard({
  item,

  showCategory = true,

  onView,
  onEdit,
  onDelete,
  onIncrease,
  onDecrease,
}) {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const menuRef =
    useRef(null);

  const stock =
    Number(
      item?.stock
    ) || 0;

  /*
   * ========================================
   * ESTADO DEL STOCK
   * ========================================
   */

  const stockStatus =
    stock <= 0
      ? {
          label:
            "Sin stock",

          badge:
            "bg-red-50 text-red-500",

          dot:
            "bg-red-500",

          stock:
            "text-red-500",

          border:
            "border-red-300",
        }
      : stock <= 4
      ? {
          label:
            "Stock bajo",

          badge:
            "bg-orange-50 text-orange-500",

          dot:
            "bg-orange-400",

          stock:
            "text-[#F79598]",

          border:
            "border-[#F79598]",
        }
      : {
          label:
            "En stock",

          badge:
            "bg-emerald-50 text-emerald-500",

          dot:
            "bg-emerald-500",

          stock:
            "text-slate-900",

          border:
            "border-[#C0C976]",
        };

  /*
   * ========================================
   * CERRAR MENÚ AL HACER CLICK AFUERA
   * ========================================
   */

  useEffect(() => {
    const handleOutside =
      (event) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(
            event.target
          )
        ) {
          setMenuOpen(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  return (
    <article
      className={`
        relative
        bg-white
        rounded-[2.2rem]
        border-l-[6px]
        shadow-lg
        border-y
        border-r
        border-y-slate-100
        border-r-slate-100

        transition-all
        duration-200

        hover:-translate-y-1
        hover:shadow-xl

        ${stockStatus.border}
      `}
    >
      {/* ====================================
          CABECERA
      ==================================== */}

      <div
        className="
          px-5
          pt-5
          pb-4
        "
      >
        <div
          className="
            flex
            justify-between
            items-start
            gap-4
          "
        >
          <div
            className="
              min-w-0
              flex-1
            "
          >
            {showCategory && (
              <p
                className="
                  text-[8px]
                  uppercase
                  tracking-[0.18em]
                  text-slate-400
                  mb-2
                "
              >
                {item?.categoria ||
                  "Sin categoría"}
              </p>
            )}

            <h3
              title={
                item?.tema ||
                ""
              }
              className="
                text-base
                lg:text-lg
                uppercase
                italic
                tracking-tight
                leading-tight
                text-slate-900
                break-words
              "
            >
              {item?.tema ||
                "Sin nombre"}
            </h3>
          </div>

          {/* MENÚ SUPERIOR DECORATIVO */}

          <div
            className="
              text-slate-300
              shrink-0
            "
          >
            <MoreVertical
              size={17}
            />
          </div>
        </div>
      </div>

      {/* ====================================
          INFORMACIÓN
      ==================================== */}

      <div
        className="
          mx-4
          p-4
          bg-slate-50
          rounded-[1.5rem]

          grid
          grid-cols-2
          gap-4
        "
      >
        {/* STOCK */}

        <div>
          <p
            className="
              text-[8px]
              uppercase
              tracking-widest
              text-slate-400
            "
          >
            Stock actual
          </p>

          <div
            className="
              mt-1
              flex
              items-end
              gap-1
            "
          >
            <span
              className={`
                text-2xl
                lg:text-3xl
                italic
                leading-none

                ${stockStatus.stock}
              `}
            >
              {stock}
            </span>

            <span
              className={`
                text-[10px]
                mb-0.5

                ${stockStatus.stock}
              `}
            >
              Pzs
            </span>
          </div>

          {/* STATUS */}

          <div
            className={`
              mt-3
              inline-flex
              items-center
              gap-1.5

              px-2.5
              py-1.5

              rounded-xl
              text-[8px]
              uppercase
              tracking-wide

              ${stockStatus.badge}
            `}
          >
            <span
              className={`
                w-1.5
                h-1.5
                rounded-full

                ${stockStatus.dot}
              `}
            />

            {
              stockStatus.label
            }
          </div>
        </div>

        {/* PRECIO */}

        <div
          className="
            border-l
            border-slate-200
            pl-4

            flex
            flex-col
            justify-center
          "
        >
          <p
            className="
              text-[8px]
              uppercase
              tracking-widest
              text-slate-400
            "
          >
            Precio
          </p>

          <p
            className="
              mt-2
              text-base
              lg:text-lg
              italic
              text-slate-800
            "
          >
            {currency(
              Number(
                item?.precio
              ) || 0
            )}
          </p>
        </div>
      </div>

      {/* ====================================
          ACCIONES
      ==================================== */}

      <div
        className="
          px-4
          py-4
          grid
          grid-cols-[1fr_1fr_42px]
          gap-2
        "
      >
        {/* VER */}

        <button
          type="button"
          onClick={onView}
          className="
            h-10
            rounded-xl

            bg-white
            border
            border-slate-100

            text-slate-500

            flex
            items-center
            justify-center
            gap-2

            text-[9px]
            uppercase
            tracking-wide

            hover:bg-slate-900
            hover:text-white

            transition-all
          "
        >
          <Eye
            size={14}
          />

          Ver
        </button>

        {/* EDITAR */}

        <button
          type="button"
          onClick={onEdit}
          className="
            h-10
            rounded-xl

            bg-white
            border
            border-slate-100

            text-slate-600

            flex
            items-center
            justify-center
            gap-2

            text-[9px]
            uppercase
            tracking-wide

            hover:bg-[#8ED4BE]
            hover:text-slate-900

            transition-all
          "
        >
          <Pencil
            size={13}
          />

          Editar
        </button>

        {/* MÁS */}

        <div
          ref={menuRef}
          className="relative"
        >
          <button
            type="button"
            aria-label="Más opciones"
            aria-expanded={
              menuOpen
            }
            onClick={() =>
              setMenuOpen(
                (previous) =>
                  !previous
              )
            }
            className="
              w-full
              h-10

              rounded-xl

              bg-white
              border
              border-slate-100

              text-slate-500

              flex
              items-center
              justify-center

              hover:bg-slate-100
              transition-all
            "
          >
            <MoreVertical
              size={16}
            />
          </button>

          {menuOpen && (
            <div
              className="
                absolute
                right-0
                bottom-12

                w-44

                bg-white
                rounded-2xl
                shadow-2xl
                border
                border-slate-100

                p-2

                z-40
                animate-in
              "
            >
              {/* +1 */}

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(
                    false
                  );

                  onIncrease?.();
                }}
                className="
                  w-full
                  p-3

                  rounded-xl

                  flex
                  items-center
                  gap-3

                  text-[9px]
                  uppercase
                  text-slate-500

                  hover:bg-emerald-50
                  hover:text-emerald-500

                  transition-all
                "
              >
                <Plus
                  size={15}
                />

                Agregar 1
              </button>

              {/* -1 */}

              <button
                type="button"
                disabled={
                  stock <= 0
                }
                onClick={() => {
                  setMenuOpen(
                    false
                  );

                  onDecrease?.();
                }}
                className="
                  w-full
                  p-3

                  rounded-xl

                  flex
                  items-center
                  gap-3

                  text-[9px]
                  uppercase
                  text-slate-500

                  hover:bg-orange-50
                  hover:text-orange-500

                  disabled:opacity-30
                  disabled:pointer-events-none

                  transition-all
                "
              >
                <Minus
                  size={15}
                />

                Restar 1
              </button>

              <div
                className="
                  h-px
                  bg-slate-100
                  my-1
                "
              />

              {/* ELIMINAR */}

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(
                    false
                  );

                  onDelete?.();
                }}
                className="
                  w-full
                  p-3

                  rounded-xl

                  flex
                  items-center
                  gap-3

                  text-[9px]
                  uppercase
                  text-red-400

                  hover:bg-red-50

                  transition-all
                "
              >
                <Trash2
                  size={15}
                />

                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}