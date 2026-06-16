"use client";
import { useMemo, useState } from "react";

import { READY_STATUS, LOCKED_STATUSES } from "../shared/constants"; // ✅ add LOCKED_STATUSES

import useOrdersManager from "../hooks/useOrdersManager";
import StatusSummary from "./StatusSummary";
import BulkBar from "./BulkBar";
import OrderCard from "./OrderCard";

export default function OrdersGrid({
  orders,
  onEdit,
  onDelete = null,
  onStatusChange,
  onSendCourier,
  onBulkStatusChange,
  onBulkDelete,
  onBulkSendCourier,
}) {
  const [tabStatus, setTabStatus] = useState("");
  const [openId, setOpenId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const manager = useOrdersManager({
    orders,
    tabStatus,
  });

  /* ===============================
     SINGLE ORDER STATUS CHANGE
     READY → SEND_TO_COURIER হলে auto courier create
  =============================== */
  const handleChange = async (id, payload, order) => {
    setUpdatingId(id);
    try {
      // 🚚 READY → SEND TO COURIER
      if (
        order?.status === READY_STATUS &&
        payload.status === "send_to_courier"
      ) {
        await onSendCourier(order);

        // success হলে selection clear
        manager.setSelected([]);
        return; // ⛔ status update এখানেই থামবে
      }

      // 🔁 NORMAL STATUS UPDATE
      await onStatusChange(id, payload);

      manager.setSelected([]);
    } finally {
      setUpdatingId(null);
    }
  };

  /* ===============================
     COURIER FINAL STATUS SYNC (MOBILE)
     CourierStatus যদি DELIVERED/CANCELLED হয়
     তাহলে backend sync + UI status update হবে
  =============================== */
  const handleCourierFinalStatus = async (orderId, finalStatus) => {
    if (!orderId || !finalStatus) return;
    if (updatingId === orderId) return;

    // locked check (safe)
    const order = (orders || []).find((x) => x._id === orderId);
    if (order && LOCKED_STATUSES?.includes(order.status)) return;
    if (order && order.status === finalStatus) return;

    setUpdatingId(orderId);

    try {
      const apiUrl = "/api";

      // ✅ backend sync endpoint call
      await fetch(`${apiUrl}/admin/api/sync-courier-final`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, finalStatus }),
      });

      // ✅ UI instant update (parent handler)
      await onStatusChange(orderId, { status: finalStatus });

      manager.setSelected([]);
    } catch (err) {
      console.error("Courier final sync failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  /* ===============================
     STATUS COUNT (SUMMARY)
  =============================== */
  const statusCount = useMemo(() => {
    const base = {
      pending: 0,
      ready_to_delivery: 0,
      send_to_courier: 0,
      delivered: 0,
      cancelled: 0,
    };

    (orders || []).forEach((o) => {
      if (base[o.status] !== undefined) {
        base[o.status]++;
      }
    });

    return base;
  }, [orders]);

  return (
    <div className="md:hidden space-y-2">
      {/* ================= STATUS SUMMARY ================= */}
      <StatusSummary
        orders={orders || []}
        tabStatus={tabStatus}
        setTabStatus={(s) => {
          setTabStatus(s);
          manager.setSelected([]);
        }}
        statusCount={statusCount}
      />

      {/* ================= SELECT ALL + BULK ================= */}
      {manager.filteredOrders.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2">
          {/* SELECT ALL */}
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={manager.allSelected}
              onChange={manager.toggleAll}
            />
            <span className="text-xs font-semibold whitespace-nowrap">
              Select all ({manager.filteredOrders.length})
            </span>
          </label>

          {/* BULK ACTIONS */}
          <div className="flex-1">
            <BulkBar
              selected={manager.selected}
              selectedOrders={manager.selectedOrders}
              sameStatus={manager.sameStatus}
              bulkStatus={manager.bulkStatus}
              setSelected={manager.setSelected}
              onStatusChange={onStatusChange}
              onBulkStatusChange={onBulkStatusChange}
              onBulkDelete={onBulkDelete}
              onBulkSendCourier={onBulkSendCourier}
            />
          </div>
        </div>
      )}

      {/* ================= ORDER LIST ================= */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {manager.filteredOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No orders found.
          </div>
        ) : (
          <div className="divide-y">
            {manager.filteredOrders.map((o) => (
              <OrderCard
                key={o._id}
                o={o}
                expanded={openId === o._id}
                setOpenId={setOpenId}
                selected={manager.selected}
                toggleOne={manager.toggleOne}
                updatingId={updatingId}
                onStatusChange={handleChange}
                onEdit={onEdit}
                onDelete={onDelete}
                onSendCourier={onSendCourier}
                onFinalStatusSync={handleCourierFinalStatus} // ✅ ADD
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
