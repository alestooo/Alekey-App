import {
  ArrowLeft,
  KeyRound,
  Mail,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import Swal from "sweetalert2";

import logoAlekey from "../assets/images/alekey-logo.jpeg";

import {
  supabase,
} from "../lib/supabase";

import {
  emailIsRegistered,
  normalizeAuthEmail,
} from "../services/authLookupService";

/* =========================================================
   FORGOT PASSWORD
========================================================= */

export default function ForgotPasswordPage() {
  const [
    searchParams,
  ] = useSearchParams();

  const initialEmail =
    useMemo(
      () =>
        normalizeAuthEmail(
          searchParams.get(
            "email"
          ) || ""
        ),
      [
        searchParams,
      ]
    );

  const [
    email,
    setEmail,
  ] = useState(
    initialEmail
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    sent,
    setSent,
  ] = useState(false);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      if (loading) {
        return;
      }

      const cleanEmail =
        normalizeAuthEmail(
          email
        );

      if (
        !cleanEmail ||
        !cleanEmail.includes(
          "@"
        )
      ) {
        await Swal.fire({
          title:
            "Correo inválido",

          text:
            "Ingresa un correo electrónico válido.",

          icon:
            "warning",

          confirmButtonColor:
            "#8ED4BE",
        });

        return;
      }

      setLoading(true);

      try {
        /* ===============================================
           VERIFY EMAIL EXISTS
        =============================================== */

        const exists =
          await emailIsRegistered(
            cleanEmail
          );

        if (!exists) {
          await Swal.fire({
            title:
              "Correo no registrado",

            text:
              "Ese correo no se encuentra registrado en Alekey.",

            icon:
              "info",

            confirmButtonColor:
              "#8ED4BE",
          });

          return;
        }

        /* ===============================================
           SEND RESET
        =============================================== */

        const {
          error,
        } =
          await supabase.auth.resetPasswordForEmail(
            cleanEmail,
            {
              redirectTo:
                `${window.location.origin}/nueva-contrasena`,
            }
          );

        if (error) {
          throw error;
        }

        setEmail(
          cleanEmail
        );

        setSent(true);

        await Swal.fire({
          title:
            "Correo enviado",

          text:
            "Revisa tu correo para cambiar la contraseña.",

          icon:
            "success",

          confirmButtonColor:
            "#8ED4BE",
        });
      } catch (
        error
      ) {
        console.error(
          "Password recovery:",
          error
        );

        const message =
          String(
            error?.message ||
              ""
          ).toLowerCase();

        if (
          error?.status ===
            429 ||
          message.includes(
            "rate limit"
          ) ||
          message.includes(
            "too many requests"
          )
        ) {
          await Swal.fire({
            title:
              "Espera un momento",

            text:
              "Ya se solicitó un correo recientemente. Espera un poco antes de pedir otro.",

            icon:
              "info",

            confirmButtonColor:
              "#8ED4BE",
          });

          return;
        }

        await Swal.fire({
          title:
            "No se pudo enviar el correo",

          text:
            error?.message ||
            "Inténtalo nuevamente.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      className="
        min-h-screen

        bg-[#070d1a]

        flex
        items-center
        justify-center

        px-4
        py-10
      "
    >
      <section
        className="
          w-full
          max-w-[440px]

          p-7
          sm:p-8

          rounded-[2.5rem]

          bg-[#0b1324]

          border
          border-slate-800

          shadow-2xl
        "
      >
        {/* LOGO */}

        <div
          className="
            text-center
          "
        >
          <img
            src={
              logoAlekey
            }
            alt="Alekey"
            className="
              w-16
              h-16

              mx-auto

              rounded-2xl

              object-cover

              border-4
              border-slate-700
            "
          />

          <h1
            className="
              mt-5

              text-2xl

              italic
              font-black

              text-white
            "
          >
            Recuperar contraseña
            <span
              className="
                text-[#8ED4BE]
              "
            >
              .
            </span>
          </h1>

          <p
            className="
              mt-3

              max-w-[330px]

              mx-auto

              text-xs
              leading-relaxed

              text-slate-500
            "
          >
            Ingresa el correo asociado a tu cuenta de Alekey.
          </p>
        </div>

        {/* SENT */}

        {sent ? (
          <div
            className="
              mt-8

              text-center
            "
          >
            <div
              className="
                w-16
                h-16

                mx-auto

                rounded-2xl

                bg-[#8ED4BE]/10

                text-[#8ED4BE]

                flex
                items-center
                justify-center
              "
            >
              <Mail
                size={27}
              />
            </div>

            <h2
              className="
                mt-5

                text-lg

                font-black

                text-white
              "
            >
              Revisa tu correo
            </h2>

            <p
              className="
                mt-2

                text-xs
                leading-relaxed

                text-slate-500
              "
            >
              Enviamos un enlace de recuperación a
              {" "}
              <span
                className="
                  text-slate-300
                  font-bold
                "
              >
                {email}
              </span>
              .
            </p>

            <button
              type="button"
              onClick={() =>
                setSent(
                  false
                )
              }
              className="
                mt-6

                text-[8px]

                font-black

                uppercase
                tracking-widest

                text-[#8ED4BE]
              "
            >
              Enviar nuevamente
            </button>
          </div>
        ) : (
          <form
            onSubmit={
              handleSubmit
            }
            className="
              mt-8
            "
          >
            <label
              className="
                block
              "
            >
              <span
                className="
                  block

                  mb-2

                  text-[7px]

                  font-black

                  uppercase
                  tracking-[0.16em]

                  text-slate-500
                "
              >
                Correo electrónico
              </span>

              <div
                className="
                  relative
                "
              >
                <Mail
                  size={16}
                  className="
                    absolute

                    left-4
                    top-1/2

                    -translate-y-1/2

                    text-slate-600

                    pointer-events-none
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
                      event.target.value
                    )
                  }
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  className="
                    w-full
                    h-13

                    pl-11
                    pr-4

                    rounded-2xl

                    bg-[#080f1e]

                    border
                    border-slate-800

                    outline-none

                    text-sm
                    font-semibold

                    text-slate-200

                    placeholder:text-slate-700

                    focus:border-[#8ED4BE]/70

                    transition-all
                  "
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={
                loading
              }
              className="
                w-full
                min-h-13

                mt-5

                rounded-2xl

                bg-[#8ED4BE]

                text-[#07130f]

                flex
                items-center
                justify-center
                gap-2

                text-[9px]

                font-black

                uppercase
                tracking-wider

                transition-all

                hover:brightness-105

                disabled:opacity-40
              "
            >
              <KeyRound
                size={16}
              />

              {loading
                ? "Verificando..."
                : "Cambiar contraseña"}
            </button>
          </form>
        )}

        {/* BACK */}

        <div
          className="
            mt-7

            pt-6

            border-t
            border-slate-800
          "
        >
          <Link
            to="/login"
            className="
              flex
              items-center
              justify-center
              gap-2

              text-[8px]

              font-black

              uppercase
              tracking-widest

              text-slate-500

              hover:text-[#8ED4BE]

              transition-colors
            "
          >
            <ArrowLeft
              size={14}
            />

            Volver a iniciar sesión
          </Link>
        </div>
      </section>
    </main>
  );
}