import {
  CheckCircle2,
  Edit3,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  getRoleLabel,
} from "../constants/roles";

import {
  updateMyName,
} from "../services/usersService";

import ScrollToTop from "../components/common/ScrollToTop";

export default function UserPage() {
  const navigate =
    useNavigate();

  const {
    user,
    profile,
    role,
    logout,
    refreshProfile,
  } = useAuth();

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    nombre,
    setNombre,
  ] = useState(
    profile?.nombre ||
      ""
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  useEffect(() => {
    setNombre(
      profile?.nombre ||
        ""
    );
  }, [
    profile?.nombre,
  ]);

  const saveName =
    async () => {
      const clean =
        nombre.trim();

      if (
        clean.length <
        2
      ) {
        return;
      }

      setSaving(
        true
      );

      try {
        await updateMyName(
          clean
        );

        await refreshProfile();

        setEditing(
          false
        );

        await Swal.fire({
          title:
            "Nombre actualizado",

          icon:
            "success",

          timer:
            1000,

          showConfirmButton:
            false,
        });
      } catch (error) {
        await Swal.fire(
          "Error",
          error.message ||
            "No se pudo actualizar el nombre.",
          "error"
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  const handleLogout =
    async () => {
      const result =
        await Swal.fire({
          title:
            "¿Cerrar sesión?",

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
        });

      if (
        !result.isConfirmed
      ) {
        return;
      }

      await logout();

      navigate(
        "/login",
        {
          replace:
            true,
        }
      );
    };

  return (
    <div
      className="
        max-w-5xl
        mx-auto

        p-4
        lg:p-8

        pb-28

        font-black
      "
    >
      <ScrollToTop />

      <header
        className="
          mb-6
        "
      >
        <h1
          className="
            text-3xl
            lg:text-4xl

            italic
            uppercase

            tracking-tighter

            text-slate-900
          "
        >
          Mi cuenta
          <span className="text-[#8ED4BE]">
            .
          </span>
        </h1>
      </header>

      <section
        className="
          bg-white

          rounded-[2.5rem]

          border
          border-slate-100

          shadow-[0_16px_40px_rgba(15,23,42,0.08)]

          overflow-hidden
        "
      >
        <div
          className="
            bg-slate-900

            p-6
            lg:p-8

            flex
            items-center
            gap-4
          "
        >
          <div
            className="
              w-14
              h-14

              rounded-2xl

              bg-[#8ED4BE]

              flex
              items-center
              justify-center

              text-slate-900
            "
          >
            <UserRound
              size={24}
            />
          </div>

          <div>
            <h2
              className="
                text-xl
                italic
                uppercase

                text-white
              "
            >
              {profile?.nombre ||
                "Usuario"}
            </h2>

            <p
              className="
                mt-1

                text-[7px]
                uppercase
                tracking-widest

                text-[#8ED4BE]
              "
            >
              {getRoleLabel(
                role
              )}
            </p>
          </div>
        </div>

        <div
          className="
            p-5
            lg:p-8

            space-y-5
          "
        >
          <InfoRow
            icon={Mail}
            label="Correo"
            value={
              profile?.email ||
              user?.email ||
              "—"
            }
          />

          <InfoRow
            icon={
              ShieldCheck
            }
            label="Rol"
            value={
              getRoleLabel(
                role
              )
            }
          />

          <InfoRow
            icon={
              CheckCircle2
            }
            label="Cuenta"
            value={
              profile?.activo
                ? "Activa"
                : "Desactivada"
            }
          />

          <InfoRow
            icon={
              CheckCircle2
            }
            label="Correo verificado"
            value={
              profile?.verificado
                ? "Sí"
                : "No"
            }
          />

          <div
            className="
              pt-4

              border-t
              border-slate-100
            "
          >
            <div
              className="
                flex
                items-center
                justify-between

                mb-3
              "
            >
              <div>
                <p
                  className="
                    text-[8px]
                    uppercase
                    tracking-widest

                    text-slate-400
                  "
                >
                  Nombre
                </p>

                <p
                  className="
                    mt-1

                    text-xs
                    font-semibold

                    text-slate-300
                  "
                >
                  Único dato personal
                  editable.
                </p>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() =>
                    setEditing(
                      true
                    )
                  }
                  className="
                    w-10
                    h-10

                    rounded-xl

                    bg-slate-50
                    text-slate-400

                    flex
                    items-center
                    justify-center
                  "
                >
                  <Edit3
                    size={16}
                  />
                </button>
              )}
            </div>

            {editing ? (
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row

                  gap-3
                "
              >
                <input
                  value={
                    nombre
                  }
                  onChange={(
                    event
                  ) =>
                    setNombre(
                      event
                        .target
                        .value
                    )
                  }
                  maxLength={80}
                  className="
                    flex-1

                    h-14

                    px-4

                    rounded-2xl

                    bg-slate-50

                    border
                    border-slate-100

                    outline-none

                    text-sm
                    font-bold

                    focus:border-[#8ED4BE]
                  "
                />

                <button
                  type="button"
                  onClick={
                    saveName
                  }
                  disabled={
                    saving
                  }
                  className="
                    px-5

                    h-14

                    rounded-2xl

                    bg-[#8ED4BE]
                    text-slate-900

                    flex
                    items-center
                    justify-center
                    gap-2

                    text-[8px]
                    uppercase
                    tracking-widest
                  "
                >
                  <Save
                    size={16}
                  />

                  Guardar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNombre(
                      profile
                        ?.nombre ||
                        ""
                    );

                    setEditing(
                      false
                    );
                  }}
                  className="
                    w-14
                    h-14

                    rounded-2xl

                    bg-slate-100
                    text-slate-400

                    flex
                    items-center
                    justify-center
                  "
                >
                  <X
                    size={17}
                  />
                </button>
              </div>
            ) : (
              <div
                className="
                  min-h-14

                  px-4

                  rounded-2xl

                  bg-slate-50

                  border
                  border-slate-100

                  flex
                  items-center

                  text-sm
                  text-slate-700
                "
              >
                {profile?.nombre ||
                  "Usuario"}
              </div>
            )}
          </div>

          <div
            className="
              pt-5

              border-t
              border-slate-100
            "
          >
            <button
              type="button"
              onClick={
                handleLogout
              }
              className="
                px-6
                py-4

                rounded-2xl

                bg-red-50
                text-red-500

                flex
                items-center
                gap-2

                text-[8px]
                uppercase
                tracking-widest
              "
            >
              <LogOut
                size={16}
              />

              Cerrar sesión
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        p-4

        rounded-2xl

        bg-slate-50

        border
        border-slate-100

        flex
        items-center
        gap-4
      "
    >
      <div
        className="
          w-10
          h-10

          rounded-xl

          bg-white

          flex
          items-center
          justify-center

          text-[#58B99A]
        "
      >
        <Icon
          size={17}
        />
      </div>

      <div>
        <p
          className="
            text-[7px]
            uppercase
            tracking-widest

            text-slate-400
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1

            text-sm
            text-slate-700
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}