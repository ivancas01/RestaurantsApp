import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, CheckCircle2, ChevronRight, AlertCircle, Play, XCircle, Search, Filter, ShoppingBag, Utensils, Maximize2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const KitchenDisplay = () => {
  const { orders, updateOrderStatus, tables, locations, fetchOrders } = useAdmin();

  // Local Polling: Only while kitchen is open
  useEffect(() => {
    fetchOrders(); // Initial fetch
    const POLL_INTERVAL = 8000;
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchOrders();
      }
    }, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchOrders]);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, PREPARING, READY
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('ALL'); // ALL, table, delivery
  const [isMonitorMode, setIsMonitorMode] = useState(false);

  // Handle ESC to exit modes
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsMonitorMode(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Enhanced filtering logic
  const filteredOrders = orders.filter(o => {
    // Domicilios (delivery) en estado 'Pendiente' no van a la cocina hasta que el administrador los confirme / envíe a 'En Lista' (a menos que tenga actualizaciones)
    if (o.type === 'delivery' && o.status === 'Pendiente' && !o.has_updates) return false;

    // 0. Date Filter: Show active orders from ANY date, but completed/ready orders ONLY from today
    const orderDate = new Date(o.created_at).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    const isActive = ['Pendiente', 'En Lista', 'Confirmado', 'En Cocina', 'Preparando', 'Listo'].includes(o.status);
    const isToday = orderDate === today;

    if (!isActive && !isToday) return false;

    if (viewType !== 'ALL' && o.type !== viewType) return false;

    const isPending = ['Pendiente', 'En Lista'].includes(o.status);
    const isPreparing = ['Confirmado', 'En Cocina', 'Preparando'].includes(o.status);
    const isReady = o.status === 'Listo';
    const isCompleted = ['Completado', 'Pagado'].includes(o.status);

    let passFilter = false;
    if (filter === 'ALL') passFilter = isPending || isPreparing || isReady || isCompleted;
    else if (filter === 'PENDING') passFilter = isPending;
    else if (filter === 'PREPARING') passFilter = isPreparing;
    else if (filter === 'COMPLETED') passFilter = isCompleted || isReady;

    if (!passFilter) return false;

    if (searchTerm.trim() === '') return true;
    const searchLower = searchTerm.toLowerCase();
    const tableNum = tables.find(t => String(t.id) === String(o.table))?.number?.toString() || '';
    
    return (o.customer_name || '').toLowerCase().includes(searchLower) || 
           String(o.id || '').toLowerCase().includes(searchLower) ||
           tableNum.toLowerCase().includes(searchLower);
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleNextStatus = (orderId, currentStatus) => {
    const nextMap = {
      'Pendiente': 'Preparando',
      'En Lista': 'Preparando',
      'Confirmado': 'Preparando', // Fallback for old orders
      'Preparando': 'Listo',
      'En Cocina': 'Listo'
    };
    
    if (nextMap[currentStatus]) {
      updateOrderStatus(orderId, nextMap[currentStatus]);
    } else if (currentStatus === 'Listo') {
      updateOrderStatus(orderId, 'Completado');
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'Pendiente' || status === 'En Lista') return { label: 'En Lista', icon: <AlertCircle size={14} />, color: 'bg-yellow-500' };
    if (status === 'Confirmado') return { label: 'Confirmado', icon: <ChefHat size={14} />, color: 'bg-blue-500' };
    if (status === 'Preparando' || status === 'En Cocina') return { label: 'Preparando', icon: <Play size={14} />, color: 'bg-primary' };
    if (status === 'Listo') return { label: 'Listo', icon: <CheckCircle2 size={14} />, color: 'bg-green-500' };
    if (status === 'Completado' || status === 'Pagado') return { label: 'Completado', icon: <CheckCircle2 size={14} />, color: 'bg-emerald-500' };
    return { label: status, icon: <Clock size={14} />, color: 'bg-zinc-500' };
  };

  const updatedOrders = filteredOrders.filter(o => o.has_updates && !['Listo', 'Completado', 'Pagado', 'Servido', 'Entregado', 'Cancelado'].includes(o.status));
  const normalOrders = filteredOrders.filter(o => !o.has_updates || ['Listo', 'Completado', 'Pagado', 'Servido', 'Entregado', 'Cancelado'].includes(o.status));

  const renderOrderCard = (order, idx, isUpdate = false) => {
    const statusInfo = getStatusLabel(order.status);
    const orderTime = new Date(order.created_at || order.timestamp || new Date());
    const minutesElapsed = Math.floor((new Date() - orderTime) / 60000);
    const isDelivery = order.type === 'delivery';
    const hasUpdates = order.has_updates;

    return (
      <motion.div
        key={order.id}
        layout
        initial={{ opacity: 0, scale: 0.9, x: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
        className={`w-[calc(100vw-48px)] md:w-80 min-h-[450px] md:min-h-0 flex-shrink-0 bg-surface border-4 flex flex-col overflow-hidden shadow-2xl transition-all snap-center ${
          hasUpdates 
            ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]' 
            : (isDelivery ? 'border-amber-500/50 scale-[0.98]' : 'border-zinc-200 dark:border-zinc-900')
        }`}
      >
        <div className={`p-4 ${hasUpdates ? 'bg-amber-500 text-zinc-950 font-black' : statusInfo.color + ' text-white'} flex justify-between items-center relative overflow-hidden`}>
          <div className="flex items-center space-x-2 relative z-10">
             <span className={`text-[10px] font-bold italic mr-1 ${hasUpdates ? 'text-zinc-900/60' : 'text-white/50'}`}>{idx + 1}</span>
             <span className={`font-serif text-2xl tracking-tighter ${hasUpdates ? 'text-zinc-950' : 'text-white'}`}>#{String(order.id).split('_').pop()}</span>
             <div className={`flex items-center space-x-1 ${hasUpdates ? 'bg-black/10 text-zinc-950' : 'bg-black/20 text-white'} px-2 py-0.5 rounded text-[8px] font-bold uppercase`}>
                {hasUpdates ? <AlertCircle size={12} className="text-zinc-950 animate-pulse" /> : statusInfo.icon}
                <span>{hasUpdates ? 'ACTUALIZADO' : statusInfo.label}</span>
             </div>
          </div>
          <div className={`flex items-center space-x-1 text-[10px] font-bold relative z-10 ${hasUpdates ? 'bg-black/5 text-zinc-900' : 'bg-black/10 text-white'} px-2 py-1 rounded`}>
             <Clock size={12} />
             <span>{minutesElapsed}m</span>
          </div>
          <div className="absolute right-[-10%] top-[-10%] opacity-10 rotate-12">
             {isDelivery ? <ShoppingBag size={80} strokeWidth={1} /> : <Utensils size={80} strokeWidth={1} />}
          </div>
        </div>

        <div className={`p-4 border-b border-zinc-200 dark:border-zinc-800 ${hasUpdates ? 'bg-amber-500/20' : (isDelivery ? 'bg-amber-500/10' : 'bg-zinc-50 dark:bg-black/20')} flex justify-between items-center`}>
          <div className="flex flex-col items-start relative z-10">
             <span className={`text-[9px] font-bold uppercase tracking-widest opacity-60 ${hasUpdates ? 'text-amber-800 dark:text-amber-300' : 'text-text-bright dark:text-white/60'}`}>Cliente</span>
             <span className={`text-xs font-black uppercase tracking-wide ${hasUpdates ? 'text-amber-900 dark:text-amber-200' : 'text-text-bright dark:text-white'}`}>
                {order.customer_name || 'Sin Nombre'}
             </span>
          </div>
          <div className="flex flex-col items-end relative z-10">
             <span className={`text-xs font-black uppercase tracking-widest leading-none ${hasUpdates ? 'text-amber-900 dark:text-amber-200' : 'text-text-bright dark:text-white'}`}>
               {isDelivery ? 'Domicilio' : `Mesa ${tables.find(t => t.id === order.table)?.number || '??'}`}
             </span>
             {!isDelivery && (
               <span className={`text-[8px] font-bold uppercase opacity-80 mt-1 ${hasUpdates ? 'text-amber-800/80 dark:text-amber-300/80' : 'text-text-dim dark:text-white/50'}`}>
                 {locations.find(l => l.id === tables.find(t => t.id === order.table)?.locationId)?.name || 'General'}
               </span>
             )}
          </div>
        </div>

        <div className="flex-1 p-3 md:p-4 space-y-3 md:space-y-4 overflow-y-auto scrollbar-hide bg-white dark:bg-transparent">
           {order.notes && (
             <div className="bg-primary/10 p-3 border-l-4 border-primary mb-4">
                <p className="text-[8px] font-bold text-primary mb-1 uppercase tracking-widest italic">Observaciones Generales</p>
                <p className="text-[10px] font-bold text-text-bright uppercase leading-tight">"{order.notes}"</p>
             </div>
           )}
           
           {(() => {
             const originalItems = order.items.filter(item => !item.is_new);
             const newItems = order.items.filter(item => item.is_new);
             
             if (newItems.length === 0) {
               return order.items.map((item, index) => (
                 <div key={index} className="pb-3 md:pb-4 border-b border-dashed border-zinc-200 dark:border-zinc-800 last:border-0">
                    <div className="flex justify-between items-start">
                       <span className="text-xl md:text-2xl font-serif text-primary mr-2 md:mr-3">{item.quantity}x</span>
                       <div className="flex-1">
                          <p className="text-xs md:text-sm font-bold text-text-bright uppercase leading-tight">{item.product_name || item.name}</p>
                          {item.notes && (
                             <p className="text-[8px] text-accent font-bold mt-1 uppercase italic bg-accent/10 px-1 inline-block">-- {item.notes}</p>
                          )}
                       </div>
                    </div>
                 </div>
               ));
             }

             return (
               <div className="space-y-4 w-full">
                 {originalItems.length > 0 && (
                   <div className="space-y-2.5">
                     <div className="flex items-center space-x-2 pb-1 border-b border-zinc-100 dark:border-zinc-800/60">
                       <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                         Ya Pedidos
                       </span>
                     </div>
                     {originalItems.map((item, index) => (
                       <div key={`orig-${index}`} className="pb-2 border-b border-dashed border-zinc-100 dark:border-zinc-800/40 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start opacity-60">
                             <span className="text-base md:text-lg font-serif text-zinc-500 mr-2 md:mr-3">{item.quantity}x</span>
                             <div className="flex-1">
                                <p className="text-xs md:text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase leading-tight">{item.product_name || item.name}</p>
                                {item.notes && (
                                   <p className="text-[8px] text-zinc-400 font-bold mt-1 uppercase italic bg-zinc-100 dark:bg-zinc-800/50 px-1 inline-block">-- {item.notes}</p>
                                )}
                             </div>
                          </div>
                       </div>
                     ))}
                   </div>
                 )}

                 {newItems.length > 0 && (
                   <div className="space-y-2.5 pt-2 border-t border-dashed border-amber-500/20">
                     <div className="flex items-center space-x-2 pb-1">
                       <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1">
                         <AlertCircle size={10} className="animate-bounce" /> Nuevas Adiciones
                       </span>
                     </div>
                     {newItems.map((item, index) => (
                       <div key={`new-${index}`} className="pb-2.5 border-b border-dashed border-zinc-200 dark:border-zinc-800 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                             <span className="text-xl md:text-2xl font-serif text-amber-500 font-black mr-2 md:mr-3">{item.quantity}x</span>
                             <div className="flex-1">
                                <div className="flex items-center flex-wrap gap-1.5">
                                   <p className="text-xs md:text-sm font-black text-text-bright dark:text-amber-200 uppercase leading-tight">{item.product_name || item.name}</p>
                                   <span className="bg-amber-500 text-zinc-950 text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-sm animate-pulse shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]">
                                      NUEVO
                                   </span>
                                </div>
                                {item.notes && (
                                   <p className="text-[8px] text-accent font-bold mt-1 uppercase italic bg-accent/10 px-1 inline-block">-- {item.notes}</p>
                                )}
                             </div>
                          </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             );
           })()}
        </div>

        <div className="p-4 border-t-2 border-zinc-200 dark:border-zinc-900 grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-zinc-900/50">
           <button 
             onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'Cancelado'); }}
             disabled={!['Pendiente', 'Confirmado', 'En Lista'].includes(order.status) || order.status === 'Pagado'}
             className={`py-3 border-2 transition-all flex items-center justify-center rounded-none ${(!['Pendiente', 'Confirmado', 'En Lista'].includes(order.status) || order.status === 'Pagado') ? 'border-zinc-200 text-zinc-300 dark:border-zinc-800 dark:text-zinc-700 cursor-not-allowed' : 'border-accent text-accent hover:bg-accent hover:text-white'}`}
           >
              <XCircle size={18} />
           </button>
           <button
             onClick={(e) => { e.stopPropagation(); handleNextStatus(order.id, order.status); }}
             disabled={['Listo', 'Completado', 'Pagado'].includes(order.status)}
             className={`py-3 transition-all flex items-center justify-center space-x-2 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none translate-y-0 active:translate-y-1 ${ (['Listo', 'Completado', 'Pagado'].includes(order.status)) ? 'bg-emerald-500 text-white opacity-80 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}
           >
              <span className="text-[10px] font-bold uppercase tracking-widest">
                 {(order.status === 'Pendiente' || order.status === 'En Lista') ? 'Preparar' : 
                  (order.status === 'Confirmado' ? 'Preparar' : 
                  (order.status === 'Preparando' || order.status === 'En Cocina' ? (isDelivery ? 'Listo Envío' : 'Entregar') : 'Completado'))}
              </span>
              {(order.status === 'Listo' || order.status === 'Completado') ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
           </button>
        </div>
      </motion.div>
    );
  };

  const renderMonitorCard = (order, idx, isUpdate = false) => {
    const statusInfo = getStatusLabel(order.status);
    const hasUpdates = order.has_updates;

    return (      <div 
        key={order.id} 
        className={`bg-zinc-900 border-2 flex flex-col h-full shadow-2xl relative overflow-hidden transition-all duration-300 ${
          hasUpdates 
            ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]' 
            : 'border-zinc-800'
        }`}
      >
         <div className={`p-4 ${hasUpdates ? 'bg-amber-500 text-zinc-950 font-black' : statusInfo.color + ' text-white'} flex justify-between items-start`}>
            <div>
               <span className={`text-4xl font-bold leading-none ${hasUpdates ? 'text-zinc-950' : 'text-white'}`}>
                  <span className={`text-2xl mr-2 italic ${hasUpdates ? 'text-zinc-900/60' : 'text-primary/50'}`}>#{idx + 1}</span>
                  #{String(order.id).split('_').pop()}
               </span>
               <p className={`text-[10px] mt-1 uppercase font-bold tracking-widest ${hasUpdates ? 'text-zinc-900/80' : 'text-white/80'}`}>
                  {order.type === 'table' ? `Mesa ${order.table_name || order.table}` : 'Domicilio'}
               </p>
               <p className={`text-[11px] mt-1 font-black uppercase tracking-wider ${hasUpdates ? 'text-zinc-950' : 'text-white'}`}>
                  Cliente: {order.customer_name || 'Sin Nombre'}
               </p>
            </div>
            <div className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${hasUpdates ? 'bg-black/10 text-zinc-950 animate-pulse' : 'bg-black/20 text-white'}`}>
               {hasUpdates ? 'ACTUALIZADO' : order.status}
            </div>
         </div>

         <div className="p-6 space-y-4 flex-1">
            <div className="space-y-4">
                 {(() => {
                   const originalItems = order.items.filter(item => !item.is_new);
                   const newItems = order.items.filter(item => item.is_new);
                   
                   if (newItems.length === 0) {
                     return order.items.map((item, i) => (
                        <div key={i} className="flex items-start space-x-4">
                           <span className="text-3xl font-bold text-primary">{item.quantity}x</span>
                           <div className="flex-1">
                              <p className="text-xl font-bold text-white uppercase leading-tight">{item.product_name || item.name}</p>
                              {item.notes && <p className="text-[10px] text-accent font-bold mt-1 uppercase italic bg-accent/10 px-1 inline-block">! {item.notes}</p>}
                           </div>
                        </div>
                     ));
                   }

                   return (
                     <div className="space-y-6 w-full text-left">
                       {originalItems.length > 0 && (
                         <div className="space-y-4">
                            <div className="flex items-center space-x-2 pb-1 border-b border-zinc-700/50">
                              <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">
                                Ya Pedidos
                              </span>
                            </div>
                            {originalItems.map((item, i) => (
                              <div key={`orig-${i}`} className="flex items-start space-x-4 opacity-50">
                                 <span className="text-xl font-bold text-zinc-500">{item.quantity}x</span>
                                 <div className="flex-1">
                                    <p className="text-lg font-medium text-zinc-400 uppercase leading-tight">{item.product_name || item.name}</p>
                                    {item.notes && <p className="text-[9px] text-zinc-500 font-bold mt-1 uppercase italic bg-zinc-800 px-1 inline-block">! {item.notes}</p>}
                                 </div>
                              </div>
                            ))}
                          </div>
                       )}

                        {newItems.length > 0 && (
                          <div className="flex items-center space-x-2 pb-1 pt-4 border-t border-dashed border-amber-500/20">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                              <AlertCircle size={12} className="animate-bounce text-amber-500" /> Nuevas Adiciones
                            </span>
                          </div>
                        )}

                       {newItems.map((item, i) => (
                         <div key={`new-${i}`} className="flex items-start space-x-4">
                            <span className="text-3xl font-extrabold text-amber-500">{item.quantity}x</span>
                            <div className="flex-1">
                               <div className="flex items-center flex-wrap gap-2">
                                  <p className="text-xl font-extrabold text-white uppercase leading-tight">{item.product_name || item.name}</p>
                                  <span className="bg-amber-500 text-zinc-950 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-sm animate-pulse shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                                     NUEVO
                                  </span>
                               </div>
                               {item.notes && <p className="text-[10px] text-accent font-bold mt-1 uppercase italic bg-accent/10 px-1 inline-block">! {item.notes}</p>}
                            </div>
                         </div>
                       ))}
                     </div>
                   );
                 })()}
            </div>

            {order.notes && (
               <div className="mt-4 p-3 bg-zinc-800 border-l-4 border-primary">
                  <p className="text-[10px] font-bold text-white/50 uppercase mb-1">Nota Gral:</p>
                  <p className="text-xs text-white uppercase font-bold leading-tight italic">"{order.notes}"</p>
               </div>
            )}
            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center text-[10px] font-bold text-zinc-600">
               <span>RECIBIDO: {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
               <span>URBAN-SYSTEM</span>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-10 min-h-[750px] md:h-[85vh] flex flex-col relative">
      
      {/* FULLSCREEN KITCHEN MONITOR */}
      <AnimatePresence>
        {isMonitorMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-zinc-950 w-screen h-screen flex flex-col overflow-hidden font-mono"
          >
             {/* Monitor Top Bar */}
             <div className="h-20 bg-zinc-900 border-b-2 border-primary flex items-center justify-between px-10">
                <div className="flex items-center space-x-6">
                   <div className="bg-primary p-2 text-white"><ChefHat size={32} /></div>
                   <h1 className="text-xl md:text-3xl font-bold tracking-tighter text-white uppercase italic">Cocina // Pantalla de Pedidos</h1>
                </div>
                <div className="flex items-center space-x-8">
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] text-primary font-bold tracking-widest">SISTEMA ACTIVO</span>
                      <span className="text-xl text-white font-bold">{new Date().toLocaleTimeString()}</span>
                   </div>
                   <button 
                     onClick={() => setIsMonitorMode(false)}
                     className="px-6 py-3 bg-zinc-800 text-white font-bold hover:bg-primary transition-all border border-zinc-700"
                   >
                      SALIR [ESC]
                   </button>
                </div>
             </div>

             {/* Monitor Content */}
             <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-zinc-950">
                 {updatedOrders.length > 0 && (
                    <div className="space-y-6 mb-12">
                       <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-amber-500 flex items-center space-x-3 bg-amber-500/10 p-4 border-l-4 border-amber-500">
                          <AlertCircle size={24} className="text-amber-500 animate-pulse" />
                          <span>Actualizaciones de Pedidos</span>
                          <span className="bg-amber-500 text-zinc-950 text-xs px-2 py-0.5 rounded-full font-bold">{updatedOrders.length}</span>
                       </h2>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {updatedOrders.map((order, idx) => renderMonitorCard(order, idx, true))}
                       </div>
                    </div>
                 )}

                 <div className="space-y-6">
                    {updatedOrders.length > 0 && (
                       <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white/50 flex items-center space-x-3 bg-zinc-900 p-4 border-l-4 border-zinc-700">
                          <ChefHat size={24} className="text-white/50" />
                          <span>Cola de Cocina</span>
                       </h2>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                       {normalOrders.filter(o => o.status !== 'Cancelado').map((order, idx) => renderMonitorCard(order, idx + updatedOrders.length, false))}
                    </div>
                 </div>
                
                {filteredOrders.filter(o => !['Completado', 'Pagado', 'Cancelado'].includes(o.status)).length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-20 mt-32">
                      <ChefHat size={120} strokeWidth={0.5} className="text-white" />
                      <p className="text-4xl font-bold text-white tracking-[0.5em] uppercase">¡Cocina al día! Esperando nuevos pedidos...</p>
                   </div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-8 border-primary pl-6 md:pl-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl md:text-7xl font-serif uppercase leading-none text-text-bright">
            Cocina en <span className="text-primary italic">Acción</span>
          </h1>
          <p className="text-[10px] md:text-xs text-text-dim tracking-[0.4em] uppercase mt-2 md:mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">
            Seguimiento de Preparaciones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
           {/* Monitor Button Grouped with View Switchers */}
           <button 
             onClick={() => setIsMonitorMode(true)}
             className="px-6 py-2 bg-zinc-950 text-white text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center space-x-2 border-2 border-primary/30 hover:shadow-none translate-y-0 active:translate-y-1"
             style={{ boxShadow: '4px 4px 0px 0px var(--primary-shadow-20)' }}
           >
              <ChefHat size={14} className="text-primary" />
              <span>Pantalla Completa</span>
           </button>

           <div className="flex bg-surface border-2 border-zinc-200 dark:border-zinc-800 p-1 w-full md:w-auto">
              <button 
                onClick={() => setViewType('ALL')}
                className={`flex-1 md:px-4 py-2 flex items-center justify-center space-x-2 transition-all ${viewType === 'ALL' ? 'bg-primary text-white' : 'text-text-dim hover:text-primary'}`}
              >
                 <ChefHat size={16} />
                 <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">Todos</span>
              </button>
              <button 
                onClick={() => setViewType('table')}
                className={`flex-1 md:px-4 py-2 flex items-center justify-center space-x-2 transition-all ${viewType === 'table' ? 'bg-primary text-white' : 'text-text-dim hover:text-primary border-l border-zinc-100 dark:border-zinc-800'}`}
              >
                 <Utensils size={16} />
                 <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">Mesas</span>
              </button>
              <button 
                onClick={() => setViewType('delivery')}
                className={`flex-1 md:px-4 py-2 flex items-center justify-center space-x-2 transition-all ${viewType === 'delivery' ? 'bg-primary text-white' : 'text-text-dim hover:text-primary border-l border-zinc-100 dark:border-zinc-800'}`}
              >
                 <ShoppingBag size={16} />
                 <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">Domicilios</span>
              </button>
           </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="pb-4 md:pb-8 mb-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row gap-4 md:gap-6 items-center flex-shrink-0">
         <div className="relative w-full lg:w-96 px-2 md:px-0">
            <Search className="absolute left-6 md:left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
            <input 
              type="text" 
              placeholder="BUSCAR MESA / ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border-2 border-zinc-200 dark:border-zinc-800 p-3 pl-12 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary transition-all"
            />
         </div>

         <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-1 w-full lg:w-auto px-2 md:px-0">
            <div className="h-8 w-px bg-zinc-300 dark:bg-zinc-800 mx-2 hidden lg:block"></div>
            <Filter size={16} className="text-primary mr-2 flex-shrink-0" />
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'PENDING', label: 'Nuevas' },
              { id: 'PREPARING', label: 'Cocina' },
              { id: 'COMPLETED', label: 'Completados' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-4 md:px-6 py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all border-2 flex-shrink-0 ${filter === btn.id ? 'bg-primary border-primary text-white' : 'border-zinc-200 dark:border-zinc-800 text-text-dim hover:border-primary/50'}`}
                style={filter === btn.id ? { boxShadow: '4px 4px 0px 0px var(--primary-shadow-30)' } : undefined}
              >
                {btn.label}
              </button>
            ))}
         </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
        <div className="flex space-x-4 md:space-x-6 h-full px-4 md:px-2 items-stretch">
          <AnimatePresence mode="popLayout">
            {updatedOrders.length > 0 && (
              <>
                {/* Vertical Section Title */}
                <div className="w-12 bg-amber-500/10 border-2 border-amber-500 border-dashed flex items-center justify-center relative select-none flex-shrink-0">
                  <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] rotate-90 whitespace-nowrap absolute">
                    Actualizaciones
                  </span>
                </div>
                {updatedOrders.map((order, idx) => renderOrderCard(order, idx, true))}
                {/* Visual Separator */}
                <div className="w-1 bg-zinc-200 dark:bg-zinc-800 self-stretch my-2 flex-shrink-0"></div>
              </>
            )}

            {updatedOrders.length > 0 && (
              <div className="w-12 bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center relative select-none flex-shrink-0">
                <span className="text-text-dim text-[10px] font-black uppercase tracking-[0.4em] rotate-90 whitespace-nowrap absolute">
                  Cola de Cocina
                </span>
              </div>
            )}
            
            {normalOrders.map((order, idx) => renderOrderCard(order, idx + updatedOrders.length, false))}
          </AnimatePresence>

          {filteredOrders.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-30 mt-12 select-none">
                <ChefHat size={80} className="text-text-dim" />
                <p className="text-lg font-bold text-text-dim uppercase tracking-widest text-center">¡Cocina al día! Esperando nuevos pedidos...</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KitchenDisplay;
