import {
  ChevronRight,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

export default function UserMenu() {
  const [
    open,
    setOpen,
  ] = useState(false);

  const wrapperRef =
    useRef(null);

  /*
   * ========================================
   * CERRAR AL HACER CLICK AFUERA
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
      className="
        relative
        flex
        justify-center
      "
    >
      {/* BOTÓN USUARIO */}

      <button
        type="button"
        onClick={() =>
          setOpen(
            (previous) =>
              !previous
          )
        }
        aria-label="Menú de usuario"
        aria-expanded={open}
        className="
          w-[72px]
          min-h-[66px]
          rounded-[22px]
          flex
          flex-col
          items-center
          justify-center
          gap-2
          hover:bg-slate-50
          transition-all
          group
        "
      >
        <div
          className="
            w-9
            h-9
            bg-slate-900
            text-[#8ED4BE]
            rounded-xl
            flex
            items-center
            justify-center
            text-[10px]
            font-black
            shadow-lg
            group-hover:scale-105
            transition-transform
          "
        >
          U
        </div>

        <span
          className="
            text-[8px]
            uppercase
            tracking-widest
            font-black
            text-slate-400
          "
        >
          Usuario
        </span>
      </button>

      {/* MENÚ */}

      {open && (
        <div
          className="
            absolute
            bottom-0
            left-[86px]
            w-[245px]
            bg-white
            rounded-[1.8rem]
            shadow-2xl
            border
            border-slate-100
            p-3
            z-[100]
            animate-in
          "
        >
          {/* PERFIL */}

          <div
            className="
              p-4
              border-b
              border-slate-100
              mb-2
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  w-11
                  h-11
                  bg-slate-900
                  text-[#8ED4BE]
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  font-black
                "
              >
                U
              </div>

              <div>
                <p
                  className="
                    text-sm
                    font-black
                    text-slate-800
                  "
                >
                  Usuario
                </p>

                <p
                  className="
                    text-[9px]
                    uppercase
                    tracking-widest
                    text-slate-300
                    font-black
                  "
                >
                  Perfil próximamente
                </p>
              </div>
            </div>
          </div>

          {/* OPCIONES FUTURAS */}

          <button
            type="button"
            disabled
            className="
              w-full
              flex
              items-center
              gap-3
              p-3
              rounded-xl
              text-slate-300
              cursor-not-allowed
            "
          >
            <User
              size={16}
            />

            <span
              className="
                flex-1
                text-left
                text-[10px]
                uppercase
                tracking-widest
                font-black
              "
            >
              Perfil
            </span>

            <span
              className="
                text-[8px]
                uppercase
              "
            >
              Próximamente
            </span>
          </button>

          <button
            type="button"
            disabled
            className="
              w-full
              flex
              items-center
              gap-3
              p-3
              rounded-xl
              text-slate-300
              cursor-not-allowed
            "
          >
            <Settings
              size={16}
            />

            <span
              className="
                flex-1
                text-left
                text-[10px]
                uppercase
                tracking-widest
                font-black
              "
            >
              Cuenta
            </span>

            <ChevronRight
              size={14}
            />
          </button>

          <div
            className="
              my-2
              h-px
              bg-slate-100
            "
          />

          <button
            type="button"
            disabled
            className="
              w-full
              flex
              items-center
              gap-3
              p-3
              rounded-xl
              text-red-200
              cursor-not-allowed
            "
          >
            <LogOut
              size={16}
            />

            <span
              className="
                text-[10px]
                uppercase
                tracking-widest
                font-black
              "
            >
              Cerrar sesión
            </span>
          </button>
        </div>
      )}
    </div>
  );
}