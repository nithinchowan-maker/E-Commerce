import React from "react";
import { Plus, Eye, AlertCircle, ShoppingBag } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onBuyNow, onQuickView }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs hover:shadow-md hover:border-gray-200 transition duration-300"
      id={`product_card_${product.id}`}
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          id={`product_img_${product.id}`}
        />

        {/* Status badges */}
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <span className="rounded-full bg-red-600 px-3 py-1 font-sans text-xs font-bold uppercase tracking-wide text-white shadow-sm">
              Out of Stock
            </span>
          </div>
        ) : isLowStock ? (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-white uppercase shadow-xs">
            <AlertCircle className="h-3 w-3" />
            <span>Only {product.stock} Left</span>
          </div>
        ) : null}

        {/* Floating Quick Action Overlays */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300">
          <button
            onClick={() => onQuickView(product)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-700 shadow-lg border border-gray-100 hover:text-gray-900 hover:scale-105 active:scale-95 transition"
            title="Quick view product"
            id={`quick_view_btn_${product.id}`}
          >
            <Eye className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Category Pill Tag */}
        <span className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 font-sans text-[10px] font-semibold text-gray-700 shadow-sm ring-1 ring-black/5 uppercase">
          {product.category}
        </span>
      </div>

      {/* Product Information Body */}
      <div className="flex flex-1 flex-col p-4.5">
        <div className="mb-1 flex items-center justify-between">
          {/* Rating layout */}
          <div className="flex items-center gap-1 text-amber-500" id={`rating_${product.id}`}>
            <span className="text-xs font-bold font-sans">★</span>
            <span className="font-sans text-xs font-semibold text-gray-500">{product.rating.toFixed(1)}</span>
          </div>
          <span className="font-sans text-[11px] font-medium text-gray-400">Stock: {product.stock}</span>
        </div>

        <h3 className="mb-1.5 font-sans font-semibold text-gray-900 hover:text-gray-800 line-clamp-1 cursor-pointer text-sm" onClick={() => onQuickView(product)}>
          {product.name}
        </h3>

        <p className="mb-4 font-sans text-xs text-gray-400 line-clamp-1" title={product.description}>
          {product.description}
        </p>

        {/* Pricing & Dual-Action Section */}
        <div className="mt-auto space-y-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-sans text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">Price</span>
              <span className="font-sans text-base font-extrabold text-gray-950">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {isOutOfStock ? (
              <span className="rounded-full bg-red-50 border border-red-100 px-2 py-0.5 text-[9px] font-extrabold text-red-600 uppercase font-sans">
                Out of Stock
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 uppercase font-sans">
                {product.stock} left
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 font-sans text-xs font-bold transition duration-150 border ${
                isOutOfStock
                  ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                  : "bg-white border-gray-250 hover:bg-gray-50 text-gray-750 active:scale-95 hover:border-gray-300"
              }`}
              id={`add_to_cart_btn_${product.id}`}
              title="Add this item to cargo cart"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Cart</span>
            </button>

            <button
              onClick={() => onBuyNow(product)}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 font-sans text-xs font-bold text-white shadow-2xs transition duration-150 ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
              }`}
              id={`buy_now_btn_${product.id}`}
              title="Buy this item instantly"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
