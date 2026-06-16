import React from "react";
const LoadingSpinner = ({ size = 48, color1 = "#00e0ff", color2 = "#00bfff" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#gradient)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0f1a]">
      <LoadingSpinner />

      <p className="mt-4 text-gray-300 text-sm font-medium tracking-wide">
        loading...
      </p>
    </div>
  );
};

export default LoadingScreen;
