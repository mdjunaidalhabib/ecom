"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import DashboardSkeleton from "../../../../components/Skeleton/DashboardSkeleton.jsx";

export default function DashboardPage() {
  const API = "/api";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ FIXED status list (schema enum অনুযায়ী)
  const ORDER_STATUSES = [
    "pending",
    "ready_to_delivery",
    "send_to_courier",
    "delivered",
    "cancelled",
  ];

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
  });

  // ✅ status stats (সব status থাকবে, না থাকলে 0)
  const [statusStats, setStatusStats] = useState(() =>
    ORDER_STATUSES.reduce((acc, st) => {
      acc[st] = 0;
      return acc;
    }, {})
  );

  useEffect(() => {
    async function fetchOrders() {
      try {
        setErr("");
        setLoading(true);

        const res = await fetch(`${API}/admin/orders`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Orders fetch failed");

        const data = await res.json();

        if (Array.isArray(data)) {
          setOrders(data);

          // ✅ Total Orders + Sales
          const totalOrders = data.length;
          const totalSales = data.reduce((sum, o) => sum + (o.total || 0), 0);
          setStats({ totalOrders, totalSales });

          // ✅ status count (fixed enum list)
          const statusMap = ORDER_STATUSES.reduce((acc, st) => {
            acc[st] = 0;
            return acc;
          }, {});

          data.forEach((order) => {
            const st = order.status || "pending";
            if (statusMap[st] !== undefined) statusMap[st] += 1;
          });

          setStatusStats(statusMap);
        } else {
          setOrders([]);
          setStats({ totalOrders: 0, totalSales: 0 });
          setStatusStats(
            ORDER_STATUSES.reduce((acc, st) => {
              acc[st] = 0;
              return acc;
            }, {})
          );
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setErr("❌ Orders load করা যায়নি");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [API]);

  // ====== Top Products ======
  const topProducts = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      o.items?.forEach((it) => {
        if (!map[it.productId]) {
          map[it.productId] = { name: it.name, qty: 0, revenue: 0 };
        }
        map[it.productId].qty += it.qty;
        map[it.productId].revenue += (it.price || 0) * (it.qty || 0);
      });
    });
    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [orders]);

  // ====== Monthly Sales ======
  const monthlySales = useMemo(() => {
    const map = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      map[key] = 0;
    }
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      if (map[key] !== undefined) map[key] += o.total || 0;
    });
    return Object.entries(map).map(([month, sales]) => ({ month, sales }));
  }, [orders]);

  // ✅ Professional Gradient Cards Config (premium colors)
const cards = useMemo(() => {
  return [
    {
      key: "totalOrders",
      label: "Total Orders",
      value: stats.totalOrders,
      gradient: "from-indigo-600 via-blue-600 to-cyan-500",
      dot: "bg-white/50",
      sub: "All orders",
    },
    {
      key: "totalSales",
      label: "Total Sales",
      value: `৳${stats.totalSales}`,
      gradient: "from-emerald-600 via-emerald-600 to-emerald-500",
      dot: "bg-white/50",
      sub: "Total revenue",
    },
    {
      key: "pending",
      label: "Pending",
      value: statusStats.pending ?? 0,
      gradient: "from-amber-600 via-amber-600 to-amber-500",
      dot: "bg-white/50",
      sub: "Awaiting action",
    },
    {
      key: "ready_to_delivery",
      label: "Ready",
      value: statusStats.ready_to_delivery ?? 0,
      gradient: "from-sky-600 via-sky-600 to-sky-500",
      dot: "bg-white/50",
      sub: "Ready to deliver",
    },
    {
      key: "send_to_courier",
      label: "Courier",
      value: statusStats.send_to_courier ?? 0,
      gradient: "from-violet-600 via-violet-600 to-violet-500",
      dot: "bg-white/50",
      sub: "Handed to courier",
    },
    {
      key: "delivered",
      label: "Delivered",
      value: statusStats.delivered ?? 0,
      gradient: "from-teal-600 via-teal-700 to-teal-600",
      dot: "bg-white/50",
      sub: "Completed",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: statusStats.cancelled ?? 0,
      gradient: "from-rose-500 via-rose-600 to-rose-500",
      dot: "bg-white/50",
      sub: "Stopped orders",
    },
  ];
}, [stats, statusStats]);

  return (
    <div className="space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of orders & sales performance
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-sm font-medium shadow hover:shadow-md hover:scale-[1.02] transition-all"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : err ? (
        <div className="bg-white shadow rounded-xl p-6 text-red-500">{err}</div>
      ) : (
        <>
          {/* ✅ PREMIUM PROFESSIONAL COLOR CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4">
            {cards.map((c) => (
              <div
                key={c.key}
                className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                {/* Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${c.gradient}`}
                />

                {/* Soft glass overlay */}
                <div className="absolute inset-0 bg-black/10" />

                {/* Decorative blur blobs */}
                <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

                <div className="relative p-4 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-white/85">
                        {c.label}
                      </p>
                      <p className="mt-2 text-3xl font-extrabold leading-none drop-shadow-sm">
                        {c.value}
                      </p>
                    </div>

                    {/* Minimal icon circle (pro look) */}
                    <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/20">
                      <div className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-white/80">{c.sub}</p>

                  {/* Bottom accent line */}
                  <div className="mt-4 h-[3px] w-10 rounded-full bg-white/70" />
                </div>
              </div>
            ))}
          </div>

          {/* 🏆 Top Products */}
          <div className="bg-white shadow rounded-2xl border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              🏆 Top Selling Products
            </h2>

            {topProducts.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="p-2 text-left font-semibold">Product</th>
                        <th className="p-2 text-left font-semibold">
                          Quantity
                        </th>
                        <th className="p-2 text-left font-semibold">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="p-2">{p.name}</td>
                          <td className="p-2">{p.qty}</td>
                          <td className="p-2 font-semibold text-emerald-600">
                            ৳{p.revenue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="qty" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-10">
                No product data
              </div>
            )}
          </div>

          {/* 📈 Monthly Sales */}
          <div className="bg-white shadow rounded-2xl border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              📅 Monthly Sales (Last 12 Months)
            </h2>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#6366f1"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
