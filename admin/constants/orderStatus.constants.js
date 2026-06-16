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

export const STATUS_TEXT_COLOR = {
  pending: "text-yellow-600",
  ready_to_delivery: "text-blue-600",
  send_to_courier: "text-purple-600",
  delivered: "text-green-600",
  cancelled: "text-red-600",
};

export const STATUS_BADGE_COLOR = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ready_to_delivery: "bg-blue-100 text-blue-700 border-blue-200",
  send_to_courier: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};
