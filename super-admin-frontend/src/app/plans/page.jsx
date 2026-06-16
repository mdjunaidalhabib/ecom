"use client";
import Sidebar from "../../components/Sidebar";

const plans = [
  { name: "Basic", key: "basic", price: 500, color: "#60A5FA", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)",
    features: ["100 Products","500 Orders/month","Subdomain only","Email support","Steadfast courier"] },
  { name: "Pro", key: "pro", price: 1200, color: "#A78BFA", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)",
    features: ["Unlimited Products","Unlimited Orders","Custom Domain","Analytics","Priority support","Custom courier"] },
  { name: "Enterprise", key: "enterprise", price: 2500, color: "#6EE7B7", bg: "rgba(110,231,183,0.08)", border: "rgba(110,231,183,0.2)",
    features: ["Everything in Pro","Multiple admins","Custom branding","API access","Dedicated support","SLA guarantee"] },
];

export default function PlansPage() {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <Sidebar/>
      <main className="ml-56 flex-1 p-8">
        <div className="mb-8">
          <p className="text-xs font-medium mb-1" style={{ color: "var(--accent-green)" }}>PRICING</p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Plans</h1>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {plans.map(plan => (
            <div key={plan.key} className="rounded-2xl p-6 transition-all"
              style={{ background: plan.bg, border: `1px solid ${plan.border}` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: plan.color }}>{plan.name}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>৳{plan.price.toLocaleString()}</span>
                <span className="text-sm ml-1" style={{ color: "var(--text-muted)" }}>/month</span>
              </div>
              <ul className="space-y-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: plan.bg, border: `1px solid ${plan.border}` }}>
                      <svg className="w-2.5 h-2.5" style={{ color: plan.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
