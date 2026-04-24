import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Clock, CheckCircle, XCircle, Search, Filter, Plus, CalendarDays, Monitor, ShieldCheck, X, ChevronLeft, ChevronRight, Edit2, Trash2, Eye, MapPin, Phone } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';

const ReservationsManager = () => {
  const { reservations, updateReservationStatus, addReservation, deleteReservation: apiDeleteReservation, locations, setReservations } = useAdmin();
  const [isAdding, setIsAdding] = useState(false);
  const [editingResId, setEditingResId] = useState(null);
  const [viewingResId, setViewingResId] = useState(null);
  const [resToDelete, setResToDelete] = useState(null);

  const [newRes, setNewRes] = useState({ 
    name: '', 
    identification: '',
    phone: '',
    email: '',
    date: '', 
    time: '', 
    persons: 2,
    locationId: '',
    instructions: ''
  });

  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [viewMode, setViewMode] = useState('list');

  const validate = () => {
    const newErrors = {};
    if (!newRes.name.trim()) newErrors.name = 'Requerido';
    if (!newRes.identification.trim()) newErrors.identification = 'Requerido';
    if (!newRes.phone.trim()) newErrors.phone = 'Requerido';
    if (!newRes.date) newErrors.date = 'Requerido';
    if (!newRes.time) newErrors.time = 'Requerido';
    if (!newRes.locationId) newErrors.locationId = 'Requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveRes = () => {
    if (validate()) {
      if (editingResId) {
        setReservations(prev => prev.map(r => r.id === editingResId ? { ...r, ...newRes } : r));
        setEditingResId(null);
      } else {
        addReservation({
          ...newRes,
          status: 'Pendiente',
          method: 'admin'
        });
        setIsAdding(false);
      }
      setNewRes({ name: '', identification: '', phone: '', email: '', date: '', time: '', persons: 2, locationId: '', instructions: '' });
      setErrors({});
    }
  };

  const deleteReservation = async () => {
    if (!resToDelete) return;
    await apiDeleteReservation(resToDelete.id);
    setResToDelete(null);
  };

  const startEdit = (res) => {
    setNewRes({ ...res });
    setEditingResId(res.id);
  };

  const filteredReservations = reservations.filter(res => {
    const name = res.name || '';
    const id = res.id || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => b.id.localeCompare(a.id));

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Pendiente': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Cancelado': return 'bg-accent/10 text-accent border-accent/20';
      case 'Completado': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const viewingRes = reservations.find(r => r.id === viewingResId);

  // --- Calendar Logic ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="space-y-10 uppercase">
      {/* Modals */}
      <Modal 
        isOpen={isAdding || !!editingResId} 
        onClose={() => { setIsAdding(false); setEditingResId(null); setErrors({}); }}
        title={editingResId ? 'Editar' : 'Nueva'}
        subtitle="Reserva de Mesa"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">01 Datos del Cliente</p>
              <Input label="Nombre Completo" value={newRes.name} onChange={(e) => setNewRes({...newRes, name: e.target.value.toUpperCase()})} error={errors.name} />
              <div className="grid grid-cols-2 gap-4">
                 <Input label="ID / Documento" value={newRes.identification} onChange={(e) => setNewRes({...newRes, identification: e.target.value})} error={errors.identification} />
                 <Input label="Teléfono" value={newRes.phone} onChange={(e) => setNewRes({...newRes, phone: e.target.value})} error={errors.phone} />
              </div>
              <Input label="Email de Contacto" value={newRes.email} onChange={(e) => setNewRes({...newRes, email: e.target.value.toLowerCase()})} />
           </div>
           <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-2">02 Detalles del Servicio</p>
              <div className="grid grid-cols-2 gap-4">
                 <Input label="Fecha" type="date" value={newRes.date} onChange={(e) => setNewRes({...newRes, date: e.target.value})} error={errors.date} />
                 <Input label="Hora" type="time" value={newRes.time} onChange={(e) => setNewRes({...newRes, time: e.target.value})} error={errors.time} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Nº Personas</label>
                    <input type="number" className="w-full px-4 py-3 bg-background border-2 border-zinc-700 text-text-bright text-xs font-bold transition-all focus:border-primary" value={newRes.persons} onChange={(e) => setNewRes({...newRes, persons: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Zona</label>
                    <select className="w-full px-4 py-3 bg-background border-2 border-zinc-700 text-text-bright text-xs font-bold transition-all focus:border-primary" value={newRes.locationId} onChange={(e) => setNewRes({...newRes, locationId: e.target.value})}>
                       <option value="">Selección...</option>
                       {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    {errors.locationId && <p className="text-[8px] text-accent font-bold mt-1 uppercase">{errors.locationId}</p>}
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Instrucciones Especiales</label>
                 <textarea className="w-full px-4 py-3 bg-background border-2 border-zinc-700 text-text-bright text-xs font-bold transition-all focus:border-primary min-h-[100px] uppercase" value={newRes.instructions} onChange={(e) => setNewRes({...newRes, instructions: e.target.value})} />
              </div>
           </div>
           <div className="lg:col-span-2 pt-6 border-t border-zinc-800 flex space-x-4">
              <Button onClick={handleSaveRes} className="flex-1 text-lg">{editingResId ? 'Actualizar Reserva' : 'Confirmar Reserva'}</Button>
              <Button variant="outline" onClick={() => { setIsAdding(false); setEditingResId(null); setErrors({}); }} className="flex-1 text-lg border-zinc-700">Descartar</Button>
           </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!viewingResId}
        onClose={() => setViewingResId(null)}
        title="Expediente"
        subtitle="Reserva"
        maxWidth="max-w-2xl"
      >
        {viewingRes && (
          <div className="space-y-8">
             <div className="flex justify-between items-start border-b border-zinc-800 pb-6">
                <div><h3 className="text-4xl font-serif text-text-bright">{viewingRes.name}</h3><p className="text-[10px] font-bold text-primary tracking-widest mt-2">// ID: {viewingRes.id}</p></div>
                <span className={`px-4 py-1 text-[10px] font-bold border ${getStatusStyle(viewingRes.status)}`}>{viewingRes.status}</span>
             </div>
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div><p className="text-[8px] font-bold text-text-dim mb-1">FECHA Y HORA</p><p className="text-xl font-serif text-text-bright">{viewingRes.date} @ {viewingRes.time}</p></div>
                   <div><p className="text-[8px] font-bold text-text-dim mb-1">UBICACIÓN</p><p className="text-sm font-bold text-text-bright uppercase">{locations.find(l => l.id === viewingRes.locationId)?.name || 'N/A'}</p></div>
                </div>
                <div className="space-y-4">
                   <div><p className="text-[8px] font-bold text-text-dim mb-1">COMENSALES</p><p className="text-xl font-serif text-text-bright">{viewingRes.persons} PERSONAS</p></div>
                   <div><p className="text-[8px] font-bold text-text-dim mb-1">CONTACTO</p><p className="text-sm font-bold text-text-bright">{viewingRes.phone} // {viewingRes.email || 'SIN EMAIL'}</p></div>
                </div>
             </div>
             <div className="bg-background p-6 border-2 border-zinc-800"><p className="text-[8px] font-bold text-primary mb-2 tracking-[0.3em] uppercase">Notas de Cocina / Servicio</p><p className="text-xs italic leading-relaxed text-text-dim">{viewingRes.instructions || 'SIN INSTRUCCIONES ADICIONALES'}</p></div>
             <div className="pt-6 flex space-x-4">
                <Button onClick={() => { setViewingResId(null); startEdit(viewingRes); }} className="flex-1 space-x-2"><Edit2 size={16}/><span>Editar</span></Button>
                <Button variant="outline" onClick={() => setViewingResId(null)} className="flex-1 border-zinc-700">Cerrar Expediente</Button>
             </div>
          </div>
        )}
      </Modal>

      <ConfirmModal 
        isOpen={!!resToDelete}
        onClose={() => setResToDelete(null)}
        onConfirm={deleteReservation}
        title="Eliminar Reserva"
        message={`¿Estás seguro de que deseas eliminar permanentemente la reserva de ${resToDelete?.name}?`}
      />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-8 border-primary pl-6 md:pl-8">
        <div>
          <h1 className="text-3xl md:text-7xl font-serif uppercase leading-none text-text-bright">
            Libro de <span className="text-primary italic">Reservas</span>
          </h1>
          <p className="text-[10px] md:text-xs text-text-dim tracking-[0.4em] uppercase mt-2 md:mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">
            Control de Aforo y Gestión de Mesa
          </p>
        </div>
        
        <div className="flex bg-surface border-2 border-zinc-200 dark:border-zinc-800 p-1 w-full md:w-auto">
          <button onClick={() => setViewMode('list')} className={`flex-1 md:px-6 py-2 flex items-center justify-center space-x-2 uppercase tracking-widest text-[10px] font-bold transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-text-dim hover:text-primary'}`}><Monitor size={14} /><span>Listado</span></button>
          <button onClick={() => setViewMode('calendar')} className={`flex-1 md:px-6 py-2 flex items-center justify-center space-x-2 uppercase tracking-widest text-[10px] font-bold transition-all ${viewMode === 'calendar' ? 'bg-primary text-white shadow-lg' : 'text-text-dim hover:text-primary border-l border-zinc-100 dark:border-zinc-800'}`}><CalendarDays size={14} /><span>Agenda</span></button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-900">
         <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
            <div className="relative w-full lg:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
               <input type="text" placeholder="BUSCAR RESERVA..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-background border-2 border-zinc-200 dark:border-zinc-800 p-2.5 pl-10 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary transition-all" />
            </div>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden lg:block"></div>
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-1 w-full sm:w-auto">
               <Filter size={14} className="text-primary flex-shrink-0" />
               {['Todos', 'Confirmado', 'Pendiente', 'Cancelado'].map(f => (
                 <button key={f} onClick={() => setStatusFilter(f)} className={`px-4 py-2 text-[9px] font-bold uppercase transition-all whitespace-nowrap ${statusFilter === f ? 'bg-primary text-white border-primary' : 'text-text-dim hover:text-primary border border-zinc-200 dark:border-zinc-800'}`}>{f}</button>
               ))}
            </div>
         </div>
         <Button onClick={() => setIsAdding(true)} className="w-full lg:w-auto flex items-center justify-center space-x-2 py-4"><Plus size={16} /><span>Nueva Reserva</span></Button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 overflow-hidden"
          >
             <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-[900px]">
                   <thead>
                      <tr className="bg-black/5 dark:bg-white/5 border-b-2 border-zinc-200 dark:border-zinc-800">
                         <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-primary">Status</th>
                         <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-primary">Cliente</th>
                         <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-primary">Contacto</th>
                         <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-primary">Fecha / Hora</th>
                         <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-primary">Personas</th>
                         <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-primary">Ubicación</th>
                         <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-primary text-right">Acciones</th>
                      </tr>
                   </thead>
                   <tbody>
                      {filteredReservations.length === 0 ? (
                        <tr>
                           <td colSpan="7" className="p-20 text-center opacity-30">
                              <Calendar size={60} className="mx-auto mb-4" strokeWidth={0.5} />
                              <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No hay registros para mostrar</p>
                           </td>
                        </tr>
                      ) : (
                        filteredReservations.map((res) => (
                          <tr key={res.id} className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-primary/5 transition-all group">
                             <td className="p-5">
                                <div className="flex items-center space-x-3">
                                   <div className="flex space-x-1">
                                      {['Confirmado', 'Cancelado', 'Pendiente'].map(s => (
                                         <button 
                                            key={s} 
                                            onClick={() => updateReservationStatus(res.id, s)} 
                                            title={s}
                                            className={`w-6 h-6 border flex items-center justify-center transition-all ${res.status === s ? 'bg-primary border-primary text-white' : 'text-text-dim hover:text-primary dark:border-zinc-800'}`}
                                         >
                                            {s === 'Confirmado' ? <CheckCircle size={12}/> : s === 'Cancelado' ? <XCircle size={12}/> : <Clock size={12}/>}
                                         </button>
                                      ))}
                                   </div>
                                   <span className={`text-[8px] font-bold uppercase px-2 py-0.5 border ${getStatusStyle(res.status)}`}>{res.status}</span>
                                </div>
                             </td>
                             <td className="p-5">
                                <p className="text-sm font-bold text-text-bright uppercase">{res.name}</p>
                                <p className="text-[8px] text-text-dim mt-0.5 tracking-tighter">ID: #{String(res.id).split('_').pop()}</p>
                             </td>
                             <td className="p-5">
                                {(() => {
                                   const phone = res.phone || '';
                                   if (!phone) return <span className="text-[10px] text-text-dim italic">SIN CONTACTO</span>;

                                   const cleanPhone = phone.replace(/\D/g, '');
                                   const waMsg = encodeURIComponent(`Hola ${res.name}, te escribimos de Urban Street para confirmar tu reserva para el ${res.date} a las ${res.time}. ¿Confirmas tu asistencia?`);
                                   const waUrl = `https://wa.me/${cleanPhone.length > 10 ? cleanPhone : '57' + cleanPhone}?text=${waMsg}`;
                                   
                                   return (
                                     <a 
                                       href={waUrl} 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       className="flex items-center space-x-2 text-primary hover:underline group/phone"
                                       title="Enviar WhatsApp de Confirmación"
                                     >
                                        <Phone size={12} />
                                        <span className="text-xs font-bold tracking-widest">{res.phone}</span>
                                     </a>
                                   );
                                })()}
                             </td>
                             <td className="p-5">
                                <div className="flex items-center space-x-2 text-text-bright">
                                   <Calendar size={12} className="text-primary" />
                                   <span className="text-xs font-bold">{res.date}</span>
                                   <span className="text-primary font-bold">@</span>
                                   <span className="text-xs font-bold">{res.time}</span>
                                </div>
                             </td>
                             <td className="p-5">
                                <div className="flex items-center space-x-2">
                                   <Users size={12} className="text-primary" />
                                   <span className="text-xs font-bold text-text-bright">{res.persons}p</span>
                                </div>
                             </td>
                             <td className="p-5">
                                <div className="flex items-center space-x-2">
                                   <MapPin size={12} className="text-primary" />
                                   <span className="text-[10px] font-bold text-text-bright uppercase truncate max-w-[150px]">
                                      {locations.find(l => l.id === res.locationId)?.name || 'N/A'}
                                   </span>
                                </div>
                             </td>
                             <td className="p-5 text-right">
                                <div className="flex items-center justify-end space-x-1">
                                   <button onClick={() => setViewingResId(res.id)} className="p-2 text-text-dim hover:text-primary transition-colors bg-black/5 dark:bg-white/5"><Eye size={14}/></button>
                                   <button onClick={() => startEdit(res)} className="p-2 text-text-dim hover:text-primary transition-colors bg-black/5 dark:bg-white/5"><Edit2 size={14}/></button>
                                   <button onClick={() => setResToDelete(res)} className="p-2 text-text-dim hover:text-accent transition-colors bg-black/5 dark:bg-white/5"><Trash2 size={14}/></button>
                                </div>
                             </td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="bg-surface border-2 md:border-4 border-zinc-200 dark:border-zinc-900 overflow-hidden shadow-2xl">
             <div className="p-4 md:p-8 bg-zinc-50 dark:bg-black/20 border-b border-zinc-200 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-text-bright">
                <div className="flex items-center space-x-4 md:space-x-6 w-full md:w-auto justify-between md:justify-start">
                   <h2 className="text-2xl md:text-4xl font-serif uppercase leading-none">{monthNames[month]} <span className="text-primary">{year}</span></h2>
                   <div className="flex space-x-2"><button onClick={prevMonth} className="w-8 h-8 md:w-10 md:h-10 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><ChevronLeft size={18}/></button><button onClick={nextMonth} className="w-8 h-8 md:w-10 md:h-10 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><ChevronRight size={18}/></button></div>
                </div>
                <div className="flex items-center space-x-4"><div className="flex items-center space-x-2"><span className="w-3 h-3 bg-primary rounded-full"></span><span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-text-dim">Reservas Activas</span></div></div>
             </div>
             
             <div className="overflow-x-auto scrollbar-hide">
                <div className="min-w-[600px]">
                   <div className="grid grid-cols-7 text-center bg-zinc-100 dark:bg-black/10 border-b border-zinc-200 dark:border-zinc-900 py-4 uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-[9px] md:text-[10px] text-primary">
                      {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(d => <div key={d}>{d}</div>)}
                   </div>
                   <div className="grid grid-cols-7 h-[50vh] md:h-[60vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                      {(() => {
                         const totalDays = daysInMonth(year, month);
                         const startDay = firstDayOfMonth(year, month);
                         const days = [];
                         for (let i = 0; i < startDay; i++) days.push(<div key={`pad-${i}`} className="h-24 md:h-32 border-b border-r border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-white/5 opacity-20"></div>);
                         for (let d = 1; d <= totalDays; d++) {
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            const dayRes = reservations.filter(r => r.date === dateStr);
                            days.push(
                              <div key={d} className="h-24 md:h-32 border-b border-r border-zinc-100 dark:border-zinc-900 p-2 relative group hover:bg-primary/5 transition-colors">
                                 <span className={`text-xs font-bold ${dayRes.length > 0 ? 'text-primary' : 'text-text-dim'}`}>{d}</span>
                                 <div className="space-y-1 mt-1 overflow-hidden">
                                    {dayRes.map(r => (
                                      <button key={r.id} onClick={() => setViewingResId(r.id)} className="w-full text-left bg-primary/20 hover:bg-primary/40 border-l-2 border-primary p-1 transition-all">
                                         <p className="text-[7px] md:text-[8px] font-bold uppercase truncate text-text-bright">{r.name}</p>
                                         <p className="text-[6px] uppercase text-text-dim">{r.time}</p>
                                      </button>
                                    ))}
                                 </div>
                                 <button onClick={() => { setIsAdding(true); setNewRes({...newRes, date: dateStr}); }} className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary"><Plus size={14} /></button>
                              </div>
                            );
                         }
                         return days;
                      })()}
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReservationsManager;
