"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";

const StatCard = ({ label, value, color, icon, trend }) => (
  <div className="rounded-xl p-5 flex items-center gap-4 transition-all duration-200 group cursor-default animate-slide-in"
    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-hover)"}
    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: color + "22", border: `1px solid ${color}33` }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div className="flex-1">
      <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value ?? "—"}</p>
      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{label}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Shops", value: data?.stats?.total, color: "#6EE7B7",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> },
    { label: "Active", value: data?.stats?.active, color: "#34D399",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
    { label: "Expired", value: data?.stats?.expired, color: "#F59E0B",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
    { label: "Suspended", value: data?.stats?.suspended, color: "#F87171",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636"/></svg> },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium mb-1" style={{ color: "var(--accent-green)" }}>OVERVIEW</p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl"/>)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((s, i) => <StatCard key={i} {...s}/>)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Revenue card */}
              <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Total Revenue</p>
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{ background: "var(--accent-green-dim)", color: "var(--accent-green)" }}>Verified</span>
                </div>
                <p className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  ৳{(data?.totalRevenue || 0).toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>From all verified payments</p>
                {data?.stats?.pendingPayments > 0 && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{ background: "var(--accent-amber-dim)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent-amber)", animation: "pulse-dot 2s infinite" }}/>
                    <p className="text-xs font-medium" style={{ color: "var(--accent-amber)" }}>
                      {data.stats.pendingPayments} payment{data.stats.pendingPayments > 1 ? "s" : ""} pending verification
                    </p>
                  </div>
                )}
              </div>

              {/* Expiring soon */}
              <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Expiring Soon</p>
                  <Link href="/tenants" className="text-xs font-medium transition-colors"
                    style={{ color: "var(--accent-green)" }}>View all →</Link>
                </div>
                {!data?.expiringSoon?.length ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                      style={{ background: "var(--accent-green-dim)" }}>
                      <svg className="w-5 h-5" style={{ color: "var(--accent-green)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>All tenants are good!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.expiringSoon.slice(0, 4).map(t => (
                      <Link key={t._id} href={`/tenants/${t._id}`}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all"
                        style={{ background: "rgba(255,255,255,0.02)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{t.shopName}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.subdomain || t.customDomain}</p>
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-full"
                          style={{
                            background: t.planDaysLeft <= 2 ? "var(--accent-red-dim)" : "var(--accent-amber-dim)",
                            color: t.planDaysLeft <= 2 ? "var(--accent-red)" : "var(--accent-amber)"
                          }}>
                          {t.planDaysLeft}d
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
