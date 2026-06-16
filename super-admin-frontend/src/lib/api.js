const BASE_URL = process.env.NEXT_PUBLIC_SA_API || "http://localhost:5001/api/sa";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),

  // Dashboard
  dashboard: () => request("/dashboard"),

  // Tenants
  getTenants: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tenants${qs ? "?" + qs : ""}`);
  },
  getTenant: (id) => request(`/tenants/${id}`),
  createTenant: (body) => request("/tenants", { method: "POST", body: JSON.stringify(body) }),
  updateTenant: (id, body) => request(`/tenants/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  extendPlan: (id, body) => request(`/tenants/${id}/extend`, { method: "POST", body: JSON.stringify(body) }),
  toggleLock: (id, body) => request(`/tenants/${id}/lock`, { method: "POST", body: JSON.stringify(body) }),
  deleteTenant: (id) => request(`/tenants/${id}`, { method: "DELETE" }),

  // Payments
  getPayments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/payments${qs ? "?" + qs : ""}`);
  },
  addPayment: (body) => request("/payments", { method: "POST", body: JSON.stringify(body) }),
  updatePaymentStatus: (id, body) =>
    request(`/payments/${id}/status`, { method: "PUT", body: JSON.stringify(body) }),
};
