"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "../../../../context/UserContext";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchMe } = useUser();

  useEffect(() => {
    const token = searchParams.get("token");
    const redirect = searchParams.get("redirect") || "/";

    if (token) {
      // ✅ token save করো
      localStorage.setItem("token", token);

      // ✅ context reload (backend থেকে fresh user আনবে)
      fetchMe(token);

      // ✅ clean redirect (auth/callback URL বাদ দিয়ে আসল পেজে পাঠাবে)
      router.replace(redirect);
    } else {
      router.replace("/login");
    }
  }, []);

  return <p className="text-center">⏳ Logging in...</p>;
}
