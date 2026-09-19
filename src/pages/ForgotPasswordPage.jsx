import {
  useState,
} from "react";

import {
  ArrowLeft,
  Mail,
  Send,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function ForgotPasswordPage() {
  const navigate =
    useNavigate();

  const {
    forgotPassword,
  } = useAuth();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    sending,
    setSending,
  ] = useState(false);

  const submit =
    async (event) => {
      event.preventDefault();

      if (!email.trim()) {
        return;
      }

      setSending(
        true
      );

      try {
        await forgotPassword(
          email
        );

        await Swal.fire({
          title:
            "Revisa tu correo",

          text:
            "Si existe una cuenta con ese correo, recibirás las instrucciones para cambiar la contraseña.",

          icon:
            "success",

          confirmButtonColor:
            "#8ED4BE",
        });

        navigate(
          "/login"
        );
      } catch (error) {
        console.error(
          error
        );

        await Swal.fire(
          "Error",
          "No se pudo procesar la solicitud.",
          "error"
        );
      } finally {
        setSending(
          false
        );
      }
    };

  return (
    <main
      className="
        min-h-screen

        bg-slate-50

        flex
        items-center
        justify-center

        p-4

        font-black
      "
    >
      <form
        onSubmit={
          submit
        }
        className="
          w-full
          max-w-md

          bg-white

          p-7

          rounded-[2.5rem]

          border
          border-slate-100

          shadow-xl
        "
      >
        <button
          type="button"
          onClick={() =>
            navigate(
              "/login"
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
          <ArrowLeft
            size={17}
          />
        </button>

        <h1
          className="
            mt-6

            text-2xl

            italic
            uppercase

            text-slate-900
          "
        >
          Recuperar contraseña
          <span className="text-[#8ED4BE]">
            .
          </span>
        </h1>

        <p
          className="
            mt-2

            text-xs
            font-semibold

            text-slate-400
          "
        >
          Escribe el correo asociado a tu cuenta.
        </p>

        <div
          className="
            relative

            mt-6
          "
        >
          <Mail
            size={17}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2

              text-slate-300
            "
          />

          <input
            type="email"
            value={
              email
            }
            onChange={(
              event
            ) =>
              setEmail(
                event.target
                  .value
              )
            }
            placeholder="correo@ejemplo.com"
            className="auth-input"
          />
        </div>

        <button
          type="submit"
          disabled={
            sending
          }
          className="
            mt-5

            w-full
            min-h-14

            rounded-2xl

            bg-[#8ED4BE]
            text-slate-900

            flex
            items-center
            justify-center
            gap-2

            text-[9px]
            uppercase

            disabled:opacity-40
          "
        >
          <Send
            size={16}
          />

          {sending
            ? "Enviando..."
            : "Enviar recuperación"}
        </button>
      </form>
    </main>
  );
}