/**
 * frontend/src/app/layout.js — REPLACE বিদ্যমান layout.js দিয়ে
 *
 * পরিবর্তন:
 *  - Tenant config load করে (shop name, colors, logo)
 *  - Expired/suspended হলে error page দেখায়
 *  - বাকি সব আগের মতোই
 */

import "./globals.css";
import { CartProvider }  from "../../context/CartContext";
import Navbar            from "../../components/navbar/Navbar";
import Footer            from "../../components/home/footer";
import { UserProvider }  from "../../context/UserContext";
import PWARegister       from "../../components/pwa/pwa-register";
import FloatingActionButton from "../../components/home/FloatingActionButton";
import { headers }       from "next/headers";

// ── Fetch tenant config server-side ──────────────────────────
async function getTenantConfig() {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "";

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/tenant-config`,
      {
        headers: { host },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error, shopName: data.shopName, status: res.status };
    }
    return await res.json();
  } catch {
    return {};
  }
}

// ── Dynamic metadata ──────────────────────────────────────────
export async function generateMetadata() {
  const config = await getTenantConfig();

  return {
    title: config.shopName
      ? `${config.shopName} | Online Shop`
      : "Glorixbd | Trusted Best Online Shopping Platform in Bangladesh",
    description: config.shopName
      ? `Shop at ${config.shopName}`
      : "glorixbd is a reliable e-commerce platform in Bangladesh",
    manifest: "/manifest.json",
    icons: {
      icon:     config.favicon || "/favicon.ico",
      shortcut: config.favicon || "/favicon.ico",
      apple:    config.favicon || "/favicon.ico",
    },
  };
}

export const viewport = { themeColor: "#f472b6" };

export default async function RootLayout({ children }) {
  const config = await getTenantConfig();

  // ── Suspended / expired shop ──────────────────────────────
  if (config.error === "suspended") {
    return (
      <html lang="en">
        <body className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-red-700 mb-2">Shop Suspended</h1>
            <p className="text-gray-600">{config.shopName || "This shop"} has been suspended.</p>
            <p className="text-gray-500 text-sm mt-2">Please contact support.</p>
          </div>
        </body>
      </html>
    );
  }

  if (config.error === "expired") {
    return (
      <html lang="en">
        <body className="flex items-center justify-center min-h-screen bg-amber-50">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⏰</div>
            <h1 className="text-2xl font-bold text-amber-700 mb-2">Subscription Expired</h1>
            <p className="text-gray-600">{config.shopName || "This shop"}&apos;s subscription has expired.</p>
            <p className="text-gray-500 text-sm mt-2">Please renew to continue shopping.</p>
          </div>
        </body>
      </html>
    );
  }

  // ── Normal render ─────────────────────────────────────────
  return (
    <html lang="en">
      <head>
        {/* Dynamic primary color */}
        {config.primaryColor && (
          <style>{`:root { --primary: ${config.primaryColor}; }`}</style>
        )}
      </head>
      <body className="flex flex-col min-h-screen bg-orange-50">
        <PWARegister />
        <UserProvider>
          <CartProvider>
            <Navbar shopName={config.shopName} logo={config.logo} />
            <main className="flex-grow bg-orange-50">
              <div className="mx-auto w-full">{children}</div>
            </main>
            <Footer />
            <FloatingActionButton />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
