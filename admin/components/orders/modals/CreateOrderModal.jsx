"use client";

import { useEffect, useMemo, useState } from "react";

const phoneRegex = /^(01[3-9]\d{8})$/;

export default function CreateOrderModal({ open, onClose, onCreate, API }) {
  /* ===========================
     ✅ PRODUCTS
  ============================ */
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  /* ===========================
     ✅ DELIVERY CHARGE (DB)
  ============================ */
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [deliveryLoading, setDeliveryLoading] = useState(true);

  /* ===========================
     ✅ PRODUCT PICKER POPUP
  ============================ */
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerIndex, setPickerIndex] = useState(null);
  const [productQuery, setProductQuery] = useState("");

  /* ===========================
     ✅ BILLING
  ============================ */
  const [billing, setBilling] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    address: false,
  });

  /* ===========================
     ✅ ORDER SETTINGS
  ============================ */
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [status, setStatus] = useState("pending");

  /* ===========================
     ✅ ITEMS
  ============================ */
  const [items, setItems] = useState([{ productId: "", qty: 1, color: null }]);

  /* ===========================
     ✅ LOAD PRODUCTS WHEN OPEN
  ============================ */
  useEffect(() => {
    if (!open) return;

    let alive = true;
    setLoadingProducts(true);

    fetch(`${API}/products`)
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!alive) return;
        setProducts([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoadingProducts(false);
      });

    return () => {
      alive = false;
    };
  }, [open, API]);

  /* ===========================
     ✅ LOAD DELIVERY CHARGE FROM DB
  ============================ */
  useEffect(() => {
    if (!open) return;

    let alive = true;
    setDeliveryLoading(true);

    fetch(`${API}/deliveryCharge`)
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        const fee = Number(data?.fee);
        setDeliveryCharge(Number.isFinite(fee) ? fee : 0);
      })
      .catch(() => {
        if (!alive) return;
        setDeliveryCharge(0);
      })
      .finally(() => {
        if (!alive) return;
        setDeliveryLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [open, API]);

  /* ===========================
     ✅ RESET ON OPEN
  ============================ */
  useEffect(() => {
    if (!open) return;

    setPickerOpen(false);
    setPickerIndex(null);
    setProductQuery("");

    setTouched({ name: false, phone: false, address: false });
    setBilling({ name: "", phone: "", address: "", note: "" });
    setItems([{ productId: "", qty: 1, color: null }]);

    setDiscount(0);
    setPaymentMethod("cod");
    setPaymentStatus("pending");
    setStatus("pending");
  }, [open]);

  /* ===========================
     ✅ HELPERS
  ============================ */
  const toNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const getProduct = (pid) =>
    products.find((p) => String(p._id) === String(pid));

  const findVariant = (p, color) => {
    if (!p || !color) return null;
    const target = String(color).trim().toLowerCase();
    const colors = Array.isArray(p.colors) ? p.colors : [];
    return (
      colors.find(
        (c) =>
          String(c?.name || "")
            .trim()
            .toLowerCase() === target
      ) || null
    );
  };

  /* ===========================
     ✅ FILTER PRODUCTS (SEARCH)
  ============================ */
  const filteredProducts = useMemo(() => {
    if (!productQuery.trim()) return products;

    const q = productQuery.trim().toLowerCase();
    return products.filter((p) => {
      const name = String(p?.name || "").toLowerCase();
      const id = String(p?._id || "").toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [productQuery, products]);

  /* ===========================
     ✅ VIEW ITEMS FOR SUMMARY
  ============================ */
  const viewItems = useMemo(() => {
    return items
      .map((it) => {
        const p = getProduct(it.productId);
        if (!p) return null;

        const variant = findVariant(p, it.color);
        const stock = toNumber(variant?.stock ?? p?.stock ?? 0, 0);

        const image =
          variant?.images?.[0] ||
          p.image ||
          (Array.isArray(p.images) ? p.images[0] : null) ||
          "/no-image.png";

        return {
          ...it,
          name: p.name || "Product",
          price: toNumber(p.price, 0),
          stock,
          image,
          colorLabel: variant?.name || it.color || null,
        };
      })
      .filter(Boolean);
  }, [items, products]);

  const subtotal = viewItems.reduce(
    (sum, it) => sum + toNumber(it.price, 0) * toNumber(it.qty, 0),
    0
  );

  const total = Math.max(
    0,
    subtotal + toNumber(deliveryCharge, 0) - toNumber(discount, 0)
  );

  /* ===========================
     ✅ VALIDATION
  ============================ */
  const errors = {
    name: !billing.name.trim(),
    phone: !billing.phone.trim() || !phoneRegex.test(billing.phone.trim()),
    address: !billing.address.trim(),
  };

  const canSubmit =
    !deliveryLoading &&
    !errors.name &&
    !errors.phone &&
    !errors.address &&
    items.some((x) => x.productId && toNumber(x.qty, 0) > 0);

  const inputClass = (hasError) =>
    `w-full h-12 rounded-2xl border px-4 text-sm font-semibold outline-none transition ${
      hasError
        ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
        : "border-gray-200 bg-white focus:ring-2 focus:ring-blue-200"
    }`;

  /* ===========================
     ✅ ITEM HELPERS
  ============================ */
  const addItem = () =>
    setItems((p) => [...p, { productId: "", qty: 1, color: null }]);

  const removeItem = (idx) => setItems((p) => p.filter((_, i) => i !== idx));

  const updateItem = (idx, key, value) => {
    setItems((p) => {
      const next = [...p];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
  };

  const openPicker = (idx) => {
    setPickerIndex(idx);
    setPickerOpen(true);
    setProductQuery("");
  };

  const pickProduct = (prod) => {
    if (pickerIndex === null) return;

    updateItem(pickerIndex, "productId", String(prod._id));
    updateItem(pickerIndex, "color", null);
    updateItem(pickerIndex, "qty", 1);

    setPickerOpen(false);
    setPickerIndex(null);
    setProductQuery("");
  };

  const changeQty = (idx, delta) => {
    const it = items[idx];
    const p = getProduct(it.productId);
    if (!p) return;

    const variant = findVariant(p, it.color);
    const stock = toNumber(variant?.stock ?? p?.stock ?? 0, 0);

    const current = toNumber(it.qty, 1);
    let next = current + delta;

    next = Math.max(1, next);
    if (stock > 0) next = Math.min(stock, next);

    updateItem(idx, "qty", next);
  };

  /* ===========================
     ✅ SUBMIT
  ============================ */
  const submit = () => {
    setTouched({ name: true, phone: true, address: true });
    if (errors.name || errors.phone || errors.address) return;

    const cleaned = items
      .map((it) => {
        const p = getProduct(it.productId);
        if (!p) return null;

        const variant = findVariant(p, it.color);
        const image =
          variant?.images?.[0] ||
          p.image ||
          (Array.isArray(p.images) ? p.images[0] : null) ||
          "/no-image.png";

        return {
          productId: String(p._id),
          name: p.name || "",
          price: toNumber(p.price, 0),
          qty: Math.max(1, toNumber(it.qty, 1)),
          image,
          color: it.color || null,
          stock: toNumber(variant?.stock ?? p?.stock ?? 0, 0),
        };
      })
      .filter(Boolean);

    if (!cleaned.length) return;

    onCreate({
      items: cleaned,
      billing,
      discount: toNumber(discount, 0),
      paymentMethod,
      paymentStatus,
      status,

      createdBy: "admin",
      createdByName: "Admin",
    });
  };

  /* ===========================
     ✅ HIDE WHEN CLOSED
  ============================ */
  return (
    <>
      <div
        className={`fixed inset-0 z-50 ${
          open ? "flex" : "hidden"
        } items-end sm:items-center justify-center bg-black/60`}
      >
        {/* ✅ MOBILE FULL SCREEN / DESKTOP CENTER */}
        <div className="w-full sm:max-w-6xl sm:rounded-3xl bg-white h-[92vh] sm:h-[88vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col">
          {/* ✅ STICKY HEADER */}
          <div className="shrink-0 px-4 sm:px-6 py-4 border-b bg-white flex items-center justify-between sticky top-0 z-20">
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-black text-gray-900 truncate">
                Create New Order
              </div>
              <div className="text-[11px] text-gray-500 font-semibold">
                ✅ Created by Admin • Delivery charge from DB
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-10 w-10 rounded-2xl grid place-items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-black"
            >
              ✕
            </button>
          </div>

          {/* ✅ SCROLL BODY */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* LEFT */}
              <div className="space-y-4">
                {/* CUSTOMER CARD */}
                <div className="rounded-3xl border bg-white p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black text-gray-900">
                      Customer Info
                    </div>
                    <div className="text-[11px] text-gray-500 font-semibold">
                      Required *
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600">
                        Name *
                      </div>
                      <input
                        className={inputClass(touched.name && errors.name)}
                        placeholder="Customer name"
                        value={billing.name}
                        onChange={(e) =>
                          setBilling((p) => ({ ...p, name: e.target.value }))
                        }
                        onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                      />
                      {touched.name && errors.name && (
                        <div className="text-[11px] text-red-600">
                          Name required
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600">
                        Phone *
                      </div>
                      <input
                        className={inputClass(touched.phone && errors.phone)}
                        placeholder="01XXXXXXXXX"
                        value={billing.phone}
                        onChange={(e) =>
                          setBilling((p) => ({ ...p, phone: e.target.value }))
                        }
                        onBlur={() =>
                          setTouched((p) => ({ ...p, phone: true }))
                        }
                      />
                      {touched.phone && errors.phone && (
                        <div className="text-[11px] text-red-600">
                          Valid number required
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600">
                        Address *
                      </div>
                      <input
                        className={inputClass(
                          touched.address && errors.address
                        )}
                        placeholder="Full address"
                        value={billing.address}
                        onChange={(e) =>
                          setBilling((p) => ({ ...p, address: e.target.value }))
                        }
                        onBlur={() =>
                          setTouched((p) => ({ ...p, address: true }))
                        }
                      />
                      {touched.address && errors.address && (
                        <div className="text-[11px] text-red-600">
                          Address required
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-gray-600">
                      Note (optional)
                    </div>
                    <input
                      className="w-full h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Note..."
                      value={billing.note}
                      onChange={(e) =>
                        setBilling((p) => ({ ...p, note: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* ITEMS CARD */}
                <div className="rounded-3xl border bg-white p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-black text-gray-900">
                      Items
                    </div>
                    <button
                      onClick={addItem}
                      className="h-10 px-4 rounded-2xl bg-gray-900 text-white text-xs font-black hover:opacity-90"
                    >
                      + Add item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((it, idx) => {
                      const p = getProduct(it.productId);
                      const colors = Array.isArray(p?.colors) ? p.colors : [];
                      const variant = findVariant(p, it.color);
                      const stock = toNumber(
                        variant?.stock ?? p?.stock ?? 0,
                        0
                      );

                      const image =
                        variant?.images?.[0] ||
                        p?.image ||
                        (Array.isArray(p?.images) ? p.images[0] : null) ||
                        "/no-image.png";

                      return (
                        <div
                          key={idx}
                          className="rounded-3xl border bg-gray-50 p-3 space-y-2"
                        >
                          {/* TOP */}
                          <button
                            type="button"
                            onClick={() => openPicker(idx)}
                            className="w-full h-14 rounded-3xl border bg-white px-3 flex items-center gap-3 hover:bg-gray-50"
                          >
                            <img
                              src={p ? image : "/no-image.png"}
                              alt=""
                              className="w-11 h-11 rounded-2xl border object-cover"
                            />
                            <div className="min-w-0 text-left">
                              <div className="text-sm font-black truncate">
                                {p ? p.name : "Select product"}
                              </div>
                              <div className="text-[11px] text-gray-500 font-semibold">
                                {p
                                  ? `৳${toNumber(p.price, 0)} • Stock: ${stock}`
                                  : "Click to choose product"}
                              </div>
                            </div>
                          </button>

                          {/* BOTTOM */}
                          <div className="grid grid-cols-12 gap-2">
                            {/* COLOR */}
                            <select
                              className="col-span-7 h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                              value={it.color || ""}
                              onChange={(e) =>
                                updateItem(idx, "color", e.target.value || null)
                              }
                              disabled={!p || !colors.length}
                            >
                              <option value="">
                                {colors.length ? "Select Color" : "No colors"}
                              </option>
                              {colors.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name} (stock: {toNumber(c.stock, 0)})
                                </option>
                              ))}
                            </select>

                            {/* QTY */}
                            <div className="col-span-5 h-12 rounded-2xl border bg-white px-2 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => changeQty(idx, -1)}
                                disabled={!p || toNumber(it.qty, 1) <= 1}
                                className={`w-9 h-9 rounded-2xl font-black ${
                                  !p || toNumber(it.qty, 1) <= 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                              >
                                −
                              </button>

                              <div className="text-base font-black">
                                {it.qty}
                              </div>

                              <button
                                type="button"
                                onClick={() => changeQty(idx, 1)}
                                disabled={!p || (stock > 0 && it.qty >= stock)}
                                className={`w-9 h-9 rounded-2xl font-black ${
                                  !p || (stock > 0 && it.qty >= stock)
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1">
                            <div className="text-[11px] text-gray-500 font-semibold">
                              {p ? `Stock: ${stock}` : "Pick a product first"}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="text-xs font-black text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PAYMENT + STATUS */}
                <div className="rounded-3xl border bg-white p-4 shadow-sm space-y-3">
                  <div className="text-sm font-black text-gray-900">
                    Payment & Status
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600">
                        Payment Method
                      </div>
                      <select
                        className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="cod">Cash On Delivery</option>
                        <option value="bkash">bKash</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600">
                        Payment Status
                      </div>
                      <select
                        className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600">
                        Order Status
                      </div>
                      <select
                        className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="ready_to_delivery">
                          Ready To Delivery
                        </option>
                        <option value="send_to_courier">Send To Courier</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-gray-600">
                        Discount
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">
                          ৳
                        </span>
                        <input
                          type="number"
                          className="w-full h-12 rounded-2xl border border-gray-200 bg-white pl-10 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
                          value={discount}
                          onChange={(e) =>
                            setDiscount(Number(e.target.value || 0))
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DELIVERY LOCKED */}
                  <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-gray-900">
                        Delivery Charge (DB)
                      </div>
                      <div className="text-[11px] text-gray-500 font-semibold">
                        locked • not editable
                      </div>
                    </div>
                    <div className="text-lg font-black text-blue-700">
                      {deliveryLoading ? "..." : `৳${deliveryCharge}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SUMMARY */}
              <div className="space-y-4">
                <div className="rounded-3xl border bg-white p-4 shadow-sm space-y-3 lg:sticky lg:top-4">
                  <div className="text-sm font-black text-gray-900">
                    Order Summary
                  </div>

                  {!viewItems.length ? (
                    <div className="text-sm text-gray-500">
                      No items added yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {viewItems.map((it, i) => (
                        <div
                          key={i}
                          className="rounded-3xl border bg-gray-50 p-3 flex gap-3 items-center"
                        >
                          <img
                            src={it.image}
                            alt=""
                            className="w-14 h-14 rounded-2xl border object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-black truncate">
                              {it.name}
                            </div>
                            {it.colorLabel && (
                              <div className="text-[11px] font-black text-pink-600">
                                Color: {it.colorLabel}
                              </div>
                            )}
                            <div className="text-[11px] text-gray-500 font-semibold">
                              ৳{toNumber(it.price, 0)} × {toNumber(it.qty, 0)}
                            </div>
                          </div>
                          <div className="text-sm font-black">
                            ৳{toNumber(it.price, 0) * toNumber(it.qty, 0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-3 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">
                        Subtotal
                      </span>
                      <span className="font-black">৳{subtotal}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 font-semibold">
                        Delivery
                      </span>
                      <span className="font-black">
                        {deliveryLoading ? "..." : `৳${deliveryCharge}`}
                      </span>
                    </div>

                    {!!discount && (
                      <div className="flex justify-between text-red-600">
                        <span className="font-semibold">Discount</span>
                        <span className="font-black">
                          -৳{toNumber(discount, 0)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-lg font-black border-t pt-2">
                      <span>Total</span>
                      <span className="text-blue-700">৳{total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ STICKY FOOTER (MOBILE + DESKTOP) */}
          <div className="shrink-0 px-4 sm:px-6 py-3 border-t bg-white flex items-center justify-between sticky bottom-0 z-20">
            <div className="text-[11px] text-gray-500 font-semibold">
              {canSubmit ? "Ready to create ✅" : "Fill required fields..."}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="h-11 px-4 rounded-2xl border bg-white font-black text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={submit}
                disabled={!canSubmit}
                className={`h-11 px-5 rounded-2xl font-black text-white ${
                  canSubmit
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ PRODUCT PICKER POPUP */}
      <ProductPickerModal
        open={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setPickerIndex(null);
          setProductQuery("");
        }}
        query={productQuery}
        setQuery={setProductQuery}
        products={filteredProducts}
        loading={loadingProducts}
        onPick={pickProduct}
      />
    </>
  );
}

/* ===========================
   ✅ PRODUCT PICKER POPUP
=========================== */
function ProductPickerModal({
  open,
  onClose,
  query,
  setQuery,
  products,
  loading,
  onPick,
}) {
  return (
    <div
      className={`fixed inset-0 z-[60] bg-black/70 px-2 ${
        open ? "flex" : "hidden"
      } items-end sm:items-center justify-center`}
    >
      <div className="bg-white w-full sm:max-w-3xl h-[85vh] sm:h-auto sm:rounded-3xl rounded-t-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-4 py-3 border-b bg-white flex items-center justify-between sticky top-0 z-10">
          <div className="text-base font-black text-gray-900">
            Select Product
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-2xl grid place-items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-black"
          >
            ✕
          </button>
        </div>

        {/* SEARCH */}
        <div className="p-4 border-b bg-gray-50">
          <input
            autoFocus
            className="w-full h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Search product by name or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-[11px] text-gray-500 mt-2 font-semibold">
            Showing <b>{products.length}</b> products
          </div>
        </div>

        {/* LIST */}
        <div className="p-4 overflow-y-auto space-y-2">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading...</div>
          ) : !products.length ? (
            <div className="p-10 text-center text-gray-500">
              No products found.
            </div>
          ) : (
            products.map((p) => {
              const img =
                p.image ||
                (Array.isArray(p.images) ? p.images[0] : null) ||
                "/no-image.png";

              const stock = Number.isFinite(Number(p.stock))
                ? Number(p.stock)
                : 0;

              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => onPick(p)}
                  className="w-full text-left border rounded-3xl p-3 hover:bg-gray-50 flex items-center gap-3"
                >
                  <img
                    src={img}
                    alt=""
                    className="w-14 h-14 rounded-3xl border object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black truncate">{p.name}</div>
                    <div className="text-[11px] text-gray-600 font-semibold">
                      Price: ৳{Number(p.price || 0)} • Stock: {stock}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono truncate">
                      {String(p._id)}
                    </div>
                  </div>

                  <div className="text-xs bg-blue-600 text-white px-4 py-2 rounded-2xl font-black">
                    Select
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t bg-white">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-2xl bg-gray-900 text-white font-black hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
