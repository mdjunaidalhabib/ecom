/** @type {import('next').NextConfig} */

const backendApiUrl = process.env.BACKEND_API_URL || "http://localhost:4000";
const parsedBackendApiUrl = new URL(backendApiUrl);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_GOOGLE_IMAGE_HOST || "lh3.googleusercontent.com",
      },
      {
        protocol: parsedBackendApiUrl.protocol.replace(":", ""),
        hostname: parsedBackendApiUrl.hostname,
        port: parsedBackendApiUrl.port || undefined,
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
