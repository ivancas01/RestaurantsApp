import React, { createContext, useContext, useState, useEffect } from 'react';
import { menuCategories as INITIAL_MENU } from '../data/menu';
import { auditStorage } from '../utils/storageAudit';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

// Available Permissions in the System
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard_view',
  RESERVATIONS_MANAGE: 'reservations_manage',
  TABLES_MANAGE: 'tables_manage',
  ORDERS_MANAGE: 'orders_manage',
  PRODUCTS_MANAGE: 'products_manage',
  KITCHEN_VIEW: 'kitchen_view',
  CMS_MANAGE: 'cms_manage',
  SYSTEM_SETTINGS: 'system_settings',
  DELIVERY_MANAGE: 'delivery_manage',
};

const DEFAULT_GROUPS = [
  {
    id: 'super_admin',
    name: 'Super Administrador',
    permissions: Object.values(PERMISSIONS),
  },
  {
    id: 'chef',
    name: 'Jefe de Cocina',
    permissions: [PERMISSIONS.KITCHEN_VIEW, PERMISSIONS.PRODUCTS_MANAGE],
  },
  {
    id: 'waiter',
    name: 'Mesero',
    permissions: [PERMISSIONS.ORDERS_MANAGE, PERMISSIONS.RESERVATIONS_MANAGE, PERMISSIONS.DELIVERY_MANAGE],
  }
];

const DEFAULT_USERS = [
  {
    id: 'admin_1',
    username: 'admin',
    name: 'Admin de Operaciones',
    groupId: 'super_admin',
    active: true
  }
];

export const AdminProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('urban_admin_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('urban_admin_groups');
    return saved ? JSON.parse(saved) : DEFAULT_GROUPS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('urban_current_user');
    return saved ? JSON.parse(saved) : DEFAULT_USERS[0];
  });

  // Menu Data
  const [menu, setMenu] = useState(() => {
    const saved = localStorage.getItem('urban_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });

  // Venue Data
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('urban_locations');
    return saved ? JSON.parse(saved) : [
      { id: 'loc_1', name: 'Terranza Exterior', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop' },
      { id: 'loc_2', name: 'Salón Principal', image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&auto=format&fit=crop' },
      { id: 'loc_3', name: 'Zona VIP', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop' }
    ];
  });

  const [tables, setTables] = useState(() => {
    const saved = localStorage.getItem('urban_tables');
    const defaultTables = [
      { id: 'table_1', number: '1', capacity: 4, locationId: 'loc_1', status: 'Disponible', x: 100, y: 100, shape: 'rect' },
      { id: 'table_2', number: '2', capacity: 2, locationId: 'loc_1', status: 'Ocupada', x: 300, y: 100, shape: 'circle' },
    ];
    return saved ? JSON.parse(saved) : defaultTables;
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('urban_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('urban_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Orders & Reservations
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('urban_orders');
    return saved ? JSON.parse(saved) : [
      { id: 'ord_1', type: 'delivery', customer: 'Ivan C.', items: [], total: 45.0, status: 'Pendiente', timestamp: new Date().toISOString() },
      { id: 'ord_2', type: 'table', tableId: 'table_1', items: [], total: 22.0, status: 'Preparando', timestamp: new Date().toISOString() }
    ];
  });

  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem('urban_reservations');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'res_1', 
        name: 'Sofia Loren', 
        identification: '12345678',
        phone: '3001234567',
        email: 'sofia@example.com',
        time: '20:30', 
        date: '2026-04-20', 
        persons: 2, 
        locationId: 'loc_1',
        instructions: 'Mesa cerca de la ventana por favor.',
        status: 'Confirmado', 
        method: 'web' 
      },
      { 
        id: 'res_2', 
        name: 'Marcus V.', 
        identification: '87654321',
        phone: '3109876543',
        email: 'marcus@example.com',
        time: '21:00', 
        date: '2026-04-20', 
        persons: 4, 
        locationId: 'loc_2',
        instructions: 'Es un aniversario.',
        status: 'Pendiente', 
        method: 'admin' 
      }
    ];
  });

  const DEFAULT_CMS = {
    hero: {
      title: "Sabor Urbano, Alma // Gourmet",
      subtitle: "Donde la calle se encuentra con la alta cocina.",
      cta_menu: "Ver Carta Completa",
      cta_reserva: "Reservar Mesa",
      featured_image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop",
      featured_name: "The Architect",
      featured_price: "22",
      featured_desc: "Wagyu A5, Cheddar Envejecido, Cebolla al Bourbon y pan brioche artesanal.",
      stats_label: "Trending",
      stats_value: "+124 Pedidos",
      established: "Urban Street // Established 2026"
    },
    about: {
      title: "Nuestra // Historia",
      content: "Lumina Urban Gourmet nació en las calles vibrantes de la ciudad, donde el arte y la gastronomía convergen. No solo servimos comida, creamos experiencias sensoriales que desafían lo convencional.",
      images: [
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop"
      ],
      years_label: "Years on the street",
      years_value: "10",
      feature_1_title: "RAW MATERIALS",
      feature_1_desc: "Solo ingredientes frescos y directos de origen local.",
      feature_2_title: "URBAN SOUL",
      feature_2_desc: "Ambiente diseñado para la ciudad que nunca duerme."
    },
    contact: {
      address: "Calle 42 # 8s-12, Sector Industrial",
      phone: "+57 302 478 8683",
      email: "hola@luminagourmet.com",
      instagram: "@luminagourmet",
      whatsapp_prefix: "57"
    },
    reservations: {
      title: "Reserva // Tu Espacio",
      subtitle: "Únete a la energía de la ciudad. Sin pretensiones, solo buen sabor y mejor ambiente.",
      help_text: "Para grupos de más de 8 personas, por favor contáctanos directamente vía telefónica."
    }
  };

  const [cmsData, setCmsData] = useState(() => {
    const saved = localStorage.getItem('urban_cms');
    if (!saved) return DEFAULT_CMS;
    
    // Merge saved data with defaults to ensure new properties exist
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_CMS,
      ...parsed,
      hero: { ...DEFAULT_CMS.hero, ...parsed.hero },
      about: { ...DEFAULT_CMS.about, ...parsed.about },
      contact: { ...DEFAULT_CMS.contact, ...parsed.contact },
      reservations: { ...DEFAULT_CMS.reservations, ...parsed.reservations }
    };
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('urban_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Granular Persistence Effects
  useEffect(() => { localStorage.setItem('urban_admin_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('urban_admin_groups', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem('urban_current_user', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('urban_menu', JSON.stringify(menu)); }, [menu]);
  useEffect(() => { localStorage.setItem('urban_locations', JSON.stringify(locations)); }, [locations]);
  useEffect(() => { localStorage.setItem('urban_tables', JSON.stringify(tables)); }, [tables]);
  useEffect(() => { localStorage.setItem('urban_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('urban_reservations', JSON.stringify(reservations)); }, [reservations]);
  useEffect(() => { localStorage.setItem('urban_cms', JSON.stringify(cmsData)); }, [cmsData]);
  useEffect(() => { localStorage.setItem('urban_notifications', JSON.stringify(notifications)); }, [notifications]);

  // Sync permissions migration
  useEffect(() => {
    const allPerms = Object.values(PERMISSIONS);
    const superAdmin = groups.find(g => g.id === 'super_admin');
    if (superAdmin) {
      const allPerms = Object.values(PERMISSIONS);
      // Force update if any permission is missing
      const hasAll = allPerms.every(p => superAdmin.permissions.includes(p));
      if (!hasAll) {
        setGroups(prev => prev.map(g => g.id === 'super_admin' ? { ...g, permissions: allPerms } : g));
      }
    }
    
    const waiter = groups.find(g => g.id === 'waiter');
    if (waiter && !waiter.permissions.includes(PERMISSIONS.DELIVERY_MANAGE)) {
      setGroups(prev => prev.map(g => g.id === 'waiter' ? { ...g, permissions: [...g.permissions, PERMISSIONS.DELIVERY_MANAGE] } : g));
    }

    // Phase 3: Initial storage audit report
    auditStorage();
  }, []);

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.groupId === 'super_admin') return true;
    const userGroup = groups.find(g => g.id === currentUser.groupId);
    if (!userGroup) return false;
    return userGroup.permissions.includes(permission);
  };

  const loginAs = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };

  const logout = () => setCurrentUser(null);

  // Notification Management
  const addNotification = (notif) => {
    const id = `notif_${Date.now()}`;
    setNotifications(prev => [{ ...notif, id, timestamp: new Date().toISOString() }, ...prev]);
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Menu Management
  const updateMenu = (newMenu) => setMenu(newMenu);
  
  // Group Management
  const addGroup = (group) => setGroups([...groups, { ...group, id: `group_${Date.now()}` }]);
  
  // Location/Table Management
  const addLocation = (locData) => setLocations([...locations, { ...locData, id: `loc_${Date.now()}` }]);
  const addTable = (table) => setTables([...tables, { ...table, id: `table_${Date.now()}` }]);

  // Orders & Reservations Management
  const addOrder = (order) => {
    const newId = `ord_${Date.now()}`;
    const orderData = { ...order, id: newId, status: 'Pendiente', timestamp: new Date().toISOString() };
    setOrders([...orders, orderData]);
    
    // Auto-occupy table if it's an onsite order
    if (order.type === 'table' && order.tableId) {
      setTables(prev => prev.map(t => t.id === order.tableId ? { ...t, status: 'Ocupada' } : t));
    }

    addNotification({
      type: 'INFO',
      title: 'Nuevo Pedido',
      message: `${order.type === 'delivery' ? 'Domicilio' : 'Mesa ' + (tables.find(t => t.id === order.tableId)?.number || '??')} - ${order.customer || 'Sin Nombre'}`
    });
  };

  const updateOrderStatus = (orderId, status, reason = null) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setOrders(orders.map(o => o.id === orderId ? { ...o, status, cancelReason: reason || o.cancelReason } : o));

    // Release table only on Pagado or Cancelado
    if (order.type === 'table' && order.tableId) {
      if (['Pagado', 'Cancelado'].includes(status)) {
        setTables(prev => prev.map(t => t.id === order.tableId ? { ...t, status: 'Disponible' } : t));
      }
    }

    // Phase 3 Notifications
    if (status === 'Listo') {
      addNotification({
        type: 'SUCCESS',
        title: 'Pedido Listo',
        message: `La comanda #${order.id.split('_')[1]} está lista para ser retirada.`
      });
    } else if (status === 'Enviado') {
      addNotification({
        type: 'INFO',
        title: 'Domicilio en Camino',
        message: `El pedido de ${order.customer} ha salido para entrega.`
      });
    }
  };

  const updateOrder = (orderId, updatedOrder) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, ...updatedOrder } : o));
  };

  const deleteOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const addReservation = (res) => {
    const newId = `res_${Date.now()}`;
    setReservations([...reservations, { ...res, id: newId }]);
    addNotification({
      type: 'INFO',
      title: 'Nueva Reserva',
      message: `${res.name} para las ${res.time} (${res.persons}p)`
    });
  };

  const updateReservationStatus = (resId, status) => {
    setReservations(reservations.map(r => r.id === resId ? { ...r, status } : r));
  };

  const updateCMS = (section, data) => {
    setCmsData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const getMostOrderedProduct = () => {
    const itemCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    const sorted = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
    const topItemName = sorted[0]?.[0];
    const topItemQuantity = sorted[0]?.[1] || 0;

    if (!topItemName) return null;

    // Find the product details in the menu
    let topProduct = null;
    menu.forEach(cat => {
      const found = cat.items.find(i => i.name === topItemName);
      if (found) topProduct = found;
    });

    return topProduct ? { ...topProduct, totalOrders: topItemQuantity } : null;
  };

  return (
    <AdminContext.Provider
      value={{
        users,
        groups,
        currentUser,
        menu,
        locations,
        tables,
        orders,
        reservations,
        notifications,
        cmsData,
        PERMISSIONS,
        hasPermission,
        loginAs,
        logout,
        addNotification,
        clearNotification,
        updateMenu,
        addGroup,
        setGroups,
        addLocation,
        addTable,
        setUsers,
        setLocations,
        setTables,
        addOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        setOrders,
        addReservation,
        updateReservationStatus,
        setReservations,
        updateCMS,
        getMostOrderedProduct,
        darkMode,
        setDarkMode
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
