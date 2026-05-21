import React, { useEffect, useState } from "react";
import { Package, Clock, Truck, CheckCircle2, RotateCcw, ShieldCheck, MapPin } from "lucide-react";
import { Order } from "../types";
import { api } from "../api";

interface OrderHistoryProps {
  currentUserEmail: string;
}

export default function OrderHistory({ currentUserEmail }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [currentUserEmail]);

  // Delivery status step visualizer
  const renderStatusStepper = (status: Order["status"]) => {
    if (status === "cancelled") {
      return (
        <div className="flex items-center gap-1.5 text-xs font-bold text-red-650 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 font-sans uppercase">
          <span>● Transaction Cancelled & Stock Returned</span>
        </div>
      );
    }

    const steps: { label: string; key: Order["status"]; icon: any }[] = [
      { label: "Pending Review", key: "pending", icon: Clock },
      { label: "Processing", key: "processing", icon: RotateCcw },
      { label: "On Transit", key: "shipped", icon: Truck },
      { label: "Delivered", key: "delivered", icon: CheckCircle2 },
    ];

    const currentIdx = steps.findIndex(s => s.key === status);

    return (
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-1 scrollbar-none" id="order_stepper">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          const isCompleted = idx <= currentIdx;
          const isActive = idx === currentIdx;

          return (
            <div key={st.key} className="flex items-center shrink-0">
              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold uppercase transition duration-200 ${
                isActive 
                  ? "bg-gray-900 text-white ring-2 ring-gray-905" 
                  : isCompleted 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "bg-gray-100 text-gray-400"
              }`}>
                <Icon className="h-3 w-3" />
                <span>{st.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 w-4 sm:w-6 mx-1 bg-gray-200 shrink-0 ${isCompleted ? "bg-emerald-500" : ""}`}></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6" id="order_history_section">
      {/* Tab headings */}
      <div className="border-b border-gray-100 pb-5">
        <span className="font-sans text-[10px] font-bold tracking-wider text-gray-400 uppercase">My Account Settings</span>
        <h2 className="font-sans font-bold text-gray-950 text-xl tracking-tight mt-0.5">Purchases & Order Tracking</h2>
        <p className="font-sans text-xs text-gray-400 mt-1">Review active cargo shipments, retrieve pricing recaps, and access invoice details.</p>
      </div>

      {loading && (
        <div className="text-center py-10" id="orders_loading_msg">
          <p className="font-sans text-xs text-gray-400">Syncing transaction registry...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-semibold text-red-700 font-sans" id="orders_error_message">
          {error}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center" id="no_orders_view">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 mb-4 text-gray-400">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="font-sans font-bold text-gray-900 text-sm">No transaction records found</h3>
          <p className="font-sans text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
            Your shopping footprint is clean! Once your place your first checked-out purchase, shipment markers will appear right here.
          </p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-6" id="history_list_container">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="rounded-2xl border border-gray-150 bg-white overflow-hidden shadow-3xs"
              id={`order_history_card_${ord.id}`}
            >
              {/* Stepper overview header */}
              <div className="border-b border-gray-100 bg-gray-50/55 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5 font-sans">
                  <span className="text-[10px] text-gray-450 font-bold uppercase tracking-wider block">ID Code</span>
                  <span className="font-bold text-gray-900 pr-2">{ord.id}</span>
                  <span className="text-xs text-gray-400">Placed: {new Date(ord.createdAt).toLocaleString()}</span>
                </div>
                <div>{renderStatusStepper(ord.status)}</div>
              </div>

              {/* Items grid details */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                
                {/* Product specifics list */}
                <div className="md:col-span-2 space-y-4">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Shipment Items ({ord.items.length})</span>
                  <div className="space-y-3" id={`history_items_list_${ord.id}`}>
                    {ord.items.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center text-xs border-b border-gray-50 pb-2 last:border-none last:pb-0">
                        <div className="min-w-0 pr-4">
                          <span className="font-bold text-gray-900 block truncate">{item.name}</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">Purchased Price: ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-gray-950 block">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-[10px] text-gray-400 font-semibold block uppercase">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recipient Shipping address card */}
                <div className="bg-gray-50 border border-gray-10/40 rounded-xl p-4.5 space-y-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span>Delivery Address</span>
                  </div>

                  <div className="text-xs text-gray-800 space-y-1">
                    <p className="font-bold text-gray-950 leading-tight">{ord.shippingAddress.fullName}</p>
                    <p className="text-gray-600 leading-relaxed mt-1">{ord.shippingAddress.street}</p>
                    <p className="text-gray-600 leading-none">{ord.shippingAddress.city}, {ord.shippingAddress.zipCode}</p>
                    <p className="text-gray-500 font-medium pt-2 block border-t border-gray-150 mt-2">Tel: {ord.shippingAddress.phone}</p>
                  </div>

                  <div className="border-t border-gray-150 pt-3 flex justify-between items-baseline font-sans">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase">Paid Gross</span>
                    <span className="text-sm font-extrabold text-gray-950">₹{ord.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

              </div>

              {/* Secure logistics footer banner description */}
              <div className="bg-emerald-50/20 border-t border-gray-100 py-3.5 px-6 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                <span>Our system logs every stage; transit speeds are backed by full freight transport indemnity protection.</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
