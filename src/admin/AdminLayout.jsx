import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Calendar, 
  Users, 
  ClipboardList, 
  Coffee, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  ChefHat,
  Monitor,
  Settings,
  Truck,
  Menu,
  X,
  Bell,
  Trash2,
  Sun,
  Moon
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1280);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const { hasPermission, PERMISSIONS, currentUser, groups, notifications, clearNotification, darkMode, setDarkMode, logout, cmsData } = useAdmin();
  const brand = cmsData?.brand || { name: 'URBAN', tagline: 'Control Center' };

  React.useEffect(() => {
    if (!currentUser && !localStorage.getItem('urban_token')) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1280;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const userGroup = groups.find(g => 
    g.id === currentUser?.groupId || 
    g.id.toString() === currentUser?.groupId?.toString() || 
    g.slug === currentUser?.groupId
  );

  const menuItems = [
    { name: 'Dashboard', path: '/hidden-admin', icon: <BarChart size={20} />, permission: PERMISSIONS.DASHBOARD_VIEW },
    { name: 'Pedidos', path: '/hidden-admin/orders', icon: <ClipboardList size={20} />, permission: PERMISSIONS.ORDERS_MANAGE },
    { name: 'Cocina', path: '/hidden-admin/kitchen', icon: <ChefHat size={20} />, permission: PERMISSIONS.KITCHEN_VIEW },
    { name: 'Domicilios', path: '/hidden-admin/delivery', icon: <Truck size={20} />, permission: PERMISSIONS.DELIVERY_MANAGE },
    { name: 'Reservas', path: '/hidden-admin/reservations', icon: <Calendar size={20} />, permission: PERMISSIONS.RESERVATIONS_MANAGE },
    { name: 'Infraestructura', path: '/hidden-admin/venue', icon: <Users size={20} />, permission: PERMISSIONS.TABLES_MANAGE },
    { name: 'Menu/Carta', path: '/hidden-admin/products', icon: <Coffee size={20} />, permission: PERMISSIONS.PRODUCTS_MANAGE },
    { name: 'Contenido CMS', path: '/hidden-admin/cms', icon: <Monitor size={20} />, permission: PERMISSIONS.CMS_MANAGE },
    { name: 'Personal', path: '/hidden-admin/personnel', icon: <Settings size={20} />, permission: PERMISSIONS.SYSTEM_SETTINGS },
  ].filter(item => hasPermission(item.permission));

  return (
    <div className="flex h-screen bg-background text-text-bright font-sans overflow-hidden">
      {/* Sidebar - Urban Edition (Drawer on Mobile, Fixed on Desktop) */}
      <AnimatePresence>
        {(sidebarOpen || !isMobile) && (
          <>
            {/* Backdrop for mobile */}
            {/* Backdrop for mobile */}
            {isMobile && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[900]"
              />
            )}
            
            <motion.aside 
              initial={isMobile ? { x: -300 } : false}
              animate={{ x: 0 }}
              exit={isMobile ? { x: -300 } : false}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 left-0 w-72 border-r-2 border-zinc-200 dark:border-zinc-900 bg-surface flex flex-col z-[1000] xl:relative xl:translate-x-0 ${isMobile ? 'shadow-2xl' : ''}`}
            >
              <div className="p-8 md:p-10 border-b-2 border-primary/20 flex justify-between items-center bg-black/5">
                <div className="text-2xl md:text-3xl font-serif text-primary font-bold tracking-[0.1em] uppercase">
                  {brand.name} <span className="text-text-bright block text-[9px] md:text-[10px] tracking-[0.3em] font-sans">{brand.tagline}</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="xl:hidden text-primary p-2 hover:bg-primary/10 transition-colors">
                   <X size={28} />
                 </button>
              </div>

              <nav className="flex-1 p-4 md:p-6 space-y-2 md:space-y-3 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === '/hidden-admin'}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between p-3 md:p-4 transition-all rounded-none group ${
                        isActive 
                          ? 'bg-primary text-text-bright font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]' 
                          : 'text-text-dim hover:bg-primary/10 hover:text-primary'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center space-x-4">
                          <span className={isActive ? 'text-text-bright' : 'text-primary'}>{item.icon}</span>
                          <span className="text-[11px] md:text-sm uppercase tracking-[0.2em] font-bold">{item.name}</span>
                        </div>
                        <ChevronRight size={14} className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="p-6 border-t-2 border-zinc-200 dark:border-zinc-900 bg-black/10">
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="flex items-center space-x-3 text-text-dim hover:text-primary p-3 w-full transition-all uppercase tracking-widest text-[10px] font-bold"
                >
                  <LogOut size={16} />
                  <span>Abandonar Base</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content - Urban Edition */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 md:h-24 border-b-2 border-zinc-200 dark:border-zinc-900 flex items-center justify-between px-4 md:px-12 bg-surface shadow-lg z-[100] relative">
          <div className="flex items-center space-x-3 md:space-x-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden p-2 text-primary hover:bg-primary/10 transition-colors -ml-2"
            >
               <Menu size={28} />
            </button>
            <div className="flex items-center space-x-2 md:space-x-4">
              <ShieldCheck className="text-primary hidden sm:block" size={24} />
              <h1 className="text-sm md:text-2xl font-serif uppercase tracking-wider whitespace-nowrap">
                Sistema <span className="text-primary italic">Activo</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-6">
            {/* Theme Toggle */}
            <button 
              onClick={() => setDarkMode(prev => !prev)}
              className="p-2 text-text-dim hover:text-primary transition-all rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:scale-90"
              title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            >
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative">
               <button 
                 onClick={() => setNotifOpen(!notifOpen)}
                 className={`p-2 transition-all relative ${notifications.length > 0 ? 'text-primary' : 'text-text-dim hover:text-primary'}`}
               >
                  <Bell size={24} />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[8px] font-bold flex items-center justify-center rounded-full animate-pulse">
                       {notifications.length}
                    </span>
                  )}
               </button>

               <AnimatePresence>
                 {notifOpen && (
                   <motion.div
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     className="absolute right-0 mt-4 w-80 bg-surface border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl z-[1000] overflow-hidden"
                   >
                      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-black/5">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Operaciones Recientes</span>
                         <span className="text-[8px] font-bold text-text-dim uppercase">{notifications.length} Alertas</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto custom-scrollbar">
                         {notifications.length === 0 ? (
                           <div className="p-10 text-center text-text-dim text-[10px] uppercase tracking-widest opacity-30">
                              Sin novedades
                           </div>
                         ) : (
                           notifications.map(n => (
                             <div key={n.id} className="p-4 border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-black/5 transition-all group">
                                <div className="flex justify-between items-start mb-1">
                                   <p className={`text-[10px] font-bold uppercase tracking-widest ${n.type === 'SUCCESS' ? 'text-green-500' : 'text-primary'}`}>{n.title}</p>
                                   <button onClick={() => clearNotification(n.id)} className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-accent transition-all"><Trash2 size={12}/></button>
                                </div>
                                <p className="text-xs text-text-bright font-serif leading-tight">{n.message}</p>
                                <p className="text-[8px] text-text-dim mt-2 font-bold uppercase tracking-widest">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             </div>
                           ))
                         )}
                      </div>
                      {notifications.length > 0 && (
                        <button 
                          onClick={() => notifications.forEach(n => clearNotification(n.id))}
                          className="w-full p-3 bg-black/10 hover:bg-primary hover:text-white transition-all text-[8px] font-bold uppercase tracking-[0.3em]"
                        >
                           Limpiar Todo
                        </button>
                      )}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 md:space-x-4 hover:opacity-80 transition-all outline-none"
              >
                <div className="text-right hidden sm:block border-r-2 border-zinc-200 dark:border-zinc-800 pr-4 md:pr-8">
                  <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-primary font-bold truncate max-w-[100px] md:max-w-none">{userGroup?.name || 'Agente'}</p>
                  <p className="text-xs md:text-sm text-text-bright font-bold font-serif uppercase truncate max-w-[100px] md:max-w-none">{currentUser?.name}</p>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-200 dark:bg-zinc-800 border-2 border-primary flex items-center justify-center text-primary font-bold text-lg font-serif">
                    {currentUser?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-surface rounded-full shadow-sm"></div>
                </div>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-56 bg-surface border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-black/5">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Sesión Activa</p>
                        <p className="text-xs font-bold text-text-bright truncate">{currentUser?.email || currentUser?.username}</p>
                      </div>
                      
                      <div className="py-2">
                        <button 
                          onClick={() => { setUserMenuOpen(false); navigate('/hidden-admin/personnel'); }}
                          className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim hover:bg-primary/10 hover:text-primary transition-all flex items-center space-x-3"
                        >
                          <Settings size={14} />
                          <span>Editar Perfil</span>
                        </button>
                        
                        <button 
                          onClick={() => { setUserMenuOpen(false); navigate('/'); }}
                          className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim hover:bg-primary/10 hover:text-primary transition-all flex items-center space-x-3"
                        >
                          <Monitor size={14} />
                          <span>Vista Pública</span>
                        </button>
                        
                        <div className="border-t border-zinc-100 dark:border-zinc-900 my-1"></div>
                        
                        <button 
                          onClick={() => { setUserMenuOpen(false); logout(); navigate('/login'); }}
                          className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/10 transition-all flex items-center space-x-3"
                        >
                          <LogOut size={14} />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-background relative custom-scrollbar">
          {/* Subtle pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-[0.03] dark:opacity-[0.1] pointer-events-none"></div>
          <div className="relative max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
