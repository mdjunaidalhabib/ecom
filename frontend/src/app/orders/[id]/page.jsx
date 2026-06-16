"use client";
import { useParams } from "next/navigation";
import OrderSummary from "../../../../components/home/OrderSummary";

export default function OrderSummaryPage() {
  const params = useParams();
  const { id } = params || {};

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">❌ Invalid order ID</p>
      </div>
    );
  }

  return <OrderSummary orderId={id} />;
}
