import { supabase } from './supabaseClient';
import Swal from 'sweetalert2';
import React, { useState, useEffect, useMemo, useRef } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 
import { 
  Plus, Trash2, Home, ShoppingBag, Printer, Edit2, Check, Search,
  ChevronUp, ChevronDown, BarChart3, User, Package, Clock, TrendingUp,
  AlertCircle, MapPin, Star, Trophy, FolderPlus, Folder, Calendar, ArrowLeft, FolderMinus,
  Box, Save
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

import logoAlekey from './assets/alekey-logo.jpeg';

// ==========================================
// 1. CONFIGURACIÓN Y CONSTANTES
// ==========================================

const UBICACIONES_CR = {
  "San José": ["San José", "Escazú", "Desamparados", "Puriscal", "Tarrazú", "Aserrí", "Mora", "Goicoechea", "Santa Ana", "Alajuelita", "Vázquez de Coronado", "Acosta", "Tibás", "Moravia", "Montes de Oca", "Turrubares", "Dota", "Curridabat", "Pérez Zeledón", "León Cortés Castro"],
  "Alajuela": ["Alajuela", "San Ramón", "Grecia", "San Mateo", "Atenas", "Naranjo", "Palmares", "Poás", "Orotina", "San Carlos", "Zarcero", "Valverde Vega", "Upala", "Los Chiles", "Guatuso", "Río Cuarto"],
  "Cartago": ["Cartago", "Paraíso", "La Unión", "Jiménez", "Turrialba", "Alvarado", "Oreamuno", "El Guarco"],
  "Heredia": ["Heredia", "Barva", "Santo Domingo", "Santa Bárbara", "San Rafael", "San Isidro", "Belén", "Flores", "San Pablo", "Sarapiquí"],
  "Guanacaste": ["Liberia", "Nicoya", "Santa Cruz", "Bagaces", "Carrillo", "Cañas", "Abangares", "Tilarán", "Nandayure", "La Cruz", "Hojancha"],
  "Puntarenas": ["Puntarenas", "Esparza", "Buenos Aires", "Montes de Oro", "Osa", "Quepos", "Golfito", "Coto Brus", "Parrita", "Corredores", "Garabito", "Monteverde", "Puerto Jiménez"],
  "Limón": ["Limón", "Pococí", "Siquirres", "Talamanca", "Matina", "Guácimo"]
};

// Las categorías, temas, precios y stock ahora vienen desde Supabase (tabla public.inventario).
// "OTROS..." se conserva como opción manual para productos que no existan todavía en inventario.

// ==========================================
// 2. UTILIDADES GLOBALES
// ==========================================

const Utils = {
  currency: (v) => `C ${(v || 0).toLocaleString()}`, 
  formatPhone: (val) => {
    const d = (val || '').replace(/\D/g, '').substring(0, 8);
    return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
  },
  capitalize: (str) => {
    const clean = (str || '').replace(/[0-9]/g, '');
    return clean.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  },
  validateName: (str) => {
    const words = (str || '').trim().split(/\s+/).filter(w => w.length > 0);
    const hasNumbers = /\d/.test(str);
    return words.length >= 3 && !hasNumbers;
  },
generateId: () => {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ALK-${Date.now().toString().slice(-5)}-${random}`;
  },  getThemeColorClass: (tema) => {
    if (tema === "LAMINADO...") return "bg-blue-50 border-blue-200 text-blue-600";
    if (tema === "ENVIO...") return "bg-green-50 border-green-200 text-green-600";
    if (tema === "FALTA...") return "bg-red-50 border-red-200 text-red-600";
    if (tema === "OTROS...") return "bg-purple-50 border-purple-200 text-purple-600";
    return "bg-white border-slate-100 focus:border-[#8ED4BE]";
  },
  getBase64: (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg"));
      };
      img.src = url;
    });
  }
};

// ==========================================
// 3. COMPONENTES COMPARTIDOS
// ==========================================

const ScrollToTop = ({ trigger }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, trigger]);
  return null;
};

// --- COMPONENTE DE ANIMACIÓN DE ENTRADA ---
const SplashScreen = () => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white animate-in fade-in duration-500">
    <div className="relative flex flex-col items-center">
      <div className="w-36 h-36 mb-6 animate-bounce-slow">
        <img 
          src={logoAlekey} 
          alt="Alekey Logo" 
          className="w-full h-full object-contain rounded-full shadow-2xl border-4 border-[#8ED4BE]/20"
        />
      </div>
      <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 animate-pulse-gentle">
        Alekey<span className="text-[#8ED4BE]">.</span>
      </h1>
      <div className="mt-8 w-48 h-1.5 bg-slate-50 rounded-full overflow-hidden">
        <div className="h-full bg-[#8ED4BE] animate-progress-load rounded-full"></div>
      </div>
    </div>
  </div>
);

const StatCard = ({ icon, label, val, borderColor, isClient }) => (
  <div className={`bg-white p-8 rounded-[3rem] shadow-xl border-b-10 ${borderColor} transition-transform hover:scale-[1.02]`}>
    <div className="mb-4 opacity-40">{icon}</div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
    <h4 className={`font-black italic uppercase leading-tight ${isClient ? 'text-sm lg:text-md text-slate-800' : 'text-2xl text-slate-900'}`}>
      {val}
    </h4>
  </div>
);

const QuantityControls = ({ value, onChange, min = 0, max = 99, colorClass = "bg-white", textClass = "text-slate-800" }) => (
  <div className="flex items-center gap-1 justify-center">
    <input 
      type="number" 
      className={`w-11 h-10 sm:w-14 sm:h-12 border-2 rounded-xl font-black text-center outline-none transition-all focus:border-cyan-400 ${colorClass} ${textClass}`} 
      value={value} 
      onChange={(e) => { 
        const v = parseInt(e.target.value) || 0; 
        onChange(Math.max(min, Math.min(max, v))); 
      }} 
    />
    <div className="flex flex-col gap-0.5">
      <button onClick={() => onChange(Math.min(max, value + 1))} className="p-1 bg-cyan-100 rounded-md text-cyan-600"><ChevronUp size={12}/></button>
      <button onClick={() => onChange(Math.max(min, value - 1))} className="p-1 bg-cyan-100 rounded-md text-cyan-600"><ChevronDown size={12}/></button>
    </div>
  </div>
);

const exportToPDF = async (venta) => {
  const doc = new jsPDF();
  const logo = await Utils.getBase64(logoAlekey);
  doc.setFillColor(245, 247, 250); doc.rect(0, 0, 210, 50, 'F');
  doc.addImage(logo, 'JPEG', 155, 5, 40, 40);
  doc.setFont("helvetica", "bold"); doc.setFontSize(30); doc.setTextColor(30, 41, 59);
  doc.text("FACTURA", 15, 25);
  doc.setFontSize(10); doc.setTextColor(100); doc.text("ORDEN: " + venta.id, 15, 35); doc.text("FECHA: " + venta.fecha, 15, 42);
  doc.setFontSize(11); doc.setTextColor(40);
  doc.text("Isabel Viquez Fernandez", 15, 65);
  doc.setFont("helvetica", "normal"); doc.text("San Joaquín de Flores", 15, 71);
  doc.setFont("helvetica", "bold"); doc.text("CLIENTE:", 110, 65);
  doc.setFont("helvetica", "normal");
  doc.text(venta.nombre, 110, 71); doc.text("Tel: " + venta.telefono, 110, 77); doc.text("Lugar: " + venta.direccion, 110, 83);
  const tableRows = (venta.items || []).map(i => [i.cant, i.cat + " - " + i.tema, "C " + (i.precio || 0).toLocaleString(), "C " + (i.cant * i.precio).toLocaleString(), i.pendiente > 0 ? i.pendiente : "Entregado"]);
  autoTable(doc, { startY: 95, head: [['Cant.', 'Descripcion', 'Unitario', 'Subtotal', 'Pend.']], body: tableRows, headStyles: { fillColor: [142, 212, 190] } });
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text("TOTAL FINAL: C " + (venta.total || 0).toLocaleString(), 195, finalY, { align: 'right' });
  doc.save(`Cotizacion_${venta.nombre}.pdf`);
};

// ==========================================
// 4. COMPONENTE ESTADÍSTICAS
// ==========================================

const Estadisticas = ({ ventas }) => {
  const [view, setView] = useState('general');
  const [sortFlujo, setSortFlujo] = useState('top'); 

  const stats = useMemo(() => {
    if (!ventas || !ventas.length) return null;
    const totalDinero = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
    const piezasTotales = ventas.reduce((acc, v) => acc + (v.items?.reduce((s, i) => s + (i.cant || 0), 0) || 0), 0);
    const totalPendientes = ventas.reduce((acc, v) => acc + (v.items?.reduce((s, i) => s + (i.pendiente || 0), 0) || 0), 0);
    const productosMap = {}; const temasMap = {}; const clientesMap = {};
    ventas.forEach(v => {
      const nombre = v.nombre || "Sin Nombre";
      if (!clientesMap[nombre]) { clientesMap[nombre] = { nombre, tel: v.telefono, total: 0, fecha: v.fecha, rawDate: v.created_at }; }
      clientesMap[nombre].total += (v.total || 0);
      v.items?.forEach(item => {
        const cant = item.cant || 0;
        temasMap[item.tema] = (temasMap[item.tema] || 0) + cant;
        if (!productosMap[item.cat]) productosMap[item.cat] = { total: 0, temas: {} };
        productosMap[item.cat].total += cant;
        productosMap[item.cat].temas[item.tema] = (productosMap[item.cat].temas[item.tema] || 0) + cant;
      });
    });
    const topTemas = Object.entries(temasMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const topCategorias = Object.entries(productosMap).sort((a,b) => b[1].total - a[1].total).slice(0, 5);
    const dataBarras = ventas.slice(0, 10).reverse().map(v => ({ name: (v.nombre || "").split(' ')[0], monto: v.total }));
    const listaFlujo = Object.values(clientesMap);
    if (sortFlujo === 'recientes') {
      listaFlujo.sort((a,b) => new Date(b.rawDate) - new Date(a.rawDate));
    } else {
      listaFlujo.sort((a,b) => b.total - a.total);
    }
    return { totalDinero, piezasTotales, totalPendientes, topTemas, topCategorias, dataBarras, allCategorias: Object.entries(productosMap).sort((a,b)=>b[1].total - a[1].total), allTemas: Object.entries(temasMap).sort((a,b)=>b[1]-a[1]), listaFlujo };
  }, [ventas, sortFlujo]);

  if (!stats) return <div className="p-20 text-center font-black italic opacity-20 text-4xl uppercase text-slate-800">Cargando Datos...</div>;
  if (view === 'temas') return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in slide-in-from-left duration-300 text-slate-800">
      <ScrollToTop trigger={view} />
      <button onClick={() => setView('general')} className="mb-8 flex items-center gap-2 font-black uppercase text-xs text-[#8ED4BE] hover:scale-105 transition-all"><Plus className="rotate-45" size={20}/> Volver Atrás</button>
      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl">
        <h2 className="text-3xl font-black italic uppercase mb-10">Todos los Temas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{stats.allTemas.map(([tema, cant], i) => (<div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl"><span className="font-black italic text-slate-200 text-2xl"># {i+1}</span><span className="font-bold uppercase text-[10px] text-slate-600 tracking-wider font-black">{tema}</span><span className="font-black text-slate-800 text-xs">{cant} pzs</span></div>))}</div>
      </div>
    </div>
  );
  if (view === 'flujo') return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in slide-in-from-left duration-300 text-slate-800">
      <ScrollToTop trigger={view} />
      <button onClick={() => setView('general')} className="mb-8 flex items-center gap-2 font-black uppercase text-xs text-[#8ED4BE] hover:scale-105 transition-all"><Plus className="rotate-45" size={20}/> Volver Atrás</button>
      <div className="bg-white p-6 lg:p-10 rounded-[3.5rem] shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <h2 className="text-2xl lg:text-3xl font-black italic uppercase">Lista de Clientes</h2>
          <select value={sortFlujo} onChange={(e) => setSortFlujo(e.target.value)} className="w-full sm:w-auto p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase outline-none border-2 border-transparent focus:border-[#8ED4BE]">
            <option value="top">Top Clientes (Ventas)</option>
            <option value="recientes">Más Recientes</option>
          </select>
        </div>
        <div className="space-y-4">
          {stats.listaFlujo.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-4xl border-l-8 border-[#8ED4BE]">
              <div className="max-w-[60%]"><h4 className="font-black italic uppercase text-slate-800 text-sm sm:text-base truncate font-black">{c.nombre}</h4><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-black">{c.tel} • {c.fecha}</p></div>
              <span className="font-black text-lg sm:text-xl text-[#8ED4BE]">{Utils.currency(c.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (view === 'categorias') return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in slide-in-from-left duration-300 text-slate-800">
      <ScrollToTop trigger={view} />
      <button onClick={() => setView('general')} className="mb-8 flex items-center gap-2 font-black uppercase text-xs text-[#8ED4BE] hover:scale-105 transition-all"><Plus className="rotate-45" size={20}/> Volver Atrás</button>
      <div className="bg-white p-6 lg:p-10 rounded-[3.5rem] shadow-2xl">
        <h2 className="text-3xl font-black italic uppercase mb-10 tracking-tighter">Ranking Categorías Detallado</h2>
        <div className="space-y-10">{stats.allCategorias.map(([cat, data], i) => (<div key={i} className="bg-slate-50 rounded-[3rem] p-6 lg:p-8 border-l-15 border-[#F79598]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-200 pb-4 gap-2">
            <div className="flex items-center gap-4">
              <span className="font-black italic text-4xl lg:text-5xl text-slate-200 font-black"># {i+1}</span>
              <span className="font-black uppercase text-base lg:text-2xl text-slate-700 tracking-tighter leading-tight font-black">{cat}</span>
            </div>
            <span className="font-black text-lg lg:text-3xl text-slate-800 font-black">{data.total} <span className="text-[10px] lg:text-sm opacity-30 italic">pzs</span></span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(data.temas).sort((a,b)=>b[1]-a[1]).map(([tema, c]) => (
              <div key={tema} className="flex flex-col justify-center bg-white/60 p-4 rounded-2xl border border-white min-h-15">
                <span className="font-bold uppercase text-[8px] lg:text-[9px] text-slate-500 font-black tracking-wider leading-tight mb-1 truncate">{tema}</span>
                <span className="font-black text-[10px] lg:text-[11px] text-[#F79598] font-black">{c} pzs</span>
              </div>
            ))}
          </div>
        </div>))}</div>
      </div>
    </div>
  );
  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500 text-slate-800">
      <ScrollToTop />
      <header className="mb-10 text-center lg:text-left"><h2 className="text-4xl font-black italic uppercase tracking-tighter font-black">Métricas Alekey<span className="text-[#8ED4BE] font-black">.</span></h2></header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<TrendingUp size={24} className="text-[#8ED4BE] font-black"/>} label="Ingresos" val={Utils.currency(stats.totalDinero)} borderColor="border-[#8ED4BE]"/>
        <StatCard icon={<AlertCircle size={24} className="text-[#F79598] font-black"/>} label="Pendientes" val={stats.totalPendientes} borderColor="border-[#F79598]"/>
        <StatCard icon={<Package size={24} className="text-[#C0C976] font-black"/>} label="Piezas" val={stats.piezasTotales} borderColor="border-[#C0C976]"/>
        <StatCard icon={<User size={24} className="text-slate-800"/>} label="Top Cliente" val={stats.listaFlujo.sort((a,b)=>b.total-a.total)[0]?.nombre || 'N/A'} borderColor="border-slate-800" isClient/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50"><div className="flex justify-between items-center mb-8"><h4 className="font-black italic uppercase text-xs flex items-center gap-2 text-slate-400 font-black"><Trophy size={16} className="text-[#C0C976]"/> Ranking de Temas</h4><button onClick={() => setView('temas')} className="bg-slate-50 px-3 py-1.5 rounded-full font-black text-[9px] uppercase text-slate-400 hover:bg-[#C0C976] hover:text-white transition-all shadow-sm">Ver más</button></div><div className="space-y-4">{stats.topTemas.map(([tema, cant], i) => (<div key={i} className="flex items-center justify-between group"><div className="flex items-center gap-4"><span className="font-black italic text-slate-200 text-2xl group-hover:text-[#C0C976] transition-colors font-black"># {i+1}</span><span className="font-bold uppercase text-[10px] text-slate-600 tracking-wider font-black">{tema}</span></div><span className="font-black text-slate-800 text-xs font-black">{cant} pzs</span></div>))}</div></div>
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 text-center">
            <div className="flex justify-between items-center mb-8">
                <h4 className="font-black italic uppercase text-xs text-slate-400 font-black">Flujo de Dinero (Últimas 10)</h4>
                <button onClick={() => setView('flujo')} className="bg-slate-50 px-3 py-1.5 rounded-full font-black text-[9px] uppercase text-slate-400 hover:bg-[#8ED4BE] hover:text-white transition-all shadow-sm">Ver</button>
            </div>
            <div className="h-64" style={{ minHeight: '250px' }}>
                <ResponsiveContainer width="99%" height="100%">
                    <BarChart data={stats.dataBarras}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'black', fill: '#cbd5e1'}} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} formatter={(v) => Utils.currency(v)} />
                        <Bar dataKey="monto" fill="#8ED4BE" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 text-center lg:text-left"><div className="flex justify-between items-center mb-8"><h4 className="font-black italic uppercase text-xs flex items-center gap-2 text-slate-400 font-black"><Star size={16} className="text-[#F79598]"/> Ranking de Categorías</h4><button onClick={() => setView('categorias')} className="bg-slate-50 px-3 py-1.5 rounded-full font-black text-[9px] uppercase text-slate-400 hover:bg-[#F79598] hover:white transition-all shadow-sm">Ver más</button></div><div className="space-y-4">{stats.topCategorias.map(([cat, data], i) => (<div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all font-black"><div className="flex items-center gap-3"><span className="font-black italic text-slate-300 transition-colors group-hover:text-[#F79598]"># {i+1}</span><span className="font-bold uppercase text-[10px] text-slate-700">{cat}</span></div><span className="font-black bg-[#F79598]/10 text-[#F79598] px-3 py-1 rounded-full text-[10px]">{data.total} pzs</span></div>))}</div></div>
      </div>
    </div>
  );
};

// ==========================================
// 5. COMPONENTE VENTAS (Actualizado)
// ==========================================

const HistorialVentas = ({ ventas, onDelete, onUpdate, inventarioCatalog = [] }) => {
  const [mode, setMode] = useState('normal');
  const [filtro, setFiltro] = useState('');
  const [filtroFolder, setFiltroFolder] = useState('');
  const [editId, setEditId] = useState(null);
  const [editCache, setEditCache] = useState(null);
  const [carpetas, setCarpetas] = useState([]);
  const [folderView, setFolderView] = useState(null);
  const [provinciaEdit, setProvinciaEdit] = useState("Heredia");

  const inventarioActivo = useMemo(() => (inventarioCatalog || []).filter(i => i.activo !== false), [inventarioCatalog]);
  const obtenerItemInventario = (categoria, tema) => inventarioActivo.find(i => i.categoria === categoria && i.tema === tema) || null;
  const obtenerPrecioCategoria = (categoria) => {
    if (!categoria || categoria === 'OTROS...') return 0;
    const item = inventarioActivo.find(i => i.categoria === categoria && (i.precio || 0) > 0);
    return item ? (item.precio || 0) : 0;
  };

  /* ================= PAGINACIÓN ================= */
  const ITEMS_POR_PAGINA = 20;
  const [pagina, setPagina] = useState(1);

  useEffect(() => { obtenerCarpetas(); }, []);
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTo(0, 0);
  }, [folderView, pagina, mode]);

  const obtenerCarpetas = async () => {
    const { data } = await supabase
      .from('carpetas_centros')
      .select('*')
      .order('orden', { ascending: true });
    if (data) setCarpetas(data);
  };
  
  const crearCarpeta = async () => {
    const { value: nombre } = await Swal.fire({ title: 'Nuevo Centro Educativo', input: 'text', inputPlaceholder: 'Ej: Escuelita 2026', showCancelButton: true, confirmButtonColor: '#8ED4BE' });
    if (nombre) { 
      const nuevoOrden = carpetas.length > 0 ? Math.max(...carpetas.map(c => c.orden || 0)) + 1 : 0;
      const { data } = await supabase.from('carpetas_centros').insert([{ nombre, ids_ventas: [], orden: nuevoOrden }]).select();
      if (data) setCarpetas([...carpetas, data[0]]); 
    }
  };

  const eliminarCarpeta = async (id, nombre, e) => {
    if (e) e.stopPropagation();
    const result = await Swal.fire({ title: `¿Eliminar centro?`, text: `Se borrará "${nombre}". Los pedidos NO se borran del historial general.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#F79598' });
    if (result.isConfirmed) { await supabase.from('carpetas_centros').delete().eq('id', id); obtenerCarpetas(); setFolderView(null); }
  };

  const editarNombreCarpeta = async (id, actual, e) => {
    if (e) e.stopPropagation();
    const { value: nombre } = await Swal.fire({ title: 'Editar Nombre', input: 'text', inputValue: actual, showCancelButton: true });
    if (nombre) { await supabase.from('carpetas_centros').update({ nombre }).eq('id', id); obtenerCarpetas(); }
  };

  const moverCarpeta = async (id, direccion, e) => {
    if (e) e.stopPropagation();
    const index = carpetas.findIndex(c => c.id === id);
    if (direccion === 'izq' && index === 0) return;
    if (direccion === 'der' && index === carpetas.length - 1) return;
    const nuevas = [...carpetas];
    const targetIdx = direccion === 'izq' ? index - 1 : index + 1;
    [nuevas[index], nuevas[targetIdx]] = [nuevas[targetIdx], nuevas[index]];
    setCarpetas(nuevas);
    const updates = nuevas.map((c, i) => supabase.from('carpetas_centros').update({ orden: i }).eq('id', c.id));
    await Promise.all(updates);
  };

  const agregarACarpeta = async (ventaId) => {
    if (!carpetas.length) return Swal.fire('Error', 'Primero crea un centro', 'error');
    const { value: folderId } = await Swal.fire({ title: 'Seleccionar Centro', input: 'select', inputOptions: Object.fromEntries(carpetas.map(c => [c.id, c.nombre])), showCancelButton: true });
    if (folderId) {
      const folder = carpetas.find(c => c.id === parseInt(folderId));
      if (!folder.ids_ventas.includes(ventaId)) {
        const nuevosIds = [...folder.ids_ventas, ventaId];
        await supabase.from('carpetas_centros').update({ ids_ventas: nuevosIds }).eq('id', folderId);
        obtenerCarpetas(); Swal.fire('Agregado', '', 'success');
      }
    }
  };

  const deseleccionarDeCarpeta = async (ventaId, folder) => {
    const nuevosIds = folder.ids_ventas.filter(id => id !== ventaId);
    await supabase.from('carpetas_centros').update({ ids_ventas: nuevosIds }).eq('id', folder.id);
    setFolderView({ ...folder, ids_ventas: nuevosIds }); obtenerCarpetas();
  };

const handleEditItem = (itemId, field, value) => {
  setEditCache(prev => {
    const updatedItems = prev.items.map(item => {
      if (item.id === itemId) {
        if (field === 'cant') {
          const v = Math.max(1, Math.min(99, value));
          const stockDisponible = Math.max(0, item.stock_disponible ?? item.stock ?? 0);
          const pendienteAuto = Math.max(0, v - stockDisponible);

          return {
            ...item,
            cant: v,
            pendiente: pendienteAuto
          };
        }

        if (field === 'pendiente') {
          return {
            ...item,
            pendiente: Math.max(0, Math.min(item.cant, value))
          };
        }

        if (field === 'precio' && item.cat === "OTROS...") {
          return { ...item, precio: Math.max(0, value) };
        }

        if (field === 'cat') {
          return {
            ...item,
            cat: value,
            tema: '',
            precio: obtenerPrecioCategoria(value),
            inventario_id: null,
            stock: 0,
            stock_disponible: 0,
            pendiente: 0
          };
        }

        if (field === 'tema') {
          const producto = obtenerItemInventario(item.cat, value);
          const stockDisponible = Math.max(0, producto?.stock ?? 0);
          const pendienteAuto = Math.max(0, item.cant - stockDisponible);

          return {
            ...item,
            tema: value,
            precio: producto?.precio || item.precio || obtenerPrecioCategoria(item.cat),
            inventario_id: producto?.id || null,
            stock: stockDisponible,
            stock_disponible: stockDisponible,
            pendiente: pendienteAuto
          };
        }

        return { ...item, [field]: value };
      }

      return item;
    });

    return {
      ...prev,
      items: updatedItems,
      total: updatedItems.reduce((s, i) => s + (i.cant * i.precio), 0)
    };
  });
};

  const agregarLineaEnEdicion = () => {
    const nuevo = { id: Date.now(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 0 };
    setEditCache(prev => {
      const updatedItems = [...prev.items, nuevo];
      return { ...prev, items: updatedItems, total: updatedItems.reduce((s, i) => s + (i.cant * i.precio), 0) };
    });
  };

  const borrarLineaEnEdicion = (itemId) => {
    setEditCache(prev => {
      const updatedItems = prev.items.filter(i => i.id !== itemId);
      return { ...prev, items: updatedItems, total: updatedItems.reduce((s, i) => s + (i.cant * i.precio), 0) };
    });
  };

  const renderVentaCard = (v, inFolder = false) => {
    const editing = editId === v.id;
    const data = editing ? editCache : v;
    const tienePendientes = (data.items || []).some(i => i.pendiente > 0);
    
    // CAMBIO: Ahora acepta números y caracteres (solo valida que no esté vacío)
    const editValido = (data.nombre || "").trim().length > 0 && 
                       (data.telefono || "").replace(/\D/g, '').length === 8 && 
                       (data.items || []).length > 0;
    
    return (
      <div key={v.id} className="bg-white rounded-4xl shadow-xl border-l-12 flex flex-col overflow-hidden transition-colors duration-300 font-black" style={{ borderLeftColor: tienePendientes ? '#F79598' : '#8ED4BE' }}>
        <div className="p-6 lg:p-8 border-b border-slate-50 bg-white z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex-1 w-full text-slate-800">
              {editing ? (
                <div className="space-y-4">
                  {/* CAMBIO: Se permite cualquier carácter en el nombre al editar */}
                  <input 
                    className="text-xl lg:text-2xl font-black italic border-b-2 outline-none w-full bg-slate-50 p-2 border-[#8ED4BE]" 
                    value={data.nombre} 
                    onChange={e => setEditCache({...editCache, nombre: e.target.value})} 
                  />
                  <div className="flex flex-wrap gap-3">
                    <input className="text-sm font-bold border-b outline-none w-32 bg-transparent" value={data.telefono} onChange={e => setEditCache({...editCache, telefono: Utils.formatPhone(e.target.value)})} />
                    <select className="text-sm font-bold border-b outline-none bg-transparent" value={provinciaEdit} onChange={e => setProvinciaEdit(e.target.value)}>
                      {Object.keys(UBICACIONES_CR).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select className="text-sm font-bold border-b outline-none bg-transparent" value={data.direccion} onChange={e => setEditCache({...editCache, direccion: e.target.value})}>
                      {UBICACIONES_CR[provinciaEdit].map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <select className="text-sm font-bold border-b outline-none bg-transparent text-[#8ED4BE]" value={data.encargado || "Vendedor..."} onChange={e => setEditCache({...editCache, encargado: e.target.value})}>
                        <option value="Vendedor...">Vendedor...</option>
                        <option value="Alejandro">Alejandro</option>
                        <option value="Isabel">Isabel</option>
                        <option value="Jason">Jason</option>
                    </select>
                    <select className="text-sm font-bold border-b outline-none bg-transparent text-purple-600" value={data.metodo_pago || "Pago..."} onChange={e => setEditCache({...editCache, metodo_pago: e.target.value})}>
                        <option value="Pago...">Pago...</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta">Tarjeta</option>
                        <option value="Sinpe">Sinpe</option>
                        <option value="Centro Educativo">Centro Educativo</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-black italic">{data.nombre}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-black">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md mr-2 text-slate-500 font-black">#{data.id}</span>
                      {data.fecha} • {data.telefono} • {data.direccion}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {data.encargado && data.encargado !== 'Vendedor...' && (
                      <span className="text-[9px] font-black bg-[#8ED4BE]/10 text-[#8ED4BE] px-3 py-1 rounded-full uppercase tracking-tighter">
                        💼 {data.encargado}
                      </span>
                    )}
                    {data.metodo_pago && data.metodo_pago !== 'Pago...' && (
                      <span className="text-[9px] font-black bg-purple-50 text-purple-600 px-3 py-1 rounded-full uppercase tracking-tighter border border-purple-100">
                        💳 {data.metodo_pago}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-auto lg:gap-2">
              {editing ? (
                <button disabled={!editValido} onClick={() => {onUpdate(v.id, editCache); setEditId(null);}} className="col-span-2 p-4 bg-emerald-500 text-white rounded-2xl shadow-lg active:scale-95 flex justify-center"><Check size={24}/></button>
              ) : (
                <>
                  <button onClick={() => {setEditId(v.id); setEditCache(JSON.parse(JSON.stringify(v)));}} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex justify-center items-center"><Edit2 size={18}/></button>
                  {inFolder ? <button onClick={() => deseleccionarDeCarpeta(v.id, folderView)} className="p-3 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all flex justify-center items-center"><FolderMinus size={18}/></button> : <button onClick={() => agregarACarpeta(v.id)} className="p-3 bg-purple-50 text-purple-500 rounded-xl hover:bg-purple-500 hover:text-white transition-all flex justify-center items-center"><FolderPlus size={18}/></button>}
                  <button onClick={() => exportToPDF(v)} className="p-3 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex justify-center items-center"><Printer size={18}/></button>
                  <button onClick={() => onDelete(v.id)} className="p-3 bg-red-50 text-red-300 rounded-xl hover:bg-red-500 hover:text-white transition-all flex justify-center items-center"><Trash2 size={18}/></button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto max-h-75 overflow-y-auto bg-slate-50/40 p-4 scrollbar-thin font-black">
          <table className="w-full min-w-150">
            <thead className="text-[10px] font-black text-slate-300 uppercase font-black">
              <tr><th className="text-left pb-2 font-black">Cant.</th><th className="text-left pb-2 font-black">Descripción</th><th className="text-center pb-2 font-black">Pend.</th><th className="text-right pb-2 font-black">Subtotal</th>{editing && <th className="w-10"></th>}</tr>
            </thead>
            <tbody>
              {(data.items || []).map(item => (
                <tr key={item.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3">
                    {editing ? (
                      <QuantityControls value={item.cant} onChange={(val) => handleEditItem(item.id, 'cant', val)} min={1} max={99} />
                    ) : (
                      <span className="font-black text-slate-600 font-black">{item.cant}</span>
                    )}
                  </td>
                  <td className="py-3 text-[11px] font-black uppercase text-slate-700 font-black">
                    {editing ? (
                      <div className="flex flex-col gap-1 font-black">
                        <input list="productos-list" className={`border rounded p-1 w-full font-black ${item.cat === "OTROS..." ? 'text-purple-600 border-purple-200' : ''}`} value={item.cat} onChange={e => handleEditItem(item.id, 'cat', e.target.value)} />
                        {item.cat === "OTROS..." && (
                          <input type="number" placeholder="Precio manual" className="border rounded p-1 w-full text-purple-600 font-bold font-black bg-purple-50" value={item.precio} onChange={e => handleEditItem(item.id, 'precio', parseFloat(e.target.value) || 0)} />
                        )}
                        <input list="temas-list" className="border rounded p-1 w-full font-black" value={item.tema} onChange={e => handleEditItem(item.id, 'tema', e.target.value)} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 font-black">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${item.cat === "OTROS..." ? 'bg-purple-50 text-purple-600 border border-purple-100' : Utils.getThemeColorClass(item.cat)}`}>{item.cat}</span>
                        {item.tema}
                      </div>
                    )}
                  </td>
                  <td className="py-3 font-black">
                    {editing ? (
                      <QuantityControls value={item.pendiente} onChange={(val) => handleEditItem(item.id, 'pendiente', val)} min={0} max={item.cant} colorClass="bg-red-50" textClass="text-red-500" />
                    ) : (
                      <div className="flex justify-center font-black">
                        <span className={`px-4 py-1.5 rounded-xl font-black text-[10px] ${item.pendiente > 0 ? 'bg-red-50 text-red-400' : 'bg-emerald-50 text-emerald-500'}`}>
                          {item.pendiente > 0 ? `${item.pendiente} PEND` : 'OK'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-right font-black text-slate-400 text-xs font-black">{Utils.currency(item.cant * item.precio)}</td>
                  {editing && (
                    <td className="py-3 text-center">
                      <button onClick={() => borrarLineaEnEdicion(item.id)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {editing && (
            <button onClick={agregarLineaEnEdicion} className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black uppercase text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-2 font-black">
              <Plus size={14}/> Agregar Línea
            </button>
          )}

          <div className="mt-4 p-4 bg-white/50 rounded-2xl border border-slate-100">
            <p className="text-[9px] uppercase font-black text-slate-300 mb-2 tracking-widest">Notas / Comentarios</p>
            {editing ? (
              <textarea 
                className="w-full p-3 bg-slate-50 rounded-xl text-[11px] font-black text-slate-700 outline-none border focus:border-[#8ED4BE] min-h-20"
                value={data.comentario || ""}
                onChange={e => setEditCache({...editCache, comentario: e.target.value})}
                placeholder="Sin comentarios..."
              />
            ) : (
              <p className="text-[11px] font-black text-slate-500 italic">
                {data.comentario || "Sin notas adicionales."}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-900 flex justify-between items-center font-black">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-black">Total Final</span>
            <span className="text-xl font-black italic text-[#8ED4BE] font-black">{Utils.currency(data.total)}</span>
        </div>
      </div>
    );
  };

  if (folderView) {
    const pedidos = ventas.filter(v =>
      (folderView.ids_ventas || []).includes(v.id)
    );

    const filtradosFolder = pedidos.filter(v =>
      (v.nombre || "").toLowerCase().includes(filtroFolder.toLowerCase()) ||
      (v.id || "").toString().includes(filtroFolder) ||
      (v.telefono || "").toString().includes(filtroFolder)
    );

    return (
      <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in slide-in-from-bottom duration-300 font-black">
        <ScrollToTop trigger={folderView} />

        <button
          onClick={() => setFolderView(null)}
          className="mb-8 flex items-center gap-2 uppercase text-xs text-[#8ED4BE] hover:scale-105 transition-all"
        >
          <ArrowLeft size={20}/> Volver a Centros
        </button>

        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-4xl shadow-lg border border-slate-50">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter text-purple-600">
              {folderView.nombre}
              <span className="text-purple-400"> ({pedidos.length})</span>
            </h2>

            <div className="mt-4 relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
              <input
                type="text"
                placeholder="Buscar en centro..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs outline-none border focus:border-purple-400"
                value={filtroFolder}
                onChange={(e) => setFiltroFolder(e.target.value)}
              />
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase">
              Total Acumulado
            </span>
            <div className="text-2xl font-black italic text-purple-600">
              {Utils.currency(pedidos.reduce((s, v) => s + v.total, 0))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {filtradosFolder.length
            ? filtradosFolder.map(v => renderVentaCard(v, true))
            : (
              <div className="p-20 text-center border-4 border-dashed rounded-[3rem] opacity-20 italic text-2xl uppercase">
                Sin coincidencias
              </div>
            )
          }
        </div>
      </div>
    );
  }

  /* ======================= VISTA CARPETAS ======================= */
  if (mode === 'carpetas') {
    return (
      <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500 font-black">
        <ScrollToTop trigger={mode} />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">
              Centros Educativos<span className="text-purple-600">.</span>
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1">
              Organiza tus pedidos por instituciones
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMode('normal')}
              className="px-6 py-4 bg-white shadow-lg rounded-2xl uppercase text-xs text-slate-400 hover:text-slate-800 font-black"
            >
              Historial
            </button>

            <button
              onClick={crearCarpeta}
              className="px-6 py-4 bg-purple-600 text-white shadow-lg rounded-2xl uppercase text-xs flex items-center gap-2 hover:scale-105 font-black"
            >
              <FolderPlus size={18}/> Nuevo Centro
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {carpetas.map(c => {
            const pedidosEnCarpeta = ventas.filter(v =>
              (c.ids_ventas || []).includes(v.id)
            );

            const totalCarpeta = pedidosEnCarpeta.reduce(
              (s, v) => s + (v.total || 0), 0
            );

            return (
              <div
                key={c.id}
                onClick={() => setFolderView(c)}
                className="group bg-white p-8 rounded-[3rem] shadow-xl border-l-10 border-purple-600 cursor-pointer hover:shadow-2xl transition-all relative"
              >
                <div className="absolute top-0 right-0 p-4 flex gap-1 bg-white/60 rounded-bl-3xl z-10">
                  <button onClick={(e) => moverCarpeta(c.id, 'izq', e)} className="p-2 bg-slate-100 rounded-lg">
                    <ChevronUp className="-rotate-90" size={14}/>
                  </button>
                  <button onClick={(e) => moverCarpeta(c.id, 'der', e)} className="p-2 bg-slate-100 rounded-lg">
                    <ChevronDown className="-rotate-90" size={14}/>
                  </button>
                  <button onClick={(e) => editarNombreCarpeta(c.id, c.nombre, e)} className="p-2 bg-blue-50 text-blue-400 rounded-lg">
                    <Edit2 size={14}/>
                  </button>
                  <button onClick={(e) => eliminarCarpeta(c.id, c.nombre, e)} className="p-2 bg-red-50 text-red-300 rounded-lg">
                    <Trash2 size={14}/>
                  </button>
                </div>

                <div className="w-16 h-16 bg-purple-50 rounded-3xl flex items-center justify-center mb-6">
                  <Folder size={32} className="text-purple-300"/>
                </div>

                <h4 className="font-black italic uppercase text-lg mb-2">
                  {c.nombre}
                </h4>

                <span className="text-[10px] uppercase text-slate-400 font-black">
                  {pedidosEnCarpeta.length} pedidos
                </span>

                <div className="mt-3 text-purple-600 font-black italic">
                  {Utils.currency(totalCarpeta)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ======================= HISTORIAL NORMAL PAGINADO ======================= */

  const filtradas = ventas.filter(v =>
    (v.nombre || "").toLowerCase().includes(filtro.toLowerCase()) ||
    (v.id || "").toString().includes(filtro) ||
    (v.telefono || "").toString().includes(filtro)
  );

  const totalPaginas = Math.ceil(filtradas.length / ITEMS_POR_PAGINA);
  const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
  const ventasPagina = filtradas.slice(inicio, inicio + ITEMS_POR_PAGINA);

  const paginasVisibles = () => {
    if (pagina === 1) return [1, 2, 3].filter(p => p <= totalPaginas);
    if (pagina === 2) return [1, 2, 3, 4].filter(p => p <= totalPaginas);
    if (pagina === totalPaginas)
      return [totalPaginas - 2, totalPaginas - 1, totalPaginas].filter(p => p > 0);
    return [pagina - 1, pagina, pagina + 1];
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500 font-black">
      <ScrollToTop trigger={pagina} />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            Historial de Ventas<span className="text-[#F79598]">.</span>
          </h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-1">
            Control total de pedidos y entregas
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setMode('carpetas')}
            className="px-6 py-4 bg-white shadow-lg rounded-2xl uppercase text-xs text-slate-400 hover:text-slate-800 flex items-center gap-2 font-black"
          >
            <Folder size={18}/> Ver Centros
          </button>

          <Link
            to="/cotizar"
            className="px-6 py-4 bg-[#F79598] text-white shadow-lg rounded-2xl uppercase text-xs flex items-center gap-2 hover:scale-105 font-black"
          >
            <Plus size={18}/> Nueva Venta
          </Link>
        </div>
      </div>

      <div className="mb-10 relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
        <input
          type="text"
          placeholder="Buscar por nombre, orden o teléfono..."
          className="w-full pl-14 pr-8 py-5 bg-white rounded-4xl shadow-xl outline-none font-bold text-slate-600 focus:ring-4 ring-[#F79598]/10"
          value={filtro}
          onChange={(e) => { setFiltro(e.target.value); setPagina(1); }}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {ventasPagina.map(v => renderVentaCard(v))}
      </div>

      {totalPaginas > 1 && (
        <div className="mt-14 flex justify-center gap-2">
          <button onClick={() => setPagina(1)} className="px-4 py-2 rounded-xl bg-slate-100">&laquo;</button>
          <button onClick={() => setPagina(p => Math.max(1, p - 1))} className="px-4 py-2 rounded-xl bg-slate-100">&lsaquo;</button>

          {paginasVisibles().map(p => (
            <button
              key={p}
              onClick={() => setPagina(p)}
              className={`px-4 py-2 rounded-xl ${
                p === pagina ? 'bg-[#F79598] text-white' : 'bg-slate-100 font-black'
              }`}
            >
              {p}
            </button>
          ))}

          <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} className="px-4 py-2 rounded-xl bg-slate-100">&rsaquo;</button>
          <button onClick={() => setPagina(totalPaginas)} className="px-4 py-2 rounded-xl bg-slate-100">&raquo;</button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. COMPONENTE FORMULARIO
// ==========================================

const FormularioCotizacion = ({ alGuardar, inventarioCatalog = [], refrescarInventario }) => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [tel, setTel] = useState('');
  const [provincia, setProvincia] = useState("");
  const [direccion, setDireccion] = useState("");
  const [encargado, setEncargado] = useState('Vendedor...');
  const [metodoPago, setMetodoPago] = useState('Pago...');
  const [comentario, setComentario] = useState('');

  const [items, setItems] = useState([{ id: Date.now(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 0, inventario_id: null, stock_disponible: null }]);
  
  const inventarioActivo = useMemo(() => (inventarioCatalog || []).filter(i => i.activo !== false), [inventarioCatalog]);
  const categoriasInventario = useMemo(() => {
    const cats = [...new Set(inventarioActivo.map(i => i.categoria).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    return [...cats, 'OTROS...'];
  }, [inventarioActivo]);

  const temasPorCategoria = (categoria) => {
    if (categoria === 'OTROS...') return [];
    return [...new Set(
      inventarioActivo
        .filter(i => i.categoria === categoria)
        .map(i => i.tema)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  };

  const buscarProducto = (categoria, tema) => {
    if (!categoria || !tema || categoria === 'OTROS...') return null;
    return inventarioActivo.find(i => i.categoria === categoria && i.tema === tema) || null;
  };

  const precioBaseCategoria = (categoria) => {
    if (!categoria || categoria === 'OTROS...') return 0;
    const item = inventarioActivo.find(i => i.categoria === categoria && (i.precio || 0) > 0);
    return item ? (item.precio || 0) : 0;
  };

  const total = items.reduce((acc, i) => acc + (i.cant * i.precio), 0);

  const esValido = nombre.trim().length > 0 && 
                   tel.replace(/\D/g, '').length === 8 && 
                   items.length > 0 && 
                   items.every(i => i.cat && i.tema && (i.cat === 'OTROS...' || i.inventario_id));

  const agregarLinea = () => setItems([...items, { id: Date.now(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 0, inventario_id: null, stock_disponible: null }]);
  const borrarLinea = (id) => setItems(items.filter(i => i.id !== id));

const updItem = (id, field, val) => {
  setItems(items.map(i => {
    if (i.id !== id) return i;

    if (field === 'cat') {
      const precio = val === 'OTROS...' ? 0 : precioBaseCategoria(val);

      return {
        ...i,
        cat: val,
        tema: '',
        precio,
        pendiente: 0,
        inventario_id: null,
        stock_disponible: 0
      };
    }

    if (field === 'tema') {
      const producto = buscarProducto(i.cat, val);
      const stockDisponible = Math.max(0, producto?.stock ?? 0);
      const pendienteAuto = Math.max(0, i.cant - stockDisponible);

      if (producto) {
        return {
          ...i,
          tema: val,
          precio: producto.precio || precioBaseCategoria(i.cat),
          inventario_id: producto.id,
          stock_disponible: stockDisponible,
          pendiente: pendienteAuto
        };
      }

      return {
        ...i,
        tema: val,
        inventario_id: null,
        stock_disponible: 0,
        pendiente: 0
      };
    }

    if (field === 'cant') {
      const newCant = Math.max(1, Math.min(99, val));
      const stockDisponible = Math.max(0, i.stock_disponible ?? 0);
      const pendienteAuto = Math.max(0, newCant - stockDisponible);

      return {
        ...i,
        cant: newCant,
        pendiente: pendienteAuto
      };
    }

    if (field === 'pendiente') {
      return {
        ...i,
        pendiente: Math.max(0, Math.min(i.cant, val))
      };
    }

    if (field === 'precio' && i.cat === 'OTROS...') {
      return {
        ...i,
        precio: Math.max(0, val)
      };
    }

    return { ...i, [field]: val };
  }));
};

  const descontarInventario = async () => {
    const productos = items.filter(i => i.inventario_id && i.cat !== 'OTROS...');
    for (const item of productos) {
      const nuevoStock = Math.max(0, (item.stock_disponible ?? 0) - (item.cant || 0));
      await supabase
        .from('inventario')
        .update({ stock: nuevoStock, updated_at: new Date().toISOString() })
        .eq('id', item.inventario_id);
    }
    if (refrescarInventario) await refrescarInventario();
  };

  const guardar = async () => {
    if (!esValido) return;

    const ventaItems = items.map(i => ({
      id: i.id,
      cant: i.cant,
      cat: i.cat,
      tema: i.tema,
      precio: i.precio,
      pendiente: i.pendiente,
      inventario_id: i.inventario_id || null
    }));

    const nueva = { 
      id: Utils.generateId(), 
      nombre, 
      telefono: tel, 
      direccion: (provincia ? provincia + ", " : "") + direccion, 
      items: ventaItems, 
      total, 
      encargado, 
      metodo_pago: metodoPago, 
      comentario, 
      fecha: new Date().toLocaleDateString(), 
      created_at: new Date().toISOString() 
    };

    const ok = await alGuardar(nueva);
    if (ok !== false) {
      await descontarInventario();
      navigate('/ventas');
    }
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in slide-in-from-bottom duration-500 font-black">
      <ScrollToTop />
      <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-50 font-black">
        <div className="p-8 lg:p-12 bg-slate-900 text-white flex flex-col lg:flex-row justify-between items-center gap-6 font-black">
          <div className="text-center lg:text-left font-black">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter font-black">Nueva Cotización<span className="text-[#8ED4BE] font-black">.</span></h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 font-black">Completa los datos para generar el pedido</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-4xl border border-white/10 font-black">
            <div className="text-right font-black">
              <p className="text-[9px] font-black uppercase text-slate-400 font-black">Total Estimado</p>
              <p className="text-3xl font-black italic text-[#8ED4BE] font-black">{Utils.currency(total)}</p>
            </div>
            <div className="w-12 h-12 bg-[#8ED4BE] rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-[#8ED4BE]/20 font-black"><Package size={24}/></div>
          </div>
        </div>

        <div className="p-8 lg:p-12 space-y-10 font-black text-slate-800">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 font-black">
            <div className="space-y-2 font-black">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2 font-black"><User size={14}/> Nombre Completo / Entidad</label>
              <input type="text" className="w-full p-6 bg-slate-50 rounded-4xl font-black text-slate-700 outline-none border-2 border-transparent focus:border-[#8ED4BE] transition-all font-black" placeholder="Nombre, empresa o institución..." value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div className="space-y-2 font-black">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2 font-black"><Clock size={14}/> Teléfono (8 dígitos)</label>
              <input type="text" className="w-full p-6 bg-slate-50 rounded-4xl font-black text-slate-700 outline-none border-2 border-transparent focus:border-[#8ED4BE] transition-all font-black" placeholder="0000-0000" value={tel} onChange={e => setTel(Utils.formatPhone(e.target.value))} />
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 font-black">
            <div className="space-y-2 font-black">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2 font-black"><Check size={14} className="text-[#8ED4BE]"/> Responsable</label>
              <select className="w-full p-5 bg-white rounded-2xl font-black uppercase text-xs outline-none shadow-sm font-black border-2 border-transparent focus:border-[#8ED4BE] text-slate-700" value={encargado} onChange={e => setEncargado(e.target.value)}>
                <option value="Vendedor...">Vendedor...</option>
                <option value="Alejandro">Alejandro</option>
                <option value="Isabel">Isabel</option>
                <option value="Jason">Jason</option>
              </select>
            </div>
            <div className="space-y-2 font-black">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2 font-black"><TrendingUp size={14} className="text-purple-500"/> Método de Pago</label>
              <select className="w-full p-5 bg-white rounded-2xl font-black uppercase text-xs outline-none shadow-sm font-black border-2 border-transparent focus:border-purple-400 text-purple-600" value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
                <option value="Pago...">Pago...</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Sinpe">Sinpe</option>
                <option value="Centro Educativo">Centro Educativo</option>
              </select>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 font-black">
            <div className="space-y-2 font-black"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 font-black">Provincia</label><select className="w-full p-5 bg-white rounded-2xl font-black uppercase text-xs outline-none shadow-sm font-black border-2 border-transparent focus:border-purple-400 text-purple-600" value={provincia} onChange={e => {setProvincia(e.target.value); setDireccion("");}}><option value="" disabled>Seleccione...</option>{Object.keys(UBICACIONES_CR).map(p => <option key={p} value={p} className="font-black">{p}</option>)}</select></div>
            <div className="space-y-2 font-black"><label className="text-[10px] font-black uppercase text-slate-400 ml-4 font-black">Ubicación Específica</label><select className="w-full p-5 bg-white rounded-2xl font-black uppercase text-xs outline-none shadow-sm font-black border-2 border-transparent focus:border-purple-400 text-purple-600" value={direccion} onChange={e => setDireccion(e.target.value)}><option value="" disabled className="font-black">Seleccione...</option>{provincia && UBICACIONES_CR[provincia].map(loc => <option key={loc} value={loc} className="font-black">{loc}</option>)}</select></div>
          </section>

          <section className="space-y-6 font-black">
            <div className="flex justify-between items-center px-4 font-black">
              <h4 className="font-black italic uppercase text-slate-800 flex items-center gap-2 text-sm font-black"><ShoppingBag size={18} className="text-[#8ED4BE] font-black"/> Desglose de Productos</h4>
            </div>
            <div className="space-y-4 font-black">
              {items.map((item, idx) => {
                const temasDisponibles = temasPorCategoria(item.cat);
                return (
                  <div key={item.id} className="group flex flex-col items-stretch lg:flex-row lg:items-center gap-6 p-6 bg-white border-2 border-slate-100 rounded-[2.5rem] hover:border-[#8ED4BE] transition-all relative font-black">
                    <span className="font-black italic text-slate-200 text-2xl lg:text-3xl w-10 text-center lg:text-left font-black">#{idx+1}</span>
                    <div className="flex-1 w-full grid grid-cols-1 gap-4 font-black">
                      <input list="productos-list" className={`w-full p-4 bg-slate-50 rounded-4xl font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-[#8ED4BE] font-black ${item.cat === 'OTROS...' ? 'text-purple-600 border-purple-100' : ''}`} placeholder="Buscar categoría..." value={item.cat} onChange={e => updItem(item.id, 'cat', e.target.value)} />
                      {item.cat === 'OTROS...' && (
                        <input type="number" placeholder="Precio manual" className="w-full p-4 bg-purple-50 rounded-4xl font-black text-purple-600 text-[10px] outline-none border-2 border-purple-100 focus:border-purple-300 font-black animate-in zoom-in-95" value={item.precio || ""} onChange={e => updItem(item.id, 'precio', parseFloat(e.target.value) || 0)} />
                      )}
                      <input list={`temas-list-${item.id}`} className="w-full p-4 bg-slate-50 rounded-4xl font-black uppercase text-[10px] outline-none border-2 border-transparent focus:border-[#8ED4BE] font-black" placeholder={item.cat ? "Buscar tema..." : "Primero elige categoría..."} value={item.tema} onChange={e => updItem(item.id, 'tema', e.target.value)} disabled={!item.cat} />
                      <datalist id={`temas-list-${item.id}`}>{temasDisponibles.map(t => <option key={t} value={t} className="font-black" />)}</datalist>
                      {item.cat && item.cat !== 'OTROS...' && item.tema && !item.inventario_id && (
                        <p className="text-[9px] text-red-400 uppercase font-black px-4">Ese tema no existe en esta categoría.</p>
                      )}
                      {item.inventario_id && (
                        <p className="text-[9px] text-slate-400 uppercase font-black px-4">Stock actual: {item.stock_disponible ?? 0} pzs • Precio: {Utils.currency(item.precio)}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 font-black">
                      <div className="flex flex-col items-center flex-1 min-w-17.5 font-black">
                        <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase mb-2 font-black">Cant.</span>
                        <QuantityControls value={item.cant} onChange={v => updItem(item.id, 'cant', v)} min={1} max={99} />
                      </div>
                      <div className="flex flex-col items-center flex-1 min-w-17.5 font-black">
                        <span className="text-[9px] font-black text-slate-400 uppercase mb-2 font-black">Pend.</span>
                        <QuantityControls value={item.pendiente} onChange={v => updItem(item.id, 'pendiente', v)} min={0} max={item.cant} colorClass="bg-red-50" textClass="text-red-500" />
                      </div>
                      <div className="flex flex-col items-end flex-1 min-w-22.5 pr-2 font-black">
                        <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase font-black">Subtotal</p>
                        <p className="font-black italic text-slate-800 text-sm sm:text-lg whitespace-nowrap font-black">{Utils.currency(item.cant * item.precio)}</p>
                      </div>
                      {items.length > 1 && (
                        <div className="absolute top-4 right-4 lg:static font-black">
                          <button onClick={() => borrarLinea(item.id)} className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all font-black"><Trash2 size={16}/></button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-6">
              <button onClick={agregarLinea} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black uppercase text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 font-black"><Plus size={18}/> Agregar Línea</button>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest flex items-center gap-2 font-black"><Edit2 size={14}/> Agregar Comentario (Opcional)</label>
                <textarea className="w-full p-8 bg-slate-50 rounded-[3rem] font-black text-slate-700 outline-none border-2 border-transparent focus:border-[#8ED4BE] transition-all min-h-40 resize-none font-black" placeholder="Escribe aquí cualquier detalle adicional..." maxLength={3000} value={comentario} onChange={e => setComentario(e.target.value)} />
              </div>
            </div>
          </section>

          <button disabled={!esValido} onClick={guardar} className={`w-full p-8 rounded-4xl font-black italic uppercase text-xl shadow-2xl transition-all flex items-center justify-center gap-4 font-black ${esValido ? 'bg-slate-900 text-[#8ED4BE] hover:scale-[1.02] shadow-slate-200 font-black' : 'bg-slate-100 text-slate-300 cursor-not-allowed font-black'}`}><Check size={32}/> {esValido ? 'Confirmar y Guardar Pedido' : 'Complete los datos'}</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 7. COMPONENTE GESTIÓN INVENTARIO
// ==========================================

const GestionInventario = ({ inventarioCatalog = [], setInventarioCatalog }) => {
  const [inventario, setInventario] = useState([]);
  const [catFiltro, setCatFiltro] = useState('Todo');
  const [orden, setOrden] = useState('alfabetico');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  const [pagina, setPagina] = useState(1);
  const itemsPorPagina = 21;

  useEffect(() => { fetchInv(); }, []);

  const fetchInv = async () => {
  setCargando(true);

  try {
    const TAMANO_BLOQUE = 1000;
    let desde = 0;
    let todosLosItems = [];
    let hayMas = true;

    while (hayMas) {
      const { data, error } = await supabase
        .from('inventario')
        .select('*')
        .order('categoria', { ascending: true })
        .order('tema', { ascending: true })
        .range(desde, desde + TAMANO_BLOQUE - 1);

      if (error) throw error;

      const bloque = data || [];
      todosLosItems = [...todosLosItems, ...bloque];

      hayMas = bloque.length === TAMANO_BLOQUE;
      desde += TAMANO_BLOQUE;
    }

    setInventario(todosLosItems);

    if (setInventarioCatalog) {
      setInventarioCatalog(todosLosItems);
    }
  } catch (error) {
    console.error('Error cargando el inventario:', error);

    Swal.fire({
      title: 'Error',
      text: 'No se pudo cargar el inventario completo.',
      icon: 'error',
      confirmButtonColor: '#C0C976'
    });
  } finally {
    setCargando(false);
  }
};

  const actualizarStock = async (id, nuevoStock) => {
    const limpio = Math.max(0, parseInt(nuevoStock) || 0);
    const { error } = await supabase
      .from('inventario')
      .update({ stock: limpio, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      const nuevos = inventario.map(i => i.id === id ? { ...i, stock: limpio } : i);
      setInventario(nuevos);
      if (setInventarioCatalog) setInventarioCatalog(nuevos);
    }
  };

  const editarStockManual = async (item) => {
    const { value } = await Swal.fire({
      title: 'Editar Stock Manual',
      input: 'number',
      inputValue: item.stock || 0,
      inputAttributes: { min: 0 },
      showCancelButton: true,
      confirmButtonColor: '#C0C976'
    });
    if (value !== undefined) {
      actualizarStock(item.id, Math.max(0, parseInt(value)));
    }
  };

  const agregarNuevo = async () => {
    const categorias = [...new Set(inventario.map(i => i.categoria).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Item de Inventario',
      html:
        `<input id="swal-cat" list="productos-list" class="swal2-input" placeholder="Categoría">` +
        `<input id="swal-tema" class="swal2-input" placeholder="Tema o diseño">` +
        `<input id="swal-stock" type="number" class="swal2-input" placeholder="Cantidad / Stock inicial">` +
        `<input id="swal-precio" type="number" class="swal2-input" placeholder="Precio">` +
        `<datalist id="productos-list">${categorias.map(c => `<option value="${c}"></option>`).join('')}<option value="OTROS..."></option></datalist>`,
      focusConfirm: false,
      preConfirm: () => ({
        hoja_origen: 'APP',
        categoria: document.getElementById('swal-cat').value,
        titulo_interno_original: 'APP',
        numero: 0,
        tema: document.getElementById('swal-tema').value,
        cantidad: parseInt(document.getElementById('swal-stock').value) || 0,
        vendidos: 0,
        x_mayor: 0,
        stock: parseInt(document.getElementById('swal-stock').value) || 0,
        precio: parseInt(document.getElementById('swal-precio').value) || 0,
        precio_mayor: 0,
        total: 0,
        notas: 'Agregado desde la app',
        cantidad_stock_igual: 'Sí',
        activo: true
      })
    });

    if (formValues && formValues.categoria && formValues.tema) {
      const { data, error } = await supabase.from('inventario').insert([formValues]).select();
      if (!error && data) {
        const nuevos = [...inventario, data[0]];
        setInventario(nuevos);
        if (setInventarioCatalog) setInventarioCatalog(nuevos);
      }
    }
  };

const borrarItem = async (id) => {
  const res = await Swal.fire({
    title: '¿Eliminar producto?',
    text: 'El producto se eliminará permanentemente del inventario.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#F79598',
    cancelButtonColor: '#64748b'
  });

  if (!res.isConfirmed) return;

  try {
    const { data, error } = await supabase
      .from('inventario')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    // Si Supabase no eliminó ninguna fila
    if (!data || data.length === 0) {
      throw new Error(
        'Supabase no permitió eliminar el registro. Revisa las políticas RLS.'
      );
    }

    const nuevos = inventario.filter(item => item.id !== id);

    setInventario(nuevos);

    if (setInventarioCatalog) {
      setInventarioCatalog(nuevos);
    }

    Swal.fire({
      title: 'Producto eliminado',
      text: 'El registro fue eliminado correctamente de Supabase.',
      icon: 'success',
      confirmButtonColor: '#C0C976'
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);

    Swal.fire({
      title: 'No se pudo eliminar',
      text: error.message || 'Ocurrió un error al eliminar el producto.',
      icon: 'error',
      confirmButtonColor: '#F79598'
    });
  }
};

  const categorias = useMemo(() => {
    return ['Todo', ...new Set(inventario.map(i => i.categoria).filter(Boolean))]
      .sort((a, b) => a === 'Todo' ? -1 : b === 'Todo' ? 1 : a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [inventario]);

 const todosLosFiltrados = useMemo(() => {
  const textoBusqueda = busqueda.trim().toLowerCase();

  return (
    catFiltro === 'Todo'
      ? inventario
      : inventario.filter(item => item.categoria === catFiltro)
  )
    .filter(item => {
      if (!textoBusqueda) return true;

      return (
        (item.tema || '').toLowerCase().includes(textoBusqueda) ||
        (item.categoria || '').toLowerCase().includes(textoBusqueda)
      );
    })
    .slice()
    .sort((a, b) => {
      if (orden === 'cantidad') {
        return (b.stock || 0) - (a.stock || 0);
      }

      return (a.tema || '').localeCompare(
        b.tema || '',
        'es',
        { sensitivity: 'base' }
      );
    });
}, [inventario, catFiltro, busqueda, orden]);

const resumenInventario = useMemo(() => {
  const categoriasVisibles = new Set(
    todosLosFiltrados
      .map(item => item.categoria)
      .filter(Boolean)
  );

  const totalStock = todosLosFiltrados.reduce(
    (acumulado, item) => acumulado + (Number(item.stock) || 0),
    0
  );

  return {
    totalItems: todosLosFiltrados.length,
    totalCategorias: categoriasVisibles.size,
    totalStock
  };
}, [todosLosFiltrados]);

  const totalPaginas = Math.ceil(todosLosFiltrados.length / itemsPorPagina);
  const filtrados = todosLosFiltrados.slice(
    (pagina - 1) * itemsPorPagina,
    pagina * itemsPorPagina
  );

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32 text-slate-800 font-black">
      <ScrollToTop trigger={catFiltro + pagina} />

      <header className="mb-10 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl italic uppercase tracking-tighter">
            Inventario Alekey<span className="text-[#C0C976]">.</span>
          </h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
          Control de Stock en Tiempo Real
        </p>

<div className="mt-2 flex flex-wrap items-center gap-2">
  {catFiltro === 'Todo' ? (
    <>
      <span className="px-3 py-1 bg-[#C0C976]/15 text-[#909944] rounded-full text-[9px] uppercase tracking-widest">
        {resumenInventario.totalCategorias}{' '}
        {resumenInventario.totalCategorias === 1
          ? 'categoría'
          : 'categorías'}
      </span>

      <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] uppercase tracking-widest">
        {resumenInventario.totalItems}{' '}
        {resumenInventario.totalItems === 1 ? 'ítem' : 'ítems'}
      </span>

      <span className="px-3 py-1 bg-[#8ED4BE]/15 text-[#529b84] rounded-full text-[9px] uppercase tracking-widest">
        {resumenInventario.totalStock}{' '}
        {resumenInventario.totalStock === 1 ? 'unidad' : 'unidades'}
      </span>
    </>
  ) : (
    <>
      <span className="px-3 py-1 bg-[#C0C976]/15 text-[#909944] rounded-full text-[9px] uppercase tracking-widest">
        Categoría: {catFiltro}
      </span>

      <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] uppercase tracking-widest">
        {resumenInventario.totalItems}{' '}
        {resumenInventario.totalItems === 1 ? 'ítem' : 'ítems'}
      </span>

      <span className="px-3 py-1 bg-[#8ED4BE]/15 text-[#529b84] rounded-full text-[9px] uppercase tracking-widest">
        {resumenInventario.totalStock}{' '}
        {resumenInventario.totalStock === 1 ? 'unidad' : 'unidades'}
      </span>
    </>
  )}

  {busqueda.trim() && (
    <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-full text-[9px] uppercase tracking-widest">
      Búsqueda: “{busqueda.trim()}”
    </span>
  )}
</div>
        </div>
        <button onClick={agregarNuevo} className="px-8 py-4 bg-[#C0C976] text-slate-800 rounded-2xl uppercase text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
          <Plus size={18}/> Agregar Item
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar diseño o categoría..."
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
          className="flex-1 px-4 py-3 rounded-xl bg-white shadow-sm text-xs uppercase tracking-widest outline-none font-black"
        />
        <div className="flex gap-2">
          <button onClick={() => { setOrden('alfabetico'); setPagina(1); }} className={`px-4 py-2 rounded-lg text-[9px] uppercase font-black ${orden === 'alfabetico' ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`}>
            Alfabético
          </button>
          <button onClick={() => { setOrden('cantidad'); setPagina(1); }} className={`px-4 py-2 rounded-lg text-[9px] uppercase font-black ${orden === 'cantidad' ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`}>
            Cantidad
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
        {categorias.map(cat => (
          <button key={cat} onClick={() => { setCatFiltro(cat); setPagina(1); }} className={`px-6 py-3 rounded-xl text-[10px] uppercase whitespace-nowrap transition-all font-black ${catFiltro === cat ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white text-slate-400 shadow-sm'}`}>
            {cat}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="p-20 text-center italic opacity-20 text-2xl uppercase font-black">Cargando Inventario...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map(item => (
              <div key={item.id} className="bg-white p-8 rounded-[3rem] shadow-xl border-l-10 border-[#C0C976] relative group font-black">
                <button onClick={() => borrarItem(item.id)} className="absolute top-6 right-6 text-red-100 group-hover:text-red-300 transition-colors">
                  <Trash2 size={16}/>
                </button>

                {catFiltro === 'Todo' && (
                  <p className="text-[8px] uppercase tracking-widest text-slate-400 mb-1 font-black">
                    {item.categoria}
                  </p>
                )}

                <h4 className="italic uppercase text-lg text-slate-800 mb-4 font-black">
                  {item.tema}
                </h4>

                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">
                      Stock Actual
                    </p>
                    <p className={`text-2xl italic font-black ${(item.stock || 0) < 5 ? 'text-red-400' : 'text-slate-800'}`}>
                      {item.stock || 0} Pzs
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-2">
                      {Utils.currency(item.precio || 0)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => actualizarStock(item.id, (item.stock || 0) + 1)} className="p-2 bg-white rounded-lg shadow-sm text-[#C0C976] hover:bg-[#C0C976] hover:text-white transition-all">
                      <ChevronUp size={16}/>
                    </button>
                    <button onClick={() => actualizarStock(item.id, Math.max(0, (item.stock || 0) - 1))} className="p-2 bg-white rounded-lg shadow-sm text-[#C0C976] hover:bg-[#C0C976] hover:text-white transition-all">
                      <ChevronDown size={16}/>
                    </button>
                    <button onClick={() => editarStockManual(item)} className="text-[9px] uppercase text-slate-400 hover:text-slate-800 mt-1 font-black">
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {!filtrados.length && (
              <div className="col-span-full p-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] opacity-20 italic text-2xl uppercase font-black">
                Sin productos
              </div>
            )}
          </div>

          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-3 mt-12 flex-wrap">
              <button disabled={pagina === 1} onClick={() => setPagina(p => p - 1)} className="p-4 bg-white rounded-2xl shadow-sm disabled:opacity-20 text-slate-600 font-black">
                <ArrowLeft size={18} />
              </button>

              <div className="flex gap-2 flex-wrap justify-center">
                {[...Array(totalPaginas)].map((_, i) => (
                  <button key={i} onClick={() => setPagina(i + 1)} className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all ${pagina === i + 1 ? 'bg-slate-900 text-[#C0C976] shadow-xl scale-110' : 'bg-white text-slate-400 hover:bg-slate-50'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>

              <button disabled={pagina === totalPaginas} onClick={() => setPagina(p => p + 1)} className="p-4 bg-white rounded-2xl shadow-sm disabled:opacity-20 text-slate-600 font-black">
                <div className="rotate-180"><ArrowLeft size={18} /></div>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ==========================================
// 8. COMPONENTE DASHBOARD (HOME)
// ==========================================

const DashboardHome = ({ historial }) => {
  const navigate = useNavigate();
  const summary = useMemo(() => {
    const pend = (historial || []).reduce((acc, v) => acc + (v.items?.reduce((s, i) => s + (i.pendiente || 0), 0) || 0), 0);
    const total = (historial || []).reduce((acc, v) => acc + (v.total || 0), 0);
    return { pend, total, count: (historial || []).length };
  }, [historial]);
  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700 font-black">
      <ScrollToTop />
      <header className="mb-12 flex flex-col lg:flex-row justify-between items-center gap-8 bg-white p-10 rounded-[4rem] shadow-xl border border-slate-50 font-black">
        <div className="flex items-center gap-8 flex-col sm:flex-row text-center sm:text-left font-black">
          <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3 transition-transform hover:rotate-0 font-black"><img src={logoAlekey} alt="Logo" className="w-16 h-16 object-contain rounded-xl font-black" /></div>
          <div className="font-black"><h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-slate-800 font-black">Hola, Alekey<span className="text-[#8ED4BE] font-black">.</span></h1><p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1 font-black">Gestión Administrativa {new Date().getFullYear()}</p></div>
        </div>
        <div className="flex gap-4 font-black">
          <div className="bg-slate-50 p-6 rounded-4xl text-center border-b-4 border-[#8ED4BE] font-black"><p className="text-[9px] font-black uppercase text-slate-400 mb-1 font-black">Hoy es</p><p className="font-black italic text-slate-800 font-black">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p></div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 font-black">
        <StatCard icon={<TrendingUp size={28} className="text-[#8ED4BE] font-black"/>} label="Ventas Totales" val={Utils.currency(summary.total)} borderColor="border-[#8ED4BE]"/>
        <StatCard icon={<AlertCircle size={28} className="text-[#F79598] font-black"/>} label="Piezas Pendientes" val={summary.pend} borderColor="border-[#F79598]"/>
        <StatCard icon={<ShoppingBag size={28} className="text-[#C0C976] font-black"/>} label="Pedidos Realizados" val={summary.count} borderColor="border-[#C0C976]"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-black">
        <button onClick={() => navigate('/cotizar')} className="group p-8 bg-slate-900 rounded-[3.5rem] text-white flex flex-col justify-between hover:scale-[1.02] transition-all shadow-2xl relative overflow-hidden font-black min-h-48">
          <div className="w-14 h-14 bg-[#8ED4BE] rounded-2xl flex items-center justify-center text-slate-900 shadow-xl group-hover:rotate-12 transition-transform font-black"><Plus size={32}/></div>
          <div className="z-10 text-left font-black"><h4 className="text-2xl font-black italic uppercase mb-1 font-black">Nueva Venta</h4><p className="text-slate-500 font-black uppercase text-[10px] tracking-widest font-black">Crear cotización</p></div>
        </button>
        <button onClick={() => navigate('/ventas')} className="group p-8 bg-white rounded-[3.5rem] text-slate-800 flex flex-col justify-between hover:scale-[1.02] transition-all shadow-xl border border-slate-50 relative overflow-hidden font-black min-h-48">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all font-black"><Search size={32}/></div>
          <div className="z-10 text-left font-black"><h4 className="text-2xl font-black italic uppercase mb-1 font-black">Historial</h4><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest font-black">Ver pedidos</p></div>
        </button>
        <button onClick={() => navigate('/inventario')} className="group p-8 bg-white rounded-[3.5rem] text-slate-800 flex flex-col justify-between hover:scale-[1.02] transition-all shadow-xl border border-slate-50 relative overflow-hidden font-black min-h-48 border-b-10 border-[#C0C976]">
          <div className="w-14 h-14 bg-[#C0C976]/10 rounded-2xl flex items-center justify-center text-[#C0C976] group-hover:bg-[#C0C976] group-hover:text-white transition-all font-black"><Box size={32}/></div>
          <div className="z-10 text-left font-black"><h4 className="text-2xl font-black italic uppercase mb-1 font-black">Inventario</h4><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest font-black">Gestionar Stock</p></div>
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 9. APP PRINCIPAL
// ==========================================

export default function App() {
  const [ventas, setVentas] = useState([]);
  const [inventarioCatalog, setInventarioCatalog] = useState([]);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://');
    if (isStandalone) { setShowSplash(true); setTimeout(() => setShowSplash(false), 2500); }
    fetchVentas(); 
    fetchInventarioCatalog();
  }, []);

  async function fetchVentas() {
    const { data } = await supabase.from('ventas').select('*').order('created_at', { ascending: false });
    if (data) setVentas(data);
  }

  async function fetchInventarioCatalog() {
  try {
    const TAMANO_BLOQUE = 1000;
    let desde = 0;
    let catalogoCompleto = [];
    let hayMas = true;

    while (hayMas) {
      const { data, error } = await supabase
        .from('inventario')
        .select('*')
        .eq('activo', true)
        .order('categoria', { ascending: true })
        .order('tema', { ascending: true })
        .range(desde, desde + TAMANO_BLOQUE - 1);

      if (error) throw error;

      const bloque = data || [];
      catalogoCompleto = [...catalogoCompleto, ...bloque];

      hayMas = bloque.length === TAMANO_BLOQUE;
      desde += TAMANO_BLOQUE;
    }

    setInventarioCatalog(catalogoCompleto);
  } catch (error) {
    console.error('Error cargando el catálogo completo:', error);
  }
}

  const categoriasDatalist = useMemo(() => {
    const cats = [...new Set((inventarioCatalog || []).map(i => i.categoria).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    return [...cats, 'OTROS...'];
  }, [inventarioCatalog]);

  const temasDatalist = useMemo(() => {
    return [...new Set((inventarioCatalog || []).map(i => i.tema).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [inventarioCatalog]);

  const alGuardarEnNube = async (nuevaVenta) => {
    const { data, error } = await supabase.from('ventas').insert([nuevaVenta]).select();
    if (error) { Swal.fire('Error', error.message, 'error'); return false; }
    if (data && data.length > 0) setVentas([data[0], ...ventas]);
    else await fetchVentas();
    Swal.fire({ title: '¡Pedido Guardado!', icon: 'success', confirmButtonColor: '#8ED4BE', customClass: { popup: 'rounded-[3rem] font-black italic font-black' } });
    return true;
  };

  const alEliminar = async (id) => {
    const res = await Swal.fire({ title: '¿Eliminar Venta?', text: "Esta acción no se puede revertir", icon: 'warning', showCancelButton: true, confirmButtonColor: '#F79598', cancelButtonColor: '#cbd5e1' });
    if (res.isConfirmed) { await supabase.from('ventas').delete().eq('id', id); setVentas(ventas.filter(v => v.id !== id)); }
  };

  const alActualizar = async (id, dataEditada) => {
    const { error } = await supabase.from('ventas').update(dataEditada).eq('id', id);
    if (error) { Swal.fire('Error', error.message, 'error'); return false; }
    setVentas(ventas.map(v => v.id === id ? { ...v, ...dataEditada } : v));
    Swal.fire({ title: '¡Actualizado!', icon: 'success', timer: 1500, showConfirmButton: false });
  };

  return (
    <Router>
      <ScrollToTop />
      {/* Se cambia h-screen por h-[100dvh] para corregir el error en móviles */}
      <div className="flex flex-col lg:flex-row h-[100dvh] bg-slate-50 font-sans overflow-hidden font-black">
        <aside className="hidden lg:flex w-32 bg-white border-r border-slate-100 flex-col items-center py-10 gap-8 z-50 font-black">
          <div className="w-16 h-16 bg-[#8ED4BE] rounded-[1.8rem] items-center justify-center shadow-lg shadow-[#8ED4BE]/30 mb-6 flex font-black">
            <Package className="text-slate-800 font-black" size={28}/>
          </div>
          <nav className="flex flex-col gap-8 justify-center w-full font-black">
            <NavLink to="/" icon={<Home size={24}/>} label="Home" isMobile={false} />
            <NavLink to="/cotizar" icon={<Plus size={24}/>} label="Nueva" isMobile={false} />
            <NavLink to="/ventas" icon={<Clock size={24}/>} label="Ventas" isMobile={false} />
            <NavLink to="/stats" icon={<BarChart3 size={24}/>} label="Stats" isMobile={false} />
            <NavLink to="/inventario" icon={<Box size={24}/>} label="Stock" isMobile={false} />
          </nav>
          <div className="mt-auto p-4 flex flex-col items-center gap-2 font-black">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-bold text-[#8ED4BE] text-xs font-black">IV</div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-slate-50/30 font-black">
          <Routes>
            <Route path="/" element={<DashboardHome historial={ventas} />} />
            <Route path="/cotizar" element={<FormularioCotizacion alGuardar={alGuardarEnNube} inventarioCatalog={inventarioCatalog} refrescarInventario={fetchInventarioCatalog} />} />
            <Route path="/ventas" element={<HistorialVentas ventas={ventas} onDelete={alEliminar} onUpdate={alActualizar} inventarioCatalog={inventarioCatalog} />} />
            <Route path="/stats" element={<Estadisticas ventas={ventas} />} />
            <Route path="/inventario" element={<GestionInventario inventarioCatalog={inventarioCatalog} setInventarioCatalog={setInventarioCatalog} />} />
          </Routes>
        </main>

        <footer className="lg:hidden w-full bg-white border-t border-slate-100 flex items-center justify-around py-4 px-2 z-50 font-black">
          <nav className="flex w-full justify-around items-center font-black">
            <NavLink to="/" icon={<Home size={22}/>} label="Home" isMobile={true} />
            <NavLink to="/cotizar" icon={<Plus size={22}/>} label="Nueva" isMobile={true} />
            <NavLink to="/ventas" icon={<Clock size={22}/>} label="Ventas" isMobile={true} />
            <NavLink to="/stats" icon={<BarChart3 size={22}/>} label="Stats" isMobile={true} />
            <NavLink to="/inventario" icon={<Box size={22}/>} label="Stock" isMobile={true} />
          </nav>
        </footer>
      </div>
      <datalist id="productos-list">{categoriasDatalist.map(p => <option key={p} value={p} className="font-black" />)}</datalist>
      <datalist id="temas-list">{temasDatalist.map(t => <option key={t} value={t} className="font-black" />)}</datalist>
    </Router>
  );
}

const NavLink = ({ to, icon, label, isMobile }) => {
  const active = useLocation().pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 group relative transition-all font-black ${active ? 'text-[#8ED4BE] font-black' : 'text-slate-300 hover:text-slate-500 font-black'}`}>
      <div className={`p-3 rounded-2xl transition-all font-black ${active ? 'bg-[#8ED4BE]/10 shadow-inner font-black' : 'group-hover:bg-slate-50 font-black'}`}>{icon}</div>
      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest font-black">{label}</span>
      {active && !isMobile && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#8ED4BE] rounded-full hidden lg:block font-black"></div>}
      {active && isMobile && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#8ED4BE] rounded-full font-black"></div>}
    </Link>
  );
};