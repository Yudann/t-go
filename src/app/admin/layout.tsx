// app/admin/layout.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
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
  { id: "stops", label: "Halte", icon: MapPin, href: "/admin/stops" },
  { id: "tickets", label: "Tiket", icon: Ticket, href: "/admin/tickets" },
  { id: "users", label: "Pengguna", icon: Users, href: "/admin/users" },
  {
    id: "analytics",
    label: "Analitik",
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

  // Simple admin check - in production, you should implement proper role-based auth
  //   const isAdmin =
  //     user?.email?.includes("admin") || user?.email === "admin@tgo.com";

  //   if (!isAdmin) {
  //     router.push("/dashboard");
  //     return null;
  //   }

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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex lg:shrink-0">
        <div className="flex flex-col w-64 bg-linear-to-b from-purple-700 to-purple-800 text-white">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-purple-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">T-Go Admin</h1>
                <p className="text-purple-200 text-xs">Management System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
                  activeItem === item.id
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-purple-100 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-purple-600">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-purple-200">Administrator</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-purple-100 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-80 max-w-sm h-full bg-linear-to-b from-purple-700 to-purple-800 text-white">
            <div className="flex items-center justify-between p-4 border-b border-purple-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Bus className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">T-Go Admin</h1>
                  <p className="text-purple-200 text-xs">Management System</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
                    activeItem === item.id
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-purple-100 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {menuItems.find((item) => item.id === activeItem)?.label}
                </h1>
                <p className="text-sm text-gray-600">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50/50">{children}</main>
      </div>
    </div>
  );
}
