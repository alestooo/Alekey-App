import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronRight,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  useAuth,
} from "../../contexts/AuthContext";

export default function UserMenu() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const menuRef =
    useRef(null);

  const {
    user,
    profile,
    isAdmin,
    logout,
  } = useAuth();

  const [
    open,
    setOpen,
  ] = useState(false);

  /*
   * ========================================
   * INITIAL
   * ========================================
   */

  const displayName =
    profile?.nombre ||
    user?.user_metadata
      ?.nombre ||
    user?.user_metadata
      ?.full_name ||
    user?.user_metadata
      ?.name ||
    "Usuario";

  const displayEmail =
    profile?.email ||
    user?.email ||
    "";

  const initial =
    displayName
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "U";

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
   * ESC
   * ========================================
   */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown =
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
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    open,
  ]);

  /*
   * ========================================
   * LOGOUT
   * ========================================
   */

  const handleLogout =
    async () => {
      const result =
        await Swal.fire({
          title:
            "¿Cerrar sesión?",

          text:
            "Tendrás que iniciar sesión nuevamente para entrar a Alekey.",

          icon:
            "question",

          showCancelButton:
            true,

          confirmButtonText:
            "Cerrar sesión",

          cancelButtonText:
            "Cancelar",

          confirmButtonColor:
            "#F79598",

          cancelButtonColor:
            "#94a3b8",
        });

      if (
        !result.isConfirmed
      ) {
        return;
      }

      try {
        setOpen(false);

        await logout();

        navigate(
          "/login",
          {
            replace:
              true,
          }
        );
      } catch (error) {
        console.error(
          "Error cerrando sesión:",
          error
        );

        await Swal.fire({
          title:
            "Error",

          text:
            error.message ||
            "No se pudo cerrar la sesión.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });
      }
    };

  return (
    <div
      ref={menuRef}
      className="
        relative

        flex
        flex-col
        items-center

        z-[200]
      "
    >
      {/* =================================
          MENU PANEL
      ================================= */}

      {open && (
        <div
          className="
            absolute

            left-[calc(100%+18px)]
            bottom-0

            w-[290px]

            p-4

            rounded-[2rem]

            bg-white

            border
            border-slate-100

            shadow-[0_22px_60px_rgba(15,23,42,0.18)]

            z-[999]

            pointer-events-auto
          "
        >
          {/* =============================
              HEADER
          ============================= */}

          <div
            className="
              flex
              items-start
              gap-3

              pb-4
            "
          >
            <div
              className="
                w-12
                h-12

                rounded-2xl

                bg-slate-900
                text-[#8ED4BE]

                flex
                items-center
                justify-center

                shrink-0
              "
            >
              <span
                className="
                  text-sm
                  font-black
                "
              >
                {initial}
              </span>
            </div>

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <p
                  className="
                    text-sm
                    italic
                    uppercase
                    font-black

                    text-slate-900

                    truncate
                  "
                >
                  {displayName}
                </p>

                {isAdmin && (
                  <ShieldCheck
                    size={15}
                    className="
                      shrink-0
                      text-[#58B99A]
                    "
                  />
                )}
              </div>

              <p
                className="
                  mt-1

                  text-[7px]
                  uppercase
                  tracking-widest

                  text-slate-400

                  truncate
                "
              >
                {isAdmin
                  ? "Administrador"
                  : "Usuario"}
              </p>

              {displayEmail && (
                <p
                  className="
                    mt-1

                    text-[8px]

                    font-semibold

                    text-slate-400

                    truncate
                  "
                >
                  {displayEmail}
                </p>
              )}
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

                flex
                items-center
                justify-center

                text-slate-300

                hover:bg-slate-100
                hover:text-slate-600

                transition-all
              "
            >
              <X
                size={15}
              />
            </button>
          </div>

          {/* =============================
              SEPARATOR
          ============================= */}

          <div
            className="
              h-px
              bg-slate-100
            "
          />

          {/* =============================
              PROFILE
          ============================= */}

          <div
            className="
              py-3

              space-y-1
            "
          >
            <MenuLink
              to="/usuario"
              icon={
                UserRound
              }
              title="Perfil"
              subtitle="Ver información"
              onClick={() =>
                setOpen(false)
              }
            />

            <MenuLink
              to="/ajustes"
              icon={
                Settings
              }
              title="Cuenta"
              subtitle="Ajustes"
              onClick={() =>
                setOpen(false)
              }
            />

            {isAdmin && (
              <MenuLink
                to="/admin/usuarios"
                icon={
                  ShieldCheck
                }
                title="Administración"
                subtitle="Usuarios y roles"
                admin
                onClick={() =>
                  setOpen(false)
                }
              />
            )}
          </div>

          {/* =============================
              SEPARATOR
          ============================= */}

          <div
            className="
              h-px
              bg-slate-100
            "
          />

          {/* =============================
              LOGOUT
          ============================= */}

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="
              mt-3

              w-full

              px-4
              py-3.5

              rounded-2xl

              flex
              items-center
              gap-3

              text-red-400

              hover:bg-red-50
              hover:text-red-500

              transition-all
            "
          >
            <LogOut
              size={17}
            />

            <span
              className="
                text-[8px]
                uppercase
                tracking-[0.16em]
                font-black
              "
            >
              Cerrar sesión
            </span>
          </button>
        </div>
      )}

      {/* =================================
          MAIN USER BUTTON
      ================================= */}

      <button
        type="button"
        aria-label="Menú de usuario"
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
          group

          flex
          flex-col
          items-center
          justify-center

          gap-1.5

          text-slate-400

          transition-all

          hover:text-[#58B99A]
        "
      >
        <div
          className={`
            w-11
            h-11

            rounded-2xl

            flex
            items-center
            justify-center

            border

            transition-all

            ${
              open
                ? `
                  bg-[#8ED4BE]
                  border-[#8ED4BE]
                  text-slate-900
                  shadow-lg
                  shadow-[#8ED4BE]/20
                `
                : `
                  bg-slate-900
                  border-slate-800
                  text-[#8ED4BE]

                  group-hover:border-[#8ED4BE]/50
                `
            }
          `}
        >
          <span
            className="
              text-xs
              font-black
            "
          >
            {initial}
          </span>
        </div>

        <span
          className="
            max-w-[80px]

            text-[6px]

            uppercase
            tracking-[0.18em]

            truncate
          "
        >
          {displayName}
        </span>
      </button>
    </div>
  );
}

/*
 * ========================================
 * MENU LINK
 * ========================================
 */

function MenuLink({
  to,
  icon: Icon,
  title,
  subtitle,
  onClick,
  admin = false,
}) {
  return (
    <Link
      to={to}
      onClick={
        onClick
      }
      className={`
        w-full

        px-4
        py-3

        rounded-2xl

        flex
        items-center
        gap-3

        transition-all

        ${
          admin
            ? `
              text-[#58B99A]
              hover:bg-[#8ED4BE]/10
            `
            : `
              text-slate-500
              hover:bg-slate-50
              hover:text-slate-800
            `
        }
      `}
    >
      <Icon
        size={17}
        className="
          shrink-0
        "
      />

      <div
        className="
          min-w-0
          flex-1

          text-left
        "
      >
        <p
          className="
            text-[8px]

            uppercase
            tracking-[0.16em]

            font-black
          "
        >
          {title}
        </p>

        <p
          className="
            mt-0.5

            text-[6px]

            uppercase
            tracking-wider

            text-slate-300
          "
        >
          {subtitle}
        </p>
      </div>

      <ChevronRight
        size={14}
        className="
          shrink-0
          text-slate-300
        "
      />
    </Link>
  );
}