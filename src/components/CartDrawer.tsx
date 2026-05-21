import React, { useState } from "react";
import { X, Trash2, ShoppingBag, CreditCard, ChevronRight, MapPin, Phone, User } from "lucide-react";
import { CartItem, Order } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (shippingAddress: Order["shippingAddress"]) => Promise<void>;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isLoggedIn,
  onOpenAuth,
}: CartDrawerProps) {
  // Checkout flow state: 'cart' | 'shipping'
  const [step, setStep] = useState<"cart" | "shipping">("cart");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address form fields
  const [fullName, setFullName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError("Please sign in to place an order.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await onCheckout({
        fullName,
        street,
        city,
        zipCode,
        phone,
      });
      // Clear forms
      setFullName("");
      setStreet("");
      setCity("");
      setZipCode("");
      setPhone("");
      setStep("cart");
      onClose();
    } catch (err: any) {
      setError(err.message || "Checkout failed. Please inspect stock availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-950/40 backdrop-blur-xs" id="cart_overlay">
      <div 
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-gray-100"
        id="cart_drawer_container"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-150">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gray-955" />
            <h2 className="font-sans font-bold text-gray-950 text-lg tracking-tight">
              {step === "cart" ? "My Shopping Cart" : "Enter Shipping Details"}
            </h2>
          </div>
          <button
            onClick={() => {
              setStep("cart");
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition"
            id="close_cart_btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Standard Error Panel */}
        {error && (
          <div className="mx-6 mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-xs font-semibold text-red-700" id="cart_error">
            {error}
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6" id="cart_drawer_body">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center" id="empty_cart_view">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 mb-4 text-gray-400">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="font-sans font-bold text-gray-900 text-sm">Your shopping basket is empty</h3>
              <p className="font-sans text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                Explore our catalog to add modern, premium organic items and high-productivity electronics to your home.
              </p>
              <button
                onClick={onClose}
                className="mt-5 rounded-full bg-gray-900 px-4 py-2 font-sans text-xs font-bold text-white transition hover:bg-gray-800"
                id="empty_cart_continue"
              >
                Continue Browsing
              </button>
            </div>
          ) : step === "cart" ? (
            /* Items List Step */
            <div className="space-y-4" id="cart_items_list">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3 rounded-xl border border-gray-10/40 hover:border-gray-200 transition"
                  id={`cart_item_${item.product.id}`}
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-16 w-16 rounded-lg object-cover bg-gray-50 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-sans font-semibold text-gray-900 text-xs truncate">
                      {item.product.name}
                    </h4>
                    <span className="font-sans text-[10px] text-gray-400 uppercase tracking-wider font-semibold block mt-0.5">
                      {item.product.category}
                    </span>
                    <span className="font-sans text-xs font-bold text-gray-900 block mt-1.5 font-sans">
                      ₹{item.product.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-sm"
                      title="Remove product"
                      id={`remove_item_${item.product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Quantity Selector controls */}
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="h-5 w-5 flex items-center justify-center font-sans text-xs text-gray-500 hover:bg-white rounded-md transition"
                        title="Decrease"
                        id={`qty_dec_${item.product.id}`}
                      >
                        -
                      </button>
                      <span className="font-sans text-xs font-bold text-gray-850 px-1">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="h-5 w-5 flex items-center justify-center font-sans text-xs text-gray-500 hover:bg-white rounded-md transition"
                        disabled={item.quantity >= item.product.stock}
                        title="Increase"
                        id={`qty_inc_${item.product.id}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Shipping Address Form Step */
            <form onSubmit={handleSubmitCheckout} className="space-y-4" id="shipping_details_form">
              <div>
                <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">Recipient Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Alex Buyer"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 font-sans text-sm text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none"
                    id="ship_fullname"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">Street Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="123 Premium Lane"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 font-sans text-sm text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none"
                    id="ship_street"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Seattle"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 font-sans text-sm text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none"
                    id="ship_city"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">ZIP Code</label>
                  <input
                    type="text"
                    required
                    placeholder="98101"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 font-sans text-sm text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none"
                    id="ship_zipcode"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 font-sans text-sm text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none"
                    id="ship_phone"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-50 text-blue-800 text-[11px] rounded-lg leading-relaxed font-medium">
                Note: By checking out, your cart inventory is reserved. Double-check your delivery info.
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("cart")}
                  className="flex-1 rounded-xl border border-gray-250 py-2.5 font-sans text-xs font-bold text-gray-650 hover:bg-gray-50 hover:text-gray-900 transition"
                  id="checkout_back_btn"
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 rounded-xl bg-gray-900 py-2.5 font-sans text-xs font-bold text-white shadow-xs hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition"
                  id="checkout_submit_btn"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer aggregate Pricing summary panel */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-150 p-6 bg-gray-50/90" id="cart_drawer_footer">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 font-sans font-medium">
                <span>Subtotal Items ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</span>
                <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 font-sans font-medium">
                <span>Freight Shipping</span>
                <span className="text-emerald-600 font-bold">FREE DELIVERY</span>
              </div>
              <div className="h-px bg-gray-200 my-1"></div>
              <div className="flex items-center justify-between font-sans">
                <span className="text-sm font-bold text-gray-950">Total Payment Amount</span>
                <span className="text-base font-extrabold text-gray-950">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {step === "cart" && (
              isLoggedIn ? (
                <button
                  onClick={() => setStep("shipping")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-sans text-sm font-bold text-white shadow-md transition hover:bg-gray-800 active:scale-98"
                  id="cart_checkout_next_btn"
                >
                  <CreditCard className="h-4.5 w-4.5" />
                  <span>Secure Checkout</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="space-y-2 text-center">
                  <button
                    onClick={onOpenAuth}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-950 py-3 font-sans text-sm font-bold text-white shadow-sm hover:bg-gray-850"
                    id="cart_trigger_auth"
                  >
                    <span>Sign In to Complete Purchase</span>
                  </button>
                  <p className="font-sans text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                    Authentication is required for buyer security tracking
                  </p>
                </div>
              )
            )}
          </div>
        )}

      </div>
    </div>
  );
}
