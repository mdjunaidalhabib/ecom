"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdmin } from "../../lib/auth";

export default function RootRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdmin(); // 🔐 token check (frontend fallback)

    const timeout = setTimeout(() => {
      if (token) {
        router.push("/admin/dashboard");
      } else {
        router.push("/login");
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
