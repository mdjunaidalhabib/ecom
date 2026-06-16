"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import Sidebar from "../../components/Sidebar";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await api.getPayments(params);
      setPayments(data.payments); setTotal(data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, [statusFilter]);

  const handleStatus = async (id, status) => {
    const reason = status === "rejected" ? prompt("Rejection reason:") : null;
    try { await api.updatePaymentStatus(id, { status, rejectionReason: reason }); fetchPayments(); }
    catch (err) { alert(err.message); }
  };

  const methodColors = { bkash: "#E2136E", nagad: "#F7941D", manual: "#94A3B8", bank: "#60A5FA" };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar/>
      <main className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--accent-green)" }}>BILLING</p>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Payments
              <span className="text-base font-normal ml-2" style={{ color: "var(--text-muted)" }}>({total})</span>
            </h1>
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Tenant","Amount","Method","Plan","Status","Date","Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(6)].map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  {[...Array(7)].map((_, j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4"/></td>)}
                </tr>
              )) : payments.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16" style={{ color: "var(--text-muted)" }}>No payments found</td></tr>
              ) : payments.map(p => (
                <tr key={p._id} style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td className="px-5 py-4">
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{p.tenant?.shopName || "—"}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{p.tenant?.ownerEmail}</p>
                  </td>
                  <td className="px-5 py-4 font-bold" style={{ color: "var(--accent-green)" }}>৳{p.amount?.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold uppercase" style={{ color: methodColors[p.method] || "#94A3B8" }}>{p.method}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: "rgba(167,139,250,0.1)", color: "#A78BFA" }}>{p.plan}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
                      background: p.status === "verified" ? "var(--accent-green-dim)" : p.status === "pending" ? "var(--accent-amber-dim)" : "var(--accent-red-dim)",
                      color: p.status === "verified" ? "var(--accent-green)" : p.status === "pending" ? "var(--accent-amber)" : "var(--accent-red)"
                    }}>{p.status}</span>
                  </td>
                  <td className="px-5 py-4 text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(p.createdAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-5 py-4">
                    {p.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatus(p._id, "verified")}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: "var(--accent-green-dim)", color: "var(--accent-green)" }}>Verify</button>
                        <button onClick={() => handleStatus(p._id, "rejected")}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: "var(--accent-red-dim)", color: "var(--accent-red)" }}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
