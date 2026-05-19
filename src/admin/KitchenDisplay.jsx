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
    // Domicilios (delivery) en estado 'Pendiente' no van a la cocina hasta que el administrador los confirme / envíe a 'En Lista'
    if (o.type === 'delivery' && o.status === 'Pendiente') return false;

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
                   <h1 className="text-xl md:text-3xl font-bold tracking-tighter text-white uppercase italic">Urban Kitchen // Monitor de Despacho</h1>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {filteredOrders.filter(o => o.status !== 'Cancelado').map((order, idx) => {
                      const statusInfo = getStatusLabel(order.status);
                      return (
                        <div key={order.id} className="bg-zinc-900 border-2 border-zinc-800 flex flex-col h-full shadow-2xl relative overflow-hidden">
                           <div className={`p-4 ${statusInfo.color} flex justify-between items-start`}>
                              <div>
                                 <span className="text-4xl font-bold text-white leading-none">
                                    <span className="text-primary/50 text-2xl mr-2 italic">#{idx + 1}</span>
                                    #{String(order.id).split('_').pop()}
                                 </span>
                                 <p className="text-[10px] text-white/80 mt-1 uppercase font-bold tracking-widest">
                                    {order.type === 'table' ? `Mesa ${order.table_name || order.table}` : 'Domicilio'}
                                 </p>
                              </div>
                              <div className="bg-black/20 px-2 py-1 text-[10px] font-bold text-white uppercase rounded">
                                 {order.status}
                              </div>
                           </div>

                           <div className="p-6 space-y-4 flex-1">
                              <div className="space-y-4">
                                 {order.items.map((item, i) => (
                                    <div key={i} className="flex items-start space-x-4">
                                       <span className="text-3xl font-bold text-primary">{item.quantity}x</span>
                                       <div className="flex-1">
                                          <p className="text-xl font-bold text-white uppercase leading-tight">{item.product_name || item.name}</p>
                                          {item.notes && <p className="text-[10px] text-accent font-bold mt-1 uppercase italic bg-accent/10 px-1 inline-block">! {item.notes}</p>}
                                       </div>
                                    </div>
                                 ))}
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
                   })}
                </div>
                
                {filteredOrders.filter(o => !['Completado', 'Pagado', 'Cancelado'].includes(o.status)).length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-20 mt-32">
                      <ChefHat size={120} strokeWidth={0.5} className="text-white" />
                      <p className="text-4xl font-bold text-white tracking-[0.5em] uppercase">Esperando Comandas...</p>
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
            Línea de <span className="text-primary italic">Fuego</span>
          </h1>
          <p className="text-[10px] md:text-xs text-text-dim tracking-[0.4em] uppercase mt-2 md:mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">
            KDS // Kitchen Display
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
           {/* Monitor Button Grouped with View Switchers */}
           <button 
             onClick={() => setIsMonitorMode(true)}
             className="px-6 py-2 bg-zinc-950 text-white text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center space-x-2 border-2 border-primary/30 shadow-[4px_4px_0px_0px_rgba(225,29,72,0.2)] hover:shadow-none translate-y-0 active:translate-y-1"
           >
              <ChefHat size={14} className="text-primary" />
              <span>Modo Monitor</span>
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
                className={`px-4 md:px-6 py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all border-2 flex-shrink-0 ${filter === btn.id ? 'bg-primary border-primary text-white shadow-[4px_4px_0px_0px_rgba(225,29,72,0.3)]' : 'border-zinc-200 dark:border-zinc-800 text-text-dim hover:border-primary/50'}`}
              >
                {btn.label}
              </button>
            ))}
         </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
        <div className="flex space-x-4 md:space-x-6 h-full px-4 md:px-2">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, idx) => {
              const statusInfo = getStatusLabel(order.status);
              const orderTime = new Date(order.created_at || order.timestamp || new Date());
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
                       <span className="text-[10px] font-bold text-white/50 italic mr-1">{idx + 1}</span>
                       <span className="font-serif text-2xl tracking-tighter">#{String(order.id).split('_').pop()}</span>
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
                         {isDelivery ? 'Domicilio' : `Mesa ${tables.find(t => t.id === order.table)?.number || '??'}`}
                       </span>
                       {!isDelivery && (
                         <span className="text-[8px] font-bold uppercase opacity-80 mt-1">
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
                     
                     {order.items.map((item, idx) => (
                       <div key={idx} className="pb-3 md:pb-4 border-b border-dashed border-zinc-200 dark:border-zinc-800 last:border-0">
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
                     ))}
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
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default KitchenDisplay;
