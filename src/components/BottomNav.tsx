"use client";

import { Home, Map, Ticket, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Map, label: "Map", path: "/dashboard/map" },
    { icon: Ticket, label: "Ticket", path: "/dashboard/ticket" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
