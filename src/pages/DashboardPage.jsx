import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  Box,
  Plus,
  Search,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import logoAlekey from "../assets/images/alekey-logo.jpeg";

import StatCard from "../components/common/StatCard";
import ScrollToTop from "../components/common/ScrollToTop";

const currency = (value) => `C ${(value || 0).toLocaleString()}`;

export default function DashboardPage({ historial = [] }) {
  const navigate = useNavigate();

  const summary = useMemo(() => {
    const pend = historial.reduce(
      (acc, venta) =>
        acc +
        (venta.items?.reduce(
          (sum, item) => sum + (item.pendiente || 0),
          0
        ) || 0),
      0
    );

    const total = historial.reduce(
      (acc, venta) => acc + (venta.total || 0),
      0
    );

    return {
      pend,
      total,
      count: historial.length,
    };
  }, [historial]);

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700 font-black">
      <ScrollToTop />

      <header className="mb-12 flex flex-col lg:flex-row justify-between items-center gap-8 bg-white p-10 rounded-[4rem] shadow-xl border border-slate-50">
        <div className="flex items-center gap-8 flex-col sm:flex-row text-center sm:text-left">
          <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3 transition-transform hover:rotate-0">
            <img
              src={logoAlekey}
              alt="Logo"
              className="w-16 h-16 object-contain rounded-xl"
            />
          </div>

          <div>
            <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-slate-800">
              Hola, Alekey
              <span className="text-[#8ED4BE]">.</span>
            </h1>

            <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1">
              Gestión Administrativa {new Date().getFullYear()}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-50 p-6 rounded-4xl text-center border-b-4 border-[#8ED4BE]">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-1">
              Hoy es
            </p>

            <p className="font-black italic text-slate-800">
              {new Date().toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <StatCard
          icon={<TrendingUp size={28} className="text-[#8ED4BE]" />}
          label="Ventas Totales"
          val={currency(summary.total)}
          borderColor="border-[#8ED4BE]"
        />

        <StatCard
          icon={<AlertCircle size={28} className="text-[#F79598]" />}
          label="Piezas Pendientes"
          val={summary.pend}
          borderColor="border-[#F79598]"
        />

        <StatCard
          icon={<ShoppingBag size={28} className="text-[#C0C976]" />}
          label="Pedidos Realizados"
          val={summary.count}
          borderColor="border-[#C0C976]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <button
          onClick={() => navigate("/cotizar")}
          className="group p-8 bg-slate-900 rounded-[3.5rem] text-white flex flex-col justify-between hover:scale-[1.02] transition-all shadow-2xl relative overflow-hidden min-h-48"
        >
          <div className="w-14 h-14 bg-[#8ED4BE] rounded-2xl flex items-center justify-center text-slate-900 shadow-xl group-hover:rotate-12 transition-transform">
            <Plus size={32} />
          </div>

          <div className="z-10 text-left">
            <h4 className="text-2xl font-black italic uppercase mb-1">
              Nueva Venta
            </h4>

            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">
              Crear cotización
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/ventas")}
          className="group p-8 bg-white rounded-[3.5rem] text-slate-800 flex flex-col justify-between hover:scale-[1.02] transition-all shadow-xl border border-slate-50 relative overflow-hidden min-h-48"
        >
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
            <Search size={32} />
          </div>

          <div className="z-10 text-left">
            <h4 className="text-2xl font-black italic uppercase mb-1">
              Historial
            </h4>

            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
              Ver pedidos
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/inventario")}
          className="group p-8 bg-white rounded-[3.5rem] text-slate-800 flex flex-col justify-between hover:scale-[1.02] transition-all shadow-xl border border-slate-50 relative overflow-hidden min-h-48 border-b-10 border-[#C0C976]"
        >
          <div className="w-14 h-14 bg-[#C0C976]/10 rounded-2xl flex items-center justify-center text-[#C0C976] group-hover:bg-[#C0C976] group-hover:text-white transition-all">
            <Box size={32} />
          </div>

          <div className="z-10 text-left">
            <h4 className="text-2xl font-black italic uppercase mb-1">
              Inventario
            </h4>

            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">
              Gestionar Stock
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}