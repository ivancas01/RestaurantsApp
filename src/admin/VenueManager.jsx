import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Plus, Hash, Layers, Trash2, CheckCircle2, Clock, Edit2, Upload, Image as ImageIcon, QrCode, Download, X, Printer } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';

const VenueManager = () => {
  const { locations, tables, addLocation, addTable, removeLocation, removeTable } = useAdmin();
  const { showNotification } = useNotification();
  const [selectedLocation, setSelectedLocation] = useState(locations[0]?.id || null);
  
  // Modal States
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'table'|'location', id, name }

  const [newLoc, setNewLoc] = useState({ name: '', image_preview: '', image_file: null });
  const [newTable, setNewTable] = useState({ number: '', capacity: 4 });
  const [selectedTableForQr, setSelectedTableForQr] = useState(null);

  const getTableQrUrl = (tableId) => {
    const baseUrl = `${window.location.origin}/hidden-admin/orders`;
    return `${baseUrl}?tableId=${tableId}`;
  };

  const getQrImageUrl = (url) => {
    return `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(url)}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setNewLoc({ ...newLoc, image_file: file, image_preview: previewUrl });
    }
  };

  const handleAddLocation = async () => {
    if (!newLoc.name.trim()) {
      showNotification("El nombre de la zona es obligatorio", "error");
      return;
    }
    const added = await addLocation(newLoc);
    if (added) setSelectedLocation(added.id);
    setNewLoc({ name: '', image_preview: '', image_file: null });
    setIsEditingLocation(false);
    showNotification("Zona de servicio creada exitosamente");
  };

  const handleAddTable = async () => {
    if (!newTable.number) {
      showNotification("El número de mesa es obligatorio", "error");
      return;
    }
    if (!selectedLocation) {
      showNotification("Debes seleccionar una zona primero", "error");
      return;
    }
    await addTable({
      number: newTable.number,
      capacity: newTable.capacity,
      locationId: selectedLocation,
      status: 'Disponible'
    });
    setNewTable({ number: '', capacity: 4 });
    setIsEditingTable(false);
    showNotification(`Mesa ${newTable.number} registrada en el sistema`);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    if (type === 'table') {
      await removeTable(id);
    } else {
      if (tables.some(t => t.locationId === id)) {
        showNotification("No se puede eliminar una ubicación que tiene mesas asignadas.", "error");
        setItemToDelete(null);
        return;
      }
      await removeLocation(id);
      if (selectedLocation === id) setSelectedLocation(locations[0]?.id || null);
      showNotification("Ubicación eliminada");
    }
    setItemToDelete(null);
  };

  const [filter, setFilter] = useState('ALL'); // 'ALL', 'Disponible', 'Ocupada', 'Reservada'

  const filteredTables = tables.filter(t => {
    const matchesLoc = t.locationId === selectedLocation;
    const matchesFilter = filter === 'ALL' || t.status === filter;
    return matchesLoc && matchesFilter;
  });

  return (
    <div className="space-y-12 uppercase">
      {/* Modals */}
      <Modal 
        isOpen={isEditingLocation} 
        onClose={() => setIsEditingLocation(false)} 
        title="Nueva" 
        subtitle="Zona / Ubicación"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
           <Input 
             label="Nombre de Zona" 
             value={newLoc.name} 
             onChange={(e) => setNewLoc({...newLoc, name: e.target.value.toUpperCase()})} 
             placeholder="Ej. VIP, Terraza..." 
           />

           <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Imagen de la Zona</label>
              <div className="flex items-center space-x-4">
                 <div className="w-16 h-16 bg-background border-2 border-zinc-800 flex items-center justify-center overflow-hidden">
                    {newLoc.image_preview ? (
                      <img src={newLoc.image_preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-text-dim/30" />
                    )}
                 </div>
                 <label className="flex-1 border-2 border-dashed border-zinc-800 hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center p-4">
                    <Upload size={18} className="text-primary mb-1" />
                    <span className="text-[8px] font-bold uppercase text-text-dim">Cargar de PC</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                 </label>
              </div>
           </div>

           <div className="flex justify-end pt-8">
             <Button 
               onClick={handleAddLocation} 
               className="text-xs font-bold uppercase tracking-[0.3em] px-20 py-4 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
               style={{ boxShadow: '10px 10px 0px 0px var(--primary-shadow-20)' }}
             >
                Crear Zona
             </Button>
           </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isEditingTable} 
        onClose={() => setIsEditingTable(false)} 
        title="Añadir" 
        subtitle="Mesa de Servicio"
        maxWidth="max-w-md"
      >
        <div className="space-y-6">
           <Input 
             label="Nº Identificador Mesa" 
             value={newTable.number} 
             onChange={(e) => setNewTable({...newTable, number: e.target.value})} 
             placeholder="Ej. 12" 
           />
           <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Comensales</label>
                 <input 
                   type="number"
                   className="w-full px-4 py-3 bg-background border-2 border-zinc-700 text-text-bright text-xs font-bold transition-all focus:border-primary"
                   value={newTable.capacity}
                   onChange={(e) => setNewTable({...newTable, capacity: e.target.value})}
                 />
              </div>
              <div className="flex flex-col space-y-2">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Forma</label>
                 <select 
                   className="w-full px-4 py-3 bg-background border-2 border-zinc-700 text-text-bright text-xs font-bold transition-all focus:border-primary appearance-none"
                   value={newTable.shape || 'rect'}
                   onChange={(e) => setNewTable({...newTable, shape: e.target.value})}
                 >
                    <option value="rect">Cuadrada</option>
                    <option value="circle">Circular</option>
                 </select>
              </div>
           </div>
           <div className="flex justify-end pt-8">
             <Button 
               onClick={handleAddTable} 
               className="text-xs font-bold uppercase tracking-[0.3em] px-20 py-4 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
               style={{ boxShadow: '10px 10px 0px 0px var(--primary-shadow-20)' }}
             >
                Registrar Mesa
             </Button>
           </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title={itemToDelete?.type === 'table' ? 'Eliminar Mesa' : 'Eliminar Zona'}
        message={`¿Estás seguro de que deseas eliminar "${itemToDelete?.name}"? Esta acción es irreversible.`}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-8 border-primary pl-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-serif uppercase leading-none text-text-bright">
            Gestión de <span className="text-primary italic">Espacios</span>
          </h1>
          <p className="text-text-dim tracking-[0.4em] text-xs uppercase mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">
            Control de Disponibilidad y Mesas
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
           <Button onClick={() => setIsEditingLocation(true)} className="flex items-center space-x-2">
              <Plus size={16} />
              <span>Nueva Zona</span>
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Locations Sidebar */}
        <div className="lg:col-span-1 space-y-4">
           <div className="flex items-center space-x-2 mb-6">
              <Layers size={18} className="text-primary" />
              <h2 className="text-lg font-serif uppercase tracking-widest leading-none text-text-bright">Zonas</h2>
           </div>

           <div className="space-y-2">
              {locations.map((loc) => (
                <div key={loc.id} className="relative group">
                  <button
                    onClick={() => setSelectedLocation(loc.id)}
                    className={`w-full text-left p-4 uppercase tracking-[0.2em] text-[10px] font-bold border-2 transition-all ${
                      selectedLocation === loc.id 
                        ? 'bg-primary border-primary text-white translate-x-2 shadow-lg' 
                        : 'bg-surface border-zinc-200 dark:border-zinc-800 text-text-dim hover:border-primary hover:text-primary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                          <MapPin size={14} />
                          <span>{loc.name}</span>
                       </div>
                    </div>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setItemToDelete({ type: 'location', id: loc.id, name: loc.name }); }}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-accent text-white p-2 hover:bg-primary transition-all shadow-xl z-20"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
           </div>
        </div>

        {/* Dynamic Area: Grid View with Enhanced Status */}
        <div className="lg:col-span-4 space-y-8">
           <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-zinc-200 dark:border-zinc-900 pb-4 gap-4">
              <h2 className="text-2xl font-serif uppercase tracking-wider text-text-bright">
                {locations.find(l => l.id === selectedLocation)?.name || 'Selecciona Zona'}
              </h2>
              
              <div className="flex items-center space-x-2 bg-surface p-1 border-2 border-zinc-800">
                 {['ALL', 'Disponible', 'Ocupada', 'Reservada'].map(s => (
                   <button
                     key={s}
                     onClick={() => setFilter(s)}
                     className={`px-4 py-1.5 text-[8px] font-bold uppercase tracking-widest transition-all ${filter === s ? 'bg-primary text-white' : 'text-text-dim hover:text-primary'}`}
                   >
                      {s === 'ALL' ? 'Todas' : s}
                   </button>
                 ))}
              </div>

              {selectedLocation && (
                <Button onClick={() => setIsEditingTable(true)} className="flex items-center space-x-2">
                  <Plus size={16} />
                  <span>Añadir Mesa</span>
                </Button>
              )}
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTables.map((table) => (
                <div 
                  key={table.id} 
                  className={`bg-surface border-2 p-6 flex flex-col items-center justify-center text-center relative group transition-all shadow-sm overflow-hidden ${
                    table.status === 'Disponible' ? 'border-zinc-200 dark:border-zinc-800 hover:border-green-500' :
                    table.status === 'Ocupada' ? 'border-primary' : 'border-yellow-500'
                  }`}
                >
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                     <button onClick={() => setSelectedTableForQr(table)} className="bg-surface border border-zinc-200 dark:border-zinc-800 p-1.5 text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                       <QrCode size={14}/>
                     </button>
                     <button onClick={() => setItemToDelete({ type: 'table', id: table.id, name: `Mesa ${table.number}` })} className="bg-surface border border-zinc-200 dark:border-zinc-800 p-1.5 text-text-dim hover:bg-accent hover:text-white transition-all shadow-lg">
                       <Trash2 size={14}/>
                     </button>
                  </div>

                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    table.status === 'Disponible' ? 'bg-green-500/30' :
                    table.status === 'Ocupada' ? 'bg-primary' : 'bg-yellow-500'
                  }`} />

                  <div className={`w-16 h-16 border-2 flex items-center justify-center mb-4 transition-colors ${
                      table.shape === 'circle' ? 'rounded-full' : 'rounded-none'
                  } ${
                      table.status === 'Disponible' ? 'border-green-500/20 text-green-500/50' : 
                      table.status === 'Ocupada' ? 'border-primary text-primary' : 'border-yellow-500 text-yellow-500'
                  }`}>
                     <Hash size={32} />
                  </div>

                  <h3 className="text-3xl font-serif text-text-bright leading-none uppercase">Mesa {table.number}</h3>
                  <div className="flex items-center space-x-2 text-[10px] text-text-dim uppercase tracking-widest font-bold mt-2">
                     <Users size={12} />
                     <span>{table.capacity} Personas</span>
                  </div>

                  <div className="mt-6 w-full pt-4 border-t border-zinc-100 dark:border-white/5">
                     <div className="flex items-center justify-center space-x-2 text-[9px] font-bold uppercase tracking-[0.2em]">
                        {table.status === 'Disponible' ? (
                          <div className="flex items-center space-x-2 text-green-500">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span>LIBRE</span>
                          </div>
                        ) : (
                          <div className={`flex items-center space-x-2 ${table.status === 'Ocupada' ? 'text-primary' : 'text-yellow-500'}`}>
                            <Clock size={12} />
                            <span>{table.status}</span>
                          </div>
                        )}
                     </div>
                  </div>
                  
                  {/* Background Distinction */}
                  <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                     <Hash size={100} />
                  </div>
                </div>
              ))}
           </div>

           {!selectedLocation && (
             <div className="h-64 border-2 border-dashed border-zinc-200 dark:border-zinc-900 flex flex-col items-center justify-center opacity-30 text-text-bright">
                <MapPin size={48} strokeWidth={1} />
                <p className="uppercase tracking-[0.3em] font-bold text-xs mt-4">Selecciona una zona para ver disponibilidad</p>
             </div>
           )}

           {selectedLocation && filteredTables.length === 0 && (
             <div className="h-64 border-2 border-dashed border-zinc-200 dark:border-zinc-900 flex flex-col items-center justify-center opacity-30 text-text-bright">
                <Layers size={48} strokeWidth={1} />
                <p className="uppercase tracking-[0.3em] font-bold text-xs mt-4">No hay mesas con este estado</p>
             </div>
           )}
        </div>
      </div>
      {/* QR Code Modal */}
      <Modal
        isOpen={!!selectedTableForQr}
        onClose={() => setSelectedTableForQr(null)}
        title="Código QR"
        subtitle={`Mesa ${selectedTableForQr?.number}`}
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center space-y-8 p-4">
          <div className="bg-white p-4 shadow-2xl border-2 border-zinc-100 min-w-[256px] min-h-[256px] flex items-center justify-center relative">
             {!selectedTableForQr?.id ? (
               <div className="text-text-dim text-[10px] uppercase font-bold">Generando...</div>
             ) : (
               <>
                 <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <QrCode size={48} className="animate-pulse" />
                 </div>
                 <img 
                   src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getTableQrUrl(selectedTableForQr.id))}`}
                   alt={`QR Mesa ${selectedTableForQr.number}`}
                   className="w-64 h-64 relative z-10"
                   onLoad={(e) => e.target.previousSibling.style.display = 'none'}
                 />
               </>
             )}
          </div>
          
          <div className="w-full space-y-4">
            <div className="bg-background border-2 border-zinc-200 dark:border-zinc-800 p-4 relative group">
               <p className="text-[8px] font-bold text-primary uppercase tracking-widest mb-1">Enlace de Acceso Directo</p>
               <p className="text-[10px] font-mono break-all text-text-dim">{getTableQrUrl(selectedTableForQr?.id)}</p>
            </div>
            
            <p className="text-[9px] text-center text-text-dim uppercase tracking-widest leading-relaxed">
              Escanea este código para abrir directamente la toma de pedidos con esta mesa pre-seleccionada.
            </p>
            
            <Button 
              variant="primary" 
              className="w-full flex items-center justify-center space-x-3"
              onClick={() => window.print()}
            >
               <Printer size={18} />
               <span>Imprimir Código</span>
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar ${itemToDelete?.name}? Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default VenueManager;
