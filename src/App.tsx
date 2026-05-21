import React, { useEffect, useState } from "react";
import { Package, ShieldAlert, Sparkles, Filter, SlidersHorizontal, Layers, CheckCircle } from "lucide-react";
import { Product, CartItem, User } from "./types";
import { api } from "./api";

// Core Components imports
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import AuthModal from "./components/AuthModal";
import CartDrawer from "./components/CartDrawer";
import ProductDetailModal from "./components/ProductDetailModal";
import AdminPanel from "./components/AdminPanel";
import OrderHistory from "./components/OrderHistory";

export default function App() {
  // Authentication & session state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Layout navigation state: 'store' | 'orders' | 'admin'
  const [activeTab, setActiveTab] = useState<string>("store");

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("rating"); // 'rating' | 'price_asc' | 'price_desc'

  // Product catalog datasets
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Cart listings state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Dialog controllers
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Top Action toast messages
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load user session on boot
  useEffect(() => {
    const user = api.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    // Load active cart state from localStorage
    const savedCart = localStorage.getItem("ecostore_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        // Safe reset
      }
    }
  }, []);

  // Fetch products catalogue upon filter adjustments
  const fetchProductCatalog = async () => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const data = await api.getProducts({
        search: searchQuery,
        category: activeCategory,
        sortBy: sortBy,
      });
      setProducts(data);
    } catch (err: any) {
      setProductsError(err.message || "Failed to download active catalog.");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProductCatalog();
  }, [searchQuery, activeCategory, sortBy]);

  // Sync cart listings to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCartItems(newCart);
    localStorage.setItem("ecostore_cart", JSON.stringify(newCart));
  };

  const spawnToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Add Item to Shopping Cart
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    const existingIdx = cartItems.findIndex((item) => item.product.id === product.id);
    const newCart = [...cartItems];

    if (existingIdx > -1) {
      const currentQty = newCart[existingIdx].quantity;
      if (currentQty + quantity > product.stock) {
        spawnToast(`Cannot exceed local stock limit! Available: ${product.stock}`);
        return;
      }
      newCart[existingIdx].quantity += quantity;
    } else {
      if (quantity > product.stock) {
        spawnToast(`We only have ${product.stock} units left in stock.`);
        return;
      }
      newCart.push({ product, quantity });
    }

    saveCart(newCart);
    spawnToast(`Added ${quantity}x "${product.name}" to cart.`);
  };

  // Buy Now immediately performs add-to-cart and focuses the checkout drawer
  const handleBuyNow = (product: Product) => {
    const existingIdx = cartItems.findIndex((item) => item.product.id === product.id);
    const currentQty = existingIdx > -1 ? cartItems[existingIdx].quantity : 0;
    
    if (currentQty + 1 > product.stock) {
      spawnToast(`We only have ${product.stock} units left in stock.`);
      return;
    }

    // Call standard add to cart with 1 unit
    const newCart = [...cartItems];
    if (existingIdx > -1) {
      newCart[existingIdx].quantity += 1;
    } else {
      newCart.push({ product, quantity: 1 });
    }
    saveCart(newCart);
    spawnToast(`Initiating purchase for "${product.name}".`);
    setIsCartOpen(true);
  };

  // Update specific item quantity inside Cart Drawer
  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    const item = cartItems.find((ci) => ci.product.id === productId);
    if (item && quantity > item.product.stock) {
      spawnToast(`Only ${item.product.stock} units available in warehouses.`);
      return;
    }

    const newCart = cartItems.map((ci) => {
      if (ci.product.id === productId) {
        return { ...ci, quantity };
      }
      return ci;
    });
    saveCart(newCart);
  };

  // Remove single item completely from cart
  const handleRemoveCartItem = (productId: string) => {
    const newCart = cartItems.filter((ci) => ci.product.id !== productId);
    saveCart(newCart);
    spawnToast("Removed item from cart.");
  };

  // Place Checkout request on backend
  const handleCheckout = async (shippingAddress: any) => {
    const formattedItems = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    try {
      const placedOrder = await api.createOrder({
        items: formattedItems,
        shippingAddress,
      });

      // Synchronously update stock count inside client catalog listing
      setProducts((currentProds) => {
        return currentProds.map((p) => {
          const matchedItem = cartItems.find((ci) => ci.product.id === p.id);
          if (matchedItem) {
            return { ...p, stock: p.stock - matchedItem.quantity };
          }
          return p;
        });
      });

      // Clear Cart entirely
      saveCart([]);
      spawnToast(`Checkout Successful! Transacted: ${placedOrder.id}`);
      setActiveTab("orders"); // route user forward to see tracking statuses immediately
    } catch (err: any) {
      throw new Error(err.message || "Failed to process database checkout.");
    }
  };

  // Trigger quick details modal popup
  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  // Handle successful logins/registrations
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    spawnToast(`Logged in successfully! Hello, ${user.name}`);
  };

  // Handle sign out
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setActiveTab("store");
    spawnToast("Logged out from EcoStore.");
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between" id="app_frame">
      <div className="w-full">
        
        {/* Main Navbar */}
        <Navbar
          currentUser={currentUser}
          cartCount={totalCartCount}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onLogout={handleLogout}
        />

        {/* Global Floating Action Toast Alert */}
        {toastMessage && (
          <div 
            className="fixed bottom-6 left-6 z-50 rounded-2xl bg-gray-950 text-white shadow-lg border border-gray-800 p-4 shrink-0 flex items-center gap-3 animate-fade-in-up"
            id="toast_alert"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white leading-none">
              <CheckCircle className="h-3 w-3" />
            </div>
            <span className="font-sans text-xs font-semibold leading-none">{toastMessage}</span>
          </div>
        )}

        {/* Main Page Body Frame */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          
          {/* TAB 1: STORE MAIN CATALOG BROWSER VIEW */}
          {activeTab === "store" && (
            <div className="space-y-6" id="dashboard_store_view">
              
              {/* Premium Promotional Hero Header Card panel */}
              {searchQuery === "" && (
                <div 
                  className="relative overflow-hidden rounded-3xl bg-gray-900 border border-gray-850 px-6 py-10 sm:px-12 sm:py-16 text-white shadow-lg flex flex-col justify-center min-h-60 sm:min-h-72"
                  id="promo_hero_banner"
                >
                  {/* Subtle decorative visual elements */}
                  <div className="absolute top-0 right-0 h-full w-1/2 opacity-25 pointer-events-none select-none">
                    <svg className="h-full w-full object-cover" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
                      <line x1="10" y1="0" x2="90" y2="100" stroke="#fff" strokeWidth="0.1" />
                      <line x1="30" y1="0" x2="110" y2="100" stroke="#fff" strokeWidth="0.1" strokeDasharray="2" />
                      <circle cx="80" cy="50" r="15" stroke="#fff" strokeWidth="0.05" />
                    </svg>
                  </div>

                  <div className="relative z-10 max-w-lg space-y-4">
                    <div className="flex items-center gap-2 rounded-full bg-amber-500/90 text-gray-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 w-fit">
                      <Sparkles className="h-3 w-3" />
                      <span>Premium Curated Collections</span>
                    </div>

                    <h2 className="font-sans font-bold leading-tight tracking-tight text-2xl sm:text-4xl text-white">
                      The Spring Organic & Productivity Suite
                    </h2>

                    <p className="font-sans text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md">
                      Meticulously designed standing desks, high-resolution acoustics, hand-finished boutique ceramics, and robust selvedge denim built to withstand a lifetime.
                    </p>

                    <div className="pt-2">
                      <span className="font-sans text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs">
                        Free Worldwide Cargo Freight
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Subheader and Sorting Select elements */}
              <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <p className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {activeCategory === "All" ? "Total Collection" : `Category: ${activeCategory}`}
                  </p>
                </div>

                {/* Grid Sorting Dropdown Controls */}
                <div className="flex items-center gap-2" id="sorting_panel">
                  <span className="font-sans text-xs text-gray-400 font-semibold flex items-center gap-1 shrink-0">
                    <SlidersHorizontal className="h-3 w-3" />
                    Order By:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 font-sans text-xs font-bold leading-normal text-gray-700 shadow-3xs outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    id="sort_selector"
                  >
                    <option value="rating">Stars (Highly Rated First)</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Loading indicators */}
              {loadingProducts ? (
                <div className="text-center py-20" id="products_loading">
                  <p className="font-sans text-xs text-gray-400">Restructuring premium catalog items...</p>
                </div>
              ) : productsError ? (
                <div className="rounded-xl bg-red-50 border border-red-100 p-4.5 text-xs font-semibold text-red-700 flex items-center gap-2" id="products_failure">
                  <ShieldAlert className="h-5 w-5 text-red-650" />
                  <span>{productsError}. Try syncing backend database.</span>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center" id="products_empty_state">
                  <p className="font-sans text-xs text-gray-400 font-semibold mb-2">No matching products found</p>
                  <button
                    onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                    className="font-sans text-xs font-bold text-gray-900 underline"
                  >
                    Reset all category search filters
                  </button>
                </div>
              ) : (
                /* Main Listings Responsive Bento-Grid */
                <div 
                  className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  id="products_catalog_grid"
                >
                  {products.map((item) => (
                    <ProductCard
                      key={item.id}
                      product={item}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onBuyNow={handleBuyNow}
                      onQuickView={handleQuickView}
                    />
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: BUYER TRANSIT LOG TRACKING */}
          {activeTab === "orders" && currentUser && (
            <div className="animate-fade-in" id="buyer_orders_view">
              <OrderHistory currentUserEmail={currentUser.email} />
            </div>
          )}

          {/* TAB 3: ADMINISTRATOR CENTRAL MANAGEMENT */}
          {activeTab === "admin" && currentUser?.role === "admin" && (
            <div className="animate-fade-in" id="admin_console_view">
              <AdminPanel onRefreshProducts={fetchProductCatalog} />
            </div>
          )}

        </main>
      </div>

      {/* FOOTER DIAGNOSTICS DECK */}
      <footer className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 border-t border-gray-150 py-8 mt-12 bg-white" id="main_footer">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-sans text-[11px] text-gray-400 font-medium">
            <span className="font-bold text-gray-700">EcoStore Suite </span>
            • Perfect Full-stack execution Sandbox powered by Local Persistent DB.
          </div>

          <div className="flex items-center gap-2 text-[10px] py-1 px-3 border border-gray-150 rounded-full font-mono text-gray-400 bg-gray-50 hover:bg-gray-100 transition shrink-0">
            <Layers className="h-3.5 w-3.5 text-gray-400" />
            <span>Port: 3000 • Engine CJS build verified</span>
          </div>
        </div>
      </footer>

      {/* POPUP OVERLAYS */}
      
      {/* 1. Account registration & login Dialog modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 2. Cart sidebar drawer drawer checkout workflow */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        isLoggedIn={!!currentUser}
        onOpenAuth={() => {
          setIsCartOpen(false);
          setIsAuthOpen(true);
        }}
        onCheckout={handleCheckout}
      />

      {/* 3. Product Quickspec detail overlay modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
        onBuyNow={(prod, qty) => {
          handleAddToCart(prod, qty);
          setIsCartOpen(true);
        }}
      />

    </div>
  );
}
