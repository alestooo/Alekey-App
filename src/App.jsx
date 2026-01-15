import { supabase } from './supabaseClient';
import Swal from 'sweetalert2';
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 
import { 
  Plus, Trash2, Home, ShoppingBag, Printer, Edit2, Check, Search,
  ChevronUp, ChevronDown, BarChart3, User, Package, Clock, TrendingUp,
  AlertCircle, MapPin, Star, Trophy
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
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
  "Laminario 6": 2750, "Laminario 7": 3150, "Laminario 8": 3500, "MR-2": 2500,
  "MR-6": 6500, "MR-8": 8000, "Nombres": 1500, "Pasafecha": 12500, "Pasalista": 5500, "Puerta": 1500, "Puerta grande": 2500,
  "Rótulo 60 cm": 2750, "Tablas": 2000, "Velcro": 1250, "OTROS...": 0
};

const TEMAS_PREDEFINIDOS = [
  "Abeja Acuarela",
  "Abeja Cute",
  "Abeja Spelling",
  "Alicia",
  "Amarillo",
  "Arcoiris",
  "Arcoliris Pastel",
  "Autismo",
  "Avenger",
  "Azul",
  "Be Happy",
  "Bosque",
  "Bosque Acuarela",
  "Bosque CR",
  "Búho",
  "Caballito de mar",
  "Cactus",
  "Campamento",
  "Cangrejo",
  "Capibara",
  "Celeste",
  "Chimuelos",
  "Circo",
  "Circo 1",
  "Circo 2",
  "Colores arcoiris",
  "Colores arcoiris cafe",
  "Colores arcoiris navidad",
  "Colores arcoiris pastel",
  "Confeti café",
  "Confeti colores",
  "Confeti negro",
  "Crayola",
  "Crayola Niños",
  "Crayola Pastel",
  "Cumpleaños",
  "Deporte",
  "Dino Baby",
  "Dinosaurio",
  "Elefante",
  "Escolar",
  "Espacio",
  "Espacio Azul",
  "Espantapajaros",
  "Feria Cientifica",
  "Flor café",
  "Fucsia",
  "Gato",
  "Granja 1",
  "Granja 2",
  "Granja Acuarela",
  "Granja New",
  "Granjeros",
  "Harry Potter",
  "Insectos",
  "Intensamente",
  "Jirafa",
  "Kirby",
  "Koala",
  "Leones",
  "Leones Pareja",
  "Llama",
  "Mar",
  "Mar fondo blanco",
  "Mar New",
  "Margarita",
  "Mario Bros",
  "Mariquita",
  "Mariquita Educlip",
  "Mariquita insecto",
  "Medio Ambiente",
  "Melonheadz",
  "Menta",
  "Mickey",
  "Mickey Safari",
  "Mono",
  "Monster Inc",
  "Monstruos 1",
  "Monstruos 2",
  "Monstruos 3",
  "Morado",
  "Música",
  "Naranja",
  "Navidad",
  "Negro",
  "Niños Corazón 1",
  "Niños Corazón 2",
  "Niños Jovenes",
  "OFERTA",
  "Oso Cariñoso",
  "Oso Miel",
  "Oso Sandia",
  "Oso Teddy",
  "Oso the Pond",
  "Pacman",
  "Pajaro Acuarela",
  "Pajaro Educlip",
  "Panda",
  "Panda Cute",
  "Patrio Desfile",
  "Patrio Niños Campesinos",
  "Perro",
  "Pingüino",
  "Pirata",
  "Pirata Meryta",
  "Plaza Sesamo",
  "Principito",
  "Puntos Amarillos",
  "Puntos Azul",
  "Puntos Celeste",
  "Puntos colores fondo blanco",
  "Puntos colores fondo negro",
  "Puntos Fucsia",
  "Puntos Naranja",
  "Puntos Negro",
  "Puntos Rainbow",
  "Puntos Rojo",
  "Puntos Rosado",
  "Puntos Turquesa",
  "Puntos Verde",
  "Rana",
  "Rana the Pond",
  "Raya Bullying",
  "Raya Café",
  "Raya Cumpleaños",
  "Robot 1",
  "Robot 2",
  "Robot 3",
  "Rojo",
  "Rombo",
  "Rompecabezas",
  "Rosado",
  "Safari",
  "Safari Cute",
  "San Valentin",
  "Selva",
  "Sloth",
  "Snoopy",
  "Snoopy colores",
  "Snoopy rojo",
  "Snoopy y amigos",
  "Spring",
  "Star Wars",
  "Stitch 1",
  "Stitch 2",
  "Suculentas 1",
  "Suculentas 2",
  "Super Heroes",
  "Toy Story",
  "Tortuga",
  "Turquesa",
  "UP",
  "Verde Limon",
  "Verde Oscuro",
  "Zootopia",
  "LAMINADO...",
  "ENVIO...",
  "FALTA..."
];

// ==========================================
// 2. UTILIDADES
// ==========================================

const Utils = {
  currency: (v) => `C ${(v || 0).toLocaleString()}`, 
  formatPhone: (val) => {
    const d = val.replace(/\D/g, '').substring(0, 8);
    return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
  },
  capitalize: (str) => {
    const clean = str.replace(/[0-9]/g, ''); 
    return clean.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
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
  // Nueva utilidad para colores de temas especiales
  getThemeColorClass: (tema) => {
    if (tema === "LAMINADO...") return "bg-blue-50 border-blue-200 text-blue-600";
    if (tema === "ENVIO...") return "bg-green-50 border-green-200 text-green-600";
    if (tema === "FALTA...") return "bg-red-50 border-red-200 text-red-600";
    return "bg-white border-slate-100 focus:border-[#8ED4BE]";
  }
};

const exportToPDF = async (venta) => {
  const doc = new jsPDF();
  const logo = await Utils.getBase64(logoAlekey);
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, 210, 50, 'F');
  doc.addImage(logo, 'JPEG', 155, 5, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30); doc.setTextColor(30, 41, 59);
  doc.text("FACTURA", 15, 25);
  doc.setFontSize(10); doc.setTextColor(100);
  doc.text("ORDEN: " + venta.id, 15, 35);
  doc.text("FECHA: " + venta.fecha, 15, 42);
  doc.setFontSize(11); doc.setTextColor(40);
  doc.text("Isabel Viquez Fernandez", 15, 65);
  doc.setFont("helvetica", "normal");
  doc.text("San Joaquín de Flores", 15, 71);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENTE:", 110, 65);
  doc.setFont("helvetica", "normal");
  doc.text(venta.nombre, 110, 71);
  doc.text("Tel: " + venta.telefono, 110, 77);
  doc.text("Lugar: " + venta.direccion, 110, 83);
  const tableRows = venta.items.map(i => [
    i.cant, i.cat + " - " + i.tema, "C " + (i.precio || 0).toLocaleString(), "C " + (i.cant * i.precio).toLocaleString(), i.pendiente > 0 ? i.pendiente : "Entregado"
  ]);
  autoTable(doc, { startY: 95, head: [['Cant.', 'Descripcion', 'Unitario', 'Subtotal', 'Pend.']], body: tableRows, headStyles: { fillColor: [142, 212, 190] } });
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14); doc.setFont("helvetica", "bold");
  doc.text("TOTAL FINAL: C " + (venta.total || 0).toLocaleString(), 195, finalY, { align: 'right' });
  doc.save(`Cotizacion_${venta.nombre}.pdf`);
};

// ==========================================
// 3. ESTADÍSTICAS
// ==========================================

const Estadisticas = ({ ventas }) => {
  const stats = useMemo(() => {
    if (!ventas.length) return null;
    const totalDinero = ventas.reduce((acc, v) => acc + (v.total || 0), 0);
    const piezasTotales = ventas.reduce((acc, v) => acc + v.items.reduce((s, i) => s + i.cant, 0), 0);
    const totalPendientes = ventas.reduce((acc, v) => acc + v.items.reduce((s, i) => s + i.pendiente, 0), 0);
    const productosMap = {};
    const temasMap = {};
    const clientesMap = {};
    ventas.forEach(v => {
      clientesMap[v.nombre] = (clientesMap[v.nombre] || 0) + (v.total || 0);
      v.items.forEach(item => {
        productosMap[item.cat] = (productosMap[item.cat] || 0) + item.cant;
        temasMap[item.tema] = (temasMap[item.tema] || 0) + item.cant;
      });
    });
    const topTemas = Object.entries(temasMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const topCategorias = Object.entries(productosMap).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const mejorCliente = Object.entries(clientesMap).sort((a,b) => b[1] - a[1])[0];
    const dataBarras = ventas.slice(0, 10).reverse().map(v => ({ name: v.nombre.split(' ')[0], monto: v.total }));
    return { totalDinero, piezasTotales, totalPendientes, topTemas, topCategorias, mejorCliente, dataBarras };
  }, [ventas]);

  if (!stats) return <div className="p-20 text-center font-black italic opacity-20 text-4xl uppercase">Cargando Datos...</div>;

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32 animate-in fade-in duration-500 text-slate-800">
      <header className="mb-10 text-center lg:text-left">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Métricas Alekey<span className="text-[#8ED4BE]">.</span></h2>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<TrendingUp size={24} className="text-[#8ED4BE]"/>} label="Ingresos" val={Utils.currency(stats.totalDinero)} borderColor="border-[#8ED4BE]"/>
        <StatCard icon={<AlertCircle size={24} className="text-[#F79598]"/>} label="Pendientes" val={stats.totalPendientes} borderColor="border-[#F79598]"/>
        <StatCard icon={<Package size={24} className="text-[#C0C976]"/>} label="Piezas" val={stats.piezasTotales} borderColor="border-[#C0C976]"/>
        <StatCard icon={<User size={24} className="text-slate-800"/>} label="Top Cliente" val={stats.mejorCliente?.[0] || 'N/A'} borderColor="border-slate-800" isClient/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50">
          <h4 className="font-black italic mb-8 uppercase text-xs flex items-center gap-2 text-slate-400"><Trophy size={16} className="text-[#C0C976]"/> Ranking de Temas</h4>
          <div className="space-y-4">
            {stats.topTemas.map(([tema, cant], i) => (
              <div key={tema} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="font-black italic text-slate-200 text-2xl group-hover:text-[#C0C976] transition-colors"># {i+1}</span>
                  <span className="font-bold uppercase text-[10px] text-slate-600 tracking-wider">{tema || "Sin Tema"}</span>
                </div>
                <span className="font-black text-slate-800 text-xs">{cant} pzs</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 text-center">
          <h4 className="font-black italic mb-8 uppercase text-xs text-slate-400">Flujo de Dinero (Últimas 10)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dataBarras}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'black', fill: '#cbd5e1'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} formatter={(v) => Utils.currency(v)} />
                <Bar dataKey="monto" fill="#8ED4BE" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 text-center lg:text-left">
          <h4 className="font-black italic mb-8 uppercase text-xs flex items-center gap-2 text-slate-400"><Star size={16} className="text-[#F79598]"/> Ranking de Categorías</h4>
          <div className="space-y-4">
            {stats.topCategorias.map(([cat, cant], i) => (
              <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <span className="font-black italic text-slate-300 transition-colors group-hover:text-[#F79598]"># {i+1}</span>
                  <span className="font-bold uppercase text-[10px] text-slate-700">{cat}</span>
                </div>
                <span className="font-black bg-[#F79598]/10 text-[#F79598] px-3 py-1 rounded-full text-[10px]">{cant} pzs</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, val, borderColor, isClient }) => (
  <div className={`bg-white p-8 rounded-[3rem] shadow-xl border-b-[10px] ${borderColor} transition-transform hover:scale-[1.02]`}>
    <div className="mb-4 opacity-40">{icon}</div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
    <h4 className={`font-black italic uppercase leading-tight ${isClient ? 'text-sm lg:text-md text-slate-800' : 'text-2xl text-slate-900'}`}>{val}</h4>
  </div>
);

// ==========================================
// 4. COMPONENTES INTERFAZ
// ==========================================

const QuantityControls = ({ value, onChange, colorClass = "bg-white", textClass = "text-slate-800" }) => (
  <div className="flex items-center gap-1 min-w-[100px] justify-center">
    <input 
      type="number" 
      className={`w-14 h-12 border-2 rounded-xl font-black text-center outline-none transition-all focus:border-cyan-400 ${colorClass} ${textClass}`} 
      value={value} 
      onChange={(e) => {
        const v = parseInt(e.target.value) || 0;
        onChange(Math.max(0, Math.min(99, v)));
      }} 
    />
    <div className="flex flex-col gap-0.5">
      <button onClick={() => onChange(Math.min(99, value + 1))} className="p-1.5 bg-cyan-100 rounded-md text-cyan-600"><ChevronUp size={16}/></button>
      <button onClick={() => onChange(Math.max(0, value - 1))} className="p-1.5 bg-cyan-100 rounded-md text-cyan-600"><ChevronDown size={16}/></button>
    </div>
  </div>
);

const HistorialVentas = ({ ventas, onDelete, onUpdate }) => {
  const [filtro, setFiltro] = useState('');
  const [editId, setEditId] = useState(null);
  const [editCache, setEditCache] = useState(null);

  const handleEditItem = (itemId, field, value) => {
    setEditCache(prev => {
      const updatedItems = prev.items.map(item => {
        if (item.id === itemId) {
          if (field === 'cant') { 
            const v = Math.max(1, Math.min(99, value)); 
            return { ...item, cant: v, pendiente: v }; 
          }
          if (field === 'pendiente') return { ...item, pendiente: Math.max(0, Math.min(item.cant, value)) };
          if (field === 'cat') return { ...item, cat: value, precio: PRODUCTOS_PRECIOS[value] || 0 };
          return { ...item, [field]: value };
        }
        return item;
      });
      return { ...prev, items: updatedItems, total: updatedItems.reduce((s, i) => s + (i.cant * i.precio), 0) };
    });
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32">
      <header className="flex flex-col lg:flex-row justify-between gap-6 mb-10 text-slate-800">
        <h2 className="text-3xl lg:text-4xl font-black italic uppercase">Historial</h2>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
          <input className="w-full pl-12 pr-5 py-4 bg-white rounded-2xl shadow-sm font-bold outline-none border-2 border-transparent focus:border-[#8ED4BE]" placeholder="Nombre o Teléfono..." onChange={e => setFiltro(e.target.value)} />
        </div>
      </header>
      <div className="space-y-8 text-slate-800">
        {ventas.filter(v => v.nombre.toLowerCase().includes(filtro.toLowerCase()) || v.telefono.includes(filtro)).map(v => {
          const editing = editId === v.id;
          const data = editing ? editCache : v;
          const tienePendientes = data.items.some(i => i.pendiente > 0);
          const [provActual, cantActual] = (data.direccion || "").split(', ');

          const editNombreValido = Utils.validateName(data.nombre || "");
          const editTelValido = (data.telefono || "").replace(/\D/g, '').length === 8;
          const editUbicacionValida = provActual && cantActual && provActual !== "" && cantActual !== "";
          const editItemsValidos = data.items.length > 0 && data.items.every(i => i.cat !== "" && i.tema !== "");
          const editValido = editNombreValido && editTelValido && editUbicacionValida && editItemsValidos;

          return (
            <div key={v.id} className={`bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-xl border-l-[12px] transition-all duration-500 ${tienePendientes ? 'border-red-400' : 'border-[#8ED4BE]'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 mr-4">
                  {editing ? (
                    <div className="space-y-4 animate-in slide-in-from-left-2">
                      <input className={`text-2xl font-black italic border-b-2 outline-none w-full bg-slate-50 p-2 ${!editNombreValido ? 'border-red-300' : 'border-[#8ED4BE]'}`} value={data.nombre} onChange={e => setEditCache({...editCache, nombre: Utils.capitalize(e.target.value)})} placeholder="Nombre + 2 Apellidos" />
                      <div className="flex flex-wrap gap-3">
                        <div className={`flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border ${!editTelValido ? 'border-red-300' : ''}`}>
                           <Clock size={12}/> <input className="text-xs font-bold outline-none bg-transparent w-24" value={data.telefono} onChange={e => setEditCache({...editCache, telefono: Utils.formatPhone(e.target.value)})} placeholder="0000-0000" />
                        </div>
                        <div className={`flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border ${!editUbicacionValida ? 'border-red-300' : ''}`}>
                           <MapPin size={12}/>
                           <select className="text-xs font-bold bg-transparent outline-none" value={provActual || ""} onChange={e => setEditCache({...editCache, direccion: `${e.target.value}, `})}>
                              <option value="">Prov...</option>
                              {Object.keys(UBICACIONES_CR).map(p => <option key={p} value={p}>{p}</option>)}
                           </select>
                           <select className="text-xs font-bold bg-transparent outline-none" value={cantActual || ""} onChange={e => setEditCache({...editCache, direccion: `${provActual}, ${e.target.value}`})}>
                              <option value="">Cantón...</option>
                              {provActual && UBICACIONES_CR[provActual]?.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <><h3 className="text-2xl font-black italic">{data.nombre}</h3><p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{data.fecha} • {data.telefono} • {data.direccion}</p></>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {editing ? (
                    <button disabled={!editValido} onClick={() => {onUpdate(v.id, editCache); setEditId(null);}} className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg scale-110 disabled:opacity-20 transition-all active:scale-95"><Check size={24}/></button>
                  ) : (
                    <>
                      <button onClick={() => {setEditId(v.id); setEditCache(JSON.parse(JSON.stringify(v)));}} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all"><Edit2 size={20}/></button>
                      <button onClick={() => exportToPDF(v)} className="p-4 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-600 hover:text-white"><Printer size={20}/></button>
                      <button onClick={() => onDelete(v.id)} className="p-4 bg-red-50 text-red-300 rounded-2xl hover:bg-red-500 hover:text-white"><Trash2 size={20}/></button>
                    </>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto bg-slate-50/50 rounded-[2rem] p-4 lg:p-6">
                <table className="w-full min-w-[700px]">
                  <thead><tr className="text-left text-[10px] font-black text-slate-300 uppercase border-b pb-2"><th className="pb-2 w-[130px]">Cant.</th><th className="pb-2">Categoría*</th><th className="pb-2">Tema*</th><th className="pb-2 text-center w-[130px]">Pendientes</th><th className="pb-2 text-right">Subtotal</th>{editing && <th className="w-10"></th>}</tr></thead>
                  <tbody>
                    {data.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-4">{editing ? <QuantityControls value={item.cant} onChange={(val) => handleEditItem(item.id, 'cant', val)} /> : <span className="font-black text-slate-600 ml-4">{item.cant}</span>}</td>
                        <td className="py-4 font-black uppercase text-[11px] text-slate-700">
                          {editing ? (
                            <input list="productos-list" className={`bg-white border-2 rounded p-2 w-full outline-none transition-all ${item.cat === "OTROS..." ? 'border-purple-300 text-purple-600 bg-purple-50' : item.cat === "" ? 'border-red-200' : 'border-slate-100'}`} value={item.cat} onChange={e => handleEditItem(item.id, 'cat', e.target.value)} placeholder="Categoría..." />
                          ) : item.cat}
                        </td>
                        <td className="py-4 font-black uppercase text-[11px] text-slate-700">
                          {editing ? (
                            <input list="temas-list" className={`border-2 rounded p-2 w-full outline-none transition-all ${Utils.getThemeColorClass(item.tema)}`} value={item.tema} onChange={e => handleEditItem(item.id, 'tema', e.target.value)} placeholder="Tema..." />
                          ) : item.tema}
                        </td>
                        <td className="py-4 text-center">{editing ? <QuantityControls value={item.pendiente} colorClass="bg-red-50" textClass="text-red-500" onChange={(val) => handleEditItem(item.id, 'pendiente', val)} /> : <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${item.pendiente > 0 ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'}`}>{item.pendiente > 0 ? item.pendiente : 'Entregado'}</span>}</td>
                        <td className="py-4 text-right font-black">
                          {editing && item.cat === "OTROS..." ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-purple-600 italic text-[10px]">C</span>
                              <input type="number" className="bg-purple-50 border-2 border-purple-200 rounded-lg p-1 w-24 text-right outline-none text-purple-600" value={item.precio} onChange={e => handleEditItem(item.id, 'precio', parseInt(e.target.value) || 0)} />
                            </div>
                          ) : Utils.currency(item.cant * item.precio)}
                        </td>
                        {editing && <td className="text-center"><button onClick={() => setEditCache({...editCache, items: editCache.items.filter(i => i.id !== item.id)})} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* BOTÓN AGREGAR LÍNEA EN EDICIÓN */}
              {editing && (
                <button onClick={() => setEditCache({...editCache, items: [...editCache.items, { id: Utils.generateId(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 1 }]})} className="mt-6 flex items-center gap-2 text-[10px] font-black text-[#8ED4BE] uppercase px-6 py-3 border-2 border-emerald-50 rounded-2xl hover:bg-emerald-50 transition-all">
                  <Plus size={14}/> Agregar Producto al Pedido
                </button>
              )}

              {/* TOTAL INDIVIDUAL POR CLIENTE */}
              <div className="mt-6 flex justify-end">
                <div className="bg-[#8ED4BE] px-8 py-4 rounded-3xl text-white shadow-lg flex items-baseline gap-3 border-b-4 border-emerald-600/20">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80 italic">Total Pedido</span>
                  <span className="text-2xl font-black italic">{Utils.currency(data.total)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <datalist id="productos-list">{Object.keys(PRODUCTOS_PRECIOS).map(p => <option key={p} value={p} />)}</datalist>
      <datalist id="temas-list">{TEMAS_PREDEFINIDOS.map(t => <option key={t} value={t} />)}</datalist>
    </div>
  );
};

const FormularioCotizacion = ({ alGuardar }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nombre: '', telefono: '', provincia: '', canton: '', items: [{ id: Utils.generateId(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 1 }] });
  const total = formData.items.reduce((s, i) => s + (i.cant * i.precio), 0);
  const nombreValido = Utils.validateName(formData.nombre);
  const telefonoValido = formData.telefono.replace(/\D/g, '').length === 8;
  const ubicacionValida = formData.provincia !== '' && formData.canton !== '';
  const itemsValidos = formData.items.length > 0 && formData.items.every(i => i.cat !== '' && i.tema !== '');
  const formularioValido = nombreValido && telefonoValido && ubicacionValida && itemsValidos;

  const handleUpdate = (id, field, value) => {
    setFormData(prev => ({ ...prev, items: prev.items.map(item => {
      if (item.id === id) {
        if (field === 'cant') { const v = Math.max(1, Math.min(99, value)); return { ...item, cant: v, pendiente: v }; }
        if (field === 'pendiente') return { ...item, pendiente: Math.max(0, Math.min(item.cant, value)) };
        if (field === 'cat') return { ...item, cat: value, precio: PRODUCTOS_PRECIOS[value] || 0 };
        return { ...item, [field]: value };
      }
      return item;
    })}));
  };

  const ejecutarGuardado = async () => {
    const nuevaVenta = { id: Utils.generateId(), nombre: formData.nombre, telefono: formData.telefono, direccion: `${formData.provincia}, ${formData.canton}`, fecha: new Date().toLocaleDateString(), total: total, items: formData.items };
    await alGuardar(nuevaVenta);
    navigate('/ventas');
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32">
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-slate-800">
            <thead><tr className="text-left text-[11px] font-black text-slate-300 uppercase border-b pb-4"><th className="pb-4 px-2 w-[140px]">Cant.</th><th className="pb-4 px-2">Categoría*</th><th className="pb-4 px-2">Tema*</th><th className="pb-4 px-2 w-[140px] text-center">Pnd.</th><th className="pb-4 px-2 text-right">Subtotal</th><th className="pb-4 w-10"></th></tr></thead>
            <tbody>
              {formData.items.map(item => (
                <tr key={item.id}>
                  <td className="py-4"><QuantityControls value={item.cant} onChange={(v) => handleUpdate(item.id, 'cant', v)} /></td>
                  <td className="py-4 px-2">
                    <input list="productos-list" className={`w-full p-4 border-2 rounded-xl font-bold outline-none transition-all ${item.cat === "OTROS..." ? 'border-purple-300 text-purple-600 bg-purple-50' : 'bg-white border-slate-100 focus:border-[#8ED4BE]'}`} value={item.cat} placeholder="Seleccione..." onChange={e => handleUpdate(item.id, 'cat', e.target.value)} />
                  </td>
                  <td className="py-4 px-2">
                    <input list="temas-list" className={`w-full p-4 border-2 rounded-xl font-bold outline-none transition-all ${Utils.getThemeColorClass(item.tema)}`} value={item.tema} placeholder="Tema..." onChange={e => handleUpdate(item.id, 'tema', e.target.value)} />
                  </td>
                  <td className="py-4"><QuantityControls value={item.pendiente} colorClass="bg-red-50" textClass="text-red-500" onChange={(v) => handleUpdate(item.id, 'pendiente', v)} /></td>
                  <td className="py-4 px-2 text-right font-black">
                    {item.cat === "OTROS..." ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-purple-600 italic text-[10px]">C</span>
                        <input type="number" className="bg-purple-50 border-2 border-purple-200 rounded-lg p-2 w-28 text-right outline-none text-purple-600" value={item.precio} onChange={e => handleUpdate(item.id, 'precio', parseInt(e.target.value) || 0)} />
                      </div>
                    ) : Utils.currency(item.cant * item.precio)}
                  </td>
                  <td className="py-4 text-center"><button onClick={() => setFormData({...formData, items: formData.items.filter(i => i.id !== item.id)})} className="text-red-300 hover:text-red-500"><Trash2 size={22}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        <div className="bg-[#8ED4BE] p-10 rounded-[3rem] text-white shadow-2xl flex flex-col justify-center transition-transform hover:scale-105"><p className="text-xs font-black uppercase mb-3 opacity-80">Ingresos Totales</p><h3 className="text-4xl lg:text-5xl font-black italic leading-none truncate">{Utils.currency(stats.ing)}</h3></div>
        <div className="bg-[#F79598] p-10 rounded-[3rem] text-white shadow-2xl flex flex-col justify-center transition-transform hover:scale-105"><p className="text-xs font-black uppercase mb-3 opacity-80">Pendientes</p><h3 className="text-4xl lg:text-6xl font-black italic leading-none">{stats.pnd} <span className="text-2xl opacity-60">Pzs</span></h3></div>
        <div className="bg-[#C0C976] p-10 rounded-[3rem] text-white shadow-2xl flex flex-col justify-center transition-transform hover:scale-105"><p className="text-xs font-black uppercase mb-3 opacity-80">Órdenes</p><h3 className="text-4xl lg:text-6xl font-black italic leading-none">{stats.total}</h3></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><Link to="/cotizar" className="p-10 bg-white rounded-[3rem] flex items-center justify-between border-4 border-slate-50 hover:border-[#8ED4BE] transition-all shadow-xl group"><div><h4 className="text-3xl font-black italic uppercase">Cotizar</h4><p className="text-xs font-bold opacity-40 uppercase">Nuevo Pedido</p></div><Plus size={32} className="group-hover:rotate-90 transition-all text-[#8ED4BE]"/></Link><Link to="/ventas" className="p-10 bg-white rounded-[3rem] flex items-center justify-between border-4 border-slate-50 hover:border-[#F79598] transition-all shadow-xl group"><div><h4 className="text-3xl font-black italic uppercase">Ventas</h4><p className="text-xs font-bold opacity-40 uppercase">Historial</p></div><ShoppingBag size={32} className="group-hover:scale-110 transition-all text-[#F79598]"/></Link></div>
    </div>
  );
};

export default function App() {
  const [ventas, setVentas] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('ventas').select('*').order('created_at', { ascending: false });
      if (data) setVentas(data);
    };
    fetch();
  }, []);
  const alGuardarEnNube = async (nv) => {
    const { data, error } = await supabase.from('ventas').insert([nv]).select();
    if (!error && data) setVentas([data[0], ...ventas]);
  };
  const alEliminar = async (id) => {
    Swal.fire({
      title: '¿Eliminar pedido?',
      text: "ESTA ACCIÓN NO SE PUEDE DESHACER.",
      icon: 'warning',
      iconColor: '#F79598',
      showCancelButton: true,
      confirmButtonText: 'SÍ, ELIMINAR',
      cancelButtonText: 'CANCELAR',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-[3rem] shadow-2xl border-none p-10',
        title: 'text-2xl font-black text-slate-800 tracking-tight', 
        htmlContainer: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2',
        confirmButton: 'px-10 py-4 bg-[#F79598] text-white font-black italic rounded-[1.5rem] mx-2 hover:scale-105 transition-all uppercase text-[10px] shadow-lg shadow-red-100',
        cancelButton: 'px-10 py-4 bg-slate-50 text-slate-400 font-black italic rounded-[1.5rem] mx-2 hover:bg-slate-100 transition-all uppercase text-[10px]'
      },
      showClass: { popup: 'animate__animated animate__zoomIn animate__faster' },
      hideClass: { popup: 'animate__animated animate__zoomOut animate__faster' },
      background: '#ffffff',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase.from('ventas').delete().eq('id', id);
          if (error) throw error;
          setVentas(ventas.filter(v => v.id !== id));
          Swal.fire({
            title: '¡LISTO!',
            text: 'EL PEDIDO FUE BORRADO CORRECTAMENTE.',
            icon: 'success',
            iconColor: '#8ED4BE',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            customClass: {
              popup: 'rounded-[3rem] p-10 shadow-2xl',
              title: 'text-2xl font-black text-[#8ED4BE] italic',
              htmlContainer: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest'
            }
          });
        } catch (error) {
          Swal.fire({
            title: 'ERROR',
            text: 'NO SE PUDO BORRAR EL PEDIDO.',
            icon: 'error',
            confirmButtonColor: '#1e293b',
            customClass: { popup: 'rounded-[3rem]' }
          });
        }
      }
    });
  };
  const alActualizar = async (id, va) => {
    const { created_at, ...updateData } = va;
    const { error } = await supabase.from('ventas').update(updateData).eq('id', id);
    if (!error) setVentas(ventas.map(v => v.id === id ? va : v));
  };
  return (
    <Router>
      <div className="flex flex-col lg:flex-row h-screen bg-[#F8FAFC] overflow-hidden">
        <aside className="fixed bottom-0 left-0 w-full lg:relative lg:w-80 bg-white border-t lg:border-r p-4 lg:p-12 flex flex-row lg:flex-col justify-between z-50">
          <div className="flex lg:flex-col items-center lg:items-start justify-between w-full lg:space-y-16">
            <div className="hidden lg:block text-4xl font-black italic text-slate-800">ALEKEY<span className="text-[#8ED4BE]">.</span></div>
            <nav className="flex flex-row lg:flex-col gap-1 lg:gap-4 w-full justify-around lg:justify-start">
              <NavLink to="/" icon={<Home size={20}/>} label="Inicio" />
              <NavLink to="/cotizar" icon={<Plus size={20}/>} label="Cotizar" />
              <NavLink to="/ventas" icon={<ShoppingBag size={20}/>} label="Ventas" />
              <NavLink to="/stats" icon={<BarChart3 size={20}/>} label="Stats" />
            </nav>
          </div>
          <div className="hidden lg:flex p-6 bg-slate-900 rounded-[2rem] text-white items-center gap-4 italic font-black text-xs"><div className="w-8 h-8 bg-[#8ED4BE] rounded-xl flex items-center justify-center font-bold text-slate-800">IV</div> Admin Alekey</div>
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
    </Router>
  );
}

const NavLink = ({ to, icon, label }) => {
  const active = useLocation().pathname === to;
  return (<Link to={to} className={`flex flex-col lg:flex-row items-center gap-1.5 lg:gap-6 p-2 lg:p-5 rounded-xl lg:rounded-[2rem] transition-all font-black italic uppercase text-[10px] lg:text-xs flex-1 lg:flex-none ${active ? 'bg-[#8ED4BE] text-white shadow-xl scale-105' : 'text-slate-300'}`}>{icon} <span className="lg:inline">{label}</span></Link>);
};