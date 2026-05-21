import React, { useState } from "react";
import { ShoppingCart, LogIn, LogOut, ShieldAlert, Package, ShoppingBag, Search, Filter } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  currentUser: User | null;
  cartCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onLogout: () => void;
}

const CATEGORIES = ["All", "Electronics", "Apparel", "Home Decor", "Accessories"];

export default function Navbar({
  currentUser,
  cartCount,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  onOpenAuth,
  onOpenCart,
  onLogout,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md" id="app_header">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div 
            className="flex cursor-pointer items-center gap-2" 
            onClick={() => { setActiveTab("store"); setActiveCategory("All"); }}
            id="nav_logo"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm transition hover:bg-gray-800">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-sans font-bold tracking-tight text-gray-900 text-lg">EcoStore</h1>
              <p className="font-sans text-[10px] text-gray-400 font-medium tracking-wide uppercase">Full-Stack Suite</p>
            </div>
          </div>

          {/* Search Input Bar (only shown when store is active) */}
          {activeTab === "store" && (
            <div className="relative flex max-w-md flex-1 items-center" id="nav_search_container">
              <div className="pointer-events-none absolute left-3 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search premium goods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 font-sans text-sm text-gray-900 transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gray-900"
                id="search_input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 font-sans text-xs font-semibold text-gray-400 hover:text-gray-600 focus:outline-none"
                  id="search_clear"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Nav Controls */}
          <div className="flex items-center gap-4" id="nav_controls">
            
            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1 font-sans text-sm font-medium" id="nav_tabs">
              <button
                onClick={() => setActiveTab("store")}
                className={`rounded-lg px-3 py-1.5 transition ${
                  activeTab === "store"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
                id="tab_store"
              >
                Store
              </button>

              {currentUser && (
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`relative rounded-lg px-3 py-1.5 transition flex items-center gap-1.5 ${
                    activeTab === "orders"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  id="tab_orders"
                >
                  <Package className="h-4 w-4" />
                  My Orders
                </button>
              )}

              {currentUser?.role === "admin" && (
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`rounded-lg px-3 py-1.5 transition flex items-center gap-1.5 ${
                    activeTab === "admin"
                      ? "bg-red-50 text-red-700 font-semibold"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                  id="tab_admin"
                >
                  <ShieldAlert className="h-4 w-4 text-red-600" />
                  Admin Control
                </button>
              )}
            </nav>

            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition shadow-xs"
              id="cart_toggle_btn"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account Controls */}
            {currentUser ? (
              <div className="flex items-center gap-2" id="user_logged_view">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="font-sans text-xs font-semibold text-gray-800 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className={`font-sans text-[9px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-full inline-block mt-0.5 self-end ${
                    currentUser.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
                
                <button
                  onClick={onLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 text-orange-600 hover:bg-orange-50 transition shadow-xs"
                  title="Logout Account"
                  id="logout_btn"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 font-sans text-sm font-semibold text-white shadow-xs transition hover:bg-gray-800"
                id="login_trigger_btn"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>

        {/* Categories Bar (Sub-navigation only on the store page view) */}
        {activeTab === "store" && (
          <div className="flex h-11 items-center justify-start overflow-x-auto gap-2 border-t border-gray-50 scrollbar-none" id="categories_nav">
            <span className="flex items-center gap-1.5 py-1 text-xs text-gray-400 font-semibold mr-2 font-sans shrink-0">
              <Filter className="h-3 w-3" />
              Filter By:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-sans text-xs font-medium rounded-full px-3.5 py-1.5 transition duration-150 shrink-0 ${
                  activeCategory === cat
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900"
                }`}
                id={`cat_${cat.toLowerCase().replace(" ", "_")}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

      </div>
    </header>
  );
}
