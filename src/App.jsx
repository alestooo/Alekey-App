import { supabase } from './supabaseClient';
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 
import { 
  Plus, Trash2, Home, Package, FileText, 
  CreditCard, Edit2, Check, X, Search,
  LayoutDashboard, LogOut, ShoppingBag, 
  Calendar, Printer, TrendingUp, Clock, 
  Info, MapPin, ArrowRight, FilePlus,
  AlertTriangle, CheckCircle2, UserCheck, Save, Menu
} from 'lucide-react';

// --- ACTIVOS ---
import logoAlekey from './assets/alekey-logo.jpeg'; 

// ==========================================
// 1. CONSTANTES Y CONFIGURACIÓN
// ==========================================

const CONFIG = {
  COLORES: { VERDE: "#8ED4BE", ROSADO: "#F79598", LIMA: "#BCC962" },
  LIMITES: { MIN: 0, MAX: 99 }
};

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
  "DCC": 3750, "Distintivos": 1350, "MR6": 6500, "Bienvenidos": 4750,
  "Puerta": 1500, "Cumpleaños": 1500, "Nombres": 1500, "Borde": 4500
};

const TEMAS_PREDEFINIDOS = [
  "Abeja Spelling", "Abeja Cute", "Abeja Acuarela", "Arcoiris", "Arcoliris Pastel", 
  "Alicia", "Avenger", "Be Happy", "Bosque", "Bosque Acuarela", "Bosque Cr", 
  "Buho", "Chimuelos", "Cactus", "Crayola", "Crayola Pastel", "Capivara", 
  "Crayola Niños", "Campamento", "Circo 1", "Circo 2", "Deporte", "Dinosaurio", 
  "Dino Baby", "Escolar", "Espacio", "Espacio Azul", "Elefante", "Feria Cientifica", 
  "Granja", "Granja Acuarela", "Granja New", "Granjeros", "Gato", "Harry Potter", 
  "Insectos", "Jirafa", "Koala", "Leones Pareja", "Llama", "Mar", "Mar New", 
  "Mario Bros", "Mariquita Educlip", "Mariquita", "Medio Ambiente", "Mono", 
  "Monstruos 1", "Monstruos 2", "Monstruos 3", "Monster Inc", "Mickey", 
  "Mickey Safari", "Melonheadz", "Música", "Navidad", "Niños Corazón", 
  "Niños Corazon New", "Niños Jovenes", "Oso Miel", "Oso Sandia", "Oso The Pond", 
  "Oso Teddy", "Osos Cariñosos", "Pajaros Educlip", "Pajaros Acuarela", "Panda", 
  "Panda Cute", "Plaza Sesamo", "Pirata", "Pirata Merita", "Piscina", "Pingüino", 
  "Principito", "Princesa", "Pacman", "Perro", "Rana", "Rana The Pond", "Robot 1", 
  "Robot 2", "Robot 3", "Safari Vintage", "Safari Cute", "San Valentin", "Selva", 
  "Setiemrbe 15 Desfile", "Setiembre 15", "Star Wars", "Sloth", "Steam", 
  "Stitch Navidad", "Stitch", "Suculentas 1", "Suculentas 2", "Super Heroes", 
  "Steam 2", "Snoopy", "Snoopy Y Amigos", "Tortuga", "Toy Story"
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
  capitalize: (str) => str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
  validateName: (str) => str.trim().split(/\s+/).length >= 3,
  generateId: () => `ALK-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
  getBase64: (url) => {
    return new Promise((resolve) => {
      const img = new Image();
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

const exportToPDF = async (venta) => {
  const doc = new jsPDF();
  const logo = await Utils.getBase64(logoAlekey);
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, 210, 50, 'F');
  doc.addImage(logo, 'JPEG', 155, 5, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(30, 41, 59);
  doc.text("FACTURA", 15, 25);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("ORDEN: " + venta.id, 15, 35);
  doc.text("FECHA: " + venta.fecha, 15, 42);
  doc.setFontSize(11);
  doc.setTextColor(40);
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
    i.cant,
    i.cat + " - " + i.tema,
    "C " + i.precio.toLocaleString(),
    "C " + (i.cant * i.precio).toLocaleString(),
    i.pendiente > 0 ? i.pendiente : "Entregado"
  ]);
  autoTable(doc, {
    startY: 95,
    head: [['Cant.', 'Descripcion', 'Unitario', 'Subtotal', 'Pend.']],
    body: tableRows,
    headStyles: { fillColor: [142, 212, 190] }
  });
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL FINAL: C " + (venta.total || 0).toLocaleString(), 195, finalY, { align: 'right' });
  doc.save(`Cotizacion_${venta.nombre}.pdf`);
};

const DeleteModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 text-center">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32}/>
        </div>
        <h3 className="text-xl md:text-2xl font-black italic text-slate-800 mb-2 uppercase">¿Eliminar Registro?</h3>
        <p className="text-slate-400 font-bold text-xs md:text-sm mb-8">Esta acción no se puede deshacer.</p>
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-600">Eliminar Ahora</button>
          <button onClick={onCancel} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. FORMULARIO COTIZACIÓN (RESPONSIVE)
// ==========================================

const FormularioCotizacion = ({ alGuardar, count }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', provincia: '', canton: '',
    items: [{ id: Utils.generateId(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 1 }]
  });

  const total = formData.items.reduce((s, i) => s + (i.cant * i.precio), 0);

  const handleUpdate = (id, field, value) => {
    const updated = formData.items.map(item => {
      if (item.id === id) {
        let val = value;
        if (field === 'cant') {
          val = Math.max(1, Math.min(99, parseInt(value) || 1));
          return { ...item, cant: val, pendiente: val }; 
        }
        if (field === 'pendiente') {
          val = Math.max(0, Math.min(item.cant, parseInt(value) || 0));
          return { ...item, pendiente: val };
        }
        if (field === 'cat') return { ...item, cat: val, precio: PRODUCTOS_PRECIOS[val] || 0 };
        return { ...item, [field]: val };
      }
      return item;
    });
    setFormData({ ...formData, items: updated });
  };

  const isInvalid = !Utils.validateName(formData.nombre) || formData.telefono.length < 9 || !formData.canton;

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-32 md:pb-10">
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl border border-slate-100">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 md:mb-12">
          <div>
            <h2 className="text-2xl md:text-4xl font-black italic text-slate-800 uppercase leading-none">Cotizar Nuevo</h2>
            <p className="text-slate-400 font-bold text-[8px] md:text-[10px] tracking-widest mt-1 uppercase">Registro Alekey #{count + 1}</p>
          </div>
          <div className="text-left md:text-right w-full md:w-auto">
            <h3 className="text-3xl md:text-5xl font-black italic text-[#BCC962]">{Utils.currency(total)}</h3>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
          <div className="space-y-4 md:space-y-6">
            <input className="w-full p-4 md:p-5 bg-slate-50 rounded-xl md:rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#8ED4BE]"
              placeholder="Nombre + 2 Apellidos..." value={formData.nombre} 
              onChange={e => setFormData({...formData, nombre: Utils.capitalize(e.target.value)})} />
            
            <input className="w-full p-4 md:p-5 bg-slate-50 rounded-xl md:rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#8ED4BE]"
              placeholder="Numero (0000-0000)" value={formData.telefono} 
              onChange={e => setFormData({...formData, telefono: Utils.formatPhone(e.target.value)})} />
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <select className="w-full p-4 md:p-5 bg-slate-50 rounded-xl md:rounded-2xl font-bold outline-none text-xs md:text-base" value={formData.provincia} 
              onChange={e => setFormData({...formData, provincia: e.target.value, canton: ''})}>
              <option value="">Provincia...</option>
              {Object.keys(UBICACIONES_CR).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="w-full p-4 md:p-5 bg-slate-50 rounded-xl md:rounded-2xl font-bold outline-none disabled:opacity-30 text-xs md:text-base" 
              disabled={!formData.provincia} value={formData.canton} onChange={e => setFormData({...formData, canton: e.target.value})}>
              <option value="">Canton...</option>
              {formData.provincia && UBICACIONES_CR[formData.provincia].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 md:mx-0">
          <table className="w-full mb-10 min-w-[600px]">
            <thead>
              <tr className="text-left text-[10px] font-black text-slate-300 uppercase tracking-widest border-b">
                <th className="pb-4 px-2">Cant.</th>
                <th className="pb-4 px-2">Categoria</th>
                <th className="pb-4 px-2">Tema</th>
                <th className="pb-4 px-2 text-center">Pnd.</th>
                <th className="pb-4 px-2 text-right">Subtotal</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map(item => (
                <tr key={item.id}>
                  <td className="py-3 md:py-4 px-1"><input type="number" className="w-14 md:w-16 p-2 md:p-3 bg-white border-2 rounded-xl font-black text-center" 
                    value={item.cant} onChange={e => handleUpdate(item.id, 'cant', e.target.value)} /></td>
                  <td className="py-3 md:py-4 px-1"><select className="w-full p-2 md:p-3 bg-white border-2 rounded-xl font-bold text-xs md:text-sm" value={item.cat} 
                    onChange={e => handleUpdate(item.id, 'cat', e.target.value)}>
                      <option value="">Seleccione...</option>
                      {Object.keys(PRODUCTOS_PRECIOS).map(p => <option key={p} value={p}>{p}</option>)}
                    </select></td>
                  <td className="py-3 md:py-4 px-1"><input list="temas-list" className="w-full p-2 md:p-3 bg-white border-2 rounded-xl text-xs md:text-sm" placeholder="Tema..." 
                    value={item.tema} onChange={e => handleUpdate(item.id, 'tema', e.target.value)} /></td>
                  <td className="py-3 md:py-4 px-1 text-center"><input type="number" className="w-14 md:w-16 p-2 md:p-3 bg-red-50 text-red-500 rounded-xl font-black text-center" 
                    value={item.pendiente} onChange={e => handleUpdate(item.id, 'pendiente', e.target.value)} /></td>
                  <td className="py-3 md:py-4 px-1 text-right font-black text-xs md:text-sm">{Utils.currency(item.cant * item.precio)}</td>
                  <td className="py-3 md:py-4 text-right"><button onClick={() => setFormData({...formData, items: formData.items.filter(i => i.id !== item.id)})} className="text-red-300 hover:text-red-500"><Trash2 size={18}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <button onClick={() => setFormData({...formData, items: [...formData.items, {id: Utils.generateId(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 1}]})} 
            className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase">Agregar Linea</button>
          
          <button disabled={isInvalid} onClick={() => { alGuardar({...formData, id: Utils.generateId(), fecha: new Date().toLocaleDateString(), direccion: `${formData.provincia}, ${formData.canton}`, total}); navigate('/ventas'); }}
            className="w-full md:w-auto px-16 py-5 bg-[#8ED4BE] text-white font-black text-lg md:text-xl rounded-2xl md:rounded-3xl shadow-2xl disabled:opacity-30">Guardar Pedido</button>
        </div>
      </div>
      <datalist id="temas-list">{TEMAS_PREDEFINIDOS.map(t => <option key={t} value={t} />)}</datalist>
    </div>
  );
};

// ==========================================
// 5. HISTORIAL VENTAS (RESPONSIVE)
// ==========================================

const HistorialVentas = ({ ventas, setVentas, onDelete, onUpdate }) => {
  const [filtro, setFiltro] = useState('');
  const [editId, setEditId] = useState(null);
  const [editCache, setEditCache] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = ventas.filter(v => v.nombre.toLowerCase().includes(filtro.toLowerCase()));

  const handleEditItem = (itemId, field, value) => {
    const updated = editCache.items.map(item => {
      if (item.id === itemId) {
        let val = value;
        if (field === 'cant') {
          val = Math.max(1, Math.min(99, parseInt(value) || 1));
          const newPendiente = Math.min(val, item.pendiente);
          return { ...item, cant: val, pendiente: newPendiente };
        }
        if (field === 'pendiente') {
          val = Math.max(0, Math.min(item.cant, parseInt(value) || 0));
          return { ...item, pendiente: val };
        }
        if (field === 'cat') return { ...item, cat: val, precio: PRODUCTOS_PRECIOS[val] || 0 };
        return { ...item, [field]: val };
      }
      return item;
    });
    setEditCache({ ...editCache, items: updated, total: updated.reduce((s, i) => s + (i.cant * i.precio), 0) });
  };

  const confirmDelete = () => {
    onDelete(deleteId); 
    setDeleteId(null);
  };

  const handleSaveEdit = () => {
    onUpdate(editId, editCache);
    setEditId(null);
  };

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-32 md:pb-10">
      <DeleteModal isOpen={!!deleteId} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
        <div><h2 className="text-3xl md:text-4xl font-black italic text-slate-800 uppercase">Historial</h2></div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
          <input className="pl-14 pr-8 py-4 md:py-5 bg-white rounded-2xl md:rounded-3xl shadow-sm border-none w-full font-bold" 
            placeholder="Buscar cliente..." value={filtro} onChange={e => setFiltro(e.target.value)} />
        </div>
      </header>

      <div className="space-y-6 md:space-y-10">
        {filtered.map(v => {
          const editing = editId === v.id;
          const data = editing ? editCache : v;

          return (
            <div key={v.id} className={`bg-white rounded-[2rem] md:rounded-[3.5rem] p-5 md:p-10 shadow-xl border-l-[8px] md:border-l-[12px] ${data.items.some(i => i.pendiente > 0) ? 'border-red-400' : 'border-[#8ED4BE]'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 md:mb-8">
                <div className="flex gap-4 md:gap-6 items-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg">{v.nombre.charAt(0)}</div>
                  {editing ? (
                    <div className="flex flex-col gap-2 w-full">
                      <input className="text-xl md:text-2xl font-black italic border-b-2 border-[#8ED4BE] outline-none" 
                        value={data.nombre} onChange={e => setEditCache({...editCache, nombre: Utils.capitalize(e.target.value)})} />
                      <div className="flex flex-wrap gap-2">
                        <input className="text-[10px] border-b outline-none" value={data.telefono} onChange={e => setEditCache({...editCache, telefono: Utils.formatPhone(e.target.value)})} />
                        <input className="text-[10px] border-b outline-none" value={data.direccion} onChange={e => setEditCache({...editCache, direccion: e.target.value})} />
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      <h3 className="text-lg md:text-2xl font-black italic text-slate-800 truncate">{v.nombre}</h3>
                      <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{v.fecha} • {v.telefono} • {v.direccion}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full md:w-auto justify-end">
                  {editing ? (
                    <button onClick={handleSaveEdit} className="p-3 md:p-4 bg-emerald-500 text-white rounded-xl md:rounded-2xl"><Check/></button>
                  ) : (
                    <button onClick={() => { setEditId(v.id); setEditCache(v); }} className="p-3 md:p-4 bg-slate-50 text-slate-300 rounded-xl md:rounded-2xl hover:bg-slate-900 hover:text-white transition-all"><Edit2 size={20}/></button>
                  )}
                  <button onClick={() => exportToPDF(v)} className="p-3 md:p-4 bg-blue-50 text-blue-500 rounded-xl md:rounded-2xl"><Printer size={20}/></button>
                  <button onClick={() => setDeleteId(v.id)} className="p-3 md:p-4 bg-red-50 text-red-300 rounded-xl md:rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="text-left text-[8px] md:text-[9px] font-black text-slate-300 uppercase">
                        <th className="pb-4">Cant.</th>
                        <th className="pb-4">Descripcion</th>
                        <th className="pb-4 text-center">Pendientes</th>
                        <th className="pb-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.items.map(item => (
                        <tr key={item.id}>
                          <td className="py-3 md:py-4">
                            {editing ? (
                              <input type="number" className="w-12 p-2 border rounded-lg font-black text-center" 
                                value={item.cant} onChange={e => handleEditItem(item.id, 'cant', e.target.value)} />
                            ) : <span className="font-black text-slate-500">{item.cant}</span>}
                          </td>
                          <td className="py-3 md:py-4">
                            {editing ? (
                              <div className="flex gap-1 md:gap-2">
                                <select className="text-[10px] border rounded p-1" value={item.cat} onChange={e => handleEditItem(item.id, 'cat', e.target.value)}>
                                  {Object.keys(PRODUCTOS_PRECIOS).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                                <input list="temas-list" className="text-[10px] border rounded p-1 flex-1" value={item.tema} onChange={e => handleEditItem(item.id, 'tema', e.target.value)} />
                              </div>
                            ) : <span className="text-[10px] font-black uppercase text-slate-700">{item.cat} - {item.tema}</span>}
                          </td>
                          <td className="py-3 md:py-4 text-center">
                            {editing ? (
                              <input type="number" className="w-12 p-2 border border-red-100 bg-red-50 rounded-lg font-black text-center text-red-500" 
                                value={item.pendiente} onChange={e => handleEditItem(item.id, 'pendiente', e.target.value)} />
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black ${item.pendiente > 0 ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                {item.pendiente > 0 ? item.pendiente : 'Entregado'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 md:py-4 text-right font-black text-xs md:text-sm">{Utils.currency(item.cant * item.precio)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {editing && (
                  <button onClick={() => setEditCache({...editCache, items: [...editCache.items, {id: Utils.generateId(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 1}]})}
                    className="mt-6 flex items-center gap-2 text-[10px] font-black text-[#8ED4BE] uppercase border-2 border-dashed border-[#8ED4BE]/30 p-4 rounded-2xl w-full justify-center">
                    <Plus size={14}/> Agregar Linea
                  </button>
                )}
                <div className="mt-6 pt-4 border-t flex justify-end">
                  <div className="text-[8px] md:text-[10px] font-black text-white px-4 py-2 rounded-full bg-slate-900 uppercase">Total: {Utils.currency(data.total)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 6. DASHBOARD HOME (RESPONSIVE)
// ==========================================

const DashboardHome = ({ historial }) => {
  const stats = useMemo(() => {
    const ing = historial.reduce((a, v) => a + (v.total || 0), 0);
    const pnd = historial.reduce((a, v) => a + (v.items?.reduce((s, i) => s + (i.pendiente || 0), 0) || 0), 0);
    return { ing, pnd, total: historial.length };
  }, [historial]);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto pb-32 md:pb-12">
      <header className="mb-12 md:mb-20">
        <h1 className="text-5xl md:text-8xl font-black italic text-slate-800 tracking-tighter uppercase leading-[0.9]">Panel<br/><span className="text-[#8ED4BE]">Alekey.</span></h1>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-12 md:mb-20">
        <div className="bg-[#8ED4BE] p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl shadow-[#8ED4BE]/20">
          <p className="text-[10px] font-black uppercase mb-2 opacity-60">Ingresos</p>
          <h3 className="text-3xl md:text-5xl font-black italic">{Utils.currency(stats.ing)}</h3>
        </div>
        <div className="bg-[#F79598] p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl shadow-[#F79598]/20">
          <p className="text-[10px] font-black uppercase mb-2 opacity-60">Pendientes</p>
          <h3 className="text-3xl md:text-5xl font-black italic">{stats.pnd} Piezas</h3>
        </div>
        <div className="bg-[#C0C976] p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl shadow-[#C0C976]/30">
          <p className="text-[10px] font-black uppercase mb-2 opacity-60">Ordenes</p>
          <h3 className="text-3xl md:text-5xl font-black italic">{stats.total}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        <Link to="/cotizar" className="p-8 md:p-14 bg-white rounded-[2rem] md:rounded-[4.5rem] flex items-center justify-between border-4 border-slate-50 hover:border-[#8ED4BE] transition-all group shadow-xl">
          <div><h4 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">Cotizar</h4><p className="text-[8px] md:text-[10px] font-bold mt-1 uppercase opacity-60">Nuevo presupuesto</p></div>
          <ArrowRight size={24} className="group-hover:translate-x-3 transition-transform text-[#8ED4BE]"/>
        </Link>
        <Link to="/ventas" className="p-8 md:p-14 bg-white rounded-[2rem] md:rounded-[4.5rem] flex items-center justify-between border-4 border-slate-50 hover:border-[#F79598] transition-all group shadow-xl">
          <div><h4 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">Ventas</h4><p className="text-[8px] md:text-[10px] font-bold mt-1 uppercase opacity-60">Historial y entregas</p></div>
          <ArrowRight size={24} className="group-hover:translate-x-3 transition-transform text-[#F79598]"/>
        </Link>
      </div>
    </div>
  );
};

// ==========================================
// 7. APP PRINCIPAL
// ==========================================

export default function App() {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setVentas(data);
  };

  const alGuardarEnNube = async (nuevaVenta) => {
    const { data, error } = await supabase
      .from('ventas')
      .insert([{
        id: nuevaVenta.id,
        nombre: nuevaVenta.nombre,
        telefono: nuevaVenta.telefono,
        direccion: nuevaVenta.direccion,
        fecha: nuevaVenta.fecha,
        total: nuevaVenta.total,
        items: nuevaVenta.items
      }])
      .select();

    if (!error && data) {
      setVentas([data[0], ...ventas]);
    } else if (error) {
      alert("Error: " + error.message);
    }
  };

  const alEliminarDeNube = async (id) => {
    const { error } = await supabase.from('ventas').delete().eq('id', id);
    if (!error) setVentas(ventas.filter(v => v.id !== id));
  };

  const alActualizarVenta = async (id, ventaActualizada) => {
    const { created_at, ...dataToUpdate } = ventaActualizada;
    const { error } = await supabase.from('ventas').update(dataToUpdate).eq('id', id);
    if (!error) setVentas(ventas.map(v => v.id === id ? ventaActualizada : v));
  };

  return (
    <Router>
      <div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] overflow-hidden">
        
        {/* Sidebar: Lateral en PC, Inferior en Móvil */}
        <aside className="fixed bottom-0 left-0 w-full md:relative md:w-80 bg-white border-t md:border-r md:border-t-0 p-4 md:p-12 flex flex-row md:flex-col justify-between z-50">
          <div className="flex md:flex-col items-center md:items-start justify-between w-full md:space-y-20">
            <div className="hidden md:block text-4xl font-black italic text-slate-800">ALEKEY<span className="text-[#8ED4BE]">.</span></div>
            
            <nav className="flex flex-row md:flex-col gap-2 md:gap-6 w-full justify-around md:justify-start">
              <NavLink to="/" icon={<Home size={20}/>} label="Inicio" />
              <NavLink to="/cotizar" icon={<Plus size={20}/>} label="Cotizar" />
              <NavLink to="/ventas" icon={<ShoppingBag size={20}/>} label="Ventas" />
            </nav>
          </div>
          <div className="hidden md:flex p-6 bg-slate-900 rounded-[2rem] text-white items-center gap-4 italic font-black text-xs">
            <div className="w-8 h-8 bg-[#8ED4BE] rounded-lg flex items-center justify-center">IV</div>
            Admin Alekey
          </div>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 overflow-y-auto bg-slate-50/30">
          <Routes>
            <Route path="/" element={<DashboardHome historial={ventas} />} />
            <Route path="/cotizar" element={<FormularioCotizacion count={ventas.length} alGuardar={alGuardarEnNube} />} />
            <Route path="/ventas" element={<HistorialVentas ventas={ventas} setVentas={setVentas} onDelete={alEliminarDeNube} onUpdate={alActualizarVenta} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const NavLink = ({ to, icon, label }) => {
  const active = useLocation().pathname === to;
  return (
    <Link to={to} className={`flex flex-col md:flex-row items-center gap-1 md:gap-6 p-2 md:p-5 rounded-xl md:rounded-[2rem] transition-all font-black italic uppercase text-[10px] md:text-xs flex-1 md:flex-none ${active ? 'bg-[#8ED4BE] text-white shadow-lg' : 'text-slate-300'}`}>
      {icon} <span className="md:inline">{label}</span>
    </Link>
  );
};