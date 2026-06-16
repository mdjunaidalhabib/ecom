"use client";

import { useEffect, useMemo, useState } from "react";
import Toast from "../../Toast";
import ModalWrapper from "./ModalWrapper";

export default function EditOrderModal({
  open,
  form,
  setForm,
  onSave,
  onClose,
}) {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialForm, setInitialForm] = useState(null);

  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    address: false,
    cancelReason: false,
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setInitialForm(form ? JSON.stringify(form) : null);
      setSubmitted(false);
      setTouched({
        name: false,
        phone: false,
        address: false,
        cancelReason: false,
      });
    }
  }, [open]);

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(form) !== initialForm;
  }, [form, initialForm]);

  if (!open) return null;

  const showToast = (message, type = "error", ms = 2000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), ms);
  };

  const handleBillingChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      billing: {
        ...prev.billing,
        [field]: value,
      },
    }));
  };

  const handleDiscountChange = (value) => {
    let num = Number(value);
    if (isNaN(num) || num < 0) num = 0;

    setForm((prev) => ({
      ...prev,
      discount: num,
    }));
  };

  const phoneValid = /^(01[3-9]\d{8})$/.test(form?.billing?.phone || "");
  const isCancelled = form.status === "cancelled";

  const errors = {
    name: !form?.billing?.name?.trim(),
    phone: !form?.billing?.phone?.trim() || !phoneValid,
    address: !form?.billing?.address?.trim(),
    cancelReason: isCancelled && !form?.cancelReason?.trim(),
  };

  const fieldClass = (hasError) =>
    `border rounded px-3 py-2 w-full outline-none transition ${
      hasError
        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
        : "border-gray-300 focus:ring-2 focus:ring-green-200"
    }`;

  const labelClass = (hasError) =>
    `block text-sm font-medium mb-1 ${hasError ? "text-red-600" : ""}`;

  const handleSave = async () => {
    setSubmitted(true);

    if (errors.name || errors.phone || errors.address || errors.cancelReason) {
      showToast("⚠️ সব প্রয়োজনীয় তথ্য ঠিকমতো দিন!", "error", 2500);
      return;
    }

    if (!isDirty) {
      showToast("ℹ️ কোনো পরিবর্তন হয়নি!", "error", 1800);
      return;
    }

    setLoading(true);
    try {
      const result = await onSave(form);

      if (result?.success || result === true) {
        onClose();
        showToast("✅ Order updated successfully!", "success", 1500);
      } else {
        showToast("❌ Failed to update order!", "error", 2000);
      }
    } catch (err) {
      console.error(err);
      showToast("❌ Something went wrong while saving!", "error", 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ModalWrapper open={open}>
        <h2 className="text-xl font-bold text-blue-600 mb-3">✏️ Edit Order</h2>

        <div className="space-y-3 mb-6">
          {/* Payment */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method
            </label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={form.paymentMethod}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  paymentMethod: e.target.value,
                }))
              }
            >
              <option value="cod">COD</option>
              <option value="bkash">bKash</option>
            </select>
          </div>

          {/* Tracking */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Tracking ID
            </label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.trackingId || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  trackingId: e.target.value,
                }))
              }
            />
          </div>

          {/* Cancel Reason (only if already cancelled) */}
          {isCancelled && (
            <div>
              <label
                className={labelClass(
                  (submitted || touched.cancelReason) && errors.cancelReason,
                )}
              >
                Cancel Reason *
              </label>
              <textarea
                rows={2}
                className={`${fieldClass(
                  (submitted || touched.cancelReason) && errors.cancelReason,
                )} resize-y`}
                value={form.cancelReason || ""}
                onBlur={() =>
                  setTouched((t) => ({
                    ...t,
                    cancelReason: true,
                  }))
                }
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    cancelReason: e.target.value,
                  }))
                }
              />
            </div>
          )}

          {/* Billing */}
          <div className="border rounded p-3">
            <p className="font-semibold text-sm mb-2">Customer</p>

            <div className="mb-2">
              <label
                className={labelClass(
                  (submitted || touched.name) && errors.name,
                )}
              >
                Name *
              </label>
              <input
                className={fieldClass(
                  (submitted || touched.name) && errors.name,
                )}
                value={form.billing.name}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                onChange={(e) => handleBillingChange("name", e.target.value)}
              />
            </div>

            <div className="mb-2">
              <label
                className={labelClass(
                  (submitted || touched.phone) && errors.phone,
                )}
              >
                Phone *
              </label>
              <input
                className={fieldClass(
                  (submitted || touched.phone) && errors.phone,
                )}
                value={form.billing.phone}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                onChange={(e) => handleBillingChange("phone", e.target.value)}
              />
              {(submitted || touched.phone) && errors.phone && (
                <p className="text-xs text-red-600 mt-1">
                  01 দিয়ে শুরু হওয়া 11 ডিজিট নাম্বার দিন
                </p>
              )}
            </div>

            <div>
              <label
                className={labelClass(
                  (submitted || touched.address) && errors.address,
                )}
              >
                Address *
              </label>
              <textarea
                rows={3}
                className={`${fieldClass(
                  (submitted || touched.address) && errors.address,
                )} resize-y`}
                value={form.billing.address}
                onBlur={() =>
                  setTouched((t) => ({
                    ...t,
                    address: true,
                  }))
                }
                onChange={(e) => handleBillingChange("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading || !isDirty}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </ModalWrapper>
    </>
  );
}
