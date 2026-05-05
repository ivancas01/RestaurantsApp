const API_HOSTNAME = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '127.0.0.1'
  : window.location.hostname;

const API_URL = import.meta.env.VITE_API_URL || `http://${API_HOSTNAME}:8000/api`;

const getHeaders = () => {
  const token = localStorage.getItem("urban_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleRequest = async (url, options = {}) => {
  const response = await fetch(url, options);
  
  if (response.status === 401) {
    // Session expired or invalid
    window.dispatchEvent(new CustomEvent('urban_unauthorized'));
    throw new Error("Sesión expirada");
  }
  
  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  // Auth
  login: async (username, password) => {
    return handleRequest(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  },

  // Menu Categories
  getCategories: () =>
    handleRequest(`${API_URL}/menu/categories/`),
  createCategory: (data) =>
    handleRequest(`${API_URL}/menu/categories/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
  updateCategory: (id, data) =>
    handleRequest(`${API_URL}/menu/categories/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
  deleteCategory: (id) =>
    handleRequest(`${API_URL}/menu/categories/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // Menu Products
  createProduct: (data) => {
    const headers = getHeaders();
    const body = data instanceof FormData ? data : JSON.stringify(data);
    if (data instanceof FormData) delete headers["Content-Type"];

    return handleRequest(`${API_URL}/menu/products/`, {
      method: "POST",
      headers,
      body,
    });
  },
  updateProduct: (id, data) => {
    const headers = getHeaders();
    const body = data instanceof FormData ? data : JSON.stringify(data);
    if (data instanceof FormData) delete headers["Content-Type"];

    return handleRequest(`${API_URL}/menu/products/${id}/`, {
      method: "PATCH",
      headers,
      body,
    });
  },
  deleteProduct: (id) =>
    handleRequest(`${API_URL}/menu/products/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // Venue Locations
  getLocations: () =>
    handleRequest(`${API_URL}/venue/locations/`),
  createLocation: (data) => {
    const headers = getHeaders();
    const body = data instanceof FormData ? data : JSON.stringify(data);
    if (data instanceof FormData) delete headers["Content-Type"];

    return handleRequest(`${API_URL}/venue/locations/`, {
      method: "POST",
      headers,
      body,
    });
  },
  deleteLocation: (id) =>
    handleRequest(`${API_URL}/venue/locations/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // Venue Tables
  createTable: (data) =>
    handleRequest(`${API_URL}/venue/tables/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
  updateTable: (id, data) =>
    handleRequest(`${API_URL}/venue/tables/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
  deleteTable: (id) =>
    handleRequest(`${API_URL}/venue/tables/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // Orders
  getOrders: (page = 1) =>
    handleRequest(`${API_URL}/orders/orders/?page=${page}`, { headers: getHeaders() }),
  getKitchenQueue: () =>
    handleRequest(`${API_URL}/orders/orders/kitchen_queue/`, {
      headers: getHeaders(),
    }),
  createOrder: (data) =>
    handleRequest(`${API_URL}/orders/orders/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
  updateOrder: (id, data) =>
    handleRequest(`${API_URL}/orders/orders/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
  deleteOrder: (id) =>
    handleRequest(`${API_URL}/orders/orders/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),
  getDashboardStats: () =>
    handleRequest(`${API_URL}/orders/orders/dashboard_stats/`, {
      headers: getHeaders(),
    }),
  updateOrderStatus: (id, status) =>
    handleRequest(`${API_URL}/orders/orders/${id}/update_status/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }),
  searchCustomer: (query) =>
    handleRequest(`${API_URL}/orders/orders/search_customer/?q=${query}`, {
      headers: getHeaders(),
    }),
  getCustomers: (page = 1) =>
    handleRequest(`${API_URL}/orders/orders/customer_list/?page=${page}`, {
      headers: getHeaders(),
    }),
  getCustomerStats: (id) =>
    handleRequest(`${API_URL}/orders/orders/customer_stats/?identification=${id}`, {
      headers: getHeaders(),
    }),
  getGlobalStats: () =>
    handleRequest(`${API_URL}/orders/orders/global_stats/`, {
      headers: getHeaders(),
    }),
  getCashClosing: () =>
    handleRequest(`${API_URL}/orders/orders/cash_closing/`, {
      headers: getHeaders(),
    }),

  // Reservations
  getReservations: (page = 1) =>
    handleRequest(`${API_URL}/reservations/reservations/?page=${page}`, {
      headers: getHeaders(),
    }),
  createReservation: (data) =>
    handleRequest(`${API_URL}/reservations/reservations/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
  updateReservation: (id, data) =>
    handleRequest(`${API_URL}/reservations/reservations/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
  deleteReservation: (id) =>
    handleRequest(`${API_URL}/reservations/reservations/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // Personnel
  getUsers: (page = 1) =>
    handleRequest(`${API_URL}/auth/users/?page=${page}`, { headers: getHeaders() }),
  getMe: () =>
    handleRequest(`${API_URL}/auth/users/me/`, { headers: getHeaders() }),
  createUser: (data) =>
    handleRequest(`${API_URL}/auth/users/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
  updateUser: (id, data) =>
    handleRequest(`${API_URL}/auth/users/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
  deleteUser: (id) =>
    handleRequest(`${API_URL}/auth/users/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // Roles / Groups
  getRoles: () =>
    handleRequest(`${API_URL}/auth/roles/`, { headers: getHeaders() }),
  createRole: (data) =>
    handleRequest(`${API_URL}/auth/roles/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
  updateRole: (id, data) =>
    handleRequest(`${API_URL}/auth/roles/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
  deleteRole: (id) =>
    handleRequest(`${API_URL}/auth/roles/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // CMS
  getCmsSection: (name) =>
    handleRequest(`${API_URL}/cms/sections/${name}/`),
  updateCmsSection: (name, data) =>
    handleRequest(`${API_URL}/cms/sections/${name}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),
};
