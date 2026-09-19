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
    isVerified,
  } = useAuth();

  /*
   * ========================================
   * LOADING
   * ========================================
   */

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

  /*
   * ========================================
   * NO SESSION
   * ========================================
   */

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
   * ========================================
   * NO PROFILE
   * ========================================
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
            No se encontró el perfil de esta cuenta.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ========================================
   * NOT VERIFIED
   * ========================================
   */

  if (
    !isVerified &&
    user?.email
  ) {
    return (
      <Navigate
        to={`/verificar?email=${encodeURIComponent(
          user.email
        )}`}
        replace
      />
    );
  }

  /*
   * ========================================
   * ADMIN DISABLED ACCOUNT
   * ========================================
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