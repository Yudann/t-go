// app/admin/layout.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useThemeStore } from "@/lib/store";
import {
  LayoutDashboard,
  Bus,
  Users,
  Ticket,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  MapPin,
  Wallet,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  { id: "routes", label: "Kelola Rute", icon: Bus, href: "/admin/routes" },
  { id: "stops", label: "Database Halte", icon: MapPin, href: "/admin/stops" },
  {
    id: "tickets",
    label: "Tiket Perjalanan",
    icon: Ticket,
    href: "/admin/tickets",
  },
  { id: "users", label: "Data Pengguna", icon: Users, href: "/admin/users" },
  { id: "wallet", label: "Keuangan", icon: Wallet, href: "/admin/wallet" }, // Added Wallet
  {
    id: "analytics",
    label: "Analitik Data",
    icon: BarChart3,
    href: "/admin/analytics",
  },
  {
    id: "settings",
    label: "Pengaturan",
    icon: Settings,
    href: "/admin/settings",
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  useEffect(() => {
    // Determine active item based on path
    const path = window.location.pathname;
    const active = menuItems.find(
      (item) =>
        path === item.href ||
        (path.startsWith(item.href) && item.href !== "/admin")
    )?.id;
    if (active) setActiveItem(active);
  }, []);

  const handleNavigation = (item: (typeof menuItems)[0]) => {
    setActiveItem(item.id);
    router.push(item.href);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div
      className={`flex h-screen transition-colors duration-300 ${
        isDarkMode ? "dark bg-[#121216]" : "bg-gray-50"
      }`}
    >
      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex lg:shrink-0">
        <div
          className={`flex flex-col w-64 transition-colors border-r ${
            isDarkMode
              ? "bg-[#1A1A20] border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Logo */}
          <div
            className={`flex items-center justify-between px-6 py-6 border-b ${
              isDarkMode ? "border-gray-800" : "border-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-linear-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1
                  className={`text-lg font-black tracking-tight ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  T-Go Admin
                </h1>
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  Management
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
            <p
              className={`px-4 text-[10px] font-black uppercase tracking-widest mb-2 ${
                isDarkMode ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Menu Utama
            </p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 group text-sm font-semibold",
                  activeItem === item.id
                    ? isDarkMode
                      ? "bg-purple-500/10 text-purple-400"
                      : "bg-purple-50 text-purple-700 shadow-sm"
                    : isDarkMode
                    ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    activeItem === item.id
                      ? "text-purple-500"
                      : "text-gray-400 group-hover:text-purple-500"
                  )}
                />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div
            className={`p-4 border-t space-y-2 ${
              isDarkMode ? "border-gray-800" : "border-gray-100"
            }`}
          >
            <div
              className={`p-3 rounded-2xl flex items-center gap-3 ${
                isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-bold truncate ${
                    isDarkMode ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  {user?.email || "admin@tgo.com"}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  Super Admin
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={toggleDarkMode}
                variant="outline"
                size="sm"
                className={`border-0 h-9 ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className={`h-9 ${
                  isDarkMode
                    ? "text-red-400 hover:bg-red-900/20 hover:text-red-300"
                    : "text-red-500 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={`relative flex flex-col w-72 h-full shadow-2xl transition-transform ${
              isDarkMode ? "bg-[#1A1A20]" : "bg-white"
            }`}
          >
            {/* Mobile Header */}
            <div
              className={`flex items-center justify-between p-6 border-b ${
                isDarkMode ? "border-gray-800" : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
                  <Bus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1
                    className={`text-lg font-black ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    T-Go Admin
                  </h1>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`p-1 rounded-lg ${
                  isDarkMode
                    ? "hover:bg-gray-800 text-gray-400"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <p
                className={`px-4 text-[10px] font-black uppercase tracking-widest mb-2 ${
                  isDarkMode ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Menu
              </p>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-sm font-semibold",
                    activeItem === item.id
                      ? isDarkMode
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-purple-50 text-purple-700 shadow-sm"
                      : isDarkMode
                      ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4",
                      activeItem === item.id
                        ? "text-purple-500"
                        : "text-gray-400"
                    )}
                  />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div
              className={`p-4 border-t ${
                isDarkMode ? "border-gray-800" : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${
                      isDarkMode ? "text-gray-200" : "text-gray-900"
                    }`}
                  >
                    {user?.email}
                  </p>
                  <p className="text-[10px] text-gray-400">Admin</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="flex-1"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="flex-1"
                >
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar - Mobile Only */}
        <header
          className={`lg:hidden shadow-sm border-b z-40 ${
            isDarkMode
              ? "bg-[#1A1A20] border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-lg ${
                  isDarkMode
                    ? "hover:bg-gray-800 text-gray-200"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1
                className={`text-sm font-bold ${
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {menuItems.find((item) => item.id === activeItem)?.label}
              </h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className={`flex-1 overflow-auto ${
            isDarkMode ? "bg-[#121216]" : "bg-gray-50"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
