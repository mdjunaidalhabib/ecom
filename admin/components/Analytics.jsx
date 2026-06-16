"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const API_URL = "/api";

  useEffect(() => {
    if (!API_URL) return;

    axios
      .get(`${API_URL}/visit/stats`)
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, [API_URL]);

  if (!data)
    return <div className="p-10 text-center text-lg">Loading analytics...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-10">📊 Visitor Dashboard</h1>

      {/* MAIN STATS */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card
          title="Total Visitors"
          value={data.totalVisitors}
          color="from-blue-500 to-indigo-600"
        />
        <Card
          title="Today Visitors"
          value={data.todayVisitors}
          color="from-green-500 to-emerald-600"
        />
        <Card
          title="Mobile Users"
          value={data.mobile}
          color="from-cyan-500 to-blue-500"
        />
        <Card
          title="Desktop Users"
          value={data.desktop}
          color="from-gray-700 to-gray-900"
        />
      </div>
    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div
    className={`bg-gradient-to-r ${color} text-white p-6 rounded-2xl shadow-lg`}
  >
    <h3 className="text-sm opacity-90">{title}</h3>
    <p className="text-4xl font-bold mt-2">{value}</p>
  </div>
);

export default Dashboard;
