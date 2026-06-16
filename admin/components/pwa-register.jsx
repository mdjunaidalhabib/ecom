"use client";
import { useEffect } from "react";

export default function AdminPWARegister() {
  useEffect(() => {
    // 🚫 Dev mode এ SW রেজিস্টার করা হবে না
    if (process.env.NODE_ENV !== "production") return;

    const registerSW = async () => {
      if ("serviceWorker" in navigator) {
        try {
          await navigator.serviceWorker.register("/admin-sw.js");
          console.log("✅ Admin SW registered");
        } catch (err) {
          console.log("❌ Admin SW failed", err);
        }
      }
    };

    registerSW();
  }, []);

  return null;
}
