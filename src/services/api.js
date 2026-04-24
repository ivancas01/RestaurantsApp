const API_URL = 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem("urban_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error("Credenciales inválidas");
    return response.json();
  },

  // Menu Categories
  getCategories: () =>
    fetch(`${API_URL}/menu/categories/`).then((res) => res.json()),
  createCategory: (data) =>
    fetch(`${API_URL}/menu/categories/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  updateCategory: (id, data) =>
    fetch(`${API_URL}/menu/categories/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  deleteCategory: (id) =>
    fetch(`${API_URL}/menu/categories/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // Menu Products
  createProduct: (data) => {
    const headers = getHeaders();
    const body = data instanceof FormData ? data : JSON.stringify(data);
    if (data instanceof FormData) delete headers["Content-Type"];

    return fetch(`${API_URL}/menu/products/`, {
      method: "POST",
      headers,
      body,
    }).then((res) => res.json());
  },
  updateProduct: (id, data) => {
    const headers = getHeaders();
    const body = data instanceof FormData ? data : JSON.stringify(data);
    if (data instanceof FormData) delete headers["Content-Type"];

    return fetch(`${API_URL}/menu/products/${id}/`, {
      method: "PATCH",
      headers,
      body,
    }).then((res) => res.json());
  },
  deleteProduct: (id) =>
    fetch(`${API_URL}/menu/products/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // Venue Locations
  getLocations: () =>
    fetch(`${API_URL}/venue/locations/`).then((res) => res.json()),
  createLocation: (data) => {
    const headers = getHeaders();
    const body = data instanceof FormData ? data : JSON.stringify(data);
    if (data instanceof FormData) delete headers["Content-Type"];

    return fetch(`${API_URL}/venue/locations/`, {
      method: "POST",
      headers,
      body,
    }).then((res) => res.json());
  },
  deleteLocation: (id) =>
    fetch(`${API_URL}/venue/locations/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // Venue Tables
  createTable: (data) =>
    fetch(`${API_URL}/venue/tables/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  updateTable: (id, data) =>
    fetch(`${API_URL}/venue/tables/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  deleteTable: (id) =>
    fetch(`${API_URL}/venue/tables/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // Orders
  getOrders: () =>
    fetch(`${API_URL}/orders/orders/`, { headers: getHeaders() }).then((res) =>
      res.json(),
    ),
  getKitchenQueue: () =>
    fetch(`${API_URL}/orders/orders/kitchen_queue/`, {
      headers: getHeaders(),
    }).then((res) => res.json()),
  createOrder: (data) =>
    fetch(`${API_URL}/orders/orders/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  updateOrder: (id, data) =>
    fetch(`${API_URL}/orders/orders/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  deleteOrder: (id) =>
    fetch(`${API_URL}/orders/orders/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),
  updateOrderStatus: (id, status) =>
    fetch(`${API_URL}/orders/orders/${id}/update_status/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then((res) => res.json()),

  // Reservations
  getReservations: () =>
    fetch(`${API_URL}/reservations/reservations/`, {
      headers: getHeaders(),
    }).then((res) => res.json()),
  createReservation: (data) =>
    fetch(`${API_URL}/reservations/reservations/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  updateReservation: (id, data) =>
    fetch(`${API_URL}/reservations/reservations/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  deleteReservation: (id) =>
    fetch(`${API_URL}/reservations/reservations/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // Personnel
  getUsers: () =>
    fetch(`${API_URL}/auth/users/`, { headers: getHeaders() }).then((res) =>
      res.json(),
    ),
  getCurrentUser: () =>
    fetch(`${API_URL}/auth/users/me/`, { headers: getHeaders() }).then((res) =>
      res.json(),
    ),
  createUser: (data) =>
    fetch(`${API_URL}/auth/users/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  updateUser: (id, data) =>
    fetch(`${API_URL}/auth/users/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  deleteUser: (id) =>
    fetch(`${API_URL}/auth/users/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // Roles / Groups
  getRoles: () =>
    fetch(`${API_URL}/auth/roles/`, { headers: getHeaders() }).then((res) =>
      res.json(),
    ),
  createRole: (data) =>
    fetch(`${API_URL}/auth/roles/`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  updateRole: (id, data) =>
    fetch(`${API_URL}/auth/roles/${id}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
  deleteRole: (id) =>
    fetch(`${API_URL}/auth/roles/${id}/`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  // CMS
  getCmsSection: (name) =>
    fetch(`${API_URL}/cms/sections/${name}/`).then((res) => res.json()),
  updateCmsSection: (name, data) =>
    fetch(`${API_URL}/cms/sections/${name}/`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((res) => res.json()),
};
