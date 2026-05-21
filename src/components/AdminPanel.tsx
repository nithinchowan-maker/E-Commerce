import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Check, RefreshCw, BarChart3, Package, Settings, ShoppingBag, ShieldAlert } from "lucide-react";
import { Product, Order, OrderStatus } from "../types";
import { api } from "../api";

interface AdminPanelProps {
  onRefreshProducts: () => void;
}

export default function AdminPanel({ onRefreshProducts }: AdminPanelProps) {
  // Tabs: 'stats' | 'products' | 'orders'
  const [activeSubTab, setActiveSubTab] = useState<"stats" | "products" | "orders">("stats");

  // Local datasets
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for creating/editing a product
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("Electronics");
  const [formStock, setFormStock] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, productsData, ordersData] = await Promise.all([
        api.getStats(),
        api.getProducts(),
        api.getOrders(),
      ]);
      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err: any) {
      setError(err.message || "Failed to load admin dataset.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const clearForm = () => {
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormCategory("Electronics");
    setFormStock("");
    setFormImageUrl("");
    setIsEditing(false);
    setEditId(null);
  };

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const payload = {
      name: formName,
      description: formDesc,
      price: parseFloat(formPrice),
      category: formCategory,
      stock: parseInt(formStock, 10),
      imageUrl: formImageUrl || undefined,
    };

    try {
      if (isEditing && editId) {
        await api.updateProduct(editId, payload);
        setSuccessMsg(`Product updated successfully.`);
      } else {
        await api.createProduct(payload);
        setSuccessMsg(`Product published successfully.`);
      }
      clearForm();
      loadAdminData();
      onRefreshProducts(); // update main browse list
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    }
  };

  const handleEditTrigger = (prod: Product) => {
    setIsEditing(true);
    setEditId(prod.id);
    setFormName(prod.name);
    setFormDesc(prod.description);
    setFormPrice(prod.price.toString());
    setFormCategory(prod.category);
    setFormStock(prod.stock.toString());
    setFormImageUrl(prod.imageUrl);
    setActiveSubTab("products"); // scroll/switch to focus
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product? This action is permanent!")) {
      return;
    }
    setError(null);
    setSuccessMsg(null);
    try {
      await api.deleteProduct(id);
      setSuccessMsg("Product deleted successfully.");
      loadAdminData();
      onRefreshProducts();
    } catch (err: any) {
      setError(err.message || "Failed to delete product.");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setError(null);
    setSuccessMsg(null);
    try {
      await api.updateOrderStatus(orderId, status);
      setSuccessMsg(`Order ${orderId} updated to state: ${status}`);
      loadAdminData();
    } catch (err: any) {
      setError(err.message || "Failed to edit order status.");
    }
  };

  return (
    <div className="space-y-6" id="admin_control_panel">
      {/* Admin header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className="font-sans text-[10px] font-bold tracking-wider text-red-500 uppercase">Control Console</span>
          <h2 className="font-sans font-bold text-gray-950 text-xl tracking-tight mt-0.5">Administrative Dashboard</h2>
          <p className="font-sans text-xs text-gray-400 mt-1">Manage active stock, configure products, look up statistics, and coordinate logistics.</p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 font-sans text-xs font-semibold text-gray-600 shadow-xs hover:bg-gray-50 active:scale-95 transition"
          id="admin_refresh_btn"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Sync Database</span>
        </button>
      </div>

      {/* Notifications bar */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2" id="admin_error">
          <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2" id="admin_success">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin Subtabs Layout */}
      <div className="flex gap-1.5 border-b border-gray-100 pb-px" id="admin_sub_nav">
        <button
          onClick={() => setActiveSubTab("stats")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2 font-sans text-xs font-bold leading-normal transition ${
            activeSubTab === "stats"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
          id="subtab_stats"
        >
          <BarChart3 className="h-4 w-4" />
          Metrics & Insights
        </button>

        <button
          onClick={() => setActiveSubTab("products")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2 font-sans text-xs font-bold leading-normal transition ${
            activeSubTab === "products"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
          id="subtab_products"
        >
          <ShoppingBag className="h-4 w-4" />
          Catalog Editor ({products.length})
        </button>

        <button
          onClick={() => setActiveSubTab("orders")}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2 font-sans text-xs font-bold leading-normal transition ${
            activeSubTab === "orders"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
          id="subtab_orders"
        >
          <Package className="h-4 w-4" />
          Customer Orders ({orders.length})
        </button>
      </div>

      {/* TABS CONTAINER */}
      <div id="admin_subtab_content">
        
        {/* TAB 1: METRICS & INSIGHTS */}
        {activeSubTab === "stats" && stats && (
          <div className="space-y-6 animate-fade" id="admin_stats_view">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="kpi_grid">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-3xs" id="kpi_revenue">
                <span className="font-sans text-[10px] font-bold text-gray-400 uppercase tracking-wide">Gross Revenue</span>
                <p className="font-sans text-xl font-extrabold text-gray-950 mt-1">₹{stats.totals.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                <div className="mt-2 text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-sm inline-block uppercase">Fulfillment active</div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-3xs" id="kpi_orders">
                <span className="font-sans text-[10px] font-bold text-gray-400 uppercase tracking-wide">Orders Placed</span>
                <p className="font-sans text-xl font-extrabold text-gray-950 mt-1">{stats.totals.ordersCount}</p>
                <div className="mt-2 text-[9px] text-gray-550 font-semibold bg-gray-50 px-1.5 py-0.5 rounded-sm inline-block uppercase">Pending status included</div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-3xs" id="kpi_catalog">
                <span className="font-sans text-[10px] font-bold text-gray-400 uppercase tracking-wide">Catalog Size</span>
                <p className="font-sans text-xl font-extrabold text-gray-950 mt-1">{stats.totals.productsCount}</p>
                <div className="mt-2 text-[9px] text-gray-550 font-semibold bg-gray-50 px-1.5 py-0.5 rounded-sm inline-block uppercase">Active items</div>
              </div>

              <div className="rounded-2xl border border-red-100 bg-red-50/20 p-4 shadow-3xs" id="kpi_lowstock">
                <span className="font-sans text-[10px] font-bold text-red-650 uppercase tracking-wide">Low Stock Alert</span>
                <p className="font-sans text-xl font-extrabold text-red-700 mt-1">{stats.totals.lowStockItemsCount}</p>
                <div className="mt-2 text-[9px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded-sm inline-block uppercase">&le; 5 units left</div>
              </div>
            </div>

            {/* Visual Charts + Diagnostics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="stats_visual_diagnostics">
              
              {/* Visualized Category Sales Bar-Chart */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-3xs">
                <div className="mb-4">
                  <h4 className="font-sans font-bold text-gray-950 text-xs uppercase tracking-wide">Revenue Analysis By Category</h4>
                  <p className="font-sans text-[11px] text-gray-400">Aggregated payments of non-cancelled orders on base category cataloging</p>
                </div>

                {stats.categoryChartData && stats.categoryChartData.length > 0 ? (
                  <div className="space-y-4 pt-1" id="category_bar_chart">
                    {stats.categoryChartData.map((item: any, idx: number) => {
                      const maxVal = Math.max(...stats.categoryChartData.map((d: any) => d.value), 1);
                      const percentage = Math.min(100, Math.round((item.value / maxVal) * 100));
                      return (
                        <div key={item.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-sans">
                            <span className="font-medium text-gray-700">{item.name}</span>
                            <span className="font-bold text-gray-950">₹{item.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gray-905 rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center h-48 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <p className="font-sans text-xs text-gray-400">No category sales metrics generated yet.</p>
                  </div>
                )}
              </div>

              {/* Recent Active Orders List summary */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-3xs">
                <div className="mb-4">
                  <h4 className="font-sans font-bold text-gray-950 text-xs uppercase tracking-wide">Recent Customer Orders</h4>
                  <p className="font-sans text-[11px] text-gray-400">Overview of the last 5 transactions placed across the platform</p>
                </div>

                {orders.length > 0 ? (
                  <div className="divide-y divide-gray-100" id="recent_orders_summary">
                    {orders.slice(0, 5).map((ord) => (
                      <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs font-sans">
                        <div className="min-w-0">
                          <span className="font-bold text-gray-900 block truncate">{ord.shippingAddress.fullName}</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">{ord.id} • {ord.items.length} items</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 block font-sans">₹{ord.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          <span className={`inline-block text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full mt-0.5 ${
                            ord.status === "delivered" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : ord.status === "cancelled" 
                              ? "bg-red-100 text-red-850" 
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center h-48 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <p className="font-sans text-xs text-gray-400">Waiting for first checked-out order.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: CATALOG EDITOR & PRODUCT CONFIGURATION */}
        {activeSubTab === "products" && (
          <div className="space-y-6 animate-fade" id="admin_products_view">
            
            {/* Create / Edit Form card */}
            <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs" id="product_config_form_container">
              <div className="mb-4">
                <h4 className="font-sans font-bold text-gray-950 text-sm">
                  {isEditing ? "Modify Product Details" : "Publish New Product to Catalog"}
                </h4>
                <p className="font-sans text-xs text-gray-400 mt-0.5">Please check description lines and imagery links precisely prior to submission.</p>
              </div>

              <form onSubmit={handleCreateOrUpdateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4" id="admin_product_form">
                <div>
                  <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mechanical Tactile Keyboard"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 font-sans text-xs text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none"
                    id="admin_form_name"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">Category Tag</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 shadow-3xs font-sans text-xs text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none"
                    id="admin_form_category"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">Price (₹ INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 89.99"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 font-sans text-xs text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none"
                      id="admin_form_price"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">Stock Count</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 25"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 font-sans text-xs text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none"
                      id="admin_form_stock"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">Stock Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... (optional)"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 font-sans text-xs text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none"
                    id="admin_form_imageurl"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400">Product Full Description</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Enter full technical details, dimensions, material characteristics, and user features..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 font-sans text-xs text-gray-900 focus:border-gray-900 focus:bg-white focus:outline-none"
                    id="admin_form_desc"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={clearForm}
                      className="rounded-xl border border-gray-255 px-4 py-2 font-sans text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                      id="cancel_edit_btn"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="rounded-xl bg-gray-950 px-5 py-2 font-sans text-xs font-bold text-white shadow-xs hover:bg-gray-850 active:scale-95 transition"
                    id="submit_product_btn"
                  >
                    {isEditing ? "Save Configuration" : "Publish Entry"}
                  </button>
                </div>
              </form>
            </div>

            {/* Catalog list details table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-3xs" id="product_catalog_manager_table">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h4 className="font-sans font-bold text-gray-950 text-xs uppercase tracking-wide">Live Catalog Management ({products.length} Products)</h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-3xl table-auto text-left font-sans text-xs">
                  <thead className="bg-gray-10/40 text-gray-450 uppercase text-[9px] font-bold tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-4">Visual</th>
                      <th className="p-4">Product Details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Inventory Stock</th>
                      <th className="p-4 text-center">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100" id="admin_products_tbody">
                    {products.map((prod) => {
                      const isLow = prod.stock <= 5;
                      return (
                        <tr key={prod.id} className="hover:bg-gray-50/50 transition">
                          <td className="p-4">
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="h-10 w-10 rounded-lg object-cover bg-gray-50 border border-gray-100"
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="p-4 max-w-xs">
                            <span className="font-bold text-gray-900 block truncate">{prod.name}</span>
                            <span className="text-[10px] text-gray-400 block truncate" title={prod.description}>
                              {prod.description}
                            </span>
                            <span className="text-[9px] font-mono text-gray-400 mt-0.5 block">{prod.id}</span>
                          </td>
                          <td className="p-4">
                            <span className="inline-block bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                              {prod.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-gray-950 font-sans">₹{prod.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </td>
                          <td className="p-4">
                            <span className={`font-bold ${isLow ? "text-red-650" : "text-gray-850"}`}>
                              {prod.stock} units
                            </span>
                            {isLow && (
                              <span className="text-[9px] text-red-500 font-bold block">Reorder stock</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditTrigger(prod)}
                                className="p-1.5 rounded-lg border border-gray-100 text-gray-650 hover:bg-white hover:text-gray-950 hover:shadow-xs transition"
                                title="Edit Product properties"
                                id={`edit_prod_${prod.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition"
                                title="Purge product from catalog"
                                id={`delete_prod_${prod.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CUSTOMER ORDERS PROCESSING */}
        {activeSubTab === "orders" && (
          <div className="space-y-6 animate-fade" id="admin_orders_view">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-3xs" id="orders_logistics_desk">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h4 className="font-sans font-bold text-gray-950 text-xs uppercase tracking-wide">Customer Fulfillment Panel ({orders.length} orders total)</h4>
              </div>

              {orders.length === 0 ? (
                <div className="p-12 text-center" id="admin_empty_orders_view">
                  <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="font-sans text-xs text-gray-400">Waiting for first user transaction.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100" id="admin_orders_list">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-6 flex flex-col lg:flex-row gap-6 justify-between items-start" id={`admin_order_card_${ord.id}`}>
                      
                      {/* Left Block Spec properties */}
                      <div className="space-y-3 flex-1 min-w-0 font-sans">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-gray-900 text-sm">Order {ord.id}</span>
                          <span className="text-[11px] text-gray-450">• {new Date(ord.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="text-xs text-gray-650 space-y-1">
                          <p><span className="font-bold text-gray-800">Buyer:</span> {ord.shippingAddress.fullName} ({ord.userEmail})</p>
                          <p><span className="font-bold text-gray-800">Destination:</span> {ord.shippingAddress.street}, {ord.shippingAddress.city} {ord.shippingAddress.zipCode}</p>
                          <p><span className="font-bold text-gray-800">Contact Telephone:</span> {ord.shippingAddress.phone}</p>
                        </div>

                        {/* Items listed */}
                        <div className="bg-gray-50 border border-gray-10/40 rounded-xl p-3 max-w-lg space-y-1.5" id={`ord_items_${ord.id}`}>
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Ordered Items</span>
                          {ord.items.map((item) => (
                            <div key={item.productId} className="flex justify-between items-center text-xs">
                              <span className="text-gray-700 truncate max-w-xs">{item.name} <span className="text-gray-400 font-semibold">x {item.quantity}</span></span>
                              <span className="font-bold text-gray-900 font-sans">₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Block Status Control */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 w-full lg:w-auto font-sans">
                        <div className="lg:text-right">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">Total Cost Price</span>
                          <span className="text-lg font-extrabold text-gray-950 font-sans">₹{ord.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide">Fulfillment Status</label>
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                              className={`rounded-xl border border-gray-250 py-1.5 px-3 font-sans text-xs font-bold leading-normal shadow-3xs focus:outline-none focus:ring-1 focus:ring-gray-900 ${
                                ord.status === "delivered" 
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                  : ord.status === "cancelled" 
                                  ? "bg-red-50 text-red-800 border-red-200" 
                                  : ord.status === "shipped" 
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                              id={`status_select_${ord.id}`}
                            >
                              <option value="pending">Pending Review</option>
                              <option value="processing">Processing & Pack</option>
                              <option value="shipped">On Shipped Transit</option>
                              <option value="delivered">Delivered Safely</option>
                              <option value="cancelled">Cancelled/Revoke Stock</option>
                            </select>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
