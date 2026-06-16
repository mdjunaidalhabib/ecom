import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { useRouter } from "next/router";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios
      .get("/auth/me")
      .then(() => setLoading(false))
      .catch(() => router.push("/login"));
  }, [router]);

  if (loading) return <div>Loading...</div>;
  return <>{children}</>;
}
