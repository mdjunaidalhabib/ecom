"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import EditProfileForm from "./EditProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";
import AdminProfileSkeleton from "../../../../components/Skeleton/AdminProfileSkeleton";

export default function AdminProfilePage() {
  const API_BASE = "/api";

  const [admin, setAdmin] = useState(null);
  const [tab, setTab] = useState("view"); // view | edit | password
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdmin = async () => {
    try {
      setError("");
      setLoading(true);

      // ✅ existing flow: verify endpoint
      const res = await axios.get(`${API_BASE}/admin/verify`, {
        withCredentials: true,
      });

      setAdmin(res.data.admin);
    } catch (err) {
      console.error("❌ Profile load error:", err);
      setError("Failed to load admin profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, []);

  // ✅ Skeleton while loading
  if (loading) return <AdminProfileSkeleton />;

  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!admin) return <div className="p-6">No admin found</div>;

  const locationText = admin.lastLoginLocation
    ? [
        admin.lastLoginLocation.city,
        admin.lastLoginLocation.region,
        admin.lastLoginLocation.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "—";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* ✅ Header (Desktop same, Mobile compact like sidebar + name/email centered) */}
      <div className="bg-white shadow rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 sm:items-center sm:justify-start sm:gap-4">
          {/* Avatar */}
          <img
            src={admin.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover border shrink-0"
          />

          {/* ✅ Desktop text block (name/email centered) */}
          <div className="hidden sm:block flex-1 text-center">
            <h1 className="text-2xl font-bold">{admin.name}</h1>
            <p className="text-gray-600">{admin.email}</p>

            <div className="mt-1 flex gap-2 text-sm justify-center">
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200">
                Role: Super Admin
              </span>

              <span
                className={`px-2 py-0.5 rounded ${
                  admin.status === "suspended"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {admin.status || "active"}
              </span>
            </div>
          </div>

          {/* ✅ Mobile right-side badges */}
          <div className="flex flex-col items-end gap-1 sm:hidden">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-violet-50 text-violet-700 border border-violet-200">
              Role: Super Admin
            </span>

            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                admin.status === "suspended"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {admin.status || "active"}
            </span>
          </div>
        </div>

        {/* ✅ Mobile full width name/email center */}
        <div className="mt-3 sm:hidden text-center">
          <h1 className="text-xl font-bold truncate">{admin.name}</h1>
          <p className="text-sm text-gray-600 truncate">{admin.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        <TabButton active={tab === "view"} onClick={() => setTab("view")}>
          Profile
        </TabButton>
        <TabButton active={tab === "edit"} onClick={() => setTab("edit")}>
          Edit Profile
        </TabButton>
        <TabButton
          active={tab === "password"}
          onClick={() => setTab("password")}
        >
          Change Password
        </TabButton>
      </div>

      {/* Body */}
      <div className="mt-4 bg-white shadow rounded-2xl p-6">
        {tab === "view" && (
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <Info label="Name" value={admin.name} />
            <Info label="Username" value={admin.username || "—"} />
            <Info label="Email" value={admin.email} />
            <Info label="Phone" value={admin.phone || "—"} />
            <Info label="Address" value={admin.address || "—"} />

            <Info
              label="Last Login"
              value={
                admin.lastLoginAt
                  ? new Date(admin.lastLoginAt).toLocaleString()
                  : "—"
              }
            />
            <Info label="Last IP" value={admin.lastLoginIp || "—"} />

            {/* ✅ NEW DETAILS */}
            <Info label="Device" value={admin.lastLoginDevice || "—"} />
            <Info label="OS" value={admin.lastLoginOS || "—"} />
            <Info label="Browser" value={admin.lastLoginBrowser || "—"} />
            <Info label="Location" value={locationText} />

            <Info
              label="Created At"
              value={
                admin.createdAt
                  ? new Date(admin.createdAt).toLocaleString()
                  : "—"
              }
            />
          </div>
        )}

        {tab === "edit" && (
          <EditProfileForm admin={admin} onSuccess={loadAdmin} />
        )}

        {tab === "password" && (
          <ChangePasswordForm onSuccess={() => setTab("view")} />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl text-sm font-medium ${
        active ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-gray-500">{label}</p>
      <p className="font-medium break-words">{value}</p>
    </div>
  );
}
