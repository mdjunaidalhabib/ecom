import "./globals.css";
import AdminPWARegister from "../../components/pwa-register.jsx";

export const metadata = {
  title: "Dashboard | Admin Panel",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ admin manifest */}
        <link rel="manifest" href="/admin-manifest.json" />
        <meta name="theme-color" content="#f472b6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>

      <body>
        {/* ✅ SW register component */}
        <AdminPWARegister />

        <div className="flex h-screen bg-pink-50">
          <div className="flex-1 flex flex-col">
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
