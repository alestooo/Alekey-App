import {
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
  UserRound,
} from "lucide-react";

import {
  Navigate,
  useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  useAuth,
} from "../contexts/AuthContext";

import logoAlekey from "../assets/images/alekey-logo.jpeg";

export default function LoginPage() {
  const navigate =
    useNavigate();

  const {
    user,
    profile,

    loading,
    isActive,
    isVerified,

    login,
    register,

    loginWithGoogle,
  } = useAuth();

  const [
    mode,
    setMode,
  ] = useState(
    "login"
  );

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(
    false
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(
    false
  );

  /*
   * ========================================
   * VALIDATION
   * ========================================
   */

  const emailValid =
    /\S+@\S+\.\S+/.test(
      email.trim()
    );

  const registerValid =
    Boolean(
      nombre.trim() &&
        emailValid &&
        password.length >=
          8 &&
        password ===
          confirmPassword
    );

  /*
   * ========================================
   * ALREADY LOGGED
   * ========================================
   */

  if (
    !loading &&
    user &&
    profile &&
    isActive &&
    isVerified
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /*
   * ========================================
   * LOGIN
   * ========================================
   */

  const handleLogin =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !email.trim() ||
        !password
      ) {
        return;
      }

      setSubmitting(
        true
      );

      try {
        await login(
          email,
          password
        );

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

        const message =
          String(
            error?.message ||
              ""
          ).toLowerCase();

        const code =
          String(
            error?.code ||
              ""
          ).toLowerCase();

        /*
         * La cuenta existe pero todavía
         * no confirmó el OTP.
         */

        if (
          message.includes(
            "email not confirmed"
          ) ||
          code.includes(
            "email_not_confirmed"
          )
        ) {
          await Swal.fire({
            title:
              "Falta verificar tu correo",

            text:
              "Tu cuenta todavía está pendiente de verificación. Ingresa el código enviado a tu correo.",

            icon:
              "info",

            confirmButtonText:
              "Verificar",

            confirmButtonColor:
              "#8ED4BE",
          });

          navigate(
            `/verificar?email=${encodeURIComponent(
              email
                .trim()
                .toLowerCase()
            )}`
          );

          return;
        }

        await Swal.fire({
          title:
            "No se pudo ingresar",

          text:
            "Correo o contraseña incorrectos.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });
      } finally {
        setSubmitting(
          false
        );
      }
    };

  /*
   * ========================================
   * REGISTER
   * ========================================
   */

  const handleRegister =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !nombre.trim()
      ) {
        return;
      }

      if (
        !emailValid
      ) {
        await Swal.fire({
          title:
            "Correo inválido",

          text:
            "Escribe un correo electrónico válido.",

          icon:
            "info",

          confirmButtonColor:
            "#8ED4BE",
        });

        return;
      }

      if (
        password.length <
        8
      ) {
        await Swal.fire({
          title:
            "Contraseña muy corta",

          text:
            "Utiliza al menos 8 caracteres.",

          icon:
            "info",

          confirmButtonColor:
            "#8ED4BE",
        });

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        await Swal.fire({
          title:
            "Las contraseñas no coinciden",

          icon:
            "info",

          confirmButtonColor:
            "#8ED4BE",
        });

        return;
      }

      setSubmitting(
        true
      );

      try {
        const result =
          await register({
            nombre,
            email,
            password,
          });

        /*
         * ==================================
         * CUENTA YA CONFIRMADA
         * ==================================
         */

        if (
          result.status ===
          "already_registered"
        ) {
          await Swal.fire({
            title:
              "Correo en uso",

            html: `
              <p style="
                color:#64748b;
                font-size:13px;
                line-height:1.6;
              ">
                Este correo ya está asociado a una cuenta de Alekey.
                Puedes iniciar sesión, recuperar tu contraseña
                o continuar con Google si utilizaste Google anteriormente.
              </p>
            `,

            icon:
              "info",

            confirmButtonText:
              "Ir a iniciar sesión",

            confirmButtonColor:
              "#8ED4BE",
          });

          setMode(
            "login"
          );

          setPassword(
            ""
          );

          setConfirmPassword(
            ""
          );

          return;
        }

        /*
         * ==================================
         * NUEVA O PENDIENTE
         * ==================================
         *
         * Si nunca confirmó el OTP,
         * permitimos volver a llegar
         * a /verificar.
         */

        navigate(
          `/verificar?email=${encodeURIComponent(
            email
              .trim()
              .toLowerCase()
          )}`
        );
      } catch (error) {
        console.error(
          error
        );

        const message =
          String(
            error?.message ||
              ""
          );

        await Swal.fire({
          title:
            "No se pudo crear la cuenta",

          text:
            message ||
            "Inténtalo nuevamente.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });
      } finally {
        setSubmitting(
          false
        );
      }
    };

  /*
   * ========================================
   * GOOGLE
   * ========================================
   */

  const handleGoogle =
    async () => {
      try {
        await loginWithGoogle();
      } catch (error) {
        console.error(
          error
        );

        await Swal.fire({
          title:
            "No se pudo continuar con Google",

          text:
            error.message ||
            "Inténtalo nuevamente.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });
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
        sm:p-6

        font-black
      "
    >
      <div
        className="
          w-full
          max-w-[460px]

          bg-white

          rounded-[2.3rem]
          sm:rounded-[3rem]

          overflow-hidden

          border
          border-slate-100

          shadow-[0_24px_70px_rgba(15,23,42,0.13)]
        "
      >
        {/* HEADER */}

        <div
          className="
            bg-slate-900

            px-6
            py-8

            text-center
          "
        >
          <div
            className="
              w-20
              h-20

              mx-auto

              rounded-[1.7rem]

              bg-white

              p-2

              shadow-lg
            "
          >
            <img
              src={
                logoAlekey
              }
              alt="Alekey"
              className="
                w-full
                h-full

                object-cover

                rounded-[1.25rem]
              "
            />
          </div>

          <h1
            className="
              mt-5

              text-3xl

              italic
              uppercase

              text-white
            "
          >
            Alekey
            <span className="text-[#8ED4BE]">
              .
            </span>
          </h1>

          <p
            className="
              mt-1

              text-[7px]

              uppercase
              tracking-[0.25em]

              text-slate-400
            "
          >
            Gestión Administrativa
          </p>
        </div>

        {/* CONTENT */}

        <div
          className="
            p-5
            sm:p-8
          "
        >
          {/* TABS */}

          <div
            className="
              grid
              grid-cols-2

              gap-2

              p-1.5

              rounded-2xl

              bg-slate-50

              mb-6
            "
          >
            <button
              type="button"
              onClick={() => {
                setMode(
                  "login"
                );

                setPassword(
                  ""
                );

                setConfirmPassword(
                  ""
                );
              }}
              className={`
                h-11

                rounded-xl

                text-[8px]
                uppercase
                tracking-widest

                transition-all

                ${
                  mode ===
                  "login"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-400"
                }
              `}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(
                  "register"
                );

                setPassword(
                  ""
                );

                setConfirmPassword(
                  ""
                );
              }}
              className={`
                h-11

                rounded-xl

                text-[8px]
                uppercase
                tracking-widest

                transition-all

                ${
                  mode ===
                  "register"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-400"
                }
              `}
            >
              Crear cuenta
            </button>
          </div>

          {/* FORM */}

          <form
            onSubmit={
              mode ===
              "login"
                ? handleLogin
                : handleRegister
            }
            className="
              space-y-4
            "
          >
            {mode ===
              "register" && (
              <AuthField
                label="Nombre"
                icon={
                  UserRound
                }
              >
                <input
                  type="text"
                  autoComplete="name"
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
                  placeholder="Nombre completo"
                  className="auth-input"
                />
              </AuthField>
            )}

            <AuthField
              label="Correo"
              icon={Mail}
            >
              <input
                type="email"
                autoComplete="email"
                value={
                  email
                }
                onChange={(
                  event
                ) =>
                  setEmail(
                    event
                      .target
                      .value
                  )
                }
                placeholder="correo@ejemplo.com"
                className="auth-input"
              />
            </AuthField>

            <PasswordField
              value={
                password
              }
              setValue={
                setPassword
              }
              showPassword={
                showPassword
              }
              setShowPassword={
                setShowPassword
              }
              autoComplete={
                mode ===
                "register"
                  ? "new-password"
                  : "current-password"
              }
            />

            {mode ===
              "register" && (
              <AuthField
                label="Confirmar contraseña"
                icon={
                  LockKeyhole
                }
              >
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  value={
                    confirmPassword
                  }
                  onChange={(
                    event
                  ) =>
                    setConfirmPassword(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Repite la contraseña"
                  className="auth-input"
                />
              </AuthField>
            )}

            {mode ===
              "register" && (
              <div
                className="
                  px-4
                  py-3

                  rounded-2xl

                  bg-[#8ED4BE]/10

                  flex
                  items-start
                  gap-3
                "
              >
                <Mail
                  size={16}
                  className="
                    mt-0.5
                    shrink-0

                    text-[#58B99A]
                  "
                />

                <p
                  className="
                    text-[8px]
                    leading-relaxed

                    font-semibold

                    text-slate-500
                  "
                >
                  La cuenta no quedará verificada hasta ingresar el código de 6 dígitos enviado al correo.
                </p>
              </div>
            )}

            {mode ===
              "login" && (
              <div
                className="
                  text-right
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/recuperar-contrasena"
                    )
                  }
                  className="
                    text-[8px]

                    uppercase
                    tracking-wide

                    text-[#58B99A]

                    hover:underline
                  "
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={
                submitting ||
                (
                  mode ===
                    "login" &&
                  (
                    !email.trim() ||
                    !password
                  )
                ) ||
                (
                  mode ===
                    "register" &&
                  !registerValid
                )
              }
              className="
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
                tracking-widest

                shadow-lg

                transition-all

                hover:brightness-105

                disabled:opacity-40
                disabled:pointer-events-none
              "
            >
              {mode ===
              "login" ? (
                <LogIn
                  size={17}
                />
              ) : (
                <Mail
                  size={17}
                />
              )}

              {submitting
                ? "Procesando..."
                : mode ===
                    "login"
                  ? "Ingresar"
                  : "Crear cuenta"}
            </button>
          </form>

          {/* DIVIDER */}

          <div
            className="
              flex
              items-center
              gap-3

              my-6
            "
          >
            <div
              className="
                h-px
                flex-1
                bg-slate-100
              "
            />

            <span
              className="
                text-[7px]

                uppercase
                tracking-widest

                text-slate-300
              "
            >
              O continuar con
            </span>

            <div
              className="
                h-px
                flex-1
                bg-slate-100
              "
            />
          </div>

          {/* GOOGLE */}

          <button
            type="button"
            onClick={
              handleGoogle
            }
            className="
              w-full

              min-h-14

              rounded-2xl

              border
              border-slate-200

              bg-white

              flex
              items-center
              justify-center
              gap-3

              text-[9px]
              uppercase
              tracking-wide

              text-slate-600

              shadow-sm

              transition-all

              hover:bg-slate-50
            "
          >
            <GoogleIcon />

            Continuar con Google
          </button>
        </div>
      </div>
    </main>
  );
}

function AuthField({
  label,
  icon: Icon,
  children,
}) {
  return (
    <div>
      <label
        className="
          ml-2

          text-[7px]

          uppercase
          tracking-widest

          text-slate-400
        "
      >
        {label}
      </label>

      <div
        className="
          relative
          mt-2
        "
      >
        <Icon
          size={17}
          className="
            absolute

            left-4
            top-1/2

            -translate-y-1/2

            text-slate-300
          "
        />

        {children}
      </div>
    </div>
  );
}

function PasswordField({
  value,
  setValue,
  showPassword,
  setShowPassword,
  autoComplete,
}) {
  return (
    <AuthField
      label="Contraseña"
      icon={
        LockKeyhole
      }
    >
      <input
        type={
          showPassword
            ? "text"
            : "password"
        }
        autoComplete={
          autoComplete
        }
        value={
          value
        }
        onChange={(
          event
        ) =>
          setValue(
            event.target
              .value
          )
        }
        placeholder="Contraseña"
        className="
          auth-input
          pr-12
        "
      />

      <button
        type="button"
        onClick={() =>
          setShowPassword(
            (
              previous
            ) =>
              !previous
          )
        }
        className="
          absolute

          right-4
          top-1/2

          -translate-y-1/2

          text-slate-400
        "
      >
        {showPassword ? (
          <EyeOff
            size={17}
          />
        ) : (
          <Eye
            size={17}
          />
        )}
      </button>
    </AuthField>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.2-.9 2.2-1.9 2.9v2.4h3.1c1.8-1.7 3-4.1 3-7.1Z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.1-2.4c-.9.6-2 .9-3.5.9-2.6 0-4.8-1.7-5.6-4.1H3.2v2.5C4.9 19.8 8.2 22 12 22Z"
      />

      <path
        fill="#FBBC05"
        d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.5H3.2C2.4 8.8 2 10.4 2 12s.4 3.2 1.2 4.5L6.4 14Z"
      />

      <path
        fill="#EA4335"
        d="M12 5.9c1.6 0 3 .5 4.1 1.6l3-3C17.3 2.8 14.9 2 12 2 8.2 2 4.9 4.2 3.2 7.5L6.4 10C7.2 7.6 9.4 5.9 12 5.9Z"
      />
    </svg>
  );
}