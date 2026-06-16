"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import Sidebar from "../../../components/Sidebar";

export default function TenantDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tenant, setTenant] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extendDays, setExtendDays] = useState("30");
  const [extendPlan, setExtendPlan] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState({ method: "bkash", amount: "", transactionId: "", transactionNumber: "" });

  const load = async () => {
    try {
      const data = await api.getTenant(id);
      setTenant(data.tenant);
      setPayments(data.payments);
      setExtendPlan(data.tenant.plan);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleExtend = async () => {
    setSaving(true);
    try { await api.extendPlan(id, { durationDays: extendDays, plan: extendPlan }); flash("Plan extended!"); load(); }
    catch (err) { flash(err.message, "error"); }
    finally { setSaving(false); }
  };

  const handleLock = async (lock) => {
    if (!confirm(lock ? "Lock?" : "Unlock?")) return;
    try { await api.toggleLock(id, { lock }); flash(lock ? "Locked" : "Unlocked"); load(); }
    catch (err) { flash(err.message, "error"); }
  };

  const handleAddPayment = async () => {
    if (!payForm.amount) return flash("Amount required", "error");
    setSaving(true);
    try {
      await api.addPayment({ tenantId: id, plan: extendPlan, durationDays: Number(extendDays), amount: Number(payForm.amount), ...payForm });
      flash("Payment recorded & plan extended!"); setShowPayForm(false);
      setPayForm({ method: "bkash", amount: "", transactionId: "", transactionNumber: "" }); load();
    } catch (err) { flash(err.message, "error"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar/>
      <main className="ml-56 flex-1 p-8 space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl"/>)}
      </main>
    </div>
  );
  if (!tenant) return null;

  const ss = { active: "#34D399", expired: "#F59E0B", suspended: "#F87171", pending: "#94A3B8" };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar/>
      <main className="ml-56 flex-1 p-8">
        <button onClick={() => router.push("/tenants")}
          className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text-secondary)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Tenants
        </button>

        {msg && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium animate-slide-in"
            style={{
              background: msg.type === "success" ? "var(--accent-green-dim)" : "var(--accent-red-dim)",
              border: `1px solid ${msg.type === "success" ? "rgba(110,231,183,0.2)" : "rgba(248,113,113,0.2)"}`,
              color: msg.type === "success" ? "var(--accent-green)" : "var(--accent-red)"
            }}>
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Info card */}
            <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{tenant.shopName}</h1>
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{tenant.ownerEmail}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: ss[tenant.status] }}/>
                      <span className="text-xs font-medium capitalize" style={{ color: ss[tenant.status] }}>{tenant.status}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold capitalize"
                      style={{ background: "rgba(167,139,250,0.1)", color: "#A78BFA" }}>{tenant.plan}</span>
                    {tenant.isLocked && <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "var(--accent-red-dim)", color: "var(--accent-red)" }}>🔒 Locked</span>}
                  </div>
                </div>
                <button onClick={() => handleLock(!tenant.isLocked)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: tenant.isLocked ? "var(--accent-green-dim)" : "var(--accent-red-dim)",
                    color: tenant.isLocked ? "var(--accent-green)" : "var(--accent-red)"
                  }}>
                  {tenant.isLocked ? "Unlock" : "Lock"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
                {[
                  ["Owner", tenant.ownerName],
                  ["Phone", tenant.ownerPhone || "—"],
                  ["Subdomain", tenant.subdomain ? `${tenant.subdomain}.glorixbd.com` : "—"],
                  ["Custom Domain", tenant.customDomain || "—"],
                  ["Database", tenant.dbName],
                  ["Created", new Date(tenant.createdAt).toLocaleDateString("en-GB")],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
                    <p className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>{value}</p>
                  </div>
                ))}
                {tenant.ownerPassword && (
                  <div className="col-span-2 mt-2 p-3 rounded-lg" style={{ background: "var(--accent-green-dim)", border: "1px solid rgba(110,231,183,0.2)" }}>
                    <p className="text-xs mb-1" style={{ color: "var(--accent-green)" }}>Admin Password</p>
                    <p className="text-sm font-mono font-bold" style={{ color: "var(--accent-green)" }}>{tenant.ownerPassword}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Plan management */}
            <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Plan Management</p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  ["Plan", tenant.plan, "#A78BFA"],
                  ["Expiry", tenant.planExpiryDate ? new Date(tenant.planExpiryDate).toLocaleDateString("en-GB") : "—", "#60A5FA"],
                  ["Days Left", tenant.planDaysLeft, tenant.planDaysLeft <= 3 ? "#F87171" : tenant.planDaysLeft <= 7 ? "#F59E0B" : "#6EE7B7"],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-xs mb-1.5 capitalize" style={{ color: "var(--text-muted)" }}>{label}</p>
                    <p className="text-lg font-bold capitalize" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <select value={extendPlan} onChange={e => setExtendPlan(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <select value={extendDays} onChange={e => setExtendDays(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                  <option value="30">+30 days</option>
                  <option value="90">+90 days</option>
                  <option value="180">+180 days</option>
                  <option value="365">+365 days</option>
                </select>
                <button onClick={handleExtend} disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #6EE7B7, #3B82F6)", color: "#0A0F1E", opacity: saving ? 0.6 : 1 }}>
                  Extend
                </button>
              </div>
            </div>

            {/* Payments */}
            <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Payment History</p>
                <button onClick={() => setShowPayForm(!showPayForm)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background: "var(--accent-green-dim)", color: "var(--accent-green)" }}>
                  + Add Payment
                </button>
              </div>

              {showPayForm && (
                <div className="rounded-xl p-4 mb-4 space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Method", "method", "select", ["bkash","nagad","manual","bank"]],
                      ["Amount (BDT)", "amount", "number", null],
                      ["Transaction ID", "transactionId", "text", null],
                      ["Sender Number", "transactionNumber", "text", null],
                    ].map(([label, key, type, options]) => (
                      <div key={key}>
                        <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</label>
                        {type === "select"
                          ? <select value={payForm[key]} onChange={e => setPayForm(f => ({ ...f, [key]: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                              {options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          : <input type={type} value={payForm[key]} onChange={e => setPayForm(f => ({ ...f, [key]: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-primary)" }}/>
                        }
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setShowPayForm(false)}
                      className="flex-1 py-2 rounded-lg text-sm"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                      Cancel
                    </button>
                    <button onClick={handleAddPayment} disabled={saving}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold"
                      style={{ background: "linear-gradient(135deg, #6EE7B7, #3B82F6)", color: "#0A0F1E" }}>
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              )}

              {payments.length === 0
                ? <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>No payments yet</p>
                : payments.map(p => (
                  <div key={p._id} className="flex items-center justify-between py-3"
                    style={{ borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        ৳{p.amount?.toLocaleString()} · {p.method} · {p.durationDays}d
                      </p>
                      <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>
                        {new Date(p.createdAt).toLocaleDateString("en-GB")}
                        {p.transactionId && ` · ${p.transactionId}`}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        background: p.status === "verified" ? "var(--accent-green-dim)" : "var(--accent-amber-dim)",
                        color: p.status === "verified" ? "var(--accent-green)" : "var(--accent-amber)"
                      }}>{p.status}</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Billing Summary</p>
              <div className="space-y-3">
                {[
                  ["Total Paid", `৳${(tenant.totalPaid || 0).toLocaleString()}`],
                  ["Last Payment", tenant.lastPaymentDate ? new Date(tenant.lastPaymentDate).toLocaleDateString("en-GB") : "—"],
                  ["Method", tenant.lastPaymentMethod || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span className="font-medium capitalize" style={{ color: "var(--text-secondary)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
