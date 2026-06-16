import React from "react";
import { FaShippingFast, FaShoppingBag } from "react-icons/fa";

const OfferBar = () => {
  return (
    <div className="flex gap-4">
      {/* Free Delivery */}
      <div className="flex items-center gap-2 bg-[#FFF5EE]  py-1 rounded-xl">
        <div className="flex items-center justify-center w-8 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm">
          <FaShippingFast className="text-lg" />
        </div>
        <span className="text-[11px] text-gray-900">
          Free Delivery
        </span>
      </div>

      {/* Best Discount */}
      <div className="flex items-center gap-2 bg-[#F4F9FF] px-2 rounded-xl">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-sm">
          <FaShoppingBag className="text-lg" />
        </div>
        <span className="text-[11px] text-gray-900">
          Best Discount
        </span>
      </div>
    </div>
  );
};

export default OfferBar;
