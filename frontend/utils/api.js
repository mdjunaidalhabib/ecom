export async function apiFetch(url, options = {}) {
  const baseUrl = "/api";

  if (!baseUrl) {
    throw new Error("API proxy route is not available");
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // ✅ FormData হলে Content-Type set করবে না
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error: ${res.status} → ${text}`);
  }

  if (res.status === 204) return null;

  return res.json();
}
