import {
  LogOut,
  ShieldX,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function InactiveAccountPage() {
  const navigate =
    useNavigate();

  const {
    logout,
  } = useAuth();

  const handleLogout =
    async () => {
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
    <main
      className="
        min-h-screen

        bg-slate-50

        p-5

        flex
        items-center
        justify-center

        font-black
      "
    >
      <div
        className="
          max-w-md
          w-full

          bg-white

          p-8

          rounded-[2.5rem]

          border
          border-slate-100

          shadow-xl

          text-center
        "
      >
        <div
          className="
            w-16
            h-16

            mx-auto

            rounded-2xl

            bg-red-50
            text-red-500

            flex
            items-center
            justify-center
          "
        >
          <ShieldX
            size={28}
          />
        </div>

        <h1
          className="
            mt-5

            text-xl

            italic
            uppercase

            text-slate-900
          "
        >
          Cuenta desactivada
        </h1>

        <p
          className="
            mt-3

            text-sm
            font-semibold

            text-slate-400
          "
        >
          Tu cuenta no tiene acceso actualmente a Alekey.
        </p>

        <button
          type="button"
          onClick={
            handleLogout
          }
          className="
            mt-6

            w-full

            py-4

            rounded-2xl

            bg-slate-900
            text-white

            flex
            items-center
            justify-center
            gap-2

            text-[9px]
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
    </main>
  );
}