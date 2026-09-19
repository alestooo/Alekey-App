import {
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function ResetPasswordPage() {
  const navigate =
    useNavigate();

  const {
    updatePassword,
  } = useAuth();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirm,
    setConfirm,
  ] = useState("");

  const [
    visible,
    setVisible,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const submit =
    async (event) => {
      event.preventDefault();

      if (
        password.length <
        8
      ) {
        await Swal.fire(
          "Contraseña muy corta",
          "Utiliza al menos 8 caracteres.",
          "info"
        );

        return;
      }

      if (
        password !==
        confirm
      ) {
        await Swal.fire(
          "No coinciden",
          "Las contraseñas deben ser iguales.",
          "info"
        );

        return;
      }

      setSaving(
        true
      );

      try {
        await updatePassword(
          password
        );

        await Swal.fire({
          title:
            "Contraseña actualizada",

          icon:
            "success",

          timer:
            1200,

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
        await Swal.fire(
          "Error",
          error.message ||
            "No se pudo cambiar la contraseña.",
          "error"
        );
      } finally {
        setSaving(
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
        <h1
          className="
            text-2xl
            italic
            uppercase

            text-slate-900
          "
        >
          Nueva contraseña
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
          Crea una nueva contraseña para tu cuenta.
        </p>

        <PasswordBox
          value={
            password
          }
          onChange={
            setPassword
          }
          placeholder="Nueva contraseña"
          visible={
            visible
          }
          setVisible={
            setVisible
          }
        />

        <PasswordBox
          value={
            confirm
          }
          onChange={
            setConfirm
          }
          placeholder="Confirmar contraseña"
          visible={
            visible
          }
          setVisible={
            setVisible
          }
        />

        <button
          type="submit"
          disabled={
            saving
          }
          className="
            mt-5

            w-full
            min-h-14

            rounded-2xl

            bg-[#8ED4BE]
            text-slate-900

            text-[9px]
            uppercase

            disabled:opacity-40
          "
        >
          {saving
            ? "Guardando..."
            : "Guardar contraseña"}
        </button>
      </form>
    </main>
  );
}

function PasswordBox({
  value,
  onChange,
  placeholder,
  visible,
  setVisible,
}) {
  return (
    <div
      className="
        relative

        mt-5
      "
    >
      <LockKeyhole
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
        type={
          visible
            ? "text"
            : "password"
        }
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        placeholder={
          placeholder
        }
        className="
          auth-input
          pr-12
        "
      />

      <button
        type="button"
        onClick={() =>
          setVisible(
            !visible
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
    </div>
  );
}