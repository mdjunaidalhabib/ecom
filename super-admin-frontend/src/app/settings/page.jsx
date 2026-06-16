"use client";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";

export default function SettingsPage() {
  const { admin } = useAuth();
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar/>
      <main className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <p className="text-xs font-medium mb-1" style={{ color: "var(--accent-green)" }}>ACCOUNT</p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
        </div>
        <div className="max-w-lg space-y-5">
          <div className="rounded-xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-sm font-semibold mb-5" style={{ color: "var(--text-primary)" }}>Profile</p>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{ background: "linear-gradient(135deg, #6EE7B7, #3B82F6)", color: "#0A0F1E" }}>
                {admin?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{admin?.name}</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{admin?.email}</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block"
                  style={{ background: "var(--accent-green-dim)", color: "var(--accent-green)" }}>Super Admin</span>
              </div>
            </div>
            <div className="space-y-2 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              {[
                ["Last Login", admin?.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString("en-GB") : "—"],
                ["Login IP", admin?.lastLoginIp || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Password Change</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Change <span className="font-mono px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)" }}>SA_PASSWORD</span> in{" "}
              <span className="font-mono px-1 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)" }}>super-admin-backend/.env</span> and restart.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
