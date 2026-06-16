"use client";
import { FaPlus, FaMinus } from "react-icons/fa";

export default function QuantityController({ qty, stock, onChange, allowZero = false }) {
  return (
    <div className="flex items-center gap-0 rounded-lg px-1">
      <button
        onClick={() => onChange(-1)}
        disabled={!allowZero && qty <= 1}
        className="bg-red-500 text-white p-1 rounded hover:bg-red-600 disabled:opacity-50"
      >
        <FaMinus className="w-3 h-3" />
      </button>

      <span className="font-bold min-w-[20px] text-center">{qty}</span>

      <button
        onClick={() => onChange(+1)}
        disabled={stock && qty >= stock}
        className="bg-green-500 text-white p-1 rounded hover:bg-green-600 disabled:opacity-50"
      >
        <FaPlus className="w-3 h-3" />
      </button>
    </div>
  );
}
