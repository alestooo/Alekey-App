import {
  BookOpen,
  Box,
  Check,
  CircleHelp,
  Edit2,
  FileText,
  Folder,
  Package,
  Plus,
  ShoppingCart,
  X,
} from "lucide-react";

import ScrollToTop from "../components/common/ScrollToTop";

export default function HelpPage() {
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

      <div className="mb-10">
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
              bg-[#8ED4BE]
              text-slate-900
              rounded-2xl
              flex
              items-center
              justify-center
            "
          >
            <CircleHelp
              size={22}
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
              Ayuda
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
              Manual rápido de
              Alekey
            </p>
          </div>
        </div>
      </div>

      {/* INICIO RÁPIDO */}

      <section className="mb-10">
        <div
          className="
            flex
            items-center
            gap-2
            mb-5
          "
        >
          <BookOpen
            size={18}
            className="text-[#8ED4BE]"
          />

          <h2
            className="
              text-lg
              italic
              uppercase
              text-slate-800
            "
          >
            Inicio rápido
          </h2>
        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-4
          "
        >
          <HelpCard
            icon={Plus}
            title="Nueva Venta"
            text="Crea pedidos y cotizaciones con productos del inventario."
            accent="mint"
          />

          <HelpCard
            icon={
              ShoppingCart
            }
            title="Ventas"
            text="Consulta, modifica, organiza y exporta tus pedidos."
            accent="pink"
          />

          <HelpCard
            icon={Folder}
            title="Centros"
            text="Agrupa pedidos por escuela, institución o cliente."
            accent="purple"
          />

          <HelpCard
            icon={FileText}
            title="Estadísticas"
            text="Consulta ingresos, piezas, clientes y productos vendidos."
            accent="blue"
          />

          <HelpCard
            icon={Box}
            title="Inventario"
            text="Controla stock, precios, categorías y productos."
            accent="yellow"
          />

          <HelpCard
            icon={
              CircleHelp
            }
            title="Alertas"
            text="Revisa productos con stock bajo y pedidos pendientes."
            accent="red"
          />
        </div>
      </section>

      {/* ACCIONES COMUNES */}

      <section
        className="
          bg-white
          rounded-[2.5rem]
          shadow-xl
          border
          border-slate-50
          p-6
          lg:p-8
          mb-10
        "
      >
        <h2
          className="
            text-lg
            italic
            uppercase
            text-slate-800
            mb-6
          "
        >
          Acciones comunes
        </h2>

        <div className="space-y-3">
          <GuideStep
            icon={Plus}
            title="Crear una venta"
            text="Nueva → completa los datos → agrega productos → Confirmar y Guardar Pedido."
          />

          <GuideStep
            icon={Edit2}
            title="Editar una venta"
            text="Ventas → selecciona el lápiz → modifica la información → presiona ✓."
          />

          <GuideStep
            icon={X}
            title="Cancelar una edición"
            text="Mientras editas una venta, presiona X para salir sin guardar cambios."
          />

          <GuideStep
            icon={Package}
            title="Cambiar stock"
            text="Stock → utiliza ↑ o ↓, o selecciona Editar para modificar stock, nombre y precio."
          />

          <GuideStep
            icon={Folder}
            title="Mover un centro"
            text="Centros → mantén presionado ⋮⋮ → arrastra la carpeta a la nueva posición."
          />

          <GuideStep
            icon={
              FileText
            }
            title="Crear PDF"
            text="Ventas → selecciona el botón de impresión para generar el documento."
          />
        </div>
      </section>

      {/* COLORES */}

      <section
        className="
          bg-white
          rounded-[2.5rem]
          shadow-xl
          border
          border-slate-50
          p-6
          lg:p-8
          mb-10
        "
      >
        <h2
          className="
            text-lg
            italic
            uppercase
            text-slate-800
            mb-6
          "
        >
          Colores del sistema
        </h2>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-3
          "
        >
          <ColorItem
            color="bg-[#8ED4BE]"
            title="Verde"
            text="Disponible, correcto o completado."
          />

          <ColorItem
            color="bg-[#F79598]"
            title="Rosado"
            text="Pendiente, alerta o stock bajo."
          />

          <ColorItem
            color="bg-purple-500"
            title="Morado"
            text="Centros educativos y agrupaciones."
          />

          <ColorItem
            color="bg-[#C0C976]"
            title="Amarillo"
            text="Inventario y productos."
          />

          <ColorItem
            color="bg-slate-900"
            title="Oscuro"
            text="Acciones principales."
          />
        </div>
      </section>

      {/* PREGUNTAS */}

      <section
        className="
          bg-slate-900
          text-white
          rounded-[2.5rem]
          p-6
          lg:p-8
        "
      >
        <h2
          className="
            text-lg
            italic
            uppercase
            mb-6
          "
        >
          Preguntas rápidas
        </h2>

        <div className="space-y-3">
          <FAQ
            question="¿Por qué una venta aparece pendiente?"
            answer="Porque uno o más productos tienen una cantidad pendiente mayor a cero."
          />

          <FAQ
            question="¿Por qué el stock aparece rojo?"
            answer="Rojo indica stock bajo o agotado. Actualmente 4 unidades o menos se considera stock bajo."
          />

          <FAQ
            question="¿Puedo guardar una venta sin ubicación?"
            answer="Sí. Provincia y cantón son datos opcionales."
          />

          <FAQ
            question="¿Cancelar edición modifica la venta?"
            answer="No. La X sale del modo edición y descarta los cambios no guardados."
          />

          <FAQ
            question="¿Eliminar una carpeta elimina sus pedidos?"
            answer="No. Solo elimina la agrupación. Los pedidos permanecen en el historial."
          />
        </div>
      </section>
    </div>
  );
}

function HelpCard({
  icon: Icon,
  title,
  text,
  accent,
}) {
  const colors = {
    mint:
      "bg-emerald-50 text-emerald-500",

    pink:
      "bg-red-50 text-[#F79598]",

    purple:
      "bg-purple-50 text-purple-500",

    blue:
      "bg-blue-50 text-blue-500",

    yellow:
      "bg-yellow-50 text-[#AEB64B]",

    red:
      "bg-red-50 text-red-400",
  };

  return (
    <article
      className="
        bg-white
        p-6
        rounded-[2rem]
        border
        border-slate-100
        shadow-lg
      "
    >
      <div
        className={`
          w-11
          h-11
          rounded-2xl
          flex
          items-center
          justify-center
          mb-5

          ${colors[accent]}
        `}
      >
        <Icon
          size={20}
        />
      </div>

      <h3
        className="
          text-sm
          uppercase
          italic
          text-slate-800
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-[10px]
          leading-relaxed
          text-slate-400
        "
      >
        {text}
      </p>
    </article>
  );
}

function GuideStep({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div
      className="
        flex
        gap-4
        p-4
        bg-slate-50
        rounded-2xl
      "
    >
      <div
        className="
          w-10
          h-10
          shrink-0
          rounded-xl
          bg-white
          text-[#8ED4BE]
          flex
          items-center
          justify-center
          shadow-sm
        "
      >
        <Icon
          size={18}
        />
      </div>

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
            text-[10px]
            leading-relaxed
            text-slate-400
          "
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function ColorItem({
  color,
  title,
  text,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        p-4
        bg-slate-50
        rounded-2xl
      "
    >
      <span
        className={`
          w-4
          h-4
          rounded-full
          shrink-0
          ${color}
        `}
      />

      <div>
        <p
          className="
            text-[11px]
            text-slate-700
          "
        >
          {title}
        </p>

        <p
          className="
            text-[9px]
            text-slate-400
            mt-0.5
          "
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function FAQ({
  question,
  answer,
}) {
  return (
    <details
      className="
        group
        bg-white/5
        rounded-2xl
        border
        border-white/5
        overflow-hidden
      "
    >
      <summary
        className="
          cursor-pointer
          p-4
          text-[11px]
          uppercase
          tracking-wide
          list-none
          flex
          items-center
          justify-between
          gap-3
        "
      >
        {question}

        <span
          className="
            text-[#8ED4BE]
            text-lg
            transition-transform
            group-open:rotate-45
          "
        >
          +
        </span>
      </summary>

      <div
        className="
          px-4
          pb-4
          text-[10px]
          leading-relaxed
          text-slate-400
        "
      >
        {answer}
      </div>
    </details>
  );
}