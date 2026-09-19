// src/components/navigation/MobileMoreMenu.jsx

import {
  CircleHelp,
  MoreHorizontal,
  Settings,
  User,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import AlertsMenu from "../common/AlertsMenu";

export default function MobileMoreMenu({
  ventas = [],
  inventarioCatalog = [],
}) {
  const [open, setOpen] =
    useState(false);

  const wrapperRef =
    useRef(null);

  const location =
    useLocation();

  /*
   * ========================================
   * CERRAR AL CAMBIAR DE RUTA
   * ========================================
   */
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  /*
   * ========================================
   * CERRAR AL TOCAR AFUERA
   * ========================================
   */
  useEffect(() => {
    const handleOutside = (
      event
    ) => {
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
      handleOutside
    );
    document.addEventListener(
      "touchstart",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
      document.removeEventListener(
        "touchstart",
        handleOutside
      );
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="
        lg:hidden
        fixed
        top-4
        right-4
        z-[100]
      "
    >
      {/* BOTÓN 3 PUNTOS */}
      <button
        type="button"
        onClick={() =>
          setOpen(
            (prev) => !prev
          )
        }
        aria-label="Más opciones"
        aria-expanded={open}
        className={`
          w-11
          h-11
          rounded-2xl
          bg-white
          border
          border-slate-100
          shadow-lg
          flex
          items-center
          justify-center
          text-slate-500
          hover:text-slate-900
          hover:shadow-xl
          active:scale-95
          transition-all
          ${
            open
              ? "text-slate-900"
              : ""
          }
        `}
      >
        {open ? (
          <X size={18} />
        ) : (
          <MoreHorizontal size={21} />
        )}
      </button>

      {/* MENÚ */}
      {open && (
        <div
          className="
            absolute
            top-14
            right-0
            p-2
            bg-white
            border
            border-slate-100
            rounded-[1.4rem]
            shadow-2xl
            flex
            items-center
            gap-2
            animate-in
          "
        >
          {/* USUARIO */}
          <Link
            to="/usuario"
            onClick={() =>
              setOpen(false)
            }
            title="Usuario"
            aria-label="Usuario"
            className={`
              w-11
              h-11
              rounded-2xl
              flex
              items-center
              justify-center
              transition-all
              ${
                location.pathname ===
                "/usuario"
                  ? "bg-[#8ED4BE]/20 text-[#58B99A]"
                  : "bg-slate-50 text-slate-400 hover:text-slate-900"
              }
            `}
          >
            <User size={18} />
          </Link>

          {/* AJUSTES */}
          <Link
            to="/ajustes"
            onClick={() =>
              setOpen(false)
            }
            title="Ajustes"
            aria-label="Ajustes"
            className={`
              w-11
              h-11
              rounded-2xl
              flex
              items-center
              justify-center
              transition-all
              ${
                location.pathname ===
                "/ajustes"
                  ? "bg-[#8ED4BE]/20 text-[#58B99A]"
                  : "bg-slate-50 text-slate-400 hover:text-slate-900"
              }
            `}
          >
            <Settings size={18} />
          </Link>

          {/* AYUDA */}
          <Link
            to="/ayuda"
            onClick={() =>
              setOpen(false)
            }
            title="Ayuda"
            aria-label="Ayuda"
            className={`
              w-11
              h-11
              rounded-2xl
              flex
              items-center
              justify-center
              transition-all
              ${
                location.pathname ===
                "/ayuda"
                  ? "bg-[#8ED4BE]/20 text-[#58B99A]"
                  : "bg-slate-50 text-slate-400 hover:text-slate-900"
              }
            `}
          >
            <CircleHelp size={18} />
          </Link>

          {/* ALERTAS */}
          <AlertsMenu
            mobile
            ventas={ventas}
            inventario={
              inventarioCatalog
            }
          />
        </div>
      )}
    </div>
  );
}