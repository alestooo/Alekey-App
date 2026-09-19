import {
  Outlet,
} from "react-router-dom";

import Sidebar from "../components/navigation/Sidebar";
import MobileNav from "../components/navigation/MobileNav";
import MobileMoreMenu from "../components/navigation/MobileMoreMenu";

export default function AppLayout({
  categoriasDatalist = [],
  temasDatalist = [],

  ventas = [],
  inventarioCatalog = [],
}) {
  return (
    <div
      className="
        flex
        flex-col
        lg:flex-row

        h-[100dvh]

        bg-slate-50

        font-sans
        font-black

        overflow-hidden
      "
    >
      {/* ====================================
          DESKTOP
      ==================================== */}

      <Sidebar
        ventas={ventas}
        inventarioCatalog={
          inventarioCatalog
        }
      />

      {/* ====================================
          MOBILE - MÁS OPCIONES
      ==================================== */}

      <MobileMoreMenu
        ventas={ventas}
        inventarioCatalog={
          inventarioCatalog
        }
      />

      {/* ====================================
          CONTENIDO
      ==================================== */}

      <main
        className="
          flex-1

          overflow-y-auto

          bg-slate-50/30

          font-black
        "
      >
        <Outlet />
      </main>

      {/* ====================================
          NAV MÓVIL
      ==================================== */}

      <MobileNav />

      {/* ====================================
          DATALIST CATEGORÍAS
      ==================================== */}

      <datalist id="productos-list">
        {categoriasDatalist.map(
          (categoria) => (
            <option
              key={
                categoria
              }
              value={
                categoria
              }
            />
          )
        )}
      </datalist>

      {/* ====================================
          DATALIST TEMAS
      ==================================== */}

      <datalist id="temas-list">
        {temasDatalist.map(
          (tema) => (
            <option
              key={tema}
              value={tema}
            />
          )
        )}
      </datalist>
    </div>
  );
}