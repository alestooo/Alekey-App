import {
  Bell,
  Box,
  ChevronRight,
  Clock3,
  PackageX,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

export default function AlertsMenu({
  ventas = [],
  inventario = [],
  mobile = false,
}) {
  const [
    open,
    setOpen,
  ] = useState(false);

  const wrapperRef =
    useRef(null);

  /*
   * ========================================
   * CALCULAR ALERTAS
   * ========================================
   */

  const alertas =
    useMemo(() => {
      const inventarioActivo =
        (
          inventario ||
          []
        ).filter(
          (item) =>
            item.activo !==
            false
        );

      const sinStock =
        inventarioActivo.filter(
          (item) =>
            Number(
              item.stock
            ) === 0
        );

      const stockBajo =
        inventarioActivo.filter(
          (item) => {
            const stock =
              Number(
                item.stock
              ) || 0;

            return (
              stock > 0 &&
              stock <= 4
            );
          }
        );

      const ventasPendientes =
        (
          ventas || []
        ).filter(
          (venta) =>
            (
              venta.items ||
              []
            ).some(
              (item) =>
                Number(
                  item.pendiente
                ) > 0
            )
        );

      const piezasPendientes =
        (
          ventas || []
        ).reduce(
          (
            total,
            venta
          ) =>
            total +
            (
              venta.items ||
              []
            ).reduce(
              (
                subtotal,
                item
              ) =>
                subtotal +
                (Number(
                  item.pendiente
                ) || 0),
              0
            ),
          0
        );

      return {
        sinStock,
        stockBajo,
        ventasPendientes,
        piezasPendientes,
      };
    }, [
      ventas,
      inventario,
    ]);

  /*
   * Número que aparece sobre
   * la campana.
   */

  const cantidadAlertas =
    alertas.sinStock.length +
    alertas.stockBajo.length +
    alertas.ventasPendientes.length;

  /*
   * ========================================
   * CLICK FUERA
   * ========================================
   */

  useEffect(() => {
    const handleClickOutside =
      (event) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(
            event.target
          )
        ) {
          setOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      {/* CAMPANA */}

      <button
        type="button"
        onClick={() =>
          setOpen(
            (previous) =>
              !previous
          )
        }
        aria-label="Ver alertas"
        aria-expanded={open}
        title="Alertas"
        className={`
          relative
          flex
          items-center
          justify-center
          bg-white
          border
          border-slate-100
          text-slate-500
          shadow-lg
          hover:text-slate-900
          hover:shadow-xl
          transition-all

          ${
            mobile
              ? `
                w-11
                h-11
                rounded-2xl
              `
              : `
                w-11
                h-11
                rounded-2xl
                mx-auto
              `
          }
        `}
      >
        <Bell
          size={18}
        />

        {cantidadAlertas >
          0 && (
          <span
            className="
              absolute
              -top-1
              -right-1
              min-w-5
              h-5
              px-1
              rounded-full
              bg-[#F79598]
              text-white
              text-[8px]
              font-black
              flex
              items-center
              justify-center
              border-2
              border-white
            "
          >
            {cantidadAlertas >
            99
              ? "99+"
              : cantidadAlertas}
          </span>
        )}
      </button>

      {/* PANEL */}

      {open && (
        <div
          className={`
            absolute
            w-[310px]
            sm:w-[350px]
            bg-white
            rounded-[2rem]
            border
            border-slate-100
            shadow-2xl
            p-4
            z-[120]
            animate-in

            ${
              mobile
                ? `
                  top-14
                  right-0
                `
                : `
                  left-[70px]
                  top-0
                `
            }
          `}
        >
          {/* HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              px-2
              pb-4
              border-b
              border-slate-100
            "
          >
            <div>
              <p
                className="
                  text-sm
                  font-black
                  text-slate-900
                  uppercase
                "
              >
                Alertas
              </p>

              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-widest
                  text-slate-300
                  font-black
                  mt-1
                "
              >
                Estado actual
                de Alekey
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="
                w-8
                h-8
                rounded-xl
                bg-slate-50
                text-slate-400
                flex
                items-center
                justify-center
                hover:bg-slate-900
                hover:text-white
                transition-all
              "
              aria-label="Cerrar alertas"
            >
              <X
                size={15}
              />
            </button>
          </div>

          {/* SIN ALERTAS */}

          {cantidadAlertas ===
          0 ? (
            <div
              className="
                py-10
                text-center
              "
            >
              <div
                className="
                  w-12
                  h-12
                  mx-auto
                  mb-4
                  rounded-2xl
                  bg-emerald-50
                  text-emerald-500
                  flex
                  items-center
                  justify-center
                "
              >
                <Bell
                  size={21}
                />
              </div>

              <p
                className="
                  text-sm
                  font-black
                  text-slate-700
                "
              >
                Todo en orden
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-slate-400
                "
              >
                No hay alertas
                importantes.
              </p>
            </div>
          ) : (
            <div
              className="
                py-3
                space-y-2
              "
            >
              {/* SIN STOCK */}

              {alertas.sinStock
                .length >
                0 && (
                <Link
                  to="/inventario"
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    p-3
                    rounded-2xl
                    bg-red-50/70
                    hover:bg-red-50
                    transition-all
                  "
                >
                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-white
                      text-red-400
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <PackageX
                      size={
                        18
                      }
                    />
                  </div>

                  <div className="flex-1">
                    <p
                      className="
                        text-[11px]
                        font-black
                        text-slate-700
                      "
                    >
                      Sin stock
                    </p>

                    <p
                      className="
                        text-[9px]
                        text-slate-400
                        mt-0.5
                      "
                    >
                      {
                        alertas
                          .sinStock
                          .length
                      }{" "}
                      productos
                      requieren
                      reposición.
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className="text-red-300"
                  />
                </Link>
              )}

              {/* STOCK BAJO */}

              {alertas.stockBajo
                .length >
                0 && (
                <Link
                  to="/inventario"
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    p-3
                    rounded-2xl
                    bg-amber-50/70
                    hover:bg-amber-50
                    transition-all
                  "
                >
                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-white
                      text-amber-500
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <Box
                      size={
                        18
                      }
                    />
                  </div>

                  <div className="flex-1">
                    <p
                      className="
                        text-[11px]
                        font-black
                        text-slate-700
                      "
                    >
                      Stock bajo
                    </p>

                    <p
                      className="
                        text-[9px]
                        text-slate-400
                        mt-0.5
                      "
                    >
                      {
                        alertas
                          .stockBajo
                          .length
                      }{" "}
                      productos tienen
                      4 unidades o
                      menos.
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className="text-amber-300"
                  />
                </Link>
              )}

              {/* PEDIDOS */}

              {alertas
                .ventasPendientes
                .length >
                0 && (
                <Link
                  to="/ventas"
                  onClick={() =>
                    setOpen(
                      false
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    p-3
                    rounded-2xl
                    bg-purple-50/70
                    hover:bg-purple-50
                    transition-all
                  "
                >
                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-white
                      text-purple-500
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <Clock3
                      size={
                        18
                      }
                    />
                  </div>

                  <div className="flex-1">
                    <p
                      className="
                        text-[11px]
                        font-black
                        text-slate-700
                      "
                    >
                      Pedidos
                      pendientes
                    </p>

                    <p
                      className="
                        text-[9px]
                        text-slate-400
                        mt-0.5
                      "
                    >
                      {
                        alertas
                          .ventasPendientes
                          .length
                      }{" "}
                      pedidos ·{" "}
                      {
                        alertas
                          .piezasPendientes
                      }{" "}
                      piezas.
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className="text-purple-300"
                  />
                </Link>
              )}
            </div>
          )}

          {/* FOOTER */}

          <div
            className="
              border-t
              border-slate-100
              pt-3
              px-2
            "
          >
            <p
              className="
                text-[8px]
                uppercase
                tracking-widest
                text-slate-300
                text-center
                font-black
              "
            >
              Se calcula con
              datos actuales
              de inventario y
              ventas
            </p>
          </div>
        </div>
      )}
    </div>
  );
}