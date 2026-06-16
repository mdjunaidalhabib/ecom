"use client";
import { useState, useEffect } from "react";
import Toast from "../home/Toast";

export default function EditOrderForm({
  billingData,
  loading,
  onSave,
  onCancel,
}) {
  const [billing, setBilling] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    if (billingData) setBilling(billingData);
  }, [billingData]);

  const handleChange = (field, value) => {
    setBilling((prev) => ({ ...prev, [field]: value }));
  };

  /* ================ Toast ================ */
  const [toast, setToast] = useState({ message: "", type: "" });
  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  /* ================= Validation ================= */
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    address: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const phoneValid = /^(01[3-9]\d{8})$/.test(billing.phone || "");

  const errors = {
    name: !billing.name?.trim(),
    phone: !billing.phone?.trim() || !phoneValid,
    address: !billing.address?.trim(),
  };

  const fieldClass = (hasError) =>
    `mt-1 w-full p-2 border rounded-md outline-none transition
     ${
       hasError
         ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
         : "border-gray-300 focus:ring-2 focus:ring-green-200"
     }`;

  const labelClass = (hasError) =>
    `text-sm font-medium ${hasError ? "text-red-600" : "text-gray-900"}`;

  const handleSaveClick = () => {
    setSubmitted(true);

    if (errors.name || errors.phone || errors.address) {
      showToast("⚠️ সব ঘর ঠিকমতো পূরণ করতে হবে!", "error");
      return;
    }

    showToast("✅ তথ্য সফলভাবে আপডেট হয়েছে", "success");
    onSave(billing);
  };

  return (
    <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
      {/* Name */}
      <label className="block">
        <span
          className={labelClass((submitted || touched.name) && errors.name)}
        >
          Name *
        </span>
        <input
          className={fieldClass((submitted || touched.name) && errors.name)}
          placeholder="Name"
          value={billing.name || ""}
          disabled={loading}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        {(submitted || touched.name) && errors.name && (
          <p className="text-xs text-red-600 mt-1">নাম লিখুন</p>
        )}
      </label>

      {/* Phone */}
      <label className="block">
        <span
          className={labelClass((submitted || touched.phone) && errors.phone)}
        >
          Phone *
        </span>
        <input
          className={fieldClass((submitted || touched.phone) && errors.phone)}
          placeholder="01XXXXXXXXX"
          value={billing.phone || ""}
          disabled={loading}
          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
        {(submitted || touched.phone) && errors.phone && (
          <p className="text-xs text-red-600 mt-1">
            সঠিক ১১ সংখ্যার নাম্বার দিন
          </p>
        )}
      </label>

      {/* Address */}
      <label className="block">
        <span
          className={labelClass(
            (submitted || touched.address) && errors.address
          )}
        >
          Address *
        </span>
        <textarea
          className={fieldClass(
            (submitted || touched.address) && errors.address
          )}
          placeholder="Address"
          value={billing.address || ""}
          disabled={loading}
          onBlur={() => setTouched((t) => ({ ...t, address: true }))}
          onChange={(e) => handleChange("address", e.target.value)}
        />
        {(submitted || touched.address) && errors.address && (
          <p className="text-xs text-red-600 mt-1">ঠিকানা লিখুন</p>
        )}
      </label>

      {/* Note */}
      <label className="block">
        <span className="text-sm font-medium text-gray-900">
          Note (optional)
        </span>
        <textarea
          className="mt-1 w-full p-2 border rounded-md border-gray-300"
          placeholder="Note (optional)"
          value={billing.note || ""}
          disabled={loading}
          onChange={(e) => handleChange("note", e.target.value)}
        />
      </label>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSaveClick}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded text-sm disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded text-sm disabled:opacity-60"
        >
          Cancel
        </button>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </div>
  );
}
