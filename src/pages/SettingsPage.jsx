import {
  Check,
  Database,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Settings,
  Sun,
} from "lucide-react";

import ScrollToTop from "../components/common/ScrollToTop";

import {
  useAppSettings,
} from "../contexts/AppSettingsContext";

export default function SettingsPage() {
  const {
    theme,
    resolvedTheme,

    salesPerPage,
    foldersPerPage,
    inventoryPerPage,

    setTheme,
    setSalesPerPage,
    setFoldersPerPage,
    setInventoryPerPage,

    validOptions,
    resetSettings,
  } = useAppSettings();

  return (
    <div
      className="
        p-4
        lg:p-10
        max-w-6xl
        mx-auto
        pb-28
        font-black
      "
    >
      <ScrollToTop />

      {/* HEADER */}

      <div
        className="
          mb-10
          flex
          flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-5
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              w-11
              h-11
              bg-slate-900
              text-[#8ED4BE]
              rounded-2xl
              flex
              items-center
              justify-center
            "
          >
            <Settings
              size={21}
            />
          </div>

          <div>
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
              Ajustes
              <span className="text-[#8ED4BE]">
                .
              </span>
            </h1>

            <p
              className="
                text-[9px]
                uppercase
                tracking-widest
                text-slate-400
              "
            >
              Configuración de
              Alekey
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            resetSettings
          }
          className="
            px-4
            py-3
            rounded-2xl
            bg-white
            border
            border-slate-100
            text-slate-400
            text-[9px]
            uppercase
            tracking-widest
            flex
            items-center
            justify-center
            gap-2
            hover:bg-slate-900
            hover:text-white
            transition-all
          "
        >
          <RotateCcw
            size={15}
          />

          Restablecer
        </button>
      </div>

      <div className="space-y-8">
        {/* =================================
            APARIENCIA
        ================================= */}

        <section
          className="
            bg-white
            rounded-[2.5rem]
            shadow-xl
            border
            border-slate-50
            p-6
            lg:p-8
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              mb-6
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-purple-50
                text-purple-500
                flex
                items-center
                justify-center
              "
            >
              <Palette
                size={19}
              />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  uppercase
                  italic
                  text-slate-800
                "
              >
                Apariencia
              </h2>

              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-widest
                  text-slate-400
                "
              >
                Tema visual de la
                aplicación
              </p>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-3
              gap-4
            "
          >
            <ThemeCard
              active={
                theme ===
                "light"
              }
              icon={Sun}
              title="Claro"
              subtitle="Interfaz clara"
              iconClass="bg-amber-50 text-amber-500"
              onClick={() =>
                setTheme(
                  "light"
                )
              }
            />

            <ThemeCard
              active={
                theme ===
                "dark"
              }
              icon={Moon}
              title="Oscuro"
              subtitle="Interfaz oscura"
              iconClass="bg-slate-900 text-slate-200"
              onClick={() =>
                setTheme(
                  "dark"
                )
              }
            />

            <ThemeCard
              active={
                theme ===
                "system"
              }
              icon={Monitor}
              title="Sistema"
              subtitle="Sigue tu dispositivo"
              iconClass="bg-blue-50 text-blue-500"
              onClick={() =>
                setTheme(
                  "system"
                )
              }
            />
          </div>

          <div
            className="
              mt-5
              px-4
              py-3
              rounded-2xl
              bg-slate-50
              flex
              flex-col
              sm:flex-row
              sm:items-center
              justify-between
              gap-2
            "
          >
            <span
              className="
                text-[9px]
                uppercase
                tracking-widest
                text-slate-400
              "
            >
              Tema aplicado
            </span>

            <span
              className="
                text-[10px]
                uppercase
                text-slate-700
              "
            >
              {resolvedTheme ===
              "dark"
                ? "Oscuro"
                : "Claro"}
            </span>
          </div>
        </section>

        {/* =================================
            PREFERENCIAS
        ================================= */}

        <section
          className="
            bg-white
            rounded-[2.5rem]
            shadow-xl
            border
            border-slate-50
            p-6
            lg:p-8
          "
        >
          <div className="mb-7">
            <h2
              className="
                text-lg
                uppercase
                italic
                text-slate-800
              "
            >
              Preferencias
            </h2>

            <p
              className="
                mt-1
                text-[9px]
                uppercase
                tracking-widest
                text-slate-400
              "
            >
              Cantidad de
              elementos mostrados
              por página
            </p>
          </div>

          <div className="space-y-7">
            <PreferenceRow
              title="Ventas por página"
              description="Historial y pedidos dentro de centros"
              options={
                validOptions.salesPerPage
              }
              value={
                salesPerPage
              }
              onChange={
                setSalesPerPage
              }
            />

            <PreferenceRow
              title="Centros por página"
              description="Cantidad de carpetas visibles"
              options={
                validOptions.foldersPerPage
              }
              value={
                foldersPerPage
              }
              onChange={
                setFoldersPerPage
              }
            />

            <PreferenceRow
              title="Inventario por página"
              description="Cantidad de productos visibles"
              options={
                validOptions.inventoryPerPage
              }
              value={
                inventoryPerPage
              }
              onChange={
                setInventoryPerPage
              }
            />
          </div>

          <div
            className="
              mt-7
              p-4
              rounded-2xl
              bg-emerald-50
              text-emerald-600
              text-[9px]
              uppercase
              tracking-widest
              leading-relaxed
            "
          >
            Los cambios se
            guardan automáticamente
            en este dispositivo.
          </div>
        </section>

        {/* =================================
            INFORMACIÓN
        ================================= */}

        <section
          className="
            bg-white
            rounded-[2.5rem]
            shadow-xl
            border
            border-slate-50
            p-6
            lg:p-8
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              mb-6
            "
          >
            <div
              className="
                w-10
                h-10
                bg-emerald-50
                text-emerald-500
                rounded-xl
                flex
                items-center
                justify-center
              "
            >
              <Database
                size={19}
              />
            </div>

            <div>
              <h2
                className="
                  text-lg
                  uppercase
                  italic
                  text-slate-800
                "
              >
                Información de la
                aplicación
              </h2>

              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-widest
                  text-slate-400
                "
              >
                Información técnica
                básica
              </p>
            </div>
          </div>

          <div
            className="
              divide-y
              divide-slate-100
            "
          >
            <InfoRow
              label="Aplicación"
              value="Alekey"
            />

            <InfoRow
              label="Estado"
              value="En desarrollo"
            />

            <InfoRow
              label="Base de datos"
              value="Supabase"
              green
            />

            <InfoRow
              label="Interfaz"
              value="React + Vite"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/*
 * ========================================
 * THEME CARD
 * ========================================
 */

function ThemeCard({
  active,
  icon: Icon,
  title,
  subtitle,
  iconClass,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        text-left
        p-5
        rounded-2xl
        border-2
        transition-all

        ${
          active
            ? "border-[#8ED4BE] bg-[#8ED4BE]/10 shadow-lg"
            : "border-slate-100 bg-slate-50 hover:border-slate-300"
        }
      `}
    >
      <div
        className={`
          w-10
          h-10
          rounded-xl
          flex
          items-center
          justify-center
          mb-4

          ${iconClass}
        `}
      >
        <Icon
          size={19}
        />
      </div>

      <p
        className="
          text-sm
          text-slate-800
        "
      >
        {title}
      </p>

      <p
        className="
          text-[9px]
          text-slate-400
          mt-1
        "
      >
        {subtitle}
      </p>

      {active && (
        <span
          className="
            absolute
            top-4
            right-4
            w-6
            h-6
            rounded-full
            bg-[#8ED4BE]
            text-white
            flex
            items-center
            justify-center
          "
        >
          <Check
            size={13}
          />
        </span>
      )}
    </button>
  );
}

/*
 * ========================================
 * PREFERENCE ROW
 * ========================================
 */

function PreferenceRow({
  title,
  description,
  options,
  value,
  onChange,
}) {
  return (
    <div
      className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        justify-between
        gap-4
        pb-7
        border-b
        border-slate-100
        last:border-0
        last:pb-0
      "
    >
      <div>
        <p
          className="
            text-xs
            uppercase
            text-slate-700
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            text-[9px]
            text-slate-400
          "
        >
          {description}
        </p>
      </div>

      <div
        className="
          inline-flex
          p-1.5
          rounded-2xl
          bg-slate-50
          gap-1
          self-start
          lg:self-auto
        "
      >
        {options.map(
          (option) => (
            <button
              type="button"
              key={
                option
              }
              onClick={() =>
                onChange(
                  option
                )
              }
              className={`
                min-w-14
                h-11
                px-4
                rounded-xl
                text-[10px]
                transition-all

                ${
                  value ===
                  option
                    ? "bg-slate-900 text-white shadow-lg"
                    : "text-slate-400 hover:bg-white hover:text-slate-700"
                }
              `}
            >
              {option}
            </button>
          )
        )}
      </div>
    </div>
  );
}

/*
 * ========================================
 * INFO
 * ========================================
 */

function InfoRow({
  label,
  value,
  green = false,
}) {
  return (
    <div
      className="
        py-4
        flex
        items-center
        justify-between
        gap-4
      "
    >
      <span
        className="
          text-[9px]
          uppercase
          tracking-widest
          text-slate-400
        "
      >
        {label}
      </span>

      <span
        className={`
          text-xs
          text-right

          ${
            green
              ? "text-emerald-500"
              : "text-slate-700"
          }
        `}
      >
        {value}
      </span>
    </div>
  );
}