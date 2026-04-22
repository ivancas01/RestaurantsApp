import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, CheckCircle2, ChevronRight, AlertCircle, Play, XCircle, Search, Filter, ShoppingBag, Utensils } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const KitchenDisplay = () => {
  const { orders, updateOrderStatus, tables, locations } = useAdmin();
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, PREPARING, READY
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('ALL'); // ALL, table, delivery

  // Enhanced filtering logic
  const filteredOrders = orders.filter(o => {
    // 1. View Type Filter (Mesas vs Domicilios)
    if (viewType !== 'ALL' && o.type !== viewType) return false;

    // 2. Status Filter
    const isPending = ['Pendiente', 'En Lista'].includes(o.status);
    const isPreparing = ['Confirmado', 'En Cocina', 'Preparando'].includes(o.status);
    const isReady = o.status === 'Listo';
    const isCompleted = o.status === 'Completado';

    let passFilter = false;
    if (filter === 'ALL') passFilter = isPending || isPreparing || isReady;
    else if (filter === 'PENDING') passFilter = isPending;
    else if (filter === 'PREPARING') passFilter = isPreparing;
    else if (filter === 'COMPLETED') passFilter = isCompleted || isReady;

    if (!passFilter) return false;

    // 3. Search term check
    if (searchTerm.trim() === '') return true;
    const searchLower = searchTerm.toLowerCase();
    const tableNum = tables.find(t => t.id === o.tableId)?.number?.toString() || '';
    
    return (o.customer || '').toLowerCase().includes(searchLower) || 
           (o.id || '').toLowerCase().includes(searchLower) ||
           tableNum.includes(searchLower);
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const handleNextStatus = (orderId, currentStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (currentStatus === 'Pendiente' || currentStatus === 'En Lista') {
      updateOrderStatus(orderId, 'Preparando');
    }
    else if (currentStatus === 'Confirmado') {
      updateOrderStatus(orderId, 'Preparando'); 
    }
    else if (currentStatus === 'Preparando' || currentStatus === 'En Cocina') {
      updateOrderStatus(orderId, 'Listo');
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'Pendiente' || status === 'En Lista') return { label: 'En Lista', icon: <AlertCircle size={14} />, color: 'bg-yellow-500' };
    if (status === 'Confirmado') return { label: 'Confirmado', icon: <ChefHat size={14} />, color: 'bg-blue-500' };
    if (status === 'Preparando' || status === 'En Cocina') return { label: 'Preparando', icon: <Play size={14} />, color: 'bg-primary' };
    if (status === 'Listo') return { label: 'Listo', icon: <CheckCircle2 size={14} />, color: 'bg-green-500' };
    if (status === 'Completado') return { label: 'Enviado', icon: <CheckCircle2 size={14} />, color: 'bg-emerald-500' };
    return { label: status, icon: <Clock size={14} />, color: 'bg-zinc-500' };
  };

  return (
    <div className="space-y-6 md:space-y-10 min-h-[750px] md:h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-8 border-primary pl-6 md:pl-8 flex-shrink-0">
        <div>
          <h1 className="text-3xl md:text-7xl font-serif uppercase leading-none text-text-bright">
            Línea de <span className="text-primary italic">Fuego</span>
          </h1>
          <p className="text-[10px] md:text-xs text-text-dim tracking-[0.4em] uppercase mt-2 md:mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">
            KDS // Kitchen Display
          </p>
        </div>
        
        {/* View Switch Buttons */}
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

      {/* Control Bar: Search (Left) + Filter Buttons (Right) */}
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
                className={`px-4 md:px-6 py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all border-2 flex-shrink-0 ${filter === btn.id ? 'bg-primary border-primary text-white shadow-[4px_4px_0px_0px_rgba(225,29,72,0.3)]' : 'border-zinc-200 dark:border-zinc-800 text-text-dim hover:border-primary/50'}`}
              >
                {btn.label}
              </button>
            ))}
         </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
        <div className="flex space-x-4 md:space-x-6 h-full px-4 md:px-2">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusLabel(order.status);
              const orderTime = new Date(order.timestamp);
              const minutesElapsed = Math.floor((new Date() - orderTime) / 60000);
              const isDelivery = order.type === 'delivery';

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -50 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
                  className={`w-[calc(100vw-48px)] md:w-80 min-h-[450px] md:min-h-0 flex-shrink-0 bg-surface border-4 flex flex-col overflow-hidden shadow-2xl transition-all snap-center ${isDelivery ? 'border-amber-500/50 scale-[0.98]' : 'border-zinc-200 dark:border-zinc-900'}`}
                >
                  <div className={`p-4 ${statusInfo.color} text-white flex justify-between items-center relative overflow-hidden`}>
                    <div className="flex items-center space-x-2 relative z-10">
                       <span className="font-serif text-2xl tracking-tighter">#{order.id.split('_')[1]}</span>
                       <div className="flex items-center space-x-1 bg-black/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                          {statusInfo.icon}
                          <span>{statusInfo.label}</span>
                       </div>
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] font-bold relative z-10 bg-black/10 px-2 py-1 rounded">
                       <Clock size={12} />
                       <span>{minutesElapsed}m</span>
                    </div>
                    <div className="absolute right-[-10%] top-[-10%] opacity-10 rotate-12">
                       {isDelivery ? <ShoppingBag size={80} strokeWidth={1} /> : <Utensils size={80} strokeWidth={1} />}
                    </div>
                  </div>

                  <div className={`p-4 border-b border-zinc-200 dark:border-zinc-800 ${isDelivery ? 'bg-amber-500/10' : 'bg-zinc-50 dark:bg-black/20'}`}>
                    <div className="flex flex-col items-end relative z-10">
                       <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                         {isDelivery ? 'Domicilio' : `Mesa ${tables.find(t => t.id === order.tableId)?.number || '??'}`}
                       </span>
                       {!isDelivery && (
                         <span className="text-[8px] font-bold uppercase opacity-80 mt-1">
                           {locations.find(l => l.id === tables.find(t => t.id === order.tableId)?.locationId)?.name || 'General'}
                         </span>
                       )}
                    </div>
                    {isDelivery && (
                         <span className="bg-amber-500 text-white text-[8px] font-bold px-2 py-1 uppercase flex items-center space-x-1 flex-shrink-0">
                            <ShoppingBag size={10} />
                            <span>Delivery</span>
                         </span>
                       )}
                  </div>

                  <div className="flex-1 p-3 md:p-4 space-y-3 md:space-y-4 overflow-y-auto scrollbar-hide bg-white dark:bg-transparent">
                     {order.items.map((item, idx) => (
                       <div key={idx} className="pb-3 md:pb-4 border-b border-dashed border-zinc-200 dark:border-zinc-800 last:border-0">
                          <div className="flex justify-between items-start">
                             <span className="text-xl md:text-2xl font-serif text-primary mr-2 md:mr-3">{item.quantity}x</span>
                             <p className="flex-1 text-xs md:text-sm font-bold text-text-bright uppercase leading-tight">{item.name}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="p-4 border-t-2 border-zinc-200 dark:border-zinc-900 grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-zinc-900/50">
                     <button 
                       onClick={() => updateOrderStatus(order.id, 'Cancelado')}
                       className="py-3 border-2 border-accent text-accent hover:bg-accent hover:text-white transition-all flex items-center justify-center rounded-none"
                     >
                        <XCircle size={18} />
                     </button>
                     <button
                       onClick={() => handleNextStatus(order.id, order.status)}
                       disabled={order.status === 'Listo' || order.status === 'Completado'}
                       className={`py-3 transition-all flex items-center justify-center space-x-2 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none translate-y-0 active:translate-y-1 ${ (order.status === 'Listo' || order.status === 'Completado') ? 'bg-emerald-500 text-white opacity-80 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}
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
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default KitchenDisplay;
