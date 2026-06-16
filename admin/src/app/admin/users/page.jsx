"use client";

import { useEffect, useState } from "react";
import UsersSkeleton from "../../../../components/Skeleton/UsersSkeleton";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch Users
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/users`);
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="p-3 sm:p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">👥 Users</h2>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm shadow hover:scale-105 transition-all"
        >
          Refresh
        </button>
      </div>

      {/* 🔹 Skeleton Loading */}
      {loading ? (
        <UsersSkeleton />
      ) : users.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No users found.</div>
      ) : (
        <>
          {/* ✅ Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-xl border shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">User ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Avatar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-mono text-xs text-gray-600">
                      {u.userId}
                    </td>
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-gray-700">{u.email}</td>
                    <td className="p-3">
                      <img
                        src={u.avatar || `https://i.pravatar.cc/150?u=${u.email}`}
                        alt={u.name || "User Avatar"}
                        className="w-10 h-10 rounded-full border"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Mobile Card View */}
          <div className="grid gap-3 md:hidden">
            {users.map((u) => (
              <div
                key={u._id}
                className="border rounded-xl p-3 bg-white shadow-sm flex items-center gap-3"
              >
                <img
                  src={u.avatar || `https://i.pravatar.cc/150?u=${u.email}`}
                  alt={u.name || "User Avatar"}
                  className="w-12 h-12 rounded-full border"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{u.name}</div>
                  <div className="text-sm text-gray-600 break-all">{u.email}</div>
                  <div className="text-xs text-gray-500 mt-1">ID: {u.userId}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
