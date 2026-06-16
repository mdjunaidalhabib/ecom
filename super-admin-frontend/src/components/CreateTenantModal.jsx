"use client";
import { useState } from "react";
import { api } from "../lib/api";

export default function CreateTenantModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    shopName: "", ownerName: "", ownerEmail: "", ownerPhone: "",
    subdomain: "", customDomain: "", plan: "basic", durationDays: "30", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.shopName || !form.ownerName || !form.ownerEmail) return setError("Shop name, owner name, email required");
    if (!form.subdomain && !form.customDomain) return setError("Subdomain or custom domain required");
    setLoading(true);
    try {
      const data = await api.createTenant(form);
      setResult(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (result) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden animate-slide-in"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--accent-green-dim)" }}>
            <svg className="w-7 h-7" style={{ color: "var(--accent-green)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>Tenant Created!</h3>
          <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>Share these credentials with the client</p>
          <div className="rounded-xl p-4 text-left space-y-3 mb-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
            {[
              ["Admin URL", result.credentials?.adminUrl],
              ["Email", result.credentials?.email],
              ["Password", result.credentials?.password],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="text-sm font-mono font-medium" style={{ color: "var(--accent-green)" }}>{value}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { onCreated(); }}
            className="w-full py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: "linear-gradient(135deg, #6EE7B7, #3B82F6)", color: "#0A0F1E" }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden animate-slide-in"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>New Tenant</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Create a new shop & provision everything</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
              style={{ background: "var(--accent-red-dim)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--accent-red)" }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Shop Name *" value={form.shopName} onChange={v => set("shopName", v)} placeholder="My Shop"/>
            <Field label="Owner Name *" value={form.ownerName} onChange={v => set("ownerName", v)} placeholder="Rahim Uddin"/>
            <Field label="Email *" type="email" value={form.ownerEmail} onChange={v => set("ownerEmail", v)} placeholder="rahim@gmail.com"/>
            <Field label="Phone" value={form.ownerPhone} onChange={v => set("ownerPhone", v)} placeholder="01XXXXXXXXX"/>
            <Field label="Subdomain" value={form.subdomain}
              onChange={v => set("subdomain", v.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="myshop" helper="myshop.glorixbd.com"/>
            <Field label="Custom Domain" value={form.customDomain}
              onChange={v => set("customDomain", v.toLowerCase())}
              placeholder="myshop.com" helper="Optional"/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Plan</label>
              <select value={form.plan} onChange={e => set("plan", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Duration</label>
              <select value={form.durationDays} onChange={e => set("durationDays", e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: loading ? "rgba(110,231,183,0.3)" : "linear-gradient(135deg, #6EE7B7, #3B82F6)",
              color: loading ? "var(--text-muted)" : "#0A0F1E",
              cursor: loading ? "not-allowed" : "pointer"
            }}>
            {loading ? "Creating..." : "Create Tenant"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", helper }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        onFocus={e => e.target.style.borderColor = "var(--accent-green)"}
        onBlur={e => e.target.style.borderColor = "var(--border)"}/>
      {helper && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{helper}</p>}
    </div>
  );
}
