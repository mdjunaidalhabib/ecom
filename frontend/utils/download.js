"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ReceiptViewer({ orderId, order = null }) {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const fetchReceipt = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/api/orders/${orderId}/receipt`,
        { method: "GET", credentials: "include" }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error(`❌ Failed to fetch receipt: ${res.status} - ${errText}`);
        toast.error("Failed to load receipt!");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      toast.success("Receipt loaded successfully!");
    } catch (err) {
      console.error("🔥 Error fetching receipt:", err);
      toast.error("Error loading receipt!");
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (!pdfUrl) return;
    const fileName = `HabibsFashion-${order?.orderId || orderId}.pdf`;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Receipt downloaded!");
  };

  return (
    <div className="space-y-4">
      <button
        onClick={fetchReceipt}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Loading..." : "View Receipt"}
      </button>

      {pdfUrl && (
        <>
          <iframe
            src={pdfUrl}
            title="Receipt Preview"
            className="w-full h-[600px] border rounded"
          />
          <button
            onClick={downloadReceipt}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download Receipt
          </button>
        </>
      )}

      <Toaster position="top-right" />
    </div>
  );
}
