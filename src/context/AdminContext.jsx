import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const [menu, setMenu] = useState([]);
  const [locations, setLocations] = useState([]);
  const [tables, setTables] = useState([]);

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
      tagline: "Control Center",
      theme: "rose"
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
      instagram: "",
      whatsapp_prefix: "57",
      opening_time: "08:00:00",
      closing_time: "22:00:00",
      closed_image: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?q=80&w=800&auto=format&fit=crop"
    },
    reservations: {
      title: "Reserva tu Mesa",
      subtitle: "",
      help_text: ""
    },
    footer: {
      description: "Experience the city through flavor. Premium Urban Gastronomy.",
      socials: [
        { name: "Instagram", url: "#" },
        { name: "Facebook", url: "#" }
      ],
      copyright: "Digital Gastronomy"
    }
  };

  const [cmsData, setCmsData] = useState(DEFAULT_CMS);

  useEffect(() => {
    const themes = {
      rose: { primary: '#e11d48', dark: '#be123c' },
      amber: { primary: '#f59e0b', dark: '#d97706' },
      emerald: { primary: '#10b981', dark: '#059669' },
      blue: { primary: '#3b82f6', dark: '#2563eb' },
      violet: { primary: '#8b5cf6', dark: '#7c3aed' },
      orange: { primary: '#ea580c', dark: '#c2410c' }
    };
    
    const selectedTheme = cmsData?.brand?.theme || 'rose';
    const themeColors = themes[selectedTheme] || themes.rose;
    
    document.documentElement.style.setProperty('--primary', themeColors.primary);
    document.documentElement.style.setProperty('--primary-dark', themeColors.dark);
    document.documentElement.style.setProperty('--primary-shadow-10', themeColors.primary + '1a');
    document.documentElement.style.setProperty('--primary-shadow-20', themeColors.primary + '33');
    document.documentElement.style.setProperty('--primary-shadow-30', themeColors.primary + '4d');
  }, [cmsData?.brand?.theme]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [pagination, setPagination] = useState({
    orders: 0,
    reservations: 0,
    users: 0,
    customers: 0
  });
  const [dashboardStats, setDashboardStats] = useState({
    today_sales: 0,
    active_orders: 0,
    occupied_tables: 0,
    today_reservations: 0,
    recent_orders: [],
    recent_reservations: []
  });

  const fetchPublicBasics = useCallback(async () => {
    try {
      const [menuData, locData, brandRes, contactRes] = await Promise.all([
        api.getCategories(),
        api.getLocations(),
        api.getCmsSection('brand').catch(() => null),
        api.getCmsSection('contact').catch(() => null)
      ]);
      const menuResults = menuData.results || (Array.isArray(menuData) ? menuData : []);
      const locResults = locData.results || (Array.isArray(locData) ? locData : []);
      
      setMenu(menuResults);
      setLocations(locResults);
      setTables(locResults.flatMap(l => l.tables || []));
      setCmsData(prev => ({ 
        ...prev, 
        brand: brandRes?.content || prev.brand,
        contact: contactRes?.content || prev.contact
      }));
    } catch (err) {
      console.error("Failed to fetch public basics:", err);
    }
  }, []);

  const fetchCMSContent = useCallback(async () => {
    try {
      // Hero, About, and Footer are only needed for public site or CMS management
      const [heroRes, aboutRes, resvRes, footerRes] = await Promise.all([
        api.getCmsSection('hero').catch(() => null),
        api.getCmsSection('about').catch(() => null),
        api.getCmsSection('reservations').catch(() => null),
        api.getCmsSection('footer').catch(() => null)
      ]);

      setCmsData(prev => ({
        ...prev,
        hero: heroRes?.content || prev.hero,
        about: aboutRes?.content || prev.about,
        reservations: resvRes?.content || prev.reservations,
        footer: footerRes?.content || prev.footer
      }));
    } catch (err) {
      console.error("Failed to fetch CMS content:", err);
    }
  }, []);

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      const data = await api.getOrders(page);
      const results = data.results || (Array.isArray(data) ? data : []);
      setOrders(results);
      setPagination(prev => ({ ...prev, orders: data.count || results.length }));
      
      // Update notifications briefly
      if (Array.isArray(results)) {
        const recent = results.filter(o => o.status === 'Pendiente').slice(0, 5);
        setNotifications(recent.map(o => ({
          id: o.id,
          title: 'Nuevo Pedido',
          message: `Mesa ${o.table || 'Domi'} - $${o.total}`,
          timestamp: o.created_at
        })));
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  }, []);

  const fetchReservations = useCallback(async (page = 1) => {
    try {
      const data = await api.getReservations(page);
      const results = data.results || (Array.isArray(data) ? data : []);
      setReservations(results);
      setPagination(prev => ({ ...prev, reservations: data.count || results.length }));
    } catch (err) {
      console.error("Failed to fetch reservations:", err);
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const data = await api.getDashboardStats();
      setDashboardStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  }, []);

  const fetchAdminCritical = useCallback(async () => {
    if (!localStorage.getItem('urban_token')) return;
    setIsSyncing(true);
    try {
      // Essential: Always fetch roles/groups so hasPermission works
      // Critical: User Profile, Orders, Reservations, Dashboard, and Groups
      await Promise.all([
        api.getMe().then(data => setCurrentUser(prev => ({ ...prev, ...data }))),
        fetchOrders(), 
        fetchReservations(), 
        fetchDashboardStats(),
        api.getRoles().then(data => setGroups(Array.isArray(data) ? data : []))
      ]);
    } catch (err) {
      console.error("Failed to fetch admin critical data:", err);
    } finally {
      setIsSyncing(false);
      setLastSync(new Date());
    }
  }, [fetchOrders, fetchReservations]);

  const fetchPersonnelData = useCallback(async (page = 1) => {
    if (!localStorage.getItem('urban_token')) return;
    try {
      const userData = await api.getUsers(page);
      const userResults = userData.results || (Array.isArray(userData) ? userData : []);
      setUsers(userResults);
      setPagination(prev => ({ ...prev, users: userData.count || userResults.length }));
      
      // Groups are now fetched in fetchAdminCritical for all admin views
    } catch (err) {
      console.error("Failed to fetch personnel data:", err);
    }
  }, []);

  const refreshData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setIsSyncing(true);
    
    const path = window.location.pathname;
    const isAdmin = path.includes('/hidden-admin');
    const isPublic = path === '/' || path === '/menu';

    const tasks = [fetchPublicBasics()];
    
    if (isAdmin) {
      tasks.push(fetchAdminCritical());
    } else if (isPublic) {
      tasks.push(fetchCMSContent());
    }

    await Promise.all(tasks);
    
    setLastSync(new Date());
    setLoading(false);
    setIsSyncing(false);
  }, [fetchPublicBasics, fetchAdminCritical, fetchCMSContent]);

  const logout = useCallback(() => {
    localStorage.removeItem('urban_token');
    localStorage.removeItem('urban_refresh_token');
    localStorage.removeItem('urban_current_user');
    setCurrentUser(null);
    setOrders([]);
    setReservations([]);
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    // Session expiration listener
    const handleUnauthorized = () => {
      logout();
      window.location.href = '/login';
    };

    window.addEventListener('urban_unauthorized', handleUnauthorized);
    
    // Initial fetch only if we have a token or on public routes
    const path = window.location.pathname;
    const isPublic = path === '/' || path === '/menu';
    const hasToken = !!localStorage.getItem('urban_token');

    if (hasToken || isPublic) {
      refreshData();
    } else if (path.includes('/hidden-admin')) {
      // Force redirect if trying to access admin without token
      window.location.href = '/login';
    }

    return () => window.removeEventListener('urban_unauthorized', handleUnauthorized);
  }, [refreshData, logout]);

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

    // If they have the slug 'super_admin', they have all permissions
    if (userGroup.slug === 'super_admin' || userGroup.name?.toLowerCase().includes('admin')) return true;
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
      setOrders(orders.map(o => o.id === orderId ? { 
        ...o, 
        status, 
        isPaid: status === 'Pagado' ? true : o.isPaid,
        cancelReason: reason || o.cancelReason 
      } : o));

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

      // Release table if status changed to Pagado or Cancelado
      if (savedOrder.type === 'table' && savedOrder.table) {
        if (['Pagado', 'Cancelado'].includes(savedOrder.status)) {
          setTables(prev => prev.map(t => String(t.id) === String(savedOrder.table) ? { ...t, status: 'Disponible' } : t));
          await api.updateTable(savedOrder.table, { status: 'Disponible' });
        }
      }
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
      setReservations([newRes, ...reservations]);
      addNotification({
        type: 'INFO',
        title: 'Nueva Reserva',
        message: `${res.name} para las ${res.time} (${res.persons}p)`
      });
      return newRes;
    } catch (err) {
      console.error("Error creating reservation:", err);
      throw err;
    }
  };

  const updateReservation = async (resId, data) => {
    try {
      const updatedRes = await api.updateReservation(resId, data);
      setReservations(reservations.map(r => r.id === resId ? updatedRes : r));
      return updatedRes;
    } catch (err) {
      console.error("Error updating reservation:", err);
      throw err;
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
        pagination,
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
        updateReservation,
        updateReservationStatus,
        deleteReservation,
        refreshData,
        fetchCMSContent,
        fetchAdminCritical,
        fetchOrders,
        fetchReservations,
        fetchPersonnelData,
        logout,
        setReservations,
        updateCMS,
        getMostOrderedProduct,
        darkMode,
        setDarkMode,
        lastSync,
        isSyncing,
        dashboardStats
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
