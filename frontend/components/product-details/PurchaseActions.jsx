import { FaShoppingBag } from "react-icons/fa";
import QuantityController from "../home/QuantityController";
import CheckoutButton from "../home/CheckoutButton";

export default function PurchaseActions({
  product,
  cartKey,
  quantity,
  totalPrice,
  isOutOfStock,
  currentStock,
  updateCart,
  handleCheckout,
}) {
  return (
    <div className="space-y-2 md:space-y-3 md:pt-2 border-gray-100">
      {!quantity ? (
        // ✅ MOBILE + DESKTOP BOTH: side by side
        <div className="flex flex-row justify-center md:justify-start gap-2 md:gap-4">
          {/* ✅ Add to cart */}
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => updateCart(cartKey, +1, currentStock)}
            className={`
              w-[150px] sm:flex-1
              h-10 md:h-12
              rounded-lg md:rounded-xl
              text-sm md:text-base
              font-bold
              flex items-center justify-center gap-2
              transition-all
              ${
                isOutOfStock
                  ? "bg-gray-200 cursor-not-allowed text-gray-400"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }
            `}
          >
            <FaShoppingBag className="text-xs md:text-sm" />
            {isOutOfStock ? "Sold Out" : "Add to Cart"}
          </button>

          {/* ✅ Checkout */}
          <div
            className={`
              ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}
              w-[150px] sm:flex-1
            `}
          >
            <CheckoutButton
              product={product}
              productId={product._id}
              qty={1}
              onClick={handleCheckout}
              disabled={isOutOfStock}
              stock={currentStock}
              className="
                w-full
                h-10 md:h-12
                text-sm md:text-base
                px-4 md:px-0
                rounded-lg md:rounded-xl
              "
            />
          </div>
        </div>
      ) : (
        <div
          className="
            flex flex-col items-center gap-2 rounded-xl
            md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-2 md:rounded-2xl
          "
        >
          {/* ✅ Quantity controller */}
          <div className="flex justify-center md:min-w-[110px]">
            <QuantityController
              qty={quantity}
              stock={currentStock}
              onChange={(change) => updateCart(cartKey, change, currentStock)}
              allowZero={true}
            />
          </div>

          {/* ✅ Price */}
          <div className="text-center">
            <p className="text-blue-700 font-extrabold text-lg md:text-xl">
              ৳{totalPrice}
            </p>
          </div>

          {/* ✅ Checkout */}
          <div
            className={`
              ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}
              flex justify-center md:justify-end
            `}
          >
            <CheckoutButton
              product={product}
              productId={product._id}
              qty={quantity}
              onClick={handleCheckout}
              disabled={isOutOfStock}
              stock={currentStock}
              className="
                h-10 md:h-12
                text-sm md:text-base
                px-6 md:px-10
                rounded-lg md:rounded-xl
              "
            />
          </div>
        </div>
      )}
    </div>
  );
}
