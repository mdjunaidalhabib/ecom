"use client";
import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js") // ✅ updated
        .then(() => console.log("✅ SW registered"))
        .catch((err) => console.log("❌ SW failed", err));
    }
  }, []);

  return null;
}
