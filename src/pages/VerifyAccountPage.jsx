import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MailCheck,
  RotateCcw,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function VerifyAccountPage() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const {
    verifyEmailOtp,
    resendEmailOtp,
  } = useAuth();

  const email =
    searchParams.get(
      "email"
    ) || "";

  const [
    digits,
    setDigits,
  ] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [
    verifying,
    setVerifying,
  ] = useState(
    false
  );

  const [
    resending,
    setResending,
  ] = useState(
    false
  );

  const [
    cooldown,
    setCooldown,
  ] = useState(
    60
  );

  const inputs =
    useRef([]);

  /*
   * ========================================
   * INVALID URL
   * ========================================
   */

  useEffect(() => {
    if (!email) {
      navigate(
        "/login",
        {
          replace:
            true,
        }
      );
    }
  }, [
    email,
    navigate,
  ]);

  /*
   * ========================================
   * TIMER
   * ========================================
   */

  useEffect(() => {
    if (
      cooldown <= 0
    ) {
      return undefined;
    }

    const timer =
      window.setInterval(
        () => {
          setCooldown(
            (
              previous
            ) =>
              Math.max(
                0,
                previous -
                  1
              )
          );
        },
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, [
    cooldown,
  ]);

  /*
   * ========================================
   * DIGIT
   * ========================================
   */

  const updateDigit =
    (
      index,
      value
    ) => {
      const clean =
        String(value)
          .replace(
            /\D/g,
            ""
          )
          .slice(-1);

      setDigits(
        (
          previous
        ) => {
          const next = [
            ...previous,
          ];

          next[index] =
            clean;

          return next;
        }
      );

      if (
        clean &&
        index < 5
      ) {
        inputs.current[
          index + 1
        ]?.focus();
      }
    };

  /*
   * ========================================
   * KEYBOARD
   * ========================================
   */

  const handleKeyDown =
    (
      index,
      event
    ) => {
      if (
        event.key ===
          "Backspace" &&
        !digits[
          index
        ] &&
        index > 0
      ) {
        inputs.current[
          index - 1
        ]?.focus();
      }

      if (
        event.key ===
          "ArrowLeft" &&
        index > 0
      ) {
        inputs.current[
          index - 1
        ]?.focus();
      }

      if (
        event.key ===
          "ArrowRight" &&
        index < 5
      ) {
        inputs.current[
          index + 1
        ]?.focus();
      }
    };

  /*
   * ========================================
   * PASTE
   * ========================================
   */

  const handlePaste =
    (
      event
    ) => {
      const code =
        event.clipboardData
          .getData(
            "text"
          )
          .replace(
            /\D/g,
            ""
          )
          .slice(
            0,
            6
          );

      if (
        code.length !==
        6
      ) {
        return;
      }

      event.preventDefault();

      setDigits(
        code.split("")
      );

      inputs.current[
        5
      ]?.focus();
    };

  /*
   * ========================================
   * VERIFY
   * ========================================
   */

  const verify =
    async () => {
      const token =
        digits.join("");

      if (
        token.length !==
        6
      ) {
        return;
      }

      setVerifying(
        true
      );

      try {
        await verifyEmailOtp(
          email,
          token
        );

        await Swal.fire({
          title:
            "Cuenta verificada",

          text:
            "Tu cuenta de Alekey está lista.",

          icon:
            "success",

          timer:
            1400,

          showConfirmButton:
            false,
        });

        navigate(
          "/",
          {
            replace:
              true,
          }
        );
      } catch (error) {
        console.error(
          error
        );

        setDigits([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        window.setTimeout(
          () =>
            inputs.current[
              0
            ]?.focus(),
          50
        );

        await Swal.fire({
          title:
            "Código incorrecto",

          text:
            error.message ||
            "El código no es válido o ya expiró.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });
      } finally {
        setVerifying(
          false
        );
      }
    };

  /*
   * ========================================
   * RESEND
   * ========================================
   */

  const resend =
    async () => {
      if (
        cooldown > 0 ||
        resending
      ) {
        return;
      }

      setResending(
        true
      );

      try {
        await resendEmailOtp(
          email
        );

        setCooldown(
          60
        );

        setDigits([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        await Swal.fire({
          title:
            "Código reenviado",

          text:
            "Enviamos otro código a tu correo.",

          icon:
            "success",

          timer:
            1200,

          showConfirmButton:
            false,
        });
      } catch (error) {
        await Swal.fire({
          title:
            "No se pudo reenviar",

          text:
            error.message ||
            "Inténtalo nuevamente.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });
      } finally {
        setResending(
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
      <div
        className="
          w-full
          max-w-md

          bg-white

          p-6
          sm:p-8

          rounded-[2.5rem]

          border
          border-slate-100

          shadow-[0_20px_60px_rgba(15,23,42,0.12)]

          text-center
        "
      >
        {/* =================================
            ICON
        ================================= */}

        <div
          className="
            w-16
            h-16

            mx-auto

            rounded-2xl

            bg-[#8ED4BE]/20
            text-[#58B99A]

            flex
            items-center
            justify-center
          "
        >
          <MailCheck
            size={27}
          />
        </div>

        {/* =================================
            TITLE
        ================================= */}

        <h1
          className="
            mt-5

            text-xl

            italic
            uppercase

            text-slate-900
          "
        >
          Verifica tu cuenta
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
            mt-2

            text-xs
            font-semibold

            text-slate-400
          "
        >
          Enviamos un código
          de 6 dígitos a
        </p>

        <p
          className="
            mt-1

            text-xs

            text-slate-700
          "
        >
          {maskEmail(
            email
          )}
        </p>

        <span
          className="
            inline-flex

            mt-4

            px-3
            py-2

            rounded-xl

            bg-slate-50

            text-[7px]

            uppercase
            tracking-widest

            text-slate-400
          "
        >
          Verificación por correo
        </span>

        {/* =================================
            OTP
        ================================= */}

        <div
          onPaste={
            handlePaste
          }
          className="
            grid
            grid-cols-6

            gap-2

            my-7
          "
        >
          {digits.map(
            (
              digit,
              index
            ) => (
              <input
                key={
                  index
                }
                ref={(
                  element
                ) => {
                  inputs.current[
                    index
                  ] =
                    element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={
                  digit
                }
                onChange={(
                  event
                ) =>
                  updateDigit(
                    index,
                    event
                      .target
                      .value
                  )
                }
                onKeyDown={(
                  event
                ) =>
                  handleKeyDown(
                    index,
                    event
                  )
                }
                className="
                  min-w-0

                  h-14

                  rounded-xl

                  border
                  border-slate-200

                  bg-slate-50

                  text-center

                  text-xl
                  font-black

                  text-slate-800

                  outline-none

                  transition-all

                  focus:border-[#8ED4BE]
                  focus:ring-4
                  focus:ring-[#8ED4BE]/10
                "
              />
            )
          )}
        </div>

        {/* =================================
            VERIFY
        ================================= */}

        <button
          type="button"
          disabled={
            digits.join("")
              .length !==
              6 ||
            verifying
          }
          onClick={
            verify
          }
          className="
            w-full

            min-h-14

            rounded-2xl

            bg-[#8ED4BE]
            text-slate-900

            text-[9px]

            uppercase
            tracking-widest

            shadow-lg

            transition-all

            hover:brightness-105

            disabled:opacity-30
            disabled:pointer-events-none
          "
        >
          {verifying
            ? "Verificando..."
            : "Verificar cuenta"}
        </button>

        {/* =================================
            RESEND
        ================================= */}

        <button
          type="button"
          disabled={
            cooldown > 0 ||
            resending
          }
          onClick={
            resend
          }
          className="
            mt-4

            inline-flex

            items-center
            justify-center

            gap-2

            text-[8px]

            uppercase
            tracking-wide

            text-slate-400

            disabled:opacity-50
          "
        >
          <RotateCcw
            size={14}
          />

          {resending
            ? "Reenviando..."
            : cooldown >
                0
              ? `Reenviar en ${cooldown}s`
              : "Reenviar código"}
        </button>

        {/* =================================
            BACK
        ================================= */}

        <div
          className="
            mt-5
            pt-5

            border-t
            border-slate-100
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
              text-[8px]

              uppercase
              tracking-wide

              text-slate-400

              hover:text-slate-700
            "
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </main>
  );
}

/*
 * ========================================
 * MASK EMAIL
 * ========================================
 */

function maskEmail(
  email = ""
) {
  const [
    name,
    domain,
  ] =
    String(
      email
    ).split("@");

  if (
    !name ||
    !domain
  ) {
    return email;
  }

  const visible =
    name.slice(
      0,
      Math.min(
        3,
        name.length
      )
    );

  return `${visible}${"*".repeat(
    Math.max(
      3,
      name.length -
        visible.length
    )
  )}@${domain}`;
}