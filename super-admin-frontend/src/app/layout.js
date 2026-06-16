import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "GlorixBD — Super Admin",
  description: "Super Admin Control Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
