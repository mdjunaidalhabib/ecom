"use client";
import { useParams } from "next/navigation";
import OrderSummary from "../../../../components/home/OrderSummary";

export default function OrderSummaryPage() {
  const { id } = useParams();
  return <OrderSummary orderId={id} />;
}
