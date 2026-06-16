"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function Toast({ message, type, onClose }) {
  if (!message) return null;

  const bgColor =
    type === "success"
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-gray-800";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-6 right-6 z-50 text-white px-5 py-3 rounded-lg shadow-lg ${bgColor}`}
      >
        <div className="flex items-center justify-between space-x-3">
          <span>{message}</span>
          <button onClick={onClose} className="text-white font-bold text-lg leading-none">
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
