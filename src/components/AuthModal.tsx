import React, { useState } from "react";
import { X, Mail, Lock, User as UserIcon, ShieldAlert } from "lucide-react";
import { api } from "../api";
import { User } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

type AuthMode = "login" | "register";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const data = await api.login(email, password);
        onAuthSuccess(data.user);
        onClose();
        // Reset fields
        setEmail("");
        setPassword("");
      } else {
        if (!name) {
          throw new Error("Full Name is required for registration.");
        }
        const data = await api.register(name, email, password);
        onAuthSuccess(data.user);
        onClose();
        // Reset fields
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Immediate Quick Login for testing and evaluations
  const handleQuickLogin = async (role: "admin" | "buyer") => {
    setError(null);
    setLoading(true);
    try {
      const demoEmail = role === "admin" ? "admin@ecostore.com" : "buyer@ecostore.com";
      const demoPass = role === "admin" ? "adminpassword" : "buyerpassword";
      
      const data = await api.login(demoEmail, demoPass);
      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Quick Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/50 backdrop-blur-xs" id="auth_overlay">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-xl"
        id="auth_modal_container"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="font-sans font-bold text-gray-950 text-xl tracking-tight">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="font-sans text-xs text-gray-400 mt-0.5 font-medium leading-relaxed">
              {mode === "login" 
                ? "Enter your credentials to access your shopping hub" 
                : "Fill out details to secure your new e-commerce profile"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-55 hover:text-gray-700 transition"
            id="close_auth_btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs font-semibold text-red-700 flex items-start gap-2 animate-shake" id="auth_error">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="auth_credentials_form">
            {mode === "register" && (
              <div id="register_name_group">
                <label className="mb-1 block font-sans text-xs font-semibold uppercase tracking-wide text-gray-400">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your first and last name"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 font-sans text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:outline-none"
                    id="auth_name_input"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block font-sans text-xs font-semibold uppercase tracking-wide text-gray-400">Email Address</label>
              <div className="relative" id="email_group">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. username@example.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 font-sans text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:outline-none"
                  id="auth_email_input"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-sans text-xs font-semibold uppercase tracking-wide text-gray-400">Password</label>
              <div className="relative" id="password_group">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="• • • • • • • •"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 font-sans text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:outline-none"
                  id="auth_password_input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-900 py-2.5 font-sans text-sm font-bold text-white shadow-xs transition hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 focus:outline-none"
              id="auth_submit_btn"
            >
              {loading ? "Authenticating..." : mode === "login" ? "Sign In" : "Register"}
            </button>
          </form>

          {/* Prompt Toggle */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="font-sans text-xs font-semibold text-gray-600 hover:text-gray-955 hover:underline transition"
              id="auth_toggle_mode_btn"
            >
              {mode === "login" ? "Don't have an account? Sign up" : "Already registered? Login"}
            </button>
          </div>

          {/* Quick Demo Login Option Pane */}
          <div className="mt-6 border-t border-gray-150 pt-5" id="demo_accounts_panel">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-[11px] font-bold text-gray-400 uppercase tracking-wide">Developer Quick Logins</span>
              <span className="inline-block bg-purple-50 text-purple-700 border border-purple-100 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase leading-none">Seed Ready</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3" id="quick_login_grid">
              <button
                onClick={() => handleQuickLogin("admin")}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-red-200 bg-red-50/40 hover:bg-red-50 hover:border-red-400 transition"
                type="button"
                id="quick_login_admin"
              >
                <span className="font-sans text-xs font-bold text-red-700">Login as Admin</span>
                <span className="font-sans text-[10px] text-red-500 mt-0.5 font-medium">admin@ecostore.com</span>
              </button>

              <button
                onClick={() => handleQuickLogin("buyer")}
                className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-emerald-250 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-400 transition"
                type="button"
                id="quick_login_buyer"
              >
                <span className="font-sans text-xs font-bold text-emerald-800">Login as Buyer</span>
                <span className="font-sans text-[10px] text-emerald-600 mt-0.5 font-medium">buyer@ecostore.com</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
