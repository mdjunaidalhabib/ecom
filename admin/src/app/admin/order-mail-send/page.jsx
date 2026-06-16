"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../../utils/api";
import Toast from "../../../../components/Toast";

export default function AdminOrderMailSendPage() {
  const [settings, setSettings] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [toastList, setToastList] = useState([]);
  const [sending, setSending] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToastList((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToastList((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/order-mail-send");
      data.emails = data.emails || [];
      setSettings(data);
    } catch (err) {
      showToast("❌ Failed to load settings", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSettings = async (body) => {
    if (!settings) return;
    try {
      const data = await apiFetch("/admin/order-mail-send", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      data.emails = data.emails || [];

      const prevActive = settings.emails.find((e) => e.active)?.email;
      let activeChanged = false;

      // Handle setActive explicitly
      if (body.setActive) {
        data.emails = data.emails.map((e) => ({
          ...e,
          active: e.email === body.setActive,
        }));
        if (prevActive !== body.setActive) {
          activeChanged = true;
        }
      }

      // Auto-active only if no active email exists
      if (!data.emails.some((e) => e.active) && data.emails.length > 0) {
        data.emails[0].active = true;
        if (prevActive !== data.emails[0].email) {
          activeChanged = true;
        }
      }

      // Sort active first
      data.emails.sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0));

      setSettings(data);

      // TOASTS
      if (body.hasOwnProperty("enabled")) {
        showToast(
          body.enabled ? "✅ System turned ON" : "⚠️ System turned OFF",
          body.enabled ? "success" : "warning",
        );
      }

      if (body.addEmail) {
        showToast(`📥 Added email: ${body.addEmail}`, "success");
      }

      if (body.deleteEmail) {
        showToast(`🗑️ Deleted email: ${body.deleteEmail}`, "warning");
      }

      if (activeChanged) {
        const newActive = data.emails.find((e) => e.active)?.email;
        if (newActive) {
          showToast(`✅ Active email: ${newActive}`, "success");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("❌ Update failed", "error");
    }
  };

  const sendTestMail = async () => {
    if (!settings.enabled) {
      showToast("⚠️ System is OFF, cannot send mail", "warning");
      return;
    }

    setSending(true);
    const toastId = Date.now() + Math.random();
    setToastList((prev) => [
      ...prev,
      { id: toastId, message: "📤 Sending test mail...", type: "info" },
    ]);

    try {
      await apiFetch("/admin/order-mail-send/test", { method: "POST" });
      setToastList((prev) =>
        prev.map((t) =>
          t.id === toastId
            ? { ...t, message: "✅ Test mail sent", type: "success" }
            : t,
        ),
      );
    } catch (err) {
      console.error(err);
      setToastList((prev) =>
        prev.map((t) =>
          t.id === toastId
            ? { ...t, message: "❌ Test mail failed", type: "error" }
            : t,
        ),
      );
    } finally {
      setSending(false);
    }
  };

  if (loading || !settings)
    return <p className="p-6 text-center text-gray-500">Loading...</p>;

  const systemDisabled = !settings.enabled;

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      <div className="bg-white shadow-xl rounded-3xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:justify-between md:items-center border-b">
          <div className="flex flex-col md:flex-row md:items-center md:gap-6">
            <h2 className="font-bold text-xl md:text-2xl flex items-center gap-2">
              📩 Mail System
            </h2>
            <span
              className={`mt-2 md:mt-0 text-sm md:text-base font-medium ${
                settings.enabled ? "text-green-700" : "text-red-600"
              }`}
            >
              {settings.enabled
                ? "System is ON – All actions available"
                : "System is OFF – Actions disabled"}
            </span>
          </div>

          <p className="text-sm md:text-base text-gray-500 font-medium mt-2 md:mt-0">
            {settings.emails.length}/5 emails added
          </p>

          {/* Toggle */}
          <label className="relative inline-flex items-center cursor-pointer mt-2 md:mt-0">
            <input
              type="checkbox"
              className="sr-only"
              checked={settings.enabled}
              onChange={() => updateSettings({ enabled: !settings.enabled })}
            />
            <div
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.enabled ? "bg-green-500" : "bg-gray-300"
              }`}
            ></div>
            <span
              className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.enabled ? "translate-x-6" : "translate-x-0"
              }`}
            ></span>
          </label>
        </div>

        {/* Email List */}
        <div className="p-6 md:p-8 space-y-4">
          {settings.emails.length === 0 && (
            <p className="text-gray-500 text-sm md:text-base text-center">
              No emails added yet
            </p>
          )}

          {settings.emails.map((e) => (
            <div
              key={e.email}
              className={`flex flex-col md:flex-row md:justify-between md:items-center border p-4 rounded-2xl transition ${
                systemDisabled ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <span className="text-sm md:text-base font-medium break-all">
                {e.email}
              </span>

              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                {e.active ? (
                  <span className="text-xs md:text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Active
                  </span>
                ) : (
                  <button
                    onClick={() => updateSettings({ setActive: e.email })}
                    className="text-xs md:text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition"
                    disabled={systemDisabled}
                  >
                    Make Active
                  </button>
                )}

                <button
                  onClick={() => updateSettings({ deleteEmail: e.email })}
                  className="text-xs md:text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition"
                  disabled={systemDisabled}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {/* Add Email */}
          <div
            className={`flex flex-col md:flex-row gap-3 md:gap-4 ${
              systemDisabled ? "opacity-50" : ""
            }`}
          >
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="admin@mail.com"
              className="flex-1 border px-5 py-3 md:py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm md:text-base"
              disabled={systemDisabled || settings.emails.length >= 5}
            />
            <button
              onClick={() => {
                if (!settings.enabled) {
                  showToast("⚠️ System is OFF, cannot add email", "warning");
                  return;
                }
                if (!emailRegex.test(newEmail)) {
                  showToast("⚠️ Enter a valid email", "error");
                  return;
                }
                if (settings.emails.length >= 5) {
                  showToast("⚠️ Max 5 emails allowed", "error");
                  return;
                }

                updateSettings({ addEmail: newEmail });
                setNewEmail("");
              }}
              className="bg-pink-600 text-white px-6 py-3 md:py-4 rounded-2xl font-bold hover:bg-pink-700 transition text-sm md:text-base"
              disabled={systemDisabled || settings.emails.length >= 5}
            >
              Add
            </button>
          </div>

          {/* Test Mail */}
          <button
            onClick={sendTestMail}
            className={`w-full mt-4 bg-black text-white py-3 md:py-4 rounded-2xl font-bold hover:bg-gray-900 transition ${
              systemDisabled || sending ? "opacity-50 pointer-events-none" : ""
            }`}
            disabled={systemDisabled || sending}
          >
            {sending ? "📤 Sending..." : "📤 Send Test Mail"}
          </button>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toastList.map((t) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() =>
              setToastList((prev) => prev.filter((toast) => toast.id !== t.id))
            }
          />
        ))}
      </div>
    </div>
  );
}
