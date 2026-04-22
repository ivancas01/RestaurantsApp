import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingCart, Calendar, DollarSign, MapPin, ChefHat } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-surface border border-zinc-200 dark:border-white/5 p-6 md:p-8 relative overflow-hidden group transition-all duration-500">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      {React.cloneElement(icon, { size: 32, className: "md:w-12 md:h-12" })}
    </div>
    <p className="text-[9px] md:text-xs uppercase tracking-widest text-text-dim mb-2 font-bold">{title}</p>
    <h3 className="text-2xl md:text-3xl font-serif text-text-bright mb-4 tracking-tighter truncate">{value}</h3>
    <div className="flex items-center text-[9px] md:text-[10px] uppercase tracking-wider text-green-600 dark:text-green-500 font-bold">
      <TrendingUp size={12} className="mr-1" />
      {trend} <span className="hidden sm:inline ml-1">desde ayer</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { orders, reservations, tables, notifications } = useAdmin();

  // Metrics Logic
  const totalRevenue = orders
    .filter(o => o.status === 'Pagado')
    .reduce((acc, o) => acc + o.total, 0);

  const pendingOrders = orders.filter(o => ['Pendiente', 'Preparando', 'Listo'].includes(o.status)).length;
  const occupiedTables = tables.filter(t => t.status === 'Ocupada').length;
  const todayReservations = reservations.filter(r => r.status === 'Confirmado').length;

  const quickActions = [
    { label: 'Tomar Pedido', icon: <ShoppingCart />, path: '/hidden-admin/orders', color: 'bg-primary' },
    { label: 'Ver Cocina', icon: <ChefHat />, path: '/hidden-admin/kitchen', color: 'bg-zinc-800' },
    { label: 'Nueva Reserva', icon: <Calendar />, path: '/hidden-admin/reservations', color: 'bg-zinc-800' },
    { label: 'Gestionar Mesas', icon: <MapPin />, path: '/hidden-admin/venue', color: 'bg-zinc-800' },
  ];

  return (
    <div className="space-y-6 md:space-y-10 uppercase">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Reservas Hoy" value={todayReservations} icon={<Calendar />} trend="+12%" />
        <StatCard title="Mesas Ocupadas" value={occupiedTables} icon={<MapPin />} trend="+2" />
        <StatCard title="Pedidos Activos" value={pendingOrders} icon={<ShoppingCart />} trend="+18%" />
        <StatCard title="Ventas del Día" value={`$${totalRevenue.toFixed(0)}`} icon={<DollarSign />} trend="+24%" />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {quickActions.map((action, i) => (
           <a 
             key={i} 
             href={action.path}
             className={`p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-4 border-2 border-zinc-200 dark:border-zinc-800 hover:border-primary transition-all group ${action.color === 'bg-primary' ? 'bg-primary border-primary text-white shadow-[8px_8px_0px_0px_rgba(225,29,72,0.2)]' : 'bg-surface text-text-bright'}`}
           >
              {React.cloneElement(action.icon, { size: 28, className: action.color === 'bg-primary' ? 'text-white' : 'text-primary' })}
              <span className="text-[10px] font-bold tracking-widest">{action.label}</span>
           </a>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* Recent Reservations */}
        <div className="bg-surface border border-zinc-200 dark:border-white/5 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-serif uppercase tracking-tight">Próximas <span className="text-primary italic">Reservas</span></h2>
            <a href="/hidden-admin/reservations" className="text-[9px] md:text-xs uppercase tracking-widest text-primary hover:underline font-bold">Ver todas</a>
          </div>
          <div className="space-y-4 md:space-y-6">
            {reservations.slice(0, 3).map((res) => (
              <div key={res.id} className="flex items-center justify-between py-3 md:py-4 border-b border-zinc-100 dark:border-white/5 last:border-0">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-black/5 dark:bg-white/5 flex items-center justify-center text-primary">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-text-bright truncate max-w-[120px] md:max-w-none">{res.name}</p>
                    <p className="text-[10px] text-text-dim">{res.time} • {res.persons}p</p>
                  </div>
                </div>
                <span className={`text-[8px] md:text-[10px] px-2 py-0.5 md:px-3 md:py-1 uppercase tracking-widest font-bold border ${
                  res.status === 'Confirmado' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                }`}>
                  {res.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Operational Feed */}
        <div className="bg-surface border border-zinc-200 dark:border-white/5 p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-serif uppercase tracking-tight">Actividad <span className="text-primary italic">Reciente</span></h2>
            <div className="flex items-center space-x-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-[8px] font-bold tracking-widest text-text-dim uppercase">Live Feed</span>
            </div>
          </div>
          <div className="space-y-4 md:space-y-6 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
             {notifications.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                  <TrendingUp size={48} strokeWidth={1} />
                  <p className="text-[10px] font-bold mt-4 uppercase">Esperando actividad...</p>
               </div>
             ) : (
               [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(n => (
                 <div key={n.id} className="flex space-x-4 border-l-2 border-primary pl-4 py-1">
                    <div className="flex-1">
                       <p className="text-[10px] font-bold text-text-bright uppercase tracking-tight">{n.title}</p>
                       <p className="text-[10px] text-text-dim uppercase leading-tight mt-1">{n.message}</p>
                       <p className="text-[8px] text-primary/60 mt-2 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</p>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
