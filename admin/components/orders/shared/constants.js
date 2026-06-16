export const STATUS_OPTIONS = [
  "pending",
  "ready_to_delivery",
  "send_to_courier",
  "delivered",
  "cancelled",
];

export const STATUS_LABEL = {
  pending: "PENDING",
  ready_to_delivery: "READY TO DELIVERY",
  send_to_courier: "SEND TO COURIER",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
};

export const LOCKED_STATUSES = ["delivered", "cancelled"];

export const STATUS_FLOW = {
  pending: ["ready_to_delivery", "cancelled"],
  ready_to_delivery: ["send_to_courier", "cancelled"],
  send_to_courier: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const READY_STATUS = "ready_to_delivery";

export const STATUS_BADGE_COLOR = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ready_to_delivery: "bg-blue-100 text-blue-700 border-blue-200",
  send_to_courier: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

/* ===============================
   DESKTOP TAB TEXT COLOR
================================ */
export const STATUS_TEXT_COLOR = {
  pending: "text-yellow-600",
  ready_to_delivery: "text-blue-600",
  send_to_courier: "text-purple-600",
  delivered: "text-green-600",
  cancelled: "text-red-600",
};

/* ===============================
   MOBILE STATUS PILL
================================ */
export const STATUS_COLORS = {
  pending: "text-yellow-700 bg-yellow-50 ring-yellow-200",
  ready_to_delivery: "text-blue-700 bg-blue-50 ring-blue-200",
  send_to_courier: "text-purple-700 bg-purple-50 ring-purple-200",
  delivered: "text-green-700 bg-green-50 ring-green-200",
  cancelled: "text-red-700 bg-red-50 ring-red-200",
};
