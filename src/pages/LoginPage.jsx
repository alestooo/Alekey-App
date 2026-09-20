import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useNavigate,
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
   CONFIG
========================================================= */

const FAILED_LOGIN_THRESHOLD =
  3;

/* =========================================================
   LOGIN PAGE
========================================================= */

export default function LoginPage() {
  const navigate =
    useNavigate();

  const [
    mode,
    setMode,
  ] = useState(
    "login"
  );

  const [
    loading,
    setLoading,
  ] = useState(
    false
  );

  /* =======================================================
     LOGIN
  ======================================================= */

  const [
    loginEmail,
    setLoginEmail,
  ] = useState("");

  const [
    loginPassword,
    setLoginPassword,
  ] = useState("");

  const [
    showLoginPassword,
    setShowLoginPassword,
  ] = useState(false);

  /* =======================================================
     REGISTER
  ======================================================= */

  const [
    registerName,
    setRegisterName,
  ] = useState("");

  const [
    registerEmail,
    setRegisterEmail,
  ] = useState("");

  const [
    registerPassword,
    setRegisterPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showRegisterPassword,
    setShowRegisterPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  /* =======================================================
     CHANGE MODE
  ======================================================= */

  const changeMode = (
    nextMode
  ) => {
    if (
      loading ||
      nextMode === mode
    ) {
      return;
    }

    setMode(
      nextMode
    );
  };

  /* =======================================================
     FAILED ATTEMPTS
  ======================================================= */

  const getFailureKey = (
    email
  ) => {
    return `alekey-login-failures:${normalizeAuthEmail(
      email
    )}`;
  };

  const getFailedAttempts = (
    email
  ) => {
    try {
      return Number(
        sessionStorage.getItem(
          getFailureKey(
            email
          )
        ) || 0
      );
    } catch {
      return 0;
    }
  };

  const increaseFailedAttempts = (
    email
  ) => {
    const current =
      getFailedAttempts(
        email
      );

    const next =
      current + 1;

    try {
      sessionStorage.setItem(
        getFailureKey(
          email
        ),
        String(
          next
        )
      );
    } catch {
      // No hacemos nada.
    }

    return next;
  };

  const clearFailedAttempts = (
    email
  ) => {
    try {
      sessionStorage.removeItem(
        getFailureKey(
          email
        )
      );
    } catch {
      // No hacemos nada.
    }
  };

  /* =======================================================
     LOGIN
  ======================================================= */

  const handleLogin =
    async (
      event
    ) => {
      event.preventDefault();

      if (loading) {
        return;
      }

      const email =
        normalizeAuthEmail(
          loginEmail
        );

      const password =
        loginPassword;

      if (
        !email ||
        !email.includes("@")
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

      if (!password) {
        await Swal.fire({
          title:
            "Contraseña requerida",

          text:
            "Ingresa tu contraseña.",

          icon:
            "warning",

          confirmButtonColor:
            "#8ED4BE",
        });

        return;
      }

      setLoading(true);

      try {
        const {
          error,
        } =
          await supabase.auth.signInWithPassword(
            {
              email,
              password,
            }
          );

        /* ===============================================
           SUCCESS
        =============================================== */

        if (!error) {
          clearFailedAttempts(
            email
          );

          navigate(
            "/",
            {
              replace:
                true,
            }
          );

          return;
        }

        const errorMessage =
          String(
            error.message ||
              ""
          ).toLowerCase();

        /* ===============================================
           EMAIL NOT CONFIRMED
        =============================================== */

        if (
          errorMessage.includes(
            "email not confirmed"
          )
        ) {
          const result =
            await Swal.fire({
              title:
                "Correo pendiente de verificación",

              text:
                "Esta cuenta ya existe, pero todavía debes verificar el código enviado a tu correo.",

              icon:
                "info",

              showCancelButton:
                true,

              confirmButtonText:
                "Verificar ahora",

              cancelButtonText:
                "Cancelar",

              confirmButtonColor:
                "#8ED4BE",

              cancelButtonColor:
                "#64748b",
            });

          if (
            result.isConfirmed
          ) {
            navigate(
              `/verificar?email=${encodeURIComponent(
                email
              )}`
            );
          }

          return;
        }

        /* ===============================================
           RATE LIMIT
        =============================================== */

        if (
          error.status ===
            429 ||
          errorMessage.includes(
            "rate limit"
          ) ||
          errorMessage.includes(
            "too many requests"
          )
        ) {
          await Swal.fire({
            title:
              "Demasiados intentos",

            text:
              "Espera unos minutos antes de intentarlo nuevamente.",

            icon:
              "info",

            confirmButtonColor:
              "#8ED4BE",
          });

          return;
        }

        /* ===============================================
           INVALID LOGIN
        =============================================== */

        const attempts =
          increaseFailedAttempts(
            email
          );

        /*
         * Intentos 1 y 2:
         * mensaje normal.
         */

        if (
          attempts <
          FAILED_LOGIN_THRESHOLD
        ) {
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

          return;
        }

        /*
         * Tercer intento:
         * ofrecer recuperación.
         */

        if (
          attempts ===
          FAILED_LOGIN_THRESHOLD
        ) {
          const result =
            await Swal.fire({
              title:
                "Parece que tienes problemas",

              text:
                "Has intentado iniciar sesión varias veces. Si no recuerdas tu contraseña, puedes cambiarla.",

              icon:
                "question",

              showCancelButton:
                true,

              confirmButtonText:
                "Cambiar contraseña",

              cancelButtonText:
                "Seguir intentando",

              confirmButtonColor:
                "#8ED4BE",

              cancelButtonColor:
                "#64748b",
            });

          if (
            result.isConfirmed
          ) {
            navigate(
              `/recuperar-contrasena?email=${encodeURIComponent(
                email
              )}`
            );
          }

          return;
        }

        /*
         * A partir del cuarto:
         * mantener el mensaje normal.
         */

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
      } catch (
        error
      ) {
        console.error(
          "Error login:",
          error
        );

        await Swal.fire({
          title:
            "No se pudo ingresar",

          text:
            "Ocurrió un problema al intentar iniciar sesión.",

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
     REGISTER
  ======================================================= */

  const handleRegister =
    async (
      event
    ) => {
      event.preventDefault();

      if (loading) {
        return;
      }

      const nombre =
        registerName.trim();

      const email =
        normalizeAuthEmail(
          registerEmail
        );

      const password =
        registerPassword;

      const confirmation =
        confirmPassword;

      /* ===============================================
         VALIDATIONS
      =============================================== */

      if (
        nombre.length < 2
      ) {
        await Swal.fire({
          title:
            "Nombre requerido",

          text:
            "Ingresa tu nombre.",

          icon:
            "warning",

          confirmButtonColor:
            "#8ED4BE",
        });

        return;
      }

      if (
        !email ||
        !email.includes("@")
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

      if (
        password.length < 8
      ) {
        await Swal.fire({
          title:
            "Contraseña demasiado corta",

          text:
            "La contraseña debe tener al menos 8 caracteres.",

          icon:
            "warning",

          confirmButtonColor:
            "#8ED4BE",
        });

        return;
      }

      if (
        password !==
        confirmation
      ) {
        await Swal.fire({
          title:
            "Las contraseñas no coinciden",

          text:
            "Verifica ambas contraseñas e inténtalo nuevamente.",

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
           CHECK EXISTING EMAIL FIRST
        =============================================== */

        const exists =
          await emailIsRegistered(
            email
          );

        if (exists) {
          await Swal.fire({
            title:
              "Correo ya registrado",

            text:
              "Este correo ya está en uso. Inicia sesión o recupera tu contraseña.",

            icon:
              "info",

            confirmButtonText:
              "Entendido",

            confirmButtonColor:
              "#8ED4BE",
          });

          return;
        }

        /* ===============================================
           CREATE ACCOUNT
        =============================================== */

        const {
          data,
          error,
        } =
          await supabase.auth.signUp(
            {
              email,
              password,

              options: {
                data: {
                  nombre,
                },
              },
            }
          );

        if (error) {
          throw error;
        }

        /* ===============================================
           EXTRA DUPLICATE PROTECTION
        =============================================== */

        if (
          data?.user &&
          Array.isArray(
            data.user
              .identities
          ) &&
          data.user
            .identities
            .length === 0
        ) {
          await Swal.fire({
            title:
              "Correo ya registrado",

            text:
              "Este correo ya está en uso.",

            icon:
              "info",

            confirmButtonColor:
              "#8ED4BE",
          });

          return;
        }

        /* ===============================================
           EMAIL CONFIRMATION
        =============================================== */

        if (
          !data?.session
        ) {
          await Swal.fire({
            title:
              "Código enviado",

            text:
              "Te enviamos un código de 6 dígitos para verificar tu cuenta.",

            icon:
              "success",

            timer:
              1300,

            showConfirmButton:
              false,
          });

          navigate(
            `/verificar?email=${encodeURIComponent(
              email
            )}`
          );

          return;
        }

        /*
         * Por seguridad, si algún día desactivaras
         * confirmación de email.
         */

        navigate(
          "/",
          {
            replace:
              true,
          }
        );
      } catch (
        error
      ) {
        console.error(
          "Error register:",
          error
        );

        const message =
          String(
            error?.message ||
              ""
          ).toLowerCase();

        /* ===============================================
           DUPLICATE
        =============================================== */

        if (
          message.includes(
            "already registered"
          ) ||
          message.includes(
            "already exists"
          ) ||
          message.includes(
            "user already"
          )
        ) {
          await Swal.fire({
            title:
              "Correo ya registrado",

            text:
              "Este correo ya está en uso.",

            icon:
              "info",

            confirmButtonColor:
              "#8ED4BE",
          });

          return;
        }

        /* ===============================================
           RATE LIMIT
        =============================================== */

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
              "Límite temporal de correos",

            text:
              "No pudimos enviar el código en este momento. Espera un poco e inténtalo nuevamente.",

            icon:
              "info",

            confirmButtonColor:
              "#8ED4BE",
          });

          return;
        }

        await Swal.fire({
          title:
            "No se pudo crear la cuenta",

          text:
            error?.message ||
            "Ocurrió un problema al crear la cuenta.",

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
     GOOGLE
  ======================================================= */

  const handleGoogle =
    async () => {
      if (loading) {
        return;
      }

      setLoading(true);

      try {
        const {
          error,
        } =
          await supabase.auth.signInWithOAuth(
            {
              provider:
                "google",

              options: {
                redirectTo:
                  `${window.location.origin}/`,
              },
            }
          );

        if (error) {
          throw error;
        }
      } catch (
        error
      ) {
        console.error(
          "Google Auth:",
          error
        );

        setLoading(false);

        await Swal.fire({
          title:
            "No se pudo ingresar con Google",

          text:
            error?.message ||
            "Inténtalo nuevamente.",

          icon:
            "error",

          confirmButtonColor:
            "#8ED4BE",
        });
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
          max-w-[470px]

          overflow-hidden

          rounded-[2.6rem]

          border
          border-slate-800

          bg-[#0b1324]

          shadow-2xl
        "
      >
        {/* =================================================
            LOGO
        ================================================= */}

        <div
          className="
            px-7
            pt-8
            pb-7

            text-center

            bg-[#070d1a]
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

              text-3xl

              italic
              font-black

              tracking-tight

              text-white
            "
          >
            ALEKEY
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
              mt-1

              text-[7px]

              font-black

              tracking-[0.3em]

              text-slate-500
            "
          >
            GESTIÓN ADMINISTRATIVA
          </p>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            px-7
            py-7

            sm:px-8
          "
        >
          {/* ===============================================
              TABS
          =============================================== */}

          <div
            className="
              grid
              grid-cols-2

              p-1

              rounded-2xl

              bg-[#070d1a]

              border
              border-slate-800

              mb-7
            "
          >
            <button
              type="button"
              onClick={() =>
                changeMode(
                  "login"
                )
              }
              className={`
                h-11

                rounded-xl

                text-[9px]

                font-black

                uppercase
                tracking-wider

                transition-all
                duration-200

                ${
                  mode ===
                  "login"
                    ? `
                      bg-[#172238]
                      text-white
                      shadow-lg
                    `
                    : `
                      text-slate-500
                      hover:text-slate-300
                    `
                }
              `}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() =>
                changeMode(
                  "register"
                )
              }
              className={`
                h-11

                rounded-xl

                text-[9px]

                font-black

                uppercase
                tracking-wider

                transition-all
                duration-200

                ${
                  mode ===
                  "register"
                    ? `
                      bg-[#172238]
                      text-white
                      shadow-lg
                    `
                    : `
                      text-slate-500
                      hover:text-slate-300
                    `
                }
              `}
            >
              Crear cuenta
            </button>
          </div>

          {/* ===============================================
              ANIMATED FORM
          =============================================== */}

          <AnimatePresence
            mode="wait"
            initial={false}
          >
            {mode ===
            "login" ? (
              <motion.div
                key="login"
                initial={{
                  opacity:
                    0,

                  x:
                    -12,
                }}
                animate={{
                  opacity:
                    1,

                  x:
                    0,
                }}
                exit={{
                  opacity:
                    0,

                  x:
                    12,
                }}
                transition={{
                  duration:
                    0.18,

                  ease:
                    "easeOut",
                }}
              >
                <LoginForm
                  email={
                    loginEmail
                  }

                  setEmail={
                    setLoginEmail
                  }

                  password={
                    loginPassword
                  }

                  setPassword={
                    setLoginPassword
                  }

                  showPassword={
                    showLoginPassword
                  }

                  setShowPassword={
                    setShowLoginPassword
                  }

                  loading={
                    loading
                  }

                  onSubmit={
                    handleLogin
                  }

                  onForgot={() => {
                    const email =
                      normalizeAuthEmail(
                        loginEmail
                      );

                    navigate(
                      email
                        ? `/recuperar-contrasena?email=${encodeURIComponent(
                            email
                          )}`
                        : "/recuperar-contrasena"
                    );
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{
                  opacity:
                    0,

                  x:
                    12,
                }}
                animate={{
                  opacity:
                    1,

                  x:
                    0,
                }}
                exit={{
                  opacity:
                    0,

                  x:
                    -12,
                }}
                transition={{
                  duration:
                    0.18,

                  ease:
                    "easeOut",
                }}
              >
                <RegisterForm
                  name={
                    registerName
                  }

                  setName={
                    setRegisterName
                  }

                  email={
                    registerEmail
                  }

                  setEmail={
                    setRegisterEmail
                  }

                  password={
                    registerPassword
                  }

                  setPassword={
                    setRegisterPassword
                  }

                  confirmation={
                    confirmPassword
                  }

                  setConfirmation={
                    setConfirmPassword
                  }

                  showPassword={
                    showRegisterPassword
                  }

                  setShowPassword={
                    setShowRegisterPassword
                  }

                  showConfirmation={
                    showConfirmPassword
                  }

                  setShowConfirmation={
                    setShowConfirmPassword
                  }

                  loading={
                    loading
                  }

                  onSubmit={
                    handleRegister
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===============================================
              GOOGLE
          =============================================== */}

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

                bg-slate-800
              "
            />

            <span
              className="
                text-[7px]

                font-black

                uppercase
                tracking-widest

                text-slate-600
              "
            >
              O continuar con
            </span>

            <div
              className="
                h-px
                flex-1

                bg-slate-800
              "
            />
          </div>

          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              handleGoogle
            }
            className="
              w-full
              h-13

              min-h-13

              rounded-2xl

              border
              border-slate-700

              bg-[#101a2d]

              text-slate-200

              flex
              items-center
              justify-center
              gap-3

              text-[9px]

              font-black

              uppercase
              tracking-wider

              transition-all

              hover:bg-[#172238]
              hover:border-slate-600

              disabled:opacity-40
            "
          >
            <GoogleIcon />

            Continuar con Google
          </button>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   LOGIN FORM
========================================================= */

function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  onSubmit,
  onForgot,
}) {
  return (
    <form
      onSubmit={
        onSubmit
      }
      className="
        space-y-4
      "
    >
      <AuthField
        label="Correo electrónico"
        icon={
          Mail
        }
      >
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
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          className={inputClass}
        />
      </AuthField>

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
          value={
            password
          }
          onChange={(
            event
          ) =>
            setPassword(
              event.target.value
            )
          }
          autoComplete="current-password"
          placeholder="Tu contraseña"
          className={`${inputClass} pr-12`}
        />

        <PasswordButton
          visible={
            showPassword
          }
          onClick={() =>
            setShowPassword(
              !showPassword
            )
          }
        />
      </AuthField>

      <div
        className="
          flex
          justify-end
        "
      >
        <button
          type="button"
          onClick={
            onForgot
          }
          className="
            text-[8px]

            font-black

            uppercase
            tracking-wide

            text-[#8ED4BE]

            hover:opacity-80
          "
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <SubmitButton
        loading={
          loading
        }
        text="Iniciar sesión"
        loadingText="Ingresando..."
      />
    </form>
  );
}

/* =========================================================
   REGISTER FORM
========================================================= */

function RegisterForm({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmation,
  setConfirmation,
  showPassword,
  setShowPassword,
  showConfirmation,
  setShowConfirmation,
  loading,
  onSubmit,
}) {
  return (
    <form
      onSubmit={
        onSubmit
      }
      className="
        space-y-4
      "
    >
      <AuthField
        label="Nombre"
        icon={
          UserRound
        }
      >
        <input
          type="text"
          value={
            name
          }
          onChange={(
            event
          ) =>
            setName(
              event.target.value
            )
          }
          autoComplete="name"
          placeholder="Tu nombre"
          className={
            inputClass
          }
        />
      </AuthField>

      <AuthField
        label="Correo electrónico"
        icon={
          Mail
        }
      >
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
          autoComplete="email"
          placeholder="correo@ejemplo.com"
          className={
            inputClass
          }
        />
      </AuthField>

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
          value={
            password
          }
          onChange={(
            event
          ) =>
            setPassword(
              event.target.value
            )
          }
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          className={`${inputClass} pr-12`}
        />

        <PasswordButton
          visible={
            showPassword
          }
          onClick={() =>
            setShowPassword(
              !showPassword
            )
          }
        />
      </AuthField>

      <AuthField
        label="Confirmar contraseña"
        icon={
          KeyRound
        }
      >
        <input
          type={
            showConfirmation
              ? "text"
              : "password"
          }
          value={
            confirmation
          }
          onChange={(
            event
          ) =>
            setConfirmation(
              event.target.value
            )
          }
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          className={`${inputClass} pr-12`}
        />

        <PasswordButton
          visible={
            showConfirmation
          }
          onClick={() =>
            setShowConfirmation(
              !showConfirmation
            )
          }
        />
      </AuthField>

      <div
        className="
          px-4
          py-3

          rounded-xl

          bg-[#8ED4BE]/5

          border
          border-[#8ED4BE]/10
        "
      >
        <p
          className="
            text-[7px]

            leading-relaxed

            text-slate-500
          "
        >
          La cuenta no quedará verificada hasta ingresar
          el código de 6 dígitos enviado al correo.
        </p>
      </div>

      <SubmitButton
        loading={
          loading
        }
        text="Crear cuenta"
        loadingText="Procesando..."
      />
    </form>
  );
}

/* =========================================================
   AUTH FIELD
========================================================= */

function AuthField({
  label,
  icon: Icon,
  children,
}) {
  return (
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
        {label}
      </span>

      <div
        className="
          relative
        "
      >
        <Icon
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

        {children}
      </div>
    </label>
  );
}

/* =========================================================
   PASSWORD BUTTON
========================================================= */

function PasswordButton({
  visible,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="
        absolute

        right-4
        top-1/2

        -translate-y-1/2

        text-slate-600

        hover:text-slate-300

        transition-colors
      "
      aria-label={
        visible
          ? "Ocultar contraseña"
          : "Mostrar contraseña"
      }
    >
      {visible ? (
        <EyeOff
          size={17}
        />
      ) : (
        <Eye
          size={17}
        />
      )}
    </button>
  );
}

/* =========================================================
   SUBMIT
========================================================= */

function SubmitButton({
  loading,
  text,
  loadingText,
}) {
  return (
    <button
      type="submit"
      disabled={
        loading
      }
      className="
        w-full
        min-h-13

        mt-2

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

        active:scale-[0.99]

        disabled:opacity-40
        disabled:cursor-not-allowed
      "
    >
      {loading
        ? loadingText
        : text}

      {!loading && (
        <ArrowRight
          size={15}
        />
      )}
    </button>
  );
}

/* =========================================================
   GOOGLE ICON
========================================================= */

function GoogleIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z"
      />

      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.64-2.38l-3.24-2.53c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z"
      />

      <path
        fill="#FBBC05"
        d="M6.39 13.92A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.61.39 3.13 1.04 4.53l3.35-2.61Z"
      />

      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.78.5 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z"
      />
    </svg>
  );
}

/* =========================================================
   INPUT
========================================================= */

const inputClass = `
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

  transition-all

  focus:border-[#8ED4BE]/70
  focus:ring-2
  focus:ring-[#8ED4BE]/5
`;