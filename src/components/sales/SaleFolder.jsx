import {
  AlertTriangle,
  Edit2,
  Folder,
  GripVertical,
  Lock,
  Trash2,
  WalletCards,
} from "lucide-react";

import {
  useSortable,
} from "@dnd-kit/sortable";

import {
  CSS,
} from "@dnd-kit/utilities";

import {
  currency,
} from "../../utils/formatters";

export default function SaleFolder({
  folder,
  count = 0,
  total = 0,

  system = false,
  systemType = null,

  onOpen,
  onRename,
  onDelete,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(
      folder.id
    ),

    disabled:
      system,
  });

  const style = {
    transform:
      CSS.Transform.toString(
        transform
      ),

    transition,

    zIndex: isDragging
      ? 50
      : "auto",

    opacity: isDragging
      ? 0.9
      : 1,
  };

  const isDebt =
    systemType ===
    "debt";

  const isPending =
    systemType ===
    "pending";

  const borderColor =
    isDebt
      ? "#EF4444"
      : isPending
        ? "#F79598"
        : "#A855F7";

  const Icon =
    isDebt
      ? WalletCards
      : isPending
        ? AlertTriangle
        : Folder;

  return (
    <article
      ref={setNodeRef}
      style={{
        ...style,
        borderLeftColor:
          borderColor,
      }}
      className={`
        sale-folder
        relative
        bg-white
        rounded-[2.7rem]
        border-l-[9px]
        shadow-xl
        overflow-hidden
        transition-all

        ${
          isDragging
            ? "scale-[1.02] shadow-2xl"
            : "hover:-translate-y-1 hover:shadow-2xl"
        }

        ${
          isDebt
            ? "sale-folder-debt"
            : ""
        }
      `}
    >
      {/* SYSTEM BADGE */}

      {system && (
        <div
          className="
            absolute
            top-5
            left-6
            z-20
          "
        >
          <span
            className={`
              inline-flex
              items-center
              gap-1.5
              px-3
              py-1.5
              rounded-full
              text-[8px]
              uppercase
              tracking-widest

              ${
                isDebt
                  ? "bg-red-500 text-white"
                  : "bg-[#F79598] text-white"
              }
            `}
          >
            <Lock
              size={10}
            />

            Automática
          </span>
        </div>
      )}

      {/* ACTIONS */}

      <div
        className="
          absolute
          top-4
          right-4
          z-20
          flex
          gap-1
        "
      >
        {!system && (
          <>
            <button
              type="button"
              {...attributes}
              {...listeners}
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
              aria-label="Mover carpeta"
              title="Mantén presionado y arrastra"
              className="
                w-9
                h-9
                rounded-xl
                bg-purple-50
                text-purple-400
                flex
                items-center
                justify-center
                cursor-grab
                active:cursor-grabbing
                touch-none
                hover:bg-purple-500
                hover:text-white
              "
            >
              <GripVertical
                size={17}
              />
            </button>

            <button
              type="button"
              onClick={(
                event
              ) => {
                event.stopPropagation();

                onRename?.();
              }}
              aria-label="Editar carpeta"
              className="
                w-9
                h-9
                rounded-xl
                bg-blue-50
                text-blue-400
                flex
                items-center
                justify-center
                hover:bg-blue-500
                hover:text-white
              "
            >
              <Edit2
                size={15}
              />
            </button>

            <button
              type="button"
              onClick={(
                event
              ) => {
                event.stopPropagation();

                onDelete?.();
              }}
              aria-label="Eliminar carpeta"
              className="
                w-9
                h-9
                rounded-xl
                bg-red-50
                text-red-300
                flex
                items-center
                justify-center
                hover:bg-red-500
                hover:text-white
              "
            >
              <Trash2
                size={15}
              />
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="
          w-full
          min-h-[260px]
          p-7
          pt-16
          text-left
          flex
          flex-col
          justify-between
        "
      >
        <div>
          <div
            className={`
              w-16
              h-16
              rounded-[1.5rem]
              flex
              items-center
              justify-center
              mb-7

              ${
                isDebt
                  ? "bg-red-50 text-red-500"
                  : isPending
                    ? "bg-rose-50 text-[#F79598]"
                    : "bg-purple-50 text-purple-300"
              }
            `}
          >
            <Icon
              size={29}
            />
          </div>

          <h3
            className={`
              text-lg
              lg:text-xl
              italic
              uppercase
              leading-tight

              ${
                isDebt
                  ? "text-red-600"
                  : "text-slate-800"
              }
            `}
          >
            {folder.nombre}
          </h3>

          {isDebt && (
            <p
              className="
                mt-2
                text-[9px]
                uppercase
                tracking-widest
                text-red-400
              "
            >
              Clientes con pago
              pendiente
            </p>
          )}

          {isPending && (
            <p
              className="
                mt-2
                text-[9px]
                uppercase
                tracking-widest
                text-[#F79598]
              "
            >
              Productos pendientes
              de entregar
            </p>
          )}

          <div
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              px-3
              py-2
              bg-slate-50
              rounded-xl
            "
          >
            <strong
              className="
                text-lg
                text-slate-900
              "
            >
              {count}
            </strong>

            <span
              className="
                text-[8px]
                uppercase
                tracking-widest
                text-slate-400
              "
            >
              {count === 1
                ? "pedido"
                : "pedidos"}
            </span>
          </div>
        </div>

        <div
          className="
            mt-7
            pt-5
            border-t
            border-slate-100
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
            Total acumulado
          </p>

          <p
            className={`
              mt-1
              text-xl
              lg:text-2xl
              italic

              ${
                isDebt
                  ? "text-red-500"
                  : "text-purple-600"
              }
            `}
          >
            {currency(
              total
            )}
          </p>
        </div>
      </button>
    </article>
  );
}