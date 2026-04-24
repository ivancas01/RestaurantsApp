import React, { createContext, useContext, useState, useEffect } from 'react';
import { menuCategories as INITIAL_MENU } from '../data/menu';
import { auditStorage } from '../utils/storageAudit';
import { api } from '../services/api';

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
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('urban_current_user');
    // If it's the old default admin with string groupId, return null to force re-auth or refresh
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed && parsed.groupId === 'super_admin') return null;
    return parsed;
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
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
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
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);

  const DEFAULT_CMS = {
    brand: {
      name: "URBAN STREET",
      tagline: "Control Center"
    },
    hero: {
      title: "",
      subtitle: "",
      cta_menu: "Ver Carta",
      cta_reserva: "Reservar",
      featured_image: "",
      featured_name: "",
      featured_price: "",
      featured_desc: ""
    },
    about: {
      title: "",
      subtitle: "",
      description: "",
      stats: []
    },
    contact: {
      address: "",
      phone: "",
      email: "",
      hours: []
    },
    reservations: {
      title: "Reserva tu Mesa",
      subtitle: "",
      help_text: ""
    }
  };

  const [cmsData, setCmsData] = useState(DEFAULT_CMS);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Public Data (Menu, Locations, CMS)
      const [menuData, locData, heroRes, aboutRes, contactRes, resvRes, brandRes] = await Promise.all([
        api.getCategories(),
        api.getLocations(),
        api.getCmsSection('hero').catch(() => null),
        api.getCmsSection('about').catch(() => null),
        api.getCmsSection('contact').catch(() => null),
        api.getCmsSection('reservations').catch(() => null),
        api.getCmsSection('brand').catch(() => null)
      ]);

      if (Array.isArray(menuData)) setMenu(menuData);
      if (Array.isArray(locData)) {
        setLocations(locData);
        setTables(locData.flatMap(l => l.tables || []));
      }

      const updatedCms = { ...DEFAULT_CMS };
      if (heroRes?.content) updatedCms.hero = heroRes.content;
      if (aboutRes?.content) updatedCms.about = aboutRes.content;
      if (contactRes?.content) updatedCms.contact = contactRes.content;
      if (resvRes?.content) updatedCms.reservations = resvRes.content;
      if (brandRes?.content) updatedCms.brand = brandRes.content;
      setCmsData(updatedCms);

      // 2. Fetch Private Data (if logged in)
      if (localStorage.getItem('urban_token')) {
        const [ordData, resData, userData, roleData, profileData] = await Promise.all([
          api.getOrders(),
          api.getReservations(),
          api.getUsers(),
          api.getRoles(),
          api.getCurrentUser().catch(() => null)
        ]);

        setOrders(Array.isArray(ordData) ? ordData : []);
        setReservations(Array.isArray(resData) ? resData : []);
        setUsers(Array.isArray(userData) ? userData : []);
        setGroups(Array.isArray(roleData) ? roleData : []);
        if (profileData) setCurrentUser(profileData);
      }
    } catch (err) {
      console.error("Failed to refresh data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    refreshData();
  }, []);

  // Persistence Effects (Only for local UI state like theme and current user)
  useEffect(() => { localStorage.setItem('urban_current_user', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('urban_theme', darkMode ? 'dark' : 'light'); }, [darkMode]);

  useEffect(() => {
    // Only run if we have groups
    if (groups.length === 0) return;

    const allPerms = Object.values(PERMISSIONS);
    const superAdmin = groups.find(g => g.slug === 'super_admin');
    if (superAdmin) {
      // Check if super admin has all permissions
      const hasAll = allPerms.every(p => superAdmin.permissions.includes(p));
      if (!hasAll) {
        // In a real app we'd update via API here
      }
    }

    // Phase 3: Initial storage audit report
    auditStorage();
  }, [groups]);

  const hasPermission = (permission) => {
    if (!currentUser) return false;

    // Ultimate Fail-safe: Django Superuser or hardcoded admin username/group
    if (currentUser.is_superuser || currentUser.username === 'admin' || currentUser.groupId === 'super_admin') return true;

    // Find group by ID or slug (handles both integer IDs and string slugs)
    const userGroup = groups.find(g =>
      g.id === currentUser.groupId ||
      g.id.toString() === currentUser.groupId?.toString() ||
      g.slug === currentUser.groupId
    );

    if (!userGroup) return false;

    if (userGroup.slug === 'super_admin') return true;
    return userGroup.permissions.includes(permission);
  };

  const loginAs = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };



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

  const addCategory = async (categoryData) => {
    try {
      const newCategory = await api.createCategory(categoryData);
      setMenu([...menu, { ...newCategory, products: [] }]);
      return newCategory;
    } catch (err) {
      console.error("Error creating category:", err);
    }
  };

  const editCategory = async (id, categoryData) => {
    try {
      const updatedCategory = await api.updateCategory(id, categoryData);
      setMenu(menu.map(c => c.id === id ? { ...c, ...updatedCategory } : c));
    } catch (err) {
      console.error("Error updating category:", err);
    }
  };

  const removeCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      setMenu(menu.filter(c => c.id !== id));
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const addProduct = async (catId, productData) => {
    try {
      let dataToSend = productData;
      if (productData.image_file) {
        dataToSend = new FormData();
        dataToSend.append('category', catId);
        Object.keys(productData).forEach(key => {
          if (key === 'image_file') {
            dataToSend.append('image', productData[key]);
          } else if (key !== 'image') { // Don't send the old base64/url if there is a new file
            dataToSend.append(key, productData[key]);
          }
        });
      } else {
        dataToSend = { ...productData, category: catId };
        delete dataToSend.image_file;
      }

      const newProduct = await api.createProduct(dataToSend);
      setMenu(menu.map(c => c.id === catId ? { ...c, products: [...c.products, newProduct] } : c));
      return newProduct;
    } catch (err) {
      console.error("Error creating product:", err);
    }
  };

  const editProduct = async (catId, prodId, productData) => {
    try {
      // Clean data for API
      let dataToSend;
      const cleanData = { ...productData };
      delete cleanData.image_preview;
      delete cleanData.image_file;

      if (productData.image_file) {
        dataToSend = new FormData();
        Object.keys(cleanData).forEach(key => {
          dataToSend.append(key, cleanData[key]);
        });
        dataToSend.append('image', productData.image_file);
      } else {
        if (typeof cleanData.image === 'string') delete cleanData.image;
        dataToSend = cleanData;
      }

      const updatedProduct = await api.updateProduct(prodId, dataToSend);
      setMenu(menu.map(c => c.id === catId ? {
        ...c,
        products: c.products.map(p => p.id === prodId ? updatedProduct : p)
      } : c));
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  const removeProduct = async (catId, prodId) => {
    try {
      await api.deleteProduct(prodId);
      setMenu(menu.map(c => c.id === catId ? {
        ...c,
        products: c.products.filter(p => p.id !== prodId)
      } : c));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // User Management
  const addUser = async (userData) => {
    try {
      const newUser = await api.createUser(userData);
      setUsers([...users, newUser]);
      return newUser;
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const updated = await api.updateUser(id, userData);
      setUsers(users.map(u => u.id === id ? updated : u));
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Location/Table Management
  const addLocation = async (locData) => {
    try {
      let dataToSend = locData;
      if (locData.image_file) {
        dataToSend = new FormData();
        dataToSend.append('name', locData.name);
        dataToSend.append('image', locData.image_file);
      } else {
        dataToSend = { name: locData.name };
      }
      const newLoc = await api.createLocation(dataToSend);
      setLocations([...locations, { ...newLoc, tables: [] }]);
      return newLoc;
    } catch (err) {
      console.error("Error creating location:", err);
    }
  };

  const removeLocation = async (id) => {
    try {
      await api.deleteLocation(id);
      setLocations(locations.filter(l => l.id !== id));
    } catch (err) {
      console.error("Error deleting location:", err);
    }
  };

  const addTable = async (tableData) => {
    try {
      const newTable = await api.createTable(tableData);
      setTables([...tables, newTable]);
      return newTable;
    } catch (err) {
      console.error("Error creating table:", err);
    }
  };

  const removeTable = async (id) => {
    try {
      await api.deleteTable(id);
      setTables(tables.filter(t => t.id !== id));
    } catch (err) {
      console.error("Error deleting table:", err);
    }
  };

  // Orders & Reservations Management
  const addOrder = async (order) => {
    try {
      const orderData = {
        ...order,
        items: order.items.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price_at_order: String(item.price).replace('$', ''),
          notes: item.notes || ''
        }))
      };
      const newOrder = await api.createOrder(orderData);
      setOrders([newOrder, ...orders]);

      if (order.type === 'table' && order.table) {
        setTables(prev => prev.map(t => String(t.id) === String(order.table) ? { ...t, status: 'Ocupada' } : t));
        await api.updateTable(order.table, { status: 'Ocupada' });
      }

      addNotification({
        type: 'INFO',
        title: 'Nuevo Pedido',
        message: `Pedido #${newOrder.id} creado correctamente.`
      });
      return newOrder;
    } catch (err) {
      console.error("Error creating order:", err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, status, reason = null) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updated = await api.updateOrderStatus(orderId, status);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status, cancelReason: reason || o.cancelReason } : o));

      // Release table only on Pagado or Cancelado
      if (order.type === 'table' && order.table) {
        if (['Pagado', 'Cancelado'].includes(status)) {
          setTables(prev => prev.map(t => String(t.id) === String(order.table) ? { ...t, status: 'Disponible' } : t));
          await api.updateTable(order.table, { status: 'Disponible' });
        }
      }

      // Notifications
      if (status === 'Listo') {
        addNotification({
          type: 'SUCCESS',
          title: 'Pedido Listo',
          message: `La comanda #${order.id} está lista para ser retirada.`
        });
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  const updateOrder = async (orderId, partialOrder) => {
    try {
      const existingOrder = orders.find(o => o.id === orderId);
      if (!existingOrder) return;

      const orderData = {
        ...existingOrder,
        ...partialOrder
      };

      // Only map items if they are present in the update OR use existing ones
      const itemsToProcess = partialOrder.items || existingOrder.items || [];
      orderData.items = itemsToProcess.map(item => ({
        product: item.product || item.id,
        quantity: item.quantity,
        price_at_order: String(item.price_at_order || item.price || '0').replace('$', ''),
        notes: item.notes || ''
      }));

      const savedOrder = await api.updateOrder(orderId, orderData);
      setOrders(orders.map(o => o.id === orderId ? savedOrder : o));
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await api.deleteOrder(orderId);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  const addReservation = async (res) => {
    try {
      const newRes = await api.createReservation(res);
      setReservations([...reservations, newRes]);
      addNotification({
        type: 'INFO',
        title: 'Nueva Reserva',
        message: `${res.name} para las ${res.time} (${res.persons}p)`
      });
    } catch (err) {
      console.error("Error creating reservation:", err);
    }
  };

  const updateReservationStatus = async (resId, status) => {
    try {
      const updatedRes = await api.updateReservation(resId, { status });
      setReservations(reservations.map(r => r.id === resId ? updatedRes : r));
    } catch (err) {
      console.error("Error updating reservation status:", err);
    }
  };

  const deleteReservation = async (resId) => {
    try {
      await api.deleteReservation(resId);
      setReservations(reservations.filter(r => r.id !== resId));
    } catch (err) {
      console.error("Error deleting reservation:", err);
    }
  };

  const updateCMS = async (section, data) => {
    try {
      const updatedSection = await api.updateCmsSection(section, { content: data });
      setCmsData(prev => ({
        ...prev,
        [section]: updatedSection.content
      }));
    } catch (err) {
      console.error("Error updating CMS:", err);
      // Fallback to local only if API fails
      setCmsData(prev => ({
        ...prev,
        [section]: { ...prev[section], ...data }
      }));
    }
  };

  const getMostOrderedProduct = () => {
    const itemCounts = {};
    if (Array.isArray(orders)) {
      orders.forEach(order => {
        if (Array.isArray(order.items)) {
          order.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
          });
        }
      });
    }

    const sorted = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
    const topItemName = sorted[0]?.[0];
    const topItemQuantity = sorted[0]?.[1] || 0;

    if (!topItemName) return null;

    // Find the product details in the menu
    let topProduct = null;
    if (Array.isArray(menu)) {
      menu.forEach(cat => {
        if (Array.isArray(cat.items)) {
          const found = cat.items.find(i => i.name === topItemName);
          if (found) topProduct = found;
        }
      });
    }

    return topProduct ? { ...topProduct, totalOrders: topItemQuantity } : null;
  };

  const logout = () => {
    localStorage.removeItem('urban_token');
    localStorage.removeItem('urban_refresh_token');
    localStorage.removeItem('urban_current_user');
    setCurrentUser(null);
    setOrders([]);
    setReservations([]);
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
        setCurrentUser,
        addNotification,
        clearNotification,
        updateMenu,
        addCategory,
        editCategory,
        removeCategory,
        addProduct,
        editProduct,
        removeProduct,
        addUser,
        updateUser,
        deleteUser,
        logout,
        addLocation,
        removeLocation,
        addTable,
        removeTable,
        setGroups,
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
        deleteReservation,
        refreshData,
        logout,
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
