import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  LoaderCircle,
} from "lucide-react";

import {
  useAuth,
} from "../../contexts/AuthContext";

export default function ProtectedRoute({
  children,
}) {
  const location =
    useLocation();

  const {
    user,
    profile,
    loading,
    isActive,
  } = useAuth();

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          bg-slate-50

          flex
          items-center
          justify-center
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-4
          "
        >
          <LoaderCircle
            size={30}
            className="
              animate-spin
              text-[#8ED4BE]
            "
          />

          <p
            className="
              text-[9px]
              uppercase
              tracking-widest
              font-black
              text-slate-400
            "
          >
            Cargando Alekey
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }

  /*
   * Usuario autenticado
   * pero sin perfil.
   */

  if (!profile) {
    return (
      <div
        className="
          min-h-screen
          bg-slate-50

          flex
          items-center
          justify-center

          p-5
        "
      >
        <div
          className="
            max-w-md
            w-full

            bg-white

            p-8

            rounded-[2rem]

            border
            border-slate-100

            shadow-xl

            text-center
          "
        >
          <h1
            className="
              text-xl
              italic
              uppercase
              font-black
              text-slate-900
            "
          >
            Perfil no disponible
          </h1>

          <p
            className="
              mt-3

              text-sm
              font-semibold
              text-slate-400
            "
          >
            La cuenta existe, pero no se encontró su perfil en Alekey.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Usuario desactivado
   */

  if (!isActive) {
    return (
      <Navigate
        to="/cuenta-desactivada"
        replace
      />
    );
  }

  return children;
}