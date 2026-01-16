import { supabase } from './supabaseClient';
import Swal from 'sweetalert2';
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 
import { 
  Plus, Trash2, Home, ShoppingBag, Printer, Edit2, Check, Search,
  ChevronUp, ChevronDown, BarChart3, User, Package, Clock, TrendingUp,
  AlertCircle, MapPin, Star, Trophy, FolderPlus, Folder, Calendar, ArrowLeft, FolderMinus
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

const PRODUCTOS_PRECIOS = {
  "Abecedarios": 5000, "Areas": 4500, "Asistencia": 2500, "Bienvenidos": 4750,
  "Borde decorado": 4500, "Borde liso": 2500, "Calendario 1": 1500, "Calendario 2": 2500,
  "Calendario 3": 3750, "Cumpleaños": 1500, "Cumpleaños MR-2": 2500, "DG - amarilla": 1350,
  "DCC": 3750, "Distintivo": 1350, "Distintivo foto": 1350, "DM - celeste": 700,
  "DP - rosado": 500, "Fechero": 4750, "Fechero completo": 8500, "Laminario 5": 2250,
  "Laminario 6": 2750, "Laminario 7": 3150, "Laminario 8": 3500, "Mural-1":1500, "MR-2": 2500,
  "MR-6": 6500, "MR-8": 8000, "Nombres": 1500, "Pasafecha": 12500, "Pasalista": 5500, "Puerta": 1500, "Puerta grande": 2500,
  "Rótulo 60 cm": 2750, "Tablas": 2000, "Velcro": 1250, "OTROS...": 0
};

const TEMAS_PREDEFINIDOS = [
  "Abeja Acuarela", "Abeja Cute","Abeja Spelling","Alicia","Amarillo","Arcoiris","Arcoliris Pastel","Autismo","Avenger","Azul","Be Happy","Bosque","Bosque Acuarela",
  "Bosque CR","Búho","Caballito de mar","Cactus","Campamento","Cangrejo","Capibara","Celeste","Chimuelos","Circo","Circo 1","Circo 2","Colores arcoiris","Colores arcoiris cafe",
  "Colores arcoiris navidad","Colores arcoiris pastel","Confeti café","Confeti colores","Confeti negro","Crayola","Crayola Niños","Crayola Pastel","Cumpleaños","Deporte","Dino Baby",
  "Dinosaurio","Elefante","Escolar","Espacio","Espacio Azul","Espantapajaros","Feria Cientifica","Flor café","Fucsia","Gato","Granja 1","Granja 2","Granja Acuarela","Granja New","Granjeros",
  "Harry Potter","Insectos","Intensamente","Jirafa","Kirby","Koala","Leones","Leones Pareja","Llama","Mar","Mar fondo blanco","Mar New","Margarita","Mario Bros","Mariquita","Mariquita Educlip",
  "Mariquita insecto","Medio Ambiente","Melonheadz","Menta","Mickey","Mickey Safari","Mono","Monster Inc","Monstruos 1","Monstruos 2","Monstruos 3","Morado","Música","Naranja","Navidad",
  "Negro","Niños Corazón 1","Niños Corazón 2","Niños Jovenes","OFERTA","Oso Cariñoso","Oso Miel","Oso Sandia","Oso Teddy","Oso the Pond","Pacman","Pajaro Acuarela","Pajaro Educlip",
  "Panda","Panda Cute","Patrio Desfile","Patrio Niños Campesinos","Perro","Pingüino","Pirata","Pirata Meryta","Plaza Sesamo","Principito","Puntos Amarillos","Puntos Azul","Puntos Celeste",
  "Puntos colores fondo blanco","Puntos colores fondo negro","Puntos Fucsia","Puntos Naranja","Puntos Negro","Puntos Rainbow","Puntos Rojo","Puntos Rosado","Puntos Turquesa","Puntos Verde",
  "Rana","Rana the Pond","Raya Bullying","Raya Café","Raya Cumpleaños","Robot 1","Robot 2","Robot 3","Rojo","Rombo","Rompecabezas","Rosado","Safari","Safari Cute","San Valentin",
  "Selva","Sloth","Snoopy","Snoopy colores","Snoopy rojo","Snoopy y amigos","Spring","Star Wars","Stitch 1","Stitch 2","Suculentas 1","Suculentas 2","Super Heroes","Toy Story","Tortuga",
  "Turquesa","UP","Verde Limon","Verde Oscuro","Zootopia","LAMINADO...","ENVIO...","FALTA..."
];

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// ==========================================
// 2. UTILIDADES GLOBALES
// ==========================================

const Utils = {
  currency: (v) => `C ${(v || 0).toLocaleString()}`, 
  formatPhone: (val) => {
    const d = val.replace(/\D/g, '').substring(0, 8);
    return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
  },
  capitalize: (str) => {
    const clean = str.replace(/[0-9]/g, ''); 
    return clean.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  },
  validateName: (str) => {
    const words = str.trim().split(/\s+/).filter(w => w.length > 0);
    const hasNumbers = /\d/.test(str);
    return words.length >= 3 && !hasNumbers;
  },
  generateId: () => `ALK-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
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
  },
  getThemeColorClass: (tema) => {
    if (tema === "LAMINADO...") return "bg-blue-50 border-blue-200 text-blue-600";
    if (tema === "ENVIO...") return "bg-green-50 border-green-200 text-green-600";
    if (tema === "FALTA...") return "bg-red-50 border-red-200 text-red-600";
    return "bg-white border-slate-100 focus:border-[#8ED4BE]";
  }
};

// ==========================================
// 3. COMPONENTES COMPARTIDOS
// ==========================================

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTo(0, 0);
    else window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const StatCard = ({ icon, label, val, borderColor, isClient }) => (
  <div className={`bg-white p-8 rounded-[3rem] shadow-xl border-b-[10px] ${borderColor} transition-transform hover:scale-[1.02]`}>
    <div className="mb-4 opacity-40">{icon}</div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
    <h4 className={`font-black italic uppercase leading-tight ${isClient ? 'text-sm lg:text-md text-slate-800' : 'text-2xl text-slate-900'}`}>
      {val}
    </h4>
  </div>
);

const QuantityControls = ({ value, onChange, colorClass = "bg-white", textClass = "text-slate-800" }) => (
  <div className="flex items-center gap-1 min-w-[100px] justify-center">
    <input type="number" className={`w-14 h-12 border-2 rounded-xl font-black text-center outline-none transition-all focus:border-cyan-400 ${colorClass} ${textClass}`} value={value} onChange={(e) => { const v = parseInt(e.target.value) || 0; onChange(Math.max(0, Math.min(99, v))); }} />
    <div className="flex flex-col gap-0.5"><button onClick={() => onChange(Math.min(99, value + 1))} className="p-1.5 bg-cyan-100 rounded-md text-cyan-600"><ChevronUp size={16}/></button><button onClick={() => onChange(Math.max(0, value - 1))} className="p-1.5 bg-cyan-100 rounded-md text-cyan-600"><ChevronDown size={16}/></button></div>
  </div>
);

const exportToPDF = async (venta) => {
  const doc = new jsPDF();
  const logo = await Utils.getBase64(logoAlekey);
  doc.setFillColor(245, 247, 250); doc.rect(0, 0, 210, 50, 'F');
  doc.addImage(logo, 'JPEG', 155, 5, 40, 40);
  doc.setFont("helvetica", "bold"); doc.setFontSize(30); doc.setTextColor(30, 41, 59); doc.text("FACTURA", 15, 25);
  doc.setFontSize(10); doc.setTextColor(100); doc.text("ORDEN: " + venta.id, 15, 35); doc.text("FECHA: " + venta.fecha, 15, 42);
  doc.setFontSize(11); doc.setTextColor(40); doc.text("Isabel Viquez Fernandez", 15, 65);
  doc.setFont("helvetica", "normal"); doc.text("San Joaquín de Flores", 15, 71);
  doc.setFont("helvetica", "bold"); doc.text("CLIENTE:", 110, 65);
  doc.setFont("helvetica", "normal"); doc.text(venta.nombre, 110, 71); doc.text("Tel: " + venta.telefono, 110, 77); doc.text("Lugar: " + venta.direccion, 110, 83);
  const tableRows = venta.items.map(i => [i.cant, i.cat + " - " + i.tema, "C " + (i.precio || 0).toLocaleString(), "C " + (i.cant * i.precio).toLocaleString(), i.pendiente > 0 ? i.pendiente : "Entregado"]);
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
  const [sortFlujo, setSortFlujo] = useState('recientes');

  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) mainContent.scrollTo(0, 0);
  }, [view]);

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
    const dataBarras = ventas.slice(0, 10).reverse().map(v => ({ name: v.nombre.split(' ')[0], monto: v.total }));
    
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
    <div className="p-4 lg:p-10 max-w-5xl mx-auto pb-32 animate-in slide-in-from-left duration-300 text-slate-800">
      <button onClick={() => setView('general')} className="mb-8 flex items-center gap-2 font-black uppercase text-xs text-[#8ED4BE] hover:scale-105 transition-all"><Plus className="rotate-45" size={20}/> Volver Atrás</button>
      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl">
        <h2 className="text-3xl font-black italic uppercase mb-10">Todos los Temas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{stats.allTemas.map(([tema, cant], i) => (<div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl"><span className="font-black italic text-slate-200 text-2xl"># {i+1}</span><span className="font-bold uppercase text-[10px] text-slate-600">{tema}</span><span className="font-black text-slate-800 text-xs">{cant} pzs</span></div>))}</div>
      </div>
    </div>
  );

  if (view === 'flujo') return (
    <div className="p-4 lg:p-10 max-w-5xl mx-auto pb-32 animate-in slide-in-from-left duration-300 text-slate-800">
      <button onClick={() => setView('general')} className="mb-8 flex items-center gap-2 font-black uppercase text-xs text-[#8ED4BE] hover:scale-105 transition-all"><Plus className="rotate-45" size={20}/> Volver Atrás</button>
      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Lista de Clientes</h2>
          <select value={sortFlujo} onChange={(e) => setSortFlujo(e.target.value)} className="p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase outline-none shadow-sm cursor-pointer border-2 border-transparent focus:border-[#8ED4BE] transition-all">
            <option value="recientes">Más Recientes</option>
            <option value="top">Top Clientes (Ventas)</option>
          </select>
        </div>
        <div className="space-y-4">
          {stats.listaFlujo.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] border-l-8 border-[#8ED4BE]">
              <div><h4 className="font-black italic uppercase text-slate-800">{c.nombre}</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.tel} • {c.fecha}</p></div>
              <span className="font-black text-xl text-[#8ED4BE]">{Utils.currency(c.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (view === 'categorias') return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32 animate-in slide-in-from-left duration-300 text-slate-800">
      <button onClick={() => setView('general')} className="mb-8 flex items-center gap-2 font-black uppercase text-xs text-[#8ED4BE] hover:scale-105 transition-all"><Plus className="rotate-45" size={20}/> Volver Atrás</button>
      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl">
        <h2 className="text-3xl font-black italic uppercase mb-10 tracking-tighter">Ranking Categorías</h2>
        <div className="space-y-10">{stats.allCategorias.map(([cat, data], i) => (<div key={i} className="bg-slate-50 rounded-[3rem] p-8 border-l-[15px] border-[#F79598]"><div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-200 pb-4 gap-4"><div className="flex items-center gap-6"><span className="font-black italic text-5xl text-slate-200"># {i+1}</span><span className="font-black uppercase text-xl sm:text-2xl text-slate-700 tracking-tighter leading-tight">{cat}</span></div><span className="font-black text-xl sm:text-3xl text-slate-800">{data.total} <span className="text-sm opacity-30 italic">pzs</span></span></div><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{Object.entries(data.temas).sort((a,b)=>b[1]-a[1]).map(([tema, c]) => (<div key={tema} className="flex flex-col justify-center bg-white/60 p-4 rounded-2xl border border-white min-h-[60px]"><span className="font-bold uppercase text-[9px] text-slate-500 tracking-wider leading-tight mb-1 truncate">{tema}</span><span className="font-black text-[11px] text-[#F79598]">{c} pzs</span></div>))}</div></div>))}</div>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32 animate-in fade-in duration-500 text-slate-800">
      <header className="mb-10 text-center lg:text-left"><h2 className="text-4xl font-black italic uppercase tracking-tighter">Métricas Alekey<span className="text-[#8ED4BE]">.</span></h2></header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<TrendingUp size={24} className="text-[#8ED4BE]"/>} label="Ingresos" val={Utils.currency(stats.totalDinero)} borderColor="border-[#8ED4BE]"/>
        <StatCard icon={<AlertCircle size={24} className="text-[#F79598]"/>} label="Pendientes" val={stats.totalPendientes} borderColor="border-[#F79598]"/>
        <StatCard icon={<Package size={24} className="text-[#C0C976]"/>} label="Piezas" val={stats.piezasTotales} borderColor="border-[#C0C976]"/>
        <StatCard icon={<User size={24} className="text-slate-800"/>} label="Top Cliente" val={stats.listaFlujo.sort((a,b)=>b.total-a.total)[0]?.nombre || 'N/A'} borderColor="border-slate-800" isClient/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50"><div className="flex justify-between items-center mb-8"><h4 className="font-black italic uppercase text-xs flex items-center gap-2 text-slate-400"><Trophy size={16} className="text-[#C0C976]"/> Ranking de Temas</h4><button onClick={() => setView('temas')} className="bg-slate-50 px-3 py-1.5 rounded-full font-black text-[9px] uppercase text-slate-400 hover:bg-[#C0C976] hover:text-white transition-all shadow-sm">Ver más</button></div><div className="space-y-4">{stats.topTemas.map(([tema, cant], i) => (<div key={i} className="flex items-center justify-between group"><div className="flex items-center gap-4"><span className="font-black italic text-slate-200 text-2xl group-hover:text-[#C0C976] transition-colors"># {i+1}</span><span className="font-bold uppercase text-[10px] text-slate-600 tracking-wider">{tema}</span></div><span className="font-black text-slate-800 text-xs">{cant} pzs</span></div>))}</div></div>
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 text-center"><div className="flex justify-between items-center mb-8"><h4 className="font-black italic uppercase text-xs text-slate-400">Flujo de Dinero (Últimas 10)</h4><button onClick={() => setView('flujo')} className="bg-slate-50 px-3 py-1.5 rounded-full font-black text-[9px] uppercase text-slate-400 hover:bg-[#8ED4BE] hover:text-white transition-all shadow-sm">Ver</button></div><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.dataBarras}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'black', fill: '#cbd5e1'}} /><Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} formatter={(v) => Utils.currency(v)} /><Bar dataKey="monto" fill="#8ED4BE" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 text-center lg:text-left"><div className="flex justify-between items-center mb-8"><h4 className="font-black italic uppercase text-xs flex items-center gap-2 text-slate-400"><Star size={16} className="text-[#F79598]"/> Ranking de Categorías</h4><button onClick={() => setView('categorias')} className="bg-slate-50 px-3 py-1.5 rounded-full font-black text-[9px] uppercase text-slate-400 hover:bg-[#F79598] hover:text-white transition-all shadow-sm">Ver más</button></div><div className="space-y-4">{stats.topCategorias.map(([cat, data], i) => (<div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all"><div className="flex items-center gap-3"><span className="font-black italic text-slate-300 transition-colors group-hover:text-[#F79598]"># {i+1}</span><span className="font-bold uppercase text-[10px] text-slate-700">{cat}</span></div><span className="font-black bg-[#F79598]/10 text-[#F79598] px-3 py-1 rounded-full text-[10px]">{data.total} pzs</span></div>))}</div></div>
      </div>
    </div>
  );
};

// ==========================================
// 5. COMPONENTE VENTAS
// ==========================================

const HistorialVentas = ({ ventas, onDelete, onUpdate }) => {
  const [mode, setMode] = useState('normal'); 
  const [filtro, setFiltro] = useState('');
  const [editId, setEditId] = useState(null);
  const [editCache, setEditCache] = useState(null);
  const [carpetas, setCarpetas] = useState([]);
  const [folderView, setFolderView] = useState(null);

  useEffect(() => { obtenerCarpetas(); }, []);
  const obtenerCarpetas = async () => { const { data } = await supabase.from('carpetas_centros').select('*'); if (data) setCarpetas(data); };
  
  const crearCarpeta = async () => {
    const { value: nombre } = await Swal.fire({ title: 'Nuevo Centro Educativo', input: 'text', inputPlaceholder: 'Ej: Escuelita 2026', showCancelButton: true, confirmButtonColor: '#8ED4BE' });
    if (nombre) { const { data } = await supabase.from('carpetas_centros').insert([{ nombre, ids_ventas: [] }]).select(); if (data) setCarpetas([...carpetas, data[0]]); }
  };

  const eliminarCarpeta = async (id, nombre) => {
    const result = await Swal.fire({ title: `¿Eliminar "${nombre}"?`, text: "No se borrarán los pedidos.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#F79598' });
    if (result.isConfirmed) { await supabase.from('carpetas_centros').delete().eq('id', id); obtenerCarpetas(); setFolderView(null); }
  };

  const agregarACarpeta = async (ventaId) => {
    if (!carpetas.length) return Swal.fire('Error', 'Primero crea una carpeta', 'error');
    const { value: folderId } = await Swal.fire({ title: 'Seleccionar Carpeta', input: 'select', inputOptions: Object.fromEntries(carpetas.map(c => [c.id, c.nombre])), showCancelButton: true });
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
          if (field === 'cant') { const v = Math.max(1, value); return { ...item, cant: v, pendiente: v }; }
          if (field === 'pendiente') return { ...item, pendiente: Math.max(0, Math.min(item.cant, value)) };
          if (field === 'cat') return { ...item, cat: value, precio: PRODUCTOS_PRECIOS[value] || 0 };
          return { ...item, [field]: value };
        }
        return item;
      });
      return { ...prev, items: updatedItems, total: updatedItems.reduce((s, i) => s + (i.cant * i.precio), 0) };
    });
  };

  const groupVentasByMonth = () => {
    const groups = {};
    ventas.forEach(v => {
      const parts = v.fecha.split('/'); const mesIndex = parseInt(parts[1]) - 1; const nombreMes = MESES[mesIndex] || "Otros";
      if (!groups[nombreMes]) groups[nombreMes] = []; groups[nombreMes].push(v);
    });
    return groups;
  };

  const renderVentaCard = (v, inFolder = false) => {
    const editing = editId === v.id;
    const data = editing ? editCache : v;
    const tienePendientes = data.items.some(i => i.pendiente > 0);
    const [provActual, cantActual] = (data.direccion || "").split(', ');
    const editValido = Utils.validateName(data.nombre || "") && (data.telefono || "").replace(/\D/g, '').length === 8;

    return (
      <div key={v.id} className={`bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-xl border-l-[12px] transition-all duration-500 ${tienePendientes ? 'border-red-400' : 'border-[#8ED4BE]'}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 mr-4">
            {editing ? (
              <div className="space-y-4">
                <input className={`text-2xl font-black italic border-b-2 outline-none w-full bg-slate-50 p-2 ${!Utils.validateName(data.nombre) ? 'border-red-300' : 'border-[#8ED4BE]'}`} value={data.nombre} onChange={e => setEditCache({...editCache, nombre: Utils.capitalize(e.target.value)})} />
                <div className="flex flex-wrap gap-3">
                   <input className="text-sm font-bold border-b outline-none w-32 bg-transparent" value={data.telefono} onChange={e => setEditCache({...editCache, telefono: Utils.formatPhone(e.target.value)})} />
                   <select className="text-sm font-bold border-b outline-none bg-transparent" value={provActual || ""} onChange={e => setEditCache({...editCache, direccion: `${e.target.value}, `})}>{Object.keys(UBICACIONES_CR).map(p => <option key={p} value={p}>{p}</option>)}</select>
                   <select className="text-sm font-bold border-b outline-none bg-transparent" value={cantActual || ""} onChange={e => setEditCache({...editCache, direccion: `${provActual}, ${e.target.value}`})}>{provActual && UBICACIONES_CR[provActual]?.map(c => <option key={c} value={c}>{c}</option>)}</select>
                </div>
              </div>
            ) : (<><h3 className="text-2xl font-black italic">{data.nombre}</h3><p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{data.fecha} • {data.telefono} • {data.direccion}</p></>)}
          </div>
          <div className="flex gap-2">
            {editing ? <button disabled={!editValido} onClick={() => {onUpdate(v.id, editCache); setEditId(null);}} className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg active:scale-95"><Check size={24}/></button> : <button onClick={() => {setEditId(v.id); setEditCache(JSON.parse(JSON.stringify(v)));}} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all"><Edit2 size={20}/></button>}
            {!editing && inFolder ? <button onClick={() => deseleccionarDeCarpeta(v.id, folderView)} className="p-4 bg-orange-50 text-orange-500 rounded-2xl hover:bg-orange-500 hover:text-white transition-all"><FolderMinus size={20}/></button> : !editing && <button onClick={() => agregarACarpeta(v.id)} className="p-4 bg-purple-50 text-purple-500 rounded-2xl hover:bg-purple-500 hover:text-white transition-all"><FolderPlus size={20}/></button>}
            <button disabled={editing} onClick={() => exportToPDF(v)} className={`p-4 bg-blue-50 text-blue-500 rounded-2xl ${editing ? 'hidden' : 'hover:bg-blue-600 hover:text-white'}`}><Printer size={20}/></button>
            <button disabled={editing} onClick={() => onDelete(v.id)} className={`p-4 bg-red-50 text-red-300 rounded-2xl ${editing ? 'hidden' : 'hover:bg-red-500 hover:text-white'}`}><Trash2 size={20}/></button>
          </div>
        </div>
        <div className="overflow-x-auto bg-slate-50/50 rounded-[2rem] p-4 lg:p-6 text-slate-800">
          <table className="w-full min-w-[700px]">
            <thead><tr className="text-left text-[10px] font-black text-slate-300 uppercase border-b pb-2"><th className="pb-2 w-[130px]">Cant.</th><th className="pb-2">Descripción*</th><th className="pb-2 text-center w-[130px]">Pendientes</th><th className="pb-2 text-right">Subtotal</th><th className="w-10"></th></tr></thead>
            <tbody>
              {data.items.map(item => (
                <tr key={item.id}>
                  <td className="py-4">{editing ? <QuantityControls value={item.cant} onChange={(val) => handleEditItem(item.id, 'cant', val)} /> : <span className="font-black text-slate-600 ml-4">{item.cant}</span>}</td>
                  <td className="py-4 text-[11px] font-black uppercase">
                    {editing ? (
                      <div className="flex gap-2">
                        <input list="productos-list" className={`border-2 rounded p-1 w-1/2 ${item.cat === "OTROS..." ? 'text-purple-600 border-purple-200' : ''}`} value={item.cat} onChange={e => handleEditItem(item.id, 'cat', e.target.value)} />
                        <input list="temas-list" className="border-2 rounded p-1 w-1/2" value={item.tema} onChange={e => handleEditItem(item.id, 'tema', e.target.value)} />
                      </div>
                    ) : `${item.cat} - ${item.tema}`}
                  </td>
                  <td className="py-4"><div className="flex justify-center">{editing ? <QuantityControls value={item.pendiente} colorClass="bg-red-50" textClass="text-red-500" onChange={(val) => handleEditItem(item.id, 'pendiente', val)} /> : <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${item.pendiente > 0 ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'}`}>{item.pendiente > 0 ? item.pendiente : 'Entregado'}</span>}</div></td>
                  <td className="py-4 text-right font-black">
                    {editing && item.cat === "OTROS..." ? (
                       <input type="number" className="w-24 text-right border rounded p-1 text-purple-600" value={item.precio} onChange={e => handleEditItem(item.id, 'precio', parseInt(e.target.value) || 0)} />
                    ) : Utils.currency(item.cant * item.precio)}
                  </td>
                  <td>{editing && <button onClick={() => setEditCache({...editCache, items: editCache.items.filter(i => i.id !== item.id)})} className="text-red-300 ml-2"><Trash2 size={16}/></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editing && <button onClick={() => setEditCache({...editCache, items: [...editCache.items, { id: Utils.generateId(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 1 }]})} className="mt-4 px-4 py-2 border-2 border-dashed border-emerald-200 text-emerald-500 font-black rounded-xl text-[10px] uppercase">+ Agregar Producto Extra</button>}
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32 text-slate-800">
      <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-4">{folderView && <button onClick={() => setFolderView(null)} className="p-3 bg-white rounded-full shadow-md"><ArrowLeft size={20}/></button>}<h2 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter">{folderView ? folderView.nombre : (mode === 'normal' ? 'Historial' : mode === 'folders' ? 'Centros' : 'Por Meses')}</h2>{folderView && <button onClick={() => eliminarCarpeta(folderView.id, folderView.nombre)} className="p-3 bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>}</div>
        <div className="flex flex-wrap gap-2">
           <button onClick={() => {setMode('normal'); setFolderView(null);}} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${mode === 'normal' ? 'bg-[#8ED4BE] text-white shadow-lg' : 'bg-white text-slate-400 shadow-sm'}`}>Listado</button>
           <button onClick={() => {setMode('folders'); setFolderView(null);}} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${mode === 'folders' ? 'bg-purple-400 text-white shadow-lg' : 'bg-white text-slate-400 shadow-sm'}`}>Centros</button>
           <button onClick={() => {setMode('months'); setFolderView(null);}} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${mode === 'months' ? 'bg-orange-400 text-white shadow-lg' : 'bg-white text-slate-400 shadow-sm'}`}>Meses</button>
        </div>
      </header>
      {mode === 'normal' && !folderView && (<div className="space-y-8 animate-in fade-in"><div className="relative w-full max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/><input className="w-full pl-12 pr-6 py-4 bg-white rounded-[2rem] shadow-sm font-bold outline-none focus:border-[#8ED4BE] border-2 border-transparent" placeholder="Buscar cliente..." onChange={e => setFiltro(e.target.value)} /></div>{ventas.filter(v => v.nombre.toLowerCase().includes(filtro.toLowerCase()) || v.telefono.includes(filtro)).map(v => renderVentaCard(v, false))}</div>)}
      {mode === 'folders' && !folderView && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95"><button onClick={crearCarpeta} className="h-48 border-4 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 hover:border-purple-300 hover:text-purple-300 transition-all"><FolderPlus size={40} className="mb-2"/> <span className="font-black uppercase text-xs">Nuevo Centro</span></button>{carpetas.map(c => { const vF = ventas.filter(v => c.ids_ventas.includes(v.id)); return (<div key={c.id} onClick={() => setFolderView(c)} className="h-48 bg-white p-8 rounded-[3rem] shadow-xl border-b-8 border-purple-400 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all"><div className="flex justify-between items-start"><Folder className="text-purple-400" size={32}/><span className="font-black text-[9px] bg-purple-50 text-purple-500 px-3 py-1 rounded-full uppercase">{vF.length} Pedidos</span></div><div><h4 className="font-black italic uppercase text-lg leading-tight truncate">{c.nombre}</h4><p className="font-black text-purple-600 mt-1">{Utils.currency(vF.reduce((s,v)=>s+v.total,0))}</p></div></div>);})}</div>)}
      {folderView && <div className="space-y-8 animate-in slide-in-from-bottom-4">{ventas.filter(v => folderView.ids_ventas.includes(v.id)).map(v => renderVentaCard(v, true))}</div>}
      {mode === 'months' && (<div className="space-y-12">{Object.entries(groupVentasByMonth()).map(([mes, lista]) => (<div key={mes}><div className="flex items-center gap-4 mb-6"><Calendar className="text-orange-400" size={24}/><h3 className="text-2xl font-black italic uppercase text-slate-600">{mes}</h3><div className="h-[2px] flex-1 bg-slate-100"></div><span className="bg-orange-50 text-orange-500 font-black text-xs px-4 py-2 rounded-full">{Utils.currency(lista.reduce((s,v)=>s+v.total,0))}</span></div><div className="space-y-6">{lista.map(v => renderVentaCard(v, false))}</div></div>))}</div>)}
    </div>
  );
};

// ==========================================
// 6. FORMULARIO COTIZACIÓN E INICIO
// ==========================================

const FormularioCotizacion = ({ alGuardar }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nombre: '', telefono: '', provincia: '', canton: '', items: [{ id: Utils.generateId(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 1 }] });
  const total = formData.items.reduce((s, i) => s + (i.cant * i.precio), 0);
  const nombreValido = Utils.validateName(formData.nombre);
  const telefonoValido = formData.telefono.replace(/\D/g, '').length === 8;
  const formularioValido = nombreValido && telefonoValido && formData.provincia !== '' && formData.canton !== '' && formData.items.every(i => i.cat !== '' && i.tema !== '');

  const handleUpdate = (id, field, value) => {
    setFormData(prev => ({ ...prev, items: prev.items.map(item => {
      if (item.id === id) {
        if (field === 'cant') { const v = Math.max(1, value); return { ...item, cant: v, pendiente: v }; }
        if (field === 'pendiente') return { ...item, pendiente: Math.max(0, Math.min(item.cant, value)) };
        if (field === 'cat') return { ...item, cat: value, precio: PRODUCTOS_PRECIOS[value] || 0 };
        return { ...item, [field]: value };
      }
      return item;
    })}));
  };

  const ejecutarGuardado = async () => {
    const nuevaVenta = { id: Utils.generateId(), nombre: formData.nombre, telefono: formData.telefono, direccion: `${formData.provincia}, ${formData.canton}`, fecha: new Date().toLocaleDateString('es-CR'), total: total, items: formData.items };
    await alGuardar(nuevaVenta);
    navigate('/ventas');
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32 text-slate-800">
      <div className="bg-white rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 shadow-2xl">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-10"><h2 className="text-3xl lg:text-4xl font-black italic text-slate-800 uppercase">Cotizar Nuevo</h2><h3 className="text-3xl lg:text-5xl font-black italic text-[#BCC962]">{Utils.currency(total)}</h3></header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 text-slate-800">
          <div className="space-y-4">
            <input className={`w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 outline-none transition-all ${formData.nombre && !nombreValido ? 'border-red-200' : 'border-transparent focus:border-[#8ED4BE]'}`} placeholder="Nombre + 2 Apellidos" value={formData.nombre} onChange={e => setFormData({...formData, nombre: Utils.capitalize(e.target.value)})} />
            <input className={`w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 outline-none transition-all ${formData.telefono && !telefonoValido ? 'border-red-200' : 'border-transparent focus:border-[#8ED4BE]'}`} placeholder="Teléfono 0000-0000" value={formData.telefono} onChange={e => setFormData({...formData, telefono: Utils.formatPhone(e.target.value)})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select className="p-5 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-[#8ED4BE] outline-none" value={formData.provincia} onChange={e => setFormData({...formData, provincia: e.target.value, canton: ''})}><option value="">Provincia...</option>{Object.keys(UBICACIONES_CR).map(p => <option key={p} value={p}>{p}</option>)}</select>
            {formData.provincia && <select className="p-5 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-[#8ED4BE] outline-none" value={formData.canton} onChange={e => setFormData({...formData, canton: e.target.value})}><option value="">Cantón...</option>{UBICACIONES_CR[formData.provincia].map(c => <option key={c} value={c}>{c}</option>)}</select>}
          </div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead><tr className="text-left text-[11px] font-black text-slate-300 uppercase border-b pb-4"><th>Cant.</th><th>Categoría*</th><th>Tema*</th><th className="text-center">Pnd.</th><th className="text-right">Subtotal</th><th></th></tr></thead><tbody>{formData.items.map(item => (<tr key={item.id} className="border-b border-slate-50"><td className="py-4"><QuantityControls value={item.cant} onChange={(v) => handleUpdate(item.id, 'cant', v)} /></td><td className="py-4 px-2"><input list="productos-list" className={`w-full p-4 border-2 rounded-xl font-bold outline-none transition-all ${item.cat === "OTROS..." ? 'border-purple-300 text-purple-600 bg-purple-50' : 'bg-white border-slate-100 focus:border-[#8ED4BE]'}`} value={item.cat} placeholder="Seleccione..." onChange={e => handleUpdate(item.id, 'cat', e.target.value)} /></td><td className="py-4 px-2"><input list="temas-list" className={`w-full p-4 border-2 rounded-xl font-bold outline-none transition-all ${Utils.getThemeColorClass(item.tema)}`} value={item.tema} placeholder="Tema..." onChange={e => handleUpdate(item.id, 'tema', e.target.value)} /></td><td className="py-4"><QuantityControls value={item.pendiente} colorClass="bg-red-50" textClass="text-red-500" onChange={(v) => handleUpdate(item.id, 'pendiente', v)} /></td><td className="py-4 px-2 text-right font-black">{item.cat === "OTROS..." ? (<div className="flex items-center justify-end gap-1"><span className="text-purple-600 italic text-[10px]">C</span><input type="number" className="bg-purple-50 border-2 border-purple-200 rounded-lg p-2 w-28 text-right outline-none text-purple-600" value={item.precio} onChange={e => handleUpdate(item.id, 'precio', parseInt(e.target.value) || 0)} /></div>) : Utils.currency(item.cant * item.precio)}</td><td className="py-4 text-center"><button onClick={() => setFormData({...formData, items: formData.items.filter(i => i.id !== item.id)})} className="text-red-300 hover:text-red-500"><Trash2 size={22}/></button></td></tr>))}</tbody></table></div>
        <button onClick={() => setFormData({...formData, items: [...formData.items, {id: Utils.generateId(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 1}]})} className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-transform active:scale-95"><Plus size={16}/> Agregar Línea</button>
        <div className="mt-10 flex flex-col items-end gap-3">{!formularioValido && <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest italic animate-pulse">* Complete campos requeridos</p>}<button disabled={!formularioValido} onClick={ejecutarGuardado} className="px-16 py-5 bg-[#8ED4BE] text-white font-black text-xl rounded-3xl shadow-2xl disabled:opacity-20 transition-all hover:scale-105 active:scale-95">Guardar Pedido</button></div>
      </div>
      <datalist id="productos-list">{Object.keys(PRODUCTOS_PRECIOS).map(p => <option key={p} value={p} />)}</datalist>
      <datalist id="temas-list">{TEMAS_PREDEFINIDOS.map(t => <option key={t} value={t} />)}</datalist>
    </div>
  );
};

const DashboardHome = ({ historial }) => {
  const stats = useMemo(() => {
    const ing = historial.reduce((a, v) => a + (v.total || 0), 0);
    const pnd = historial.reduce((a, v) => a + (v.items?.reduce((s, i) => s + (i.pendiente || 0), 0) || 0), 0);
    return { ing, pnd, total: historial.length };
  }, [historial]);
  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto pb-32 text-slate-800">
      <header className="mb-16 text-center lg:text-left"><h1 className="text-5xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.9]">Panel<br/><span className="text-[#8ED4BE]">Alekey.</span></h1></header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        <div className="bg-[#8ED4BE] p-10 rounded-[3rem] text-white shadow-2xl flex flex-col justify-center transition-transform hover:scale-105 min-h-[220px]"><p className="text-xs font-black uppercase mb-3 opacity-80">Ingresos Totales</p><h3 className="text-4xl lg:text-5xl font-black italic leading-none truncate">{Utils.currency(stats.ing)}</h3></div>
        <div className="bg-[#F79598] p-10 rounded-[3rem] text-white shadow-2xl flex flex-col justify-center transition-transform hover:scale-105 min-h-[220px]"><p className="text-xs font-black uppercase mb-3 opacity-80">Pendientes</p><h3 className="text-4xl lg:text-6xl font-black italic leading-none">{stats.pnd} <span className="text-2xl opacity-60">Pzs</span></h3></div>
        <div className="bg-[#C0C976] p-10 rounded-[3rem] text-white shadow-2xl flex flex-col justify-center transition-transform hover:scale-105 min-h-[220px]"><p className="text-xs font-black uppercase mb-3 opacity-80">Órdenes</p><h3 className="text-4xl lg:text-6xl font-black italic leading-none">{stats.total}</h3></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><Link to="/cotizar" className="p-10 bg-white rounded-[3rem] flex items-center justify-between border-4 border-slate-50 hover:border-[#8ED4BE] transition-all shadow-xl group"><div><h4 className="text-3xl font-black italic uppercase">Cotizar</h4><p className="text-xs font-bold opacity-40 uppercase">Nuevo Pedido</p></div><Plus size={32} className="group-hover:rotate-90 transition-all text-[#8ED4BE]"/></Link><Link to="/ventas" className="p-10 bg-white rounded-[3rem] flex items-center justify-between border-4 border-slate-50 hover:border-[#F79598] transition-all shadow-xl group"><div><h4 className="text-3xl font-black italic uppercase">Ventas</h4><p className="text-xs font-bold opacity-40 uppercase">Historial</p></div><ShoppingBag size={32} className="group-hover:scale-110 transition-all text-[#F79598]"/></Link></div>
    </div>
  );
};

// ==========================================
// 7. APP PRINCIPAL
// ==========================================

export default function App() {
  const [ventas, setVentas] = useState([]);
  useEffect(() => { const f = async () => { const { data } = await supabase.from('ventas').select('*').order('created_at', { ascending: false }); if (data) setVentas(data); }; f(); }, []);
  const alGuardarEnNube = async (nv) => { const { data, error } = await supabase.from('ventas').insert([nv]).select(); if (!error && data) setVentas([data[0], ...ventas]); };
  const alEliminar = async (id) => { Swal.fire({ title: '¿Eliminar?', icon: 'warning', showCancelButton: true }).then(async r => { if (r.isConfirmed) { await supabase.from('ventas').delete().eq('id', id); setVentas(ventas.filter(v => v.id !== id)); } }); };
  const alActualizar = async (id, va) => { const { created_at, ...ud } = va; await supabase.from('ventas').update(ud).eq('id', id); setVentas(ventas.map(v => v.id === id ? va : v)); };

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col lg:flex-row h-screen bg-[#F8FAFC] overflow-hidden">
        <aside className="fixed bottom-0 left-0 w-full lg:relative lg:w-80 bg-white border-t lg:border-r p-4 lg:p-12 flex flex-row lg:flex-col justify-between z-50 shadow-xl">
          <div className="flex lg:flex-col items-center lg:items-start justify-between w-full lg:space-y-16"><div className="hidden lg:block text-4xl font-black italic text-slate-800 tracking-tighter">ALEKEY<span className="text-[#8ED4BE]">.</span></div><nav className="flex flex-row lg:flex-col gap-1 lg:gap-4 w-full justify-around lg:justify-start"><NavLink to="/" icon={<Home size={20}/>} label="Inicio" /><NavLink to="/cotizar" icon={<Plus size={20}/>} label="Cotizar" /><NavLink to="/ventas" icon={<ShoppingBag size={20}/>} label="Ventas" /><NavLink to="/stats" icon={<BarChart3 size={20}/>} label="Stats" /></nav></div><div className="hidden lg:flex p-6 bg-slate-900 rounded-[2rem] text-white items-center gap-4 italic font-black text-xs shadow-xl"><div className="w-8 h-8 bg-[#8ED4BE] rounded-xl flex items-center justify-center font-bold text-slate-800">IV</div> Admin Alekey</div>
        </aside>
        <main className="flex-1 overflow-y-auto bg-slate-50/30">
          <Routes>
            <Route path="/" element={<DashboardHome historial={ventas} />} />
            <Route path="/cotizar" element={<FormularioCotizacion alGuardar={alGuardarEnNube} />} />
            <Route path="/ventas" element={<HistorialVentas ventas={ventas} onDelete={alEliminar} onUpdate={alActualizar} />} />
            <Route path="/stats" element={<Estadisticas ventas={ventas} />} />
          </Routes>
        </main>
      </div>
      <datalist id="productos-list">{Object.keys(PRODUCTOS_PRECIOS).map(p => <option key={p} value={p} />)}</datalist>
      <datalist id="temas-list">{TEMAS_PREDEFINIDOS.map(t => <option key={t} value={t} />)}</datalist>
    </Router>
  );
}

const NavLink = ({ to, icon, label }) => {
  const active = useLocation().pathname === to;
  return (<Link to={to} className={`flex flex-col lg:flex-row items-center gap-1.5 lg:gap-6 p-2 lg:p-5 rounded-xl lg:rounded-[2rem] transition-all font-black italic uppercase text-[10px] lg:text-xs flex-1 lg:flex-none ${active ? 'bg-[#8ED4BE] text-white shadow-xl scale-105' : 'text-slate-300'}`}>{icon} <span className="lg:inline">{label}</span></Link>);
};