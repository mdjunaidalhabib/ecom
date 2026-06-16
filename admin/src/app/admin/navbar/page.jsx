"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function NavbarAdminPanel() {
  const [navbar, setNavbar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Footer-like edit system
  const [editing, setEditing] = useState(null);
  const [tempItem, setTempItem] = useState(null);

  const API_URL = "/api";

  // Fetch Navbar Data
  useEffect(() => {
    const fetchNavbar = async () => {
      try {
        const res = await fetch(`${API_URL}/navbar`);
        const data = await res.json();

        // ✅ ensure brand always exists + name always exists
        const brand = data.brand || {};
        if (!("name" in brand)) brand.name = "";

        setNavbar({ ...data, brand });
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to fetch navbar data");
      } finally {
        setLoading(false);
      }
    };
    fetchNavbar();
  }, [API_URL]);

  // ✅ Save Navbar (brand + removeLogo + optional file)
  const handleSave = async (nextNavbar) => {
    setSaving(true);
    try {
      const payload = structuredClone(nextNavbar);
      const formData = new FormData();

      if (payload.brand?.logoFile) {
        formData.append("logo", payload.brand.logoFile);
        delete payload.brand.logoFile;
      }

      if (payload.removeLogo) {
        formData.append("removeLogo", "true");
        delete payload.removeLogo;
      }

      formData.append("brand", JSON.stringify(payload.brand || {}));

      const res = await fetch(`${API_URL}/admin/navbar`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Save failed");

      const data = await res.json();

      const updatedNavbar = data.navbar || {};
      updatedNavbar.brand = updatedNavbar.brand || {};
      if (!("name" in updatedNavbar.brand)) updatedNavbar.brand.name = "";

      setNavbar(updatedNavbar);
      toast.success("✅ Navbar updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update navbar");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Upload Logo (same endpoint)
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const updated = {
      ...navbar,
      brand: { ...navbar.brand, logoFile: file },
    };

    setNavbar(updated);
    handleSave(updated);

    // ✅ reset input so same file triggers onChange again
    e.target.value = "";
  };

  if (loading) return <p>Loading...</p>;
  if (!navbar) return <p>No navbar data</p>;

  // ✅ Footer-style field editor
  const renderFieldEditor = (section, field, value) =>
    editing === `${section}-${field}` ? (
      <>
        <input
          type="text"
          value={tempItem ?? ""}
          onChange={(e) => setTempItem(e.target.value)}
          placeholder="Set value..."
          className="flex-1 p-2 border rounded"
          disabled={saving}
        />

        <div className="flex gap-2">
          <button
            disabled={saving}
            onClick={() => {
              const updated = {
                ...navbar,
                [section]: {
                  ...navbar[section],
                  [field]: tempItem,
                },
              };
              setNavbar(updated);
              setEditing(null);
              setTempItem(null);
              handleSave(updated);
            }}
            className="bg-green-500 text-white px-2 py-1 rounded disabled:opacity-60"
          >
            Save
          </button>

          <button
            disabled={saving}
            onClick={() => {
              setEditing(null);
              setTempItem(null);
            }}
            className="bg-gray-400 text-white px-2 py-1 rounded disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </>
    ) : (
      <>
        <p className="flex-1">
          <strong>{field}:</strong> {value || "Not set"}
        </p>

        <div className="flex gap-2">
          <button
            disabled={saving}
            onClick={() => {
              setEditing(`${section}-${field}`);
              setTempItem(value || "");
            }}
            className="bg-blue-500 text-white px-2 py-1 rounded disabled:opacity-60"
          >
            Edit
          </button>

          {/* ✅ Delete only clears value, field stays */}
          <button
            disabled={saving}
            onClick={() => {
              const updated = {
                ...navbar,
                [section]: {
                  ...navbar[section],
                  [field]: "",
                },
              };
              setNavbar(updated);
              handleSave(updated);
              toast.success(`🗑 Cleared ${section} field: ${field}`);
            }}
            className="bg-red-500 text-white px-2 py-1 rounded disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </>
    );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow space-y-6">
      {/* ✅ Footer-like Toast Style */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0f172a",
            color: "#fff",
            padding: "12px 14px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          },
          success: {
            style: { background: "#16a34a" },
            iconTheme: { primary: "#fff", secondary: "#16a34a" },
          },
          error: {
            style: { background: "#dc2626" },
            iconTheme: { primary: "#fff", secondary: "#dc2626" },
          },
        }}
      />

      <h2 className="text-xl font-bold">🛠 Navbar Admin Panel</h2>

      {/* ✅ BRAND INFO (always visible) */}
      <div className="space-y-2 border p-3 rounded">
        <h3 className="font-semibold">Brand Info</h3>

        <div className="flex justify-between items-center gap-4 border-b py-1">
          {renderFieldEditor("brand", "name", navbar.brand?.name || "")}
        </div>

        {/* Logo */}
        <div className="flex flex-col gap-2 pt-2">
          <label className="text-sm font-medium">Logo</label>

          {navbar.brand?.logo ? (
            <div className="flex items-center gap-3">
              <img
                src={navbar.brand.logo}
                alt="Logo"
                className="h-16 rounded border"
              />

              <button
                disabled={saving}
                onClick={() => {
                  const updated = {
                    ...navbar,
                    brand: {
                      ...navbar.brand,
                      logo: "",
                      logoPublicId: "",
                    },
                    removeLogo: true,
                  };
                  setNavbar(updated);
                  handleSave(updated);
                  toast.error("❌ Logo removed");
                }}
                className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <input
                type="file"
                id="logoUpload"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={saving}
                className="hidden"
              />

              <button
                type="button"
                disabled={saving}
                onClick={() => document.getElementById("logoUpload")?.click()}
                className="w-full flex items-center justify-center gap-2 
                           border border-dashed border-gray-300 
                           hover:border-blue-400 hover:bg-blue-50 
                           text-gray-700 px-3 py-2 rounded-md transition 
                           text-sm disabled:opacity-60"
              >
                <span className="text-base">🖼️</span>
                <span className="font-medium">Upload Logo</span>
              </button>
            </>
          )}
        </div>
      </div>

      {saving && (
        <p className="text-sm text-gray-500 italic">Saving changes...</p>
      )}
    </div>
  );
}
