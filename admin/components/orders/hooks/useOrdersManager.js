"use client";
import { useMemo, useState } from "react";

/**
 * SHARED ORDER MANAGER
 * works for desktop + mobile
 */
export default function useOrdersManager({
  orders = [],
  tabStatus = "",
  search = "",
  lockStatuses = ["delivered", "cancelled"], // 🔒 status change only (not selection)
}) {
  /* ===============================
     FILTER
  =============================== */
  const filteredOrders = useMemo(() => {
    let list = Array.isArray(orders) ? orders : [];

    if (tabStatus) {
      list = list.filter((o) => o.status === tabStatus);
    }

    if (search?.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o._id?.toLowerCase().includes(q) ||
          o.billing?.name?.toLowerCase().includes(q) ||
          o.billing?.phone?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [orders, tabStatus, search]);

  /* ===============================
     SELECTION (✅ NO STATUS BLOCK)
  =============================== */
  const [selected, setSelected] = useState([]);

  // ✅ all filtered orders are selectable
  const selectableIds = useMemo(
    () => filteredOrders.map((o) => o._id),
    [filteredOrders]
  );

  const toggleOne = (id) => {
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  };

  const toggleAll = () => {
    setSelected((p) =>
      p.length === selectableIds.length ? [] : selectableIds
    );
  };

  const selectedOrders = useMemo(
    () => orders.filter((o) => selected.includes(o._id)),
    [orders, selected]
  );

  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selected.includes(id));

  /* ===============================
     BULK RULES
  =============================== */
  const sameStatus =
    selectedOrders.length > 0 &&
    selectedOrders.every((o) => o.status === selectedOrders[0].status);

  const bulkStatus = sameStatus ? selectedOrders[0].status : "";

  const canBulkSendCourier =
    selectedOrders.length > 0 &&
    selectedOrders.every(
      (o) => o.status === "ready_to_delivery" && !o.trackingId
    );

  return {
    /* data */
    filteredOrders,
    selected,
    selectedOrders,
    selectableIds,

    /* selection */
    setSelected,
    toggleOne,
    toggleAll,
    allSelected,

    /* bulk helpers */
    sameStatus,
    bulkStatus,
    canBulkSendCourier,
  };
}
