import React, { useState } from "react";
import { X, Star, ShoppingCart, ShieldCheck, ShoppingBag } from "lucide-react";
import { Product } from "../types";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
    setQuantity(1); // Reset
  };

  const handleQuickBuy = () => {
    if (onBuyNow) {
      onBuyNow(product, quantity);
    } else {
      onAddToCart(product, quantity);
    }
    onClose();
    setQuantity(1);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/50 backdrop-blur-xs" id="quick_view_overlay">
      <div 
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-xl flex flex-col md:flex-row"
        id="quick_view_container"
      >
        {/* Close Button top right */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 backdrop-blur-xs border border-gray-100 text-gray-400 hover:text-gray-700 hover:bg-white transition"
          id="close_quick_view_btn"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Premium Image frame */}
        <div className="w-full md:w-1/2 aspect-square relative bg-gray-50">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center"
            referrerPolicy="no-referrer"
            id={`detail_img_${product.id}`}
          />
          <span className="absolute left-4 bottom-4 rounded-full bg-white/95 px-3 py-1 font-sans text-[10px] font-bold text-gray-700 shadow-sm uppercase tracking-wide">
            {product.category}
          </span>
        </div>

        {/* Right Side: Deep spec content */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-0.5 items-center text-amber-500">
                <Star className="h-4.5 w-4.5 fill-current" />
                <span className="font-sans text-xs font-bold leading-none mt-0.5 ml-1">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-[11px] text-gray-400">• Verified rating</span>
            </div>

            <h2 className="font-sans font-bold text-gray-950 text-lg leading-snug tracking-tight mb-2">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-sans text-xl font-extrabold text-gray-950">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-emerald-600 text-xs font-semibold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-sm">
                In Stock & Ready
              </span>
            </div>

            <div className="h-px bg-gray-100 my-3"></div>

            <p className="font-sans text-xs text-gray-500 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Spec lines */}
            <div className="space-y-1.5 text-[11px] font-sans font-medium text-gray-400 mb-4">
              <div className="flex justify-between">
                <span>Unique Stock ID</span>
                <span className="text-gray-700">{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Inventory Limit</span>
                <span className="text-gray-700">{product.stock} units remaining</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-[10px] text-emerald-700 font-sans font-bold uppercase tracking-wide bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-50">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Full buyer protection + free global delivery included</span>
            </div>

            {/* Order selector controls */}
            {!isOutOfStock ? (
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl p-1 bg-gray-55">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 flex items-center justify-center font-sans font-bold text-sm text-gray-500 hover:bg-white rounded-lg transition"
                    title="Decrease quantity"
                    id="detail_qty_dec"
                  >
                    -
                  </button>
                  <span className="font-sans text-sm font-bold text-gray-850 px-2 min-w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="h-8 w-8 flex items-center justify-center font-sans font-bold text-sm text-gray-500 hover:bg-white rounded-lg transition"
                    disabled={quantity >= product.stock}
                    title="Increase quantity"
                    id="detail_qty_inc"
                  >
                    +
                  </button>
                </div>

                <div className="flex-1 flex gap-2">
                  <button
                    onClick={handleAdd}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-250 bg-white py-2.5 font-sans text-xs font-bold text-gray-700 transition hover:bg-gray-50 hover:border-gray-300"
                    id="detail_add_to_cart_btn"
                    title="Add quantity to shopping cart"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>+ Cart</span>
                  </button>
                  <button
                    onClick={handleQuickBuy}
                    className="flex-1.5 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 hover:shadow-sm active:scale-95"
                    id="detail_buy_now_btn"
                    title="Buy items immediately"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Buy Now (₹{(product.price * quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center text-xs font-bold text-red-700">
                Out of Stock. Please request notifications.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
