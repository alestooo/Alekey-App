import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CircleHelp,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../../contexts/AuthContext";

import AlertsMenu from "../common/AlertsMenu";

export default function MobileMoreMenu({
  ventas = [],
  inventarioCatalog = [],
}) {
  const {
    isAdmin,
  } = useAuth();

  const location =
    useLocation();

  const [
    open,
    setOpen,
  ] = useState(false);

  const menuRef =
    useRef(null);

  /*
   * ========================================
   * CLOSE WHEN ROUTE CHANGES
   * ========================================
   */

  useEffect(() => {
    setOpen(false);
  }, [
    location.pathname,
  ]);

  /*
   * ========================================
   * CLOSE OUTSIDE
   * ========================================
   */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleOutside =
      (event) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(
            event.target
          )
        ) {
          setOpen(false);
        }
      };

    document.addEventListener(
      "pointerdown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutside
      );
    };
  }, [
    open,
  ]);

  /*
   * ========================================
   * ESC CLOSE
   * ========================================
   */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKey =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          setOpen(false);
        }
      };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, [
    open,
  ]);

  return (
    <div
      ref={menuRef}
      className="
        lg:hidden

        fixed
        top-4
        right-4

        z-[90]
      "
    >
      {/* =================================
          BUTTON
      ================================= */}

      <button
        type="button"
        aria-label={
          open
            ? "Cerrar menú"
            : "Abrir menú"
        }
        aria-expanded={
          open
        }
        onClick={() =>
          setOpen(
            (
              previous
            ) =>
              !previous
          )
        }
        className="
          w-11
          h-11

          rounded-2xl

          bg-white

          border
          border-slate-100

          shadow-[0_8px_24px_rgba(15,23,42,0.12)]

          flex
          items-center
          justify-center

          text-slate-500

          active:scale-95

          transition-all
        "
      >
        {open ? (
          <X
            size={19}
          />
        ) : (
          <MoreHorizontal
            size={20}
          />
        )}
      </button>

      {/* =================================
          MENU
      ================================= */}

      {open && (
        <div
          className="
            absolute

            top-14
            right-0

            p-2

            rounded-[1.4rem]

            bg-white

            border
            border-slate-100

            shadow-[0_16px_40px_rgba(15,23,42,0.16)]

            flex
            flex-col

            gap-2

            animate-in
          "
        >
          {/* USUARIO */}

          <MobileMenuLink
            to="/usuario"
            title="Usuario"
            onClick={() =>
              setOpen(false)
            }
          >
            <User
              size={18}
            />
          </MobileMenuLink>

          {/* SOLO ADMIN */}

          {isAdmin && (
            <MobileMenuLink
              to="/admin/usuarios"
              title="Administración"
              admin
              onClick={() =>
                setOpen(
                  false
                )
              }
            >
              <ShieldCheck
                size={18}
              />
            </MobileMenuLink>
          )}

          {/* AJUSTES */}

          <MobileMenuLink
            to="/ajustes"
            title="Ajustes"
            onClick={() =>
              setOpen(false)
            }
          >
            <Settings
              size={18}
            />
          </MobileMenuLink>

          {/* AYUDA */}

          <MobileMenuLink
            to="/ayuda"
            title="Ayuda"
            onClick={() =>
              setOpen(false)
            }
          >
            <CircleHelp
              size={18}
            />
          </MobileMenuLink>

          {/* ALERTAS */}

          <div
            className="
              flex
              items-center
              justify-center
            "
          >
            <AlertsMenu
              mobile
              ventas={
                ventas
              }
              inventarioCatalog={
                inventarioCatalog
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

/*
 * ========================================
 * LINK
 * ========================================
 */

function MobileMenuLink({
  to,
  title,
  children,
  onClick,
  admin = false,
}) {
  return (
    <Link
      to={to}
      title={title}
      aria-label={title}
      onClick={
        onClick
      }
      className={`
        w-11
        h-11

        rounded-xl

        flex
        items-center
        justify-center

        transition-all

        ${
          admin
            ? `
              bg-[#8ED4BE]/15
              text-[#58B99A]

              hover:bg-[#8ED4BE]
              hover:text-slate-900
            `
            : `
              bg-slate-50
              text-slate-500

              hover:bg-slate-900
              hover:text-white
            `
        }
      `}
    >
      {children}
    </Link>
  );
}