"use client";
import React from "react";


function cn(...classes) {
return classes.filter(Boolean).join(" ");
}


export const Button = React.forwardRef(
(
{ className, variant = "default", size = "md", isLoading, children, disabled, ...props },
ref
) => {
const baseStyles =
"inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-[1px]";


const variantStyles = {
default: "bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-900",
secondary:
"bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-300",
outline:
"border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-gray-300",
ghost: "bg-transparent hover:bg-gray-100 text-gray-900",
destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
link: "bg-transparent underline-offset-4 hover:underline text-blue-600",
};


const sizeStyles = {
sm: "h-9 px-3 text-sm",
md: "h-10 px-4 text-sm",
lg: "h-11 px-5 text-base",
icon: "h-10 w-10 p-0",
};


return (
<button
ref={ref}
className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
disabled={disabled || isLoading}
{...props}
>
{isLoading ? (
<span className="inline-flex items-center gap-2">
<svg
className="animate-spin h-4 w-4"
xmlns="http://www.w3.org/2000/svg"
fill="none"
viewBox="0 0 24 24"
aria-hidden="true"
>
<circle
className="opacity-25"
cx="12"
cy="12"
r="10"
stroke="currentColor"
strokeWidth="4"
/>
<path
className="opacity-75"
fill="currentColor"
d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
/>
</svg>
<span>Loading...</span>
</span>
) : (
children
)}
</button>
);
}
);
Button.displayName = "Button";


export default Button;