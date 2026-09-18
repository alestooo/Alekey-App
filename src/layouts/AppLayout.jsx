import { Outlet } from "react-router-dom";

import Sidebar from "../components/navigation/Sidebar";
import MobileNav from "../components/navigation/MobileNav";

export default function AppLayout({
  categoriasDatalist = [],
  temasDatalist = [],
}) {
  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-slate-50 font-sans overflow-hidden font-black">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-slate-50/30 font-black">
        <Outlet />
      </main>

      <MobileNav />

      <datalist id="productos-list">
        {categoriasDatalist.map((categoria) => (
          <option
            key={categoria}
            value={categoria}
          />
        ))}
      </datalist>

      <datalist id="temas-list">
        {temasDatalist.map((tema) => (
          <option
            key={tema}
            value={tema}
          />
        ))}
      </datalist>
    </div>
  );
}