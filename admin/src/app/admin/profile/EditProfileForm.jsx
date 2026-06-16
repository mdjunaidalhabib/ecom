"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditProfileForm({ admin, onSuccess }) {
  const API_BASE = "/api";

  const [form, setForm] = useState({
    name: admin.name || "",
    username: admin.username || "",
    phone: admin.phone || "",
    address: admin.address || "",
    avatar: admin.avatar || "",
  });

  const [saving, setSaving] = useState(false);

  // ✅ Save profile + optional avatar (Cloudinary backend handles upload)
  const handleSave = async (nextForm) => {
    setSaving(true);
    try {
      const payload = structuredClone(nextForm);
      const fd = new FormData();

      if (payload.avatarFile) {
        fd.append("avatar", payload.avatarFile);
        delete payload.avatarFile;
      }

      fd.append("profile", JSON.stringify(payload));

      const res = await axios.put(`${API_BASE}/admin/me`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedAdmin = res.data?.admin;
      if (updatedAdmin) {
        setForm((f) => ({
          ...f,
          avatar: updatedAdmin.avatar || "",
        }));
      }

      toast.success("✅ Profile updated!");
      onSuccess?.();
      return updatedAdmin;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "❌ Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  // ✅ File select -> instant upload
  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const updated = { ...form, avatarFile: file };
    setForm(updated);
    handleSave(updated);

    e.target.value = "";
  };

  // ✅ Remove avatar (Navbar removeLogo style)
  const handleRemoveAvatar = async () => {
    const updated = {
      ...form,
      removeAvatar: "true",
      avatarFile: null,
      avatar: "",
    };
    setForm(updated);
    await handleSave(updated);
    toast("❌ Avatar removed", { icon: "🗑️" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Full Name">
        <input
          name="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="input"
          required
          disabled={saving}
        />
      </Field>

      <Field label="Username">
        <input
          name="username"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          className="input"
          placeholder="optional"
          disabled={saving}
        />
      </Field>

      <Field label="Phone">
        <input
          name="phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          className="input"
          placeholder="+8801XXXXXXXXX"
          disabled={saving}
        />
      </Field>

      {/* ✅ Avatar Upload + Remove */}
      <Field label="Avatar Photo">
        {form.avatar ? (
          <div className="flex items-center gap-3 mb-3">
            <img
              src={form.avatar}
              alt="Profile"
              className="h-16 w-16 rounded-full border object-cover"
            />

            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={saving}
              className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-60 text-sm"
            >
              Remove
            </button>
          </div>
        ) : null}

        <input
          type="file"
          id="avatarUpload"
          accept="image/*"
          onChange={handleAvatarPick}
          disabled={saving}
          className="hidden"
        />

        <button
          type="button"
          disabled={saving}
          onClick={() => document.getElementById("avatarUpload")?.click()}
          className={`w-full flex items-center justify-center gap-2
            border border-dashed border-gray-300
            hover:border-blue-400 hover:bg-blue-50
            text-gray-700 px-3 py-2 rounded-md transition
            text-sm disabled:opacity-60`}
        >
          🖼️{" "}
          {saving
            ? "Uploading..."
            : form.avatar
            ? "Change Photo"
            : "Upload Photo"}
        </button>
      </Field>

      <Field label="Address">
        <textarea
          name="address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className="input min-h-[90px]"
          placeholder="Dhaka, Bangladesh"
          disabled={saving}
        />
      </Field>

      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2 rounded-xl bg-black text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          padding: 10px 12px;
          border-radius: 12px;
          outline: none;
        }
        .input:focus {
          border-color: #111827;
          box-shadow: 0 0 0 2px #11182710;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
