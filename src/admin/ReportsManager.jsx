import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, DollarSign, ShoppingBag, Calendar, 
  BarChart3, PieChart as PieChartIcon, ArrowUpRight, 
  ArrowDownRight, Download, Printer, Filter, 
  Clock, CheckCircle2, AlertCircle, Wallet, CreditCard, 
  ArrowRightLeft, FileText, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, 
  PieChart, Cell, Pie
} from 'recharts';
import { api } from '../services/api';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useNotification } from '../context/NotificationContext';

const ReportsManager = () => {
  const [stats, setStats] = useState(null);
  const [cashClosing, setCashClosing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'cash'
  const { showNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, cashData] = await Promise.all([
        api.getGlobalStats(),
        api.getCashClosing()
      ]);
      setStats(statsData);
      setCashClosing(cashData);
    } catch (error) {
      console.error('Error loading reports:', error);
      showNotification('Error al cargar datos de reportes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(val);

  if (loading) return (
     <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-dim">Cargando estadísticas y reportes...</p>
     </div>
  );

  return (
    <div className="space-y-8 uppercase">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-8 border-primary pl-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-serif uppercase leading-none text-text-bright">
            Resumen de <span className="text-primary italic">Ventas</span>
          </h1>
          <p className="text-text-dim tracking-[0.4em] text-xs uppercase mt-4 font-bold underline decoration-primary decoration-2 underline-offset-8">
            Información de ventas y cierre de caja
          </p>
        </div>
        
        <div className="flex bg-surface border-2 border-zinc-200 dark:border-zinc-800 p-1">
           <button 
             onClick={() => setActiveTab('overview')} 
             className={`px-6 py-2 flex items-center space-x-2 text-[10px] font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg' : 'text-text-dim hover:text-primary'}`}
           >
              <BarChart3 size={14} />
              <span>Resumen de Ventas</span>
           </button>
           <button 
             onClick={() => setActiveTab('cash')} 
             className={`px-6 py-2 flex items-center space-x-2 text-[10px] font-bold transition-all ${activeTab === 'cash' ? 'bg-primary text-white shadow-lg' : 'text-text-dim hover:text-primary'}`}
           >
              <Wallet size={14} />
              <span>Cierre de Caja</span>
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-8 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                     <DollarSign size={120} />
                  </div>
                  <p className="text-[10px] font-bold text-text-dim tracking-widest mb-2">// VENTAS DEL ÚLTIMO MES</p>
                  <h3 className="text-4xl font-serif text-text-bright">{formatCurrency(stats?.total_revenue_30d || 0)}</h3>
                  <div className="mt-6 flex items-center text-green-500 space-x-2 text-[10px] font-bold italic">
                     <TrendingUp size={14} />
                     <span>+12.5% comparado con el mes anterior</span>
                  </div>
               </div>

               <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-8 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                     <ShoppingBag size={120} />
                  </div>
                  <p className="text-[10px] font-bold text-text-dim tracking-widest mb-2">// PEDIDOS REALIZADOS</p>
                  <h3 className="text-4xl font-serif text-text-bright">{stats?.total_orders_30d || 0}</h3>
                  <p className="text-[10px] font-bold text-primary mt-6 tracking-widest uppercase">Pedidos entregados con éxito</p>
               </div>

               <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-8 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                     <TrendingUp size={120} />
                  </div>
                  <p className="text-[10px] font-bold text-text-dim tracking-widest mb-2">// CONSUMO PROMEDIO</p>
                  <h3 className="text-4xl font-serif text-text-bright">
                    {formatCurrency((stats?.total_revenue_30d || 0) / (stats?.total_orders_30d || 1))}
                  </h3>
                  <p className="text-[10px] font-bold text-text-dim mt-6 tracking-widest uppercase">Promedio por cada pedido</p>
               </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-8">
                  <div className="flex justify-between items-center mb-10">
                     <h2 className="text-xl font-serif tracking-widest uppercase">Flujo de <span className="text-primary">Ventas Diarias</span></h2>
                     <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-2 text-[8px] font-bold">
                           <div className="w-2 h-2 bg-primary"></div>
                           <span>VENTAS POR DÍA</span>
                        </span>
                     </div>
                  </div>
                  <div className="h-[350px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.sales_by_day || []}>
                           <defs>
                              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                           <XAxis 
                             dataKey="date" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fontSize: 9, fontWeight: 'bold', fill: '#71717a'}}
                             tickFormatter={(str) => str.split('-')[2]}
                           />
                           <YAxis 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fontSize: 9, fontWeight: 'bold', fill: '#71717a'}}
                             tickFormatter={(val) => `$${val/1000}k`}
                           />
                           <Tooltip 
                             contentStyle={{ backgroundColor: '#000', border: '2px solid var(--primary)', color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                             itemStyle={{ color: 'var(--primary)' }}
                           />
                           <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-8">
                  <h2 className="text-xl font-serif tracking-widest uppercase mb-10">Platos <span className="text-primary">Más Vendidos</span></h2>
                  <div className="space-y-6">
                     {stats?.top_products?.map((item, i) => (
                        <div key={i} className="space-y-2">
                           <div className="flex justify-between items-end">
                              <span className="text-[10px] font-bold tracking-widest truncate pr-4">{item.product__name}</span>
                              <span className="text-[10px] font-mono text-primary font-bold">{item.total_qty} platos</span>
                           </div>
                           <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.total_qty / stats.top_products[0].total_qty) * 100}%` }}
                                className="h-full bg-primary"
                              />
                           </div>
                        </div>
                     ))}
                     {(!stats?.top_products || stats.top_products.length === 0) && (
                        <div className="h-48 flex flex-col items-center justify-center opacity-30">
                           <AlertCircle size={32} />
                           <p className="text-[10px] font-bold mt-4">Aún no hay datos de ventas registrados</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="cash"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Cash Summary */}
            <div className="lg:col-span-1 space-y-6">
               <div 
                 className="bg-primary p-8 text-white border-b-8 border-black/20"
                 style={{ boxShadow: '10px 10px 0px 0px var(--primary-shadow-10)' }}
               >
                  <p className="text-[10px] font-bold tracking-[0.3em] opacity-70 mb-2">// VENTAS DE HOY</p>
                  <h3 className="text-5xl font-serif mb-4 leading-none">{formatCurrency(cashClosing?.total_day || 0)}</h3>
                  <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest pt-4 border-t border-white/20">
                     <Clock size={14} />
                     <span>Hora de reporte: {new Date().toLocaleTimeString()}</span>
                  </div>
               </div>

               <div className="bg-surface border-2 border-zinc-200 dark:border-zinc-900 p-8 space-y-6">
                  <h4 className="text-xs font-bold tracking-[0.2em] border-b-2 border-primary/20 pb-4 uppercase">Ventas por Forma de Pago</h4>
                  <div className="space-y-4">
                     {[
                       { label: 'Efectivo', key: 'Cash', icon: <Wallet size={16} /> },
                       { label: 'Tarjeta', key: 'Card', icon: <CreditCard size={16} /> },
                       { label: 'Transferencia', key: 'Transfer', icon: <ArrowRightLeft size={16} /> },
                       { label: 'Sin especificar', key: 'Unknown', icon: <AlertCircle size={16} /> }
                     ].map(method => (
                        <div key={method.key} className="flex items-center justify-between group">
                           <div className="flex items-center space-x-3 text-text-dim group-hover:text-primary transition-colors">
                              {method.icon}
                              <span className="text-[10px] font-bold tracking-widest">{method.label}</span>
                           </div>
                           <span className="text-[10px] font-mono font-bold text-text-bright">{formatCurrency(cashClosing?.by_method?.[method.key] || 0)}</span>
                        </div>
                     ))}
                  </div>
                  
                  <div className="pt-6">
                     <Button 
                       className="w-full py-4 flex items-center justify-center space-x-3"
                       onClick={() => window.print()}
                     >
                        <Printer size={18} />
                        <span>Imprimir Cierre de Caja</span>
                     </Button>
                  </div>
               </div>
            </div>

            {/* Transactions Table */}
            <div className="lg:col-span-2 bg-surface border-2 border-zinc-200 dark:border-zinc-900 flex flex-col overflow-hidden shadow-xl">
               <div className="p-6 border-b-2 border-zinc-200 dark:border-zinc-900 flex justify-between items-center bg-black/5 dark:bg-white/5">
                  <h4 className="text-xs font-bold tracking-[0.2em] uppercase">Pedidos de Hoy</h4>
                  <span className="text-[10px] font-mono bg-primary text-white px-3 py-1">{cashClosing?.count_day || 0} Pedidos</span>
               </div>
               
               <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                     <thead className="sticky top-0 bg-background z-10">
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[9px] font-bold uppercase tracking-widest text-text-dim">
                           <th className="p-4 font-bold">Pedido</th>
                           <th className="p-4 font-bold">Cliente</th>
                           <th className="p-4 font-bold">Pago</th>
                           <th className="p-4 font-bold text-right">Total</th>
                        </tr>
                     </thead>
                     <tbody className="text-[10px] font-bold uppercase">
                        {cashClosing?.orders?.map(order => (
                           <tr key={order.id} className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-primary/5 transition-all group">
                              <td className="p-4 text-primary">#{order.id}</td>
                              <td className="p-4 text-text-bright truncate max-w-[150px]">{order.customer_name || 'MESA / MOSTRADOR'}</td>
                              <td className="p-4">
                                 <span className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 text-[8px] font-bold tracking-widest">
                                    {order.payment_method || 'Sin registrar'}
                                 </span>
                              </td>
                              <td className="p-4 text-right text-text-bright font-mono">{order.total}</td>
                           </tr>
                        ))}
                        {(!cashClosing?.orders || cashClosing.orders.length === 0) && (
                           <tr>
                              <td colSpan="4" className="p-20 text-center opacity-30 flex flex-col items-center">
                                 <FileText size={48} strokeWidth={1} />
                                 <p className="mt-4 tracking-widest">Aún no se han registrado ventas el día de hoy</p>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsManager;
