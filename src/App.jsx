import { supabase } from './supabaseClient';
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 
import { 
  Plus, Trash2, Home, ShoppingBag, Printer, Edit2, Check, Search,
  ChevronUp, ChevronDown
} from 'lucide-react';

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
  "Niños Jovenes", "Oso Miel", "Oso Sandia", "Oso Teddy", "Panda", "Principito", "Toy Story"
];

// ==========================================
// 2. UTILIDADES Y PDF
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
// 3. COMPONENTES INTERFAZ
// ==========================================

const QuantityControls = ({ value, onChange, colorClass = "bg-white", textClass = "text-slate-800" }) => (
  <div className="flex items-center gap-1 min-w-[100px] justify-center">
    <input type="number" className={`w-14 h-12 border-2 rounded-xl font-black text-center outline-none transition-all focus:border-cyan-400 ${colorClass} ${textClass}`} value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} />
    <div className="flex flex-col gap-0.5">
      <button onClick={() => onChange(value + 1)} className="p-1.5 bg-cyan-100 rounded-md hover:bg-cyan-200 text-cyan-600"><ChevronUp size={16}/></button>
      <button onClick={() => onChange(value - 1)} className="p-1.5 bg-cyan-100 rounded-md hover:bg-cyan-200 text-cyan-600"><ChevronDown size={16}/></button>
    </div>
  </div>
);

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
        if (field === 'cant') { const v = Math.max(1, value); return { ...item, cant: v, pendiente: v }; }
        if (field === 'pendiente') return { ...item, pendiente: Math.max(0, Math.min(item.cant, value)) };
        if (field === 'cat') return { ...item, cat: value, precio: PRODUCTOS_PRECIOS[value] || 0 };
        return { ...item, [field]: value };
      }
      return item;
    })}));
  };

  const ejecutarGuardado = async () => {
    const nuevaVenta = {
      id: Utils.generateId(),
      nombre: formData.nombre,
      telefono: formData.telefono,
      direccion: `${formData.provincia}, ${formData.canton}`,
      fecha: new Date().toLocaleDateString(),
      total: total,
      items: formData.items
    };
    await alGuardar(nuevaVenta);
    navigate('/ventas');
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32">
      <div className="bg-white rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 shadow-2xl">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-10">
          <h2 className="text-3xl lg:text-4xl font-black italic text-slate-800 uppercase">Cotizar Nuevo</h2>
          <h3 className="text-3xl lg:text-5xl font-black italic text-[#BCC962]">{Utils.currency(total)}</h3>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 text-slate-800">
          <div className="space-y-4">
            <input className={`w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 outline-none transition-all ${formData.nombre && !nombreValido ? 'border-red-200' : 'border-transparent focus:border-[#8ED4BE]'}`} placeholder="Nombre + 2 Apellidos (Sin números)" value={formData.nombre} onChange={e => setFormData({...formData, nombre: Utils.capitalize(e.target.value)})} />
            <input className={`w-full p-5 bg-slate-50 rounded-2xl font-bold border-2 outline-none transition-all ${formData.telefono && !telefonoValido ? 'border-red-200' : 'border-transparent focus:border-[#8ED4BE]'}`} placeholder="Teléfono 0000-0000" value={formData.telefono} onChange={e => setFormData({...formData, telefono: Utils.formatPhone(e.target.value)})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select className="p-5 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-[#8ED4BE] outline-none" value={formData.provincia} onChange={e => setFormData({...formData, provincia: e.target.value, canton: ''})}>
              <option value="">Provincia...</option>
              {Object.keys(UBICACIONES_CR).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {formData.provincia && (
              <select className="p-5 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-[#8ED4BE] outline-none animate-in fade-in" value={formData.canton} onChange={e => setFormData({...formData, canton: e.target.value})}>
                <option value="">Cantón...</option>
                {UBICACIONES_CR[formData.provincia].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-slate-800">
            <thead><tr className="text-left text-[11px] font-black text-slate-300 uppercase border-b pb-4"><th className="pb-4 px-2 w-[140px]">Cant.</th><th className="pb-4 px-2">Categoría*</th><th className="pb-4 px-2">Tema*</th><th className="pb-4 px-2 w-[140px] text-center">Pnd.</th><th className="pb-4 px-2 text-right">Subtotal</th><th className="pb-4 w-10"></th></tr></thead>
            <tbody>
              {formData.items.map(item => (
                <tr key={item.id}>
                  <td className="py-4"><QuantityControls value={item.cant} onChange={(v) => handleUpdate(item.id, 'cant', v)} /></td>
                  <td className="py-4 px-2"><input list="productos-list" className="w-full p-4 bg-white border-2 rounded-xl font-bold outline-none focus:border-[#8ED4BE]" value={item.cat} placeholder="Seleccione..." onChange={e => handleUpdate(item.id, 'cat', e.target.value)} /></td>
                  <td className="py-4 px-2"><input list="temas-list" className="w-full p-4 bg-white border-2 rounded-xl font-bold outline-none focus:border-[#8ED4BE]" value={item.tema} placeholder="Tema..." onChange={e => handleUpdate(item.id, 'tema', e.target.value)} /></td>
                  <td className="py-4"><QuantityControls value={item.pendiente} colorClass="bg-red-50" textClass="text-red-500" onChange={(v) => handleUpdate(item.id, 'pendiente', v)} /></td>
                  <td className="py-4 px-2 text-right font-black">{Utils.currency(item.cant * item.precio)}</td>
                  <td className="py-4 text-center"><button onClick={() => setFormData({...formData, items: formData.items.filter(i => i.id !== item.id)})} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={22}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => setFormData({...formData, items: [...formData.items, {id: Utils.generateId(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 1}]})} className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase flex items-center gap-2"><Plus size={16}/> Agregar Línea</button>
        <div className="mt-10 flex flex-col items-end gap-3">
          {!formularioValido && <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest italic">* Complete todos los campos requeridos</p>}
          <button disabled={!formularioValido} onClick={ejecutarGuardado} className="px-16 py-5 bg-[#8ED4BE] text-white font-black text-xl rounded-3xl shadow-2xl disabled:opacity-20 disabled:grayscale transition-all hover:scale-105 active:scale-95">Guardar Pedido</button>
        </div>
      </div>
      <datalist id="productos-list">{Object.keys(PRODUCTOS_PRECIOS).map(p => <option key={p} value={p} />)}</datalist>
      <datalist id="temas-list">{TEMAS_PREDEFINIDOS.map(t => <option key={t} value={t} />)}</datalist>
    </div>
  );
};

const HistorialVentas = ({ ventas, onDelete, onUpdate }) => {
  const [filtro, setFiltro] = useState('');
  const [editId, setEditId] = useState(null);
  const [editCache, setEditCache] = useState(null);

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

  const agregarLineaEdicion = () => {
    setEditCache(prev => {
      const newItems = [...prev.items, { id: Utils.generateId(), cant: 1, cat: '', tema: '', precio: 0, pendiente: 1 }];
      return { ...prev, items: newItems };
    });
  };

  return (
    <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32">
      <header className="flex flex-col lg:flex-row justify-between gap-6 mb-10"><h2 className="text-3xl lg:text-4xl font-black italic text-slate-800 uppercase">Historial</h2><div className="relative w-full lg:w-96 text-slate-800"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20}/><input className="w-full pl-12 pr-5 py-4 bg-white rounded-2xl shadow-sm font-bold outline-none" placeholder="Buscar cliente..." onChange={e => setFiltro(e.target.value)} /></div></header>
      <div className="space-y-8 text-slate-800">
        {ventas.filter(v => v.nombre.toLowerCase().includes(filtro.toLowerCase())).map(v => {
          const editing = editId === v.id;
          const data = editing ? editCache : v;
          const tienePendientes = data.items.some(i => i.pendiente > 0);
          const [provActual, cantActual] = data.direccion.split(', ');

          const editValida = Utils.validateName(data.nombre) && data.telefono.replace(/\D/g, '').length === 8 && data.direccion.includes(', ') && data.items.length > 0 && data.items.every(i => i.cat !== '' && i.tema !== '');

          return (
            <div key={v.id} className={`bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-xl border-l-[12px] transition-all duration-500 ${tienePendientes ? 'border-red-400' : 'border-[#8ED4BE]'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="w-full max-w-2xl">
                  {editing ? (
                    <div className="space-y-3">
                      <input className="text-2xl font-black italic border-b-2 border-cyan-400 outline-none w-full bg-transparent" value={data.nombre} onChange={e => setEditCache({...editCache, nombre: Utils.capitalize(e.target.value)})} />
                      <div className="flex flex-wrap gap-3">
                        <input className="text-sm font-bold border-b outline-none w-32 bg-transparent" value={data.telefono} onChange={e => setEditCache({...editCache, telefono: Utils.formatPhone(e.target.value)})} />
                        <select className="text-sm font-bold border-b outline-none bg-transparent" value={provActual || ""} onChange={e => setEditCache({...editCache, direccion: `${e.target.value}, `})}>
                          <option value="">Provincia...</option>
                          {Object.keys(UBICACIONES_CR).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select className="text-sm font-bold border-b outline-none bg-transparent disabled:opacity-30" disabled={!provActual} value={cantActual || ""} onChange={e => setEditCache({...editCache, direccion: `${provActual}, ${e.target.value}`})}>
                          <option value="">Cantón...</option>
                          {provActual && UBICACIONES_CR[provActual]?.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <><h3 className="text-2xl font-black italic text-slate-800">{data.nombre}</h3><p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{data.fecha} • {data.telefono} • {data.direccion}</p></>
                  )}
                </div>
                <div className="flex gap-2">
                  {editing ? (
                    <button disabled={!editValida} onClick={() => {onUpdate(v.id, editCache); setEditId(null);}} className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg disabled:opacity-20"><Check size={24}/></button>
                  ) : (
                    <button onClick={() => {setEditId(v.id); setEditCache(v);}} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all"><Edit2 size={20}/></button>
                  )}
                  <button disabled={editing} onClick={() => exportToPDF(v)} className={`p-4 bg-blue-50 text-blue-500 rounded-2xl ${editing ? 'opacity-0 invisible hidden' : 'hover:bg-blue-600 hover:text-white'}`}><Printer size={20}/></button>
                  <button disabled={editing} onClick={() => onDelete(v.id)} className={`p-4 bg-red-50 text-red-300 rounded-2xl ${editing ? 'opacity-0 invisible hidden' : 'hover:bg-red-500 hover:text-white'}`}><Trash2 size={20}/></button>
                </div>
              </div>
              <div className="overflow-x-auto bg-slate-50/50 rounded-[2rem] p-4 lg:p-6 text-slate-800">
                <table className="w-full min-w-[700px]">
                  <thead><tr className="text-left text-[10px] font-black text-slate-300 uppercase border-b pb-2"><th className="pb-2 w-[130px]">Cant.</th><th className="pb-2">Descripción</th><th className="pb-2 text-center w-[130px]">Pendientes</th><th className="pb-2 text-right">Subtotal</th><th className="w-10"></th></tr></thead>
                  <tbody>
                    {data.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-4">{editing ? <QuantityControls value={item.cant} onChange={(val) => handleEditItem(item.id, 'cant', val)} /> : <span className="font-black text-slate-600 ml-4">{item.cant}</span>}</td>
                        <td className="py-4">{editing ? (<div className="flex gap-2"><input list="productos-list" className="text-xs border-2 rounded-lg p-2 w-1/2 outline-none focus:border-[#8ED4BE]" value={item.cat} onChange={e => handleEditItem(item.id, 'cat', e.target.value)} /><input list="temas-list" className="text-xs border-2 rounded-lg p-2 w-1/2 outline-none focus:border-[#8ED4BE]" value={item.tema} onChange={e => handleEditItem(item.id, 'tema', e.target.value)} /></div>) : <span className="text-[11px] font-black uppercase text-slate-700">{item.cat} - {item.tema}</span>}</td>
                        <td className="py-4"><div className="flex justify-center">{editing ? <QuantityControls value={item.pendiente} colorClass="bg-red-50" textClass="text-red-500" onChange={(val) => handleEditItem(item.id, 'pendiente', val)} /> : <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${item.pendiente > 0 ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'}`}>{item.pendiente > 0 ? item.pendiente : 'Entregado'}</span>}</div></td>
                        <td className="py-4 text-right font-black text-slate-800">{Utils.currency(item.cant * item.precio)}</td>
                        <td className="text-center">{editing && <button onClick={() => setEditCache({...editCache, items: editCache.items.filter(i => i.id !== item.id)})} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {editing && <button onClick={agregarLineaEdicion} className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase px-4 py-2 border-2 border-emerald-100 rounded-xl hover:bg-emerald-50 transition-all"><Plus size={14}/> Agregar Producto Extra</button>}
            </div>
          );
        })}
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
    <div className="p-6 lg:p-12 max-w-7xl mx-auto pb-32 overflow-x-hidden text-slate-800">
      <header className="mb-16 text-center lg:text-left"><h1 className="text-5xl lg:text-8xl font-black italic text-slate-800 tracking-tighter uppercase leading-[0.9]">Panel<br/><span className="text-[#8ED4BE]">Alekey.</span></h1></header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        <div className="bg-[#8ED4BE] p-10 rounded-[3rem] text-white shadow-2xl min-h-[220px] flex flex-col justify-center"><p className="text-xs font-black uppercase mb-3 opacity-80">Ingresos</p><h3 className={`font-black italic leading-none truncate ${stats.ing > 999999 ? 'text-3xl lg:text-5xl' : 'text-4xl lg:text-6xl'}`}>{Utils.currency(stats.ing)}</h3></div>
        <div className="bg-[#F79598] p-10 rounded-[3rem] text-white shadow-2xl min-h-[220px] flex flex-col justify-center"><p className="text-xs font-black uppercase mb-3 opacity-80">Pendientes</p><h3 className="text-4xl lg:text-6xl font-black italic leading-none">{stats.pnd} <span className="text-2xl lg:text-3xl opacity-60 font-bold">Pzs</span></h3></div>
        <div className="bg-[#C0C976] p-10 rounded-[3rem] text-white shadow-2xl min-h-[220px] flex flex-col justify-center"><p className="text-xs font-black uppercase mb-3 opacity-80">Órdenes</p><h3 className="text-4xl lg:text-6xl font-black italic leading-none">{stats.total}</h3></div>
      </div>
      <div id="seccion-pedidos" className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        <Link to="/cotizar" className="p-10 lg:p-14 bg-white rounded-[2.5rem] lg:rounded-[4.5rem] flex items-center justify-between border-4 border-slate-50 hover:border-[#8ED4BE] transition-all group shadow-xl"><div><h4 className="text-3xl lg:text-4xl font-black italic uppercase text-slate-800">Cotizar</h4><p className="text-xs font-bold opacity-40 uppercase mt-1">Nuevo Pedido</p></div><Plus size={32} className="group-hover:rotate-90 transition-all text-[#8ED4BE]"/></Link>
        <Link to="/ventas" className="p-10 lg:p-14 bg-white rounded-[2.5rem] lg:rounded-[4.5rem] flex items-center justify-between border-4 border-slate-50 hover:border-[#F79598] transition-all group shadow-xl"><div><h4 className="text-3xl lg:text-4xl font-black italic uppercase text-slate-800">Ventas</h4><p className="text-xs font-bold opacity-40 uppercase mt-1">Historial</p></div><ShoppingBag size={32} className="group-hover:scale-110 transition-all text-[#F79598]"/></Link>
      </div>
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
    const { error } = await supabase.from('ventas').delete().eq('id', id);
    if (!error) setVentas(ventas.filter(v => v.id !== id));
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
          <div className="flex lg:flex-col items-center lg:items-start justify-between w-full lg:space-y-20"><div className="hidden lg:block text-4xl font-black italic text-slate-800">ALEKEY<span className="text-[#8ED4BE]">.</span></div><nav className="flex flex-row lg:flex-col gap-2 lg:gap-6 w-full justify-around lg:justify-start"><NavLink to="/" icon={<Home size={22}/>} label="Inicio" /><NavLink to="/cotizar" icon={<Plus size={22}/>} label="Cotizar" /><NavLink to="/ventas" icon={<ShoppingBag size={22}/>} label="Ventas" /></nav></div>
          <div className="hidden lg:flex p-6 bg-slate-900 rounded-[2rem] text-white items-center gap-4 italic font-black text-xs"><div className="w-8 h-8 bg-[#8ED4BE] rounded-xl flex items-center justify-center font-bold text-slate-800">IV</div> Admin Alekey</div>
        </aside>
        <main className="flex-1 overflow-y-auto bg-slate-50/30">
          <Routes>
            <Route path="/" element={<DashboardHome historial={ventas} />} />
            <Route path="/cotizar" element={<FormularioCotizacion alGuardar={alGuardarEnNube} />} />
            <Route path="/ventas" element={<HistorialVentas ventas={ventas} onDelete={alEliminar} onUpdate={alActualizar} />} />
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