"use client";

import { useState } from "react";
import useOrders from "../../../hooks/useOrders";

import OrdersGrid from "../ordersGrid/OrdersGrid";
import OrdersTable from "../ordersTable/OrdersTable";
import EditOrderModal from "../modals/EditOrderModal";
import CreateOrderModal from "../modals/CreateOrderModal";
import OrdersSkeleton from "../../Skeleton/OrdersSkeleton";
import Toast from "../../Toast";

import ConfirmModal from "../modals/ConfirmModal";

export default function OrdersPage() {
  const API = "/api";

  const {
    filtered,
    loading,
    fetchOrders,

    deleting,
    handleDelete,

    toast,
    setToast,

    updateStatus,
    updateManyStatus,
    deleteMany,
    sendCourierDirect,
    sendCourierMany,

    confirm,
    setConfirm,
  } = useOrders(API);

  // ✅ Edit modal state
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // ✅ Create modal state
  const [createOpen, setCreateOpen] = useState(false);

  const [form, setForm] = useState({
    status: "pending",
    paymentMethod: "cod",
    trackingId: "",
    cancelReason: "",
    discount: 0, // ✅ added
    billing: { name: "", phone: "", address: "" },
  });

  /* =======================
     🗑 DELETE CONFIRM
     ======================= */
  const confirmDelete = (order) => {
    setConfirm({
      title: "Delete Order",
      message: "আপনি কি নিশ্চিত এই order টি delete করতে চান?",
      danger: true,
      loading: deleting,
      onConfirm: () => handleDelete(order),
    });
  };

  /* =======================
     ✏️ EDIT ORDER
     ======================= */
  const openEdit = (order) => {
    // ✅ Debug (remove later if you want)
    // console.log("EDIT ORDER:", order);

    setCurrentId(order._id);
    setForm({
      status: order.status,
      paymentMethod: order.paymentMethod,
      trackingId: order.trackingId || "",
      cancelReason: order.cancelReason || "",
      discount: Number(order.discount || 0), // ✅ important
      billing: order.billing,
    });
    setOpen(true);
  };

  /* =======================
     💾 UPDATE ORDER
     ======================= */
  const updateOrder = async (updatedForm) => {
    try {
      const res = await fetch(`${API}/admin/orders/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Update failed");

      fetchOrders();
      setToast({ message: "✅ Order updated successfully!", type: "success" });

      return { success: true };
    } catch (err) {
      setToast({ message: err.message, type: "error" });
      return { success: false };
    }
  };

  /* =======================
     ✅ CREATE ORDER
     ======================= */
  const createOrder = async (payload) => {
    try {
      const res = await fetch(`${API}/admin/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Order create failed");
      }

      setToast({ message: "✅ Order created successfully!", type: "success" });
      setCreateOpen(false);
      fetchOrders();
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Orders</h1>

        <div className="flex gap-2">
          {/* ✅ NEW ORDER BUTTON */}
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            + New Order
          </button>

          <button
            onClick={fetchOrders}
            className="bg-gray-700 text-white px-4 py-2 rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <OrdersSkeleton />
      ) : (
        <>
          <OrdersGrid
            orders={filtered}
            onEdit={openEdit}
            onDelete={confirmDelete}
            onStatusChange={updateStatus}
            onSendCourier={sendCourierDirect}
            onBulkStatusChange={updateManyStatus}
            onBulkDelete={deleteMany}
            onBulkSendCourier={sendCourierMany}
          />

          <OrdersTable
            orders={filtered}
            onEdit={openEdit}
            onDelete={confirmDelete}
            onStatusChange={updateStatus}
            onSendCourier={sendCourierDirect}
            onBulkStatusChange={updateManyStatus}
            onBulkDelete={deleteMany}
            onBulkSendCourier={sendCourierMany}
          />
        </>
      )}

      {/* ✅ CREATE MODAL */}
      <CreateOrderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={createOrder}
        API={API}
      />

      {/* EDIT MODAL */}
      <EditOrderModal
        open={open}
        form={form}
        setForm={setForm}
        onSave={() => updateOrder(form)}
        onClose={() => setOpen(false)}
      />

      {/* CONFIRM MODAL */}
      {confirm && (
        <ConfirmModal data={confirm} onClose={() => setConfirm(null)} />
      )}

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
