import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, User, Phone, MapPin, 
  TrendingUp, ShoppingBag, Clock, ChevronRight,
  Calendar, ArrowRight, Table as TableIcon
} from 'lucide-react';
import { api } from '../services/api';
import { useAdmin } from '../context/AdminContext';
import Pagination from '../components/ui/Pagination';

const CustomersManager = () => {
  const { cmsData } = useAdmin();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [brandName, setBrandName] = useState(cmsData?.brand?.name || 'URBAN');
  const [visibleCount, setVisibleCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setVisibleCount(prev => prev + 10);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage]);

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const data = await api.getCustomers(page);
      const results = data.results || (Array.isArray(data) ? data : []);
      setCustomers(results);
      setTotalCount(data.count || results.length);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = async (id) => {
    setSelectedCustomerId(id);
    setStatsLoading(true);
    try {
      const data = await api.getCustomerStats(id);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.customer_id || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 uppercase">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-l-8 border-primary pl-6 md:pl-8 mb-10">
        <div>
          <h1 className="text-4xl md:text-7xl font-serif uppercase leading-none text-text-bright">Comunidad <span className="text-primary italic">{brandName}</span></h1>
          <p className="text-[10px] md:text-xs text-text-dim tracking-[0.4em] uppercase mt-2 md:mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">Base de Datos de Clientes & Analítica</p>
        </div>
        
        <div className="flex items-center space-x-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" size={16} />
             <input 
               type="text" 
               placeholder="BUSCAR CLIENTE..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-background border-2 border-zinc-800 p-3 pl-10 text-[10px] font-bold outline-none focus:border-primary transition-all"
             />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-280px)]">
        {/* Customer List */}
        <div className="lg:col-span-1 bg-surface border-2 border-zinc-200 dark:border-zinc-900 overflow-hidden flex flex-col shadow-xl">
           <div className="p-4 bg-black/5 dark:bg-white/5 border-b-2 border-zinc-200 dark:border-zinc-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                 <Users size={14} className="text-primary" />
                 <span className="text-[10px] font-bold tracking-[0.2em]">DIRECTORIO</span>
              </div>
              <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5">{filteredCustomers.length}</span>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar" onScroll={handleScroll}>
              {loading ? (
                 <div className="p-10 text-center animate-pulse text-text-dim text-[10px] font-bold uppercase tracking-widest">Cargando información de clientes...</div>
              ) : filteredCustomers.length === 0 ? (
                 <div className="p-10 text-center text-text-dim text-[10px] font-bold uppercase tracking-widest opacity-40">No hay registros coincidentes</div>
              ) : (
                filteredCustomers.map(customer => (
                  <button 
                    key={customer.customer_id}
                    onClick={() => handleCustomerSelect(customer.customer_id)}
                    className={`w-full text-left p-4 border-b border-zinc-100 dark:border-zinc-900 hover:bg-primary/5 transition-all flex items-center justify-between group ${selectedCustomerId === customer.customer_id ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
                  >
                     <div className="space-y-1">
                        <p className="text-xs font-serif font-bold text-text-bright uppercase">{customer.name || 'SIN NOMBRE'}</p>
                        <p className="text-[9px] text-text-dim font-mono tracking-tight">{customer.customer_id}</p>
                     </div>
                     <ArrowRight size={14} className={`text-primary transition-transform ${selectedCustomerId === customer.customer_id ? 'translate-x-0' : '-translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                  </button>
                ))
              )}
           </div>
           <div className="bg-surface border-t border-zinc-200 dark:border-zinc-900 px-2 pb-2">
              <Pagination 
                current={currentPage} 
                total={totalCount} 
                onPageChange={setCurrentPage} 
              />
           </div>
        </div>

        {/* Customer Intelligence / Stats */}
        <div className="lg:col-span-2 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
           <AnimatePresence mode="wait">
              {selectedCustomerId ? (
                <motion.div 
                  key={selectedCustomerId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                   {statsLoading ? (
                      <div className="h-64 flex items-center justify-center border-2 border-dashed border-zinc-800 text-text-dim text-[10px] font-bold tracking-widest animate-pulse">CARGANDO INFORMACIÓN...</div>
                   ) : stats ? (
                     <>
                        {/* Profile Card */}
                        <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-8 flex flex-col md:flex-row gap-8 items-center shadow-2xl relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-2 opacity-5"><Users size={200} /></div>
                           <div className="w-24 h-24 bg-primary flex items-center justify-center text-white shrink-0">
                              <User size={48} />
                           </div>
                           <div className="flex-1 text-center md:text-left space-y-2">
                              <h2 className="text-3xl md:text-5xl font-serif text-text-bright leading-none">{stats.name}</h2>
                              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] font-bold text-text-dim tracking-widest">
                                 <span className="flex items-center gap-1"><Phone size={12} className="text-primary" /> {stats.phone || 'N/A'}</span>
                                 <span className="flex items-center gap-1"><MapPin size={12} className="text-primary" /> {stats.address || 'N/A'}</span>
                                 <span className="flex items-center gap-1 font-mono">{stats.identification}</span>
                              </div>
                           </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                           <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-6 flex flex-col justify-between">
                              <TrendingUp size={24} className="text-primary mb-4" />
                              <div>
                                 <p className="text-[8px] font-bold text-text-dim uppercase tracking-[0.2em]">Frecuencia Total</p>
                                 <p className="text-3xl font-serif text-text-bright">{stats.total_orders} <span className="text-xs text-primary italic">Visitas</span></p>
                              </div>
                           </div>
                           
                           <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-6 flex flex-col justify-between">
                              <ShoppingBag size={24} className="text-primary mb-4" />
                              <div>
                                 <p className="text-[8px] font-bold text-text-dim uppercase tracking-[0.2em]">Favorito de la Casa</p>
                                 <p className="text-xs font-serif text-text-bright uppercase truncate">{stats.most_ordered_product}</p>
                              </div>
                           </div>

                           <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-6 flex flex-col justify-between">
                              <TableIcon size={24} className="text-primary mb-4" />
                              <div>
                                 <p className="text-[8px] font-bold text-text-dim uppercase tracking-[0.2em]">Ubicación Preferida</p>
                                 <p className="text-xl font-serif text-text-bright uppercase">Mesa {stats.most_used_table}</p>
                              </div>
                           </div>

                           <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-6 flex flex-col justify-between">
                              <Clock size={24} className="text-primary mb-4" />
                              <div>
                                 <p className="text-[8px] font-bold text-text-dim uppercase tracking-[0.2em]">Último Pedido / Visita</p>
                                 <p className="text-[10px] font-serif text-text-bright">{new Date(stats.last_visit).toLocaleDateString()} {new Date(stats.last_visit).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              </div>
                           </div>
                        </div>

                        {/* History Section */}
                        <div className="space-y-4">
                           <button 
                             onClick={() => setShowHistory(!showHistory)}
                             className="w-full bg-primary/5 border border-primary/20 p-6 flex items-center justify-between group hover:bg-primary/10 transition-all"
                           >
                              <div className="flex items-center space-x-4">
                                 <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Calendar size={20} /></div>
                                 <div>
                                    <p className="text-[10px] font-bold text-text-bright uppercase tracking-widest">Últimas 5 Visitas / Pedidos</p>
                                    <p className="text-[8px] text-text-dim uppercase tracking-widest mt-1">{showHistory ? 'Ocultar Actividad' : 'Ver Línea de Tiempo'}</p>
                                 </div>
                              </div>
                              <ChevronRight className={`text-primary transition-transform ${showHistory ? 'rotate-90' : ''}`} />
                           </button>

                           <AnimatePresence>
                              {showHistory && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden space-y-2"
                                >
                                   {stats.recent_history && stats.recent_history.length > 0 ? (
                                     stats.recent_history.map((h, idx) => (
                                       <div key={idx} className="bg-surface border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between group hover:border-primary/50 transition-all">
                                          <div className="flex items-center space-x-4">
                                             <div className="text-[10px] font-mono text-primary bg-primary/5 px-2 py-1 border border-primary/20">{idx + 1}</div>
                                             <div>
                                                <p className="text-[10px] font-bold text-text-bright uppercase tracking-widest">{h.type}</p>
                                                <p className="text-[8px] text-text-dim uppercase tracking-wider">{new Date(h.date).toLocaleDateString()} {new Date(h.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                             </div>
                                          </div>
                                          <div className="text-right">
                                             <p className="text-[10px] font-serif text-primary font-bold">{h.detail}</p>
                                             <p className="text-[8px] font-black uppercase tracking-widest text-text-dim/60">{h.status}</p>
                                          </div>
                                       </div>
                                     ))
                                   ) : (
                                     <div className="p-8 text-center border-2 border-dashed border-zinc-800 text-text-dim text-[8px] uppercase tracking-widest">Sin registros recientes</div>
                                   )}
                                </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </>
                   ) : null}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 p-20 text-center space-y-6 opacity-30">
                   <div className="w-20 h-20 rounded-full border-2 border-text-dim flex items-center justify-center"><User size={40} /></div>
                   <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-[0.3em]">Selecciona un cliente para ver su historial y preferencias</p>
                      <p className="text-[8px] uppercase tracking-[0.2em]">Análisis de frecuencia, platos favoritos y última actividad</p>
                   </div>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CustomersManager;
