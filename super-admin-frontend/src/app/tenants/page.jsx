"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import CreateTenantModal from "../../components/CreateTenantModal";

const statusStyle = {
  active:    { bg: "var(--accent-green-dim)", color: "var(--accent-green)", dot: "#34D399" },
  expired:   { bg: "var(--accent-amber-dim)", color: "var(--accent-amber)", dot: "#F59E0B" },
  suspended: { bg: "var(--accent-red-dim)",   color: "var(--accent-red)",   dot: "#F87171" },
  pending:   { bg: "rgba(148,163,184,0.1)",   color: "#94A3B8",             dot: "#94A3B8" },
};
const planStyle = {
  basic:      { bg: "rgba(96,165,250,0.1)",  color: "#60A5FA" },
  pro:        { bg: "rgba(167,139,250,0.1)", color: "#A78BFA" },
  enterprise: { bg: "rgba(110,231,183,0.1)", color: "#6EE7B7" },
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const data = await api.getTenants(params);
      setTenants(data.tenants);
      setTotal(data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTenants(); }, [search, statusFilter, page]);

  const handleLock = async (id, lock) => {
    if (!confirm(lock ? "Lock this tenant?" : "Unlock this tenant?")) return;
    try { await api.toggleLock(id, { lock }); fetchTenants(); }
    catch (err) { alert(err.message); }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--accent-green)" }}>MANAGEMENT</p>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Tenants
              <span className="text-base font-normal ml-2" style={{ color: "var(--text-muted)" }}>({total})</span>
            </h1>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "linear-gradient(135deg, #6EE7B7, #3B82F6)", color: "#0A0F1E" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
            New Tenant
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input placeholder="Search shop, email, domain..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              onFocus={e => e.target.style.borderColor = "var(--accent-green)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}/>
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Shop", "Domain", "Plan", "Status", "Expiry", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(6)].map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="skeleton h-4"/></td>
                  ))}
                </tr>
              )) : tenants.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16" style={{ color: "var(--text-muted)" }}>
                  No tenants found
                </td></tr>
              ) : tenants.map(t => {
                const ss = statusStyle[t.status] || statusStyle.pending;
                const ps = planStyle[t.plan] || planStyle.basic;
                return (
                  <tr key={t._id} style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="px-5 py-4">
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{t.shopName}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t.ownerEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                        {t.subdomain ? `${t.subdomain}.glorixbd.com` : t.customDomain}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
                        style={{ background: ps.bg, color: ps.color }}>{t.plan}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: ss.dot }}/>
                        <span className="text-xs font-medium capitalize" style={{ color: ss.color }}>{t.status}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {t.planExpiryDate ? (
                        <div>
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {new Date(t.planExpiryDate).toLocaleDateString("en-GB")}
                          </p>
                          <p className="text-xs font-semibold mt-0.5" style={{
                            color: t.planDaysLeft <= 3 ? "var(--accent-red)" :
                                   t.planDaysLeft <= 7 ? "var(--accent-amber)" : "var(--accent-green)"
                          }}>{t.planDaysLeft}d left</p>
                        </div>
                      ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/tenants/${t._id}`}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: "var(--accent-green-dim)", color: "var(--accent-green)" }}>
                          Manage
                        </Link>
                        <button onClick={() => handleLock(t._id, !t.isLocked)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            background: t.isLocked ? "var(--accent-green-dim)" : "var(--accent-red-dim)",
                            color: t.isLocked ? "var(--accent-green)" : "var(--accent-red)"
                          }}>
                          {t.isLocked ? "Unlock" : "Lock"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {total > 15 && (
            <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Showing {tenants.length} of {total}</p>
              <div className="flex gap-2">
                {[["← Prev", () => setPage(p => Math.max(1, p - 1)), page === 1],
                  ["Next →", () => setPage(p => p + 1), tenants.length < 15]].map(([label, fn, disabled]) => (
                  <button key={label} onClick={fn} disabled={disabled}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                      color: disabled ? "var(--text-muted)" : "var(--text-secondary)",
                      opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer"
                    }}>{label}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {showCreate && <CreateTenantModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchTenants(); }}/>}
      </main>
    </div>
  );
}
