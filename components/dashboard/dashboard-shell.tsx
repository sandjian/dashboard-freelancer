"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/header";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { DesktopSidebar } from "./desktop-sidebar";
import { Toaster } from "@/components/ui/sonner";

const SIDEBAR_STORAGE_KEY = "avalon_sidebar_open";

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: { name?: string | null; email?: string | null; image?: string | null };
}) {
  // Initialize with true, sync with localStorage to avoid hydration mismatch
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) {
        setSidebarOpen(stored === "true");
      }
    } catch {
      // Ignore localStorage access restrictions in restricted environments
    }
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col xl:h-screen xl:flex-row xl:overflow-hidden bg-zinc-100/70 dark:bg-[#07090c] relative selection:bg-teal-500/20 selection:text-teal-900 dark:selection:text-teal-200">
      {/* Mobile & Tablet Header (< xl): Menu hamburguesa que despliega desde arriba */}
      <MobileHeader user={user} />

      {/* Desktop Sidebar (visible solo a partir de xl) con botón de colapso/cierre elegante */}
      <DesktopSidebar
        user={user}
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
      />

      {/* Main Content Area: Fluido sin scroll horizontal indeseado */}
      <div className="flex-grow flex flex-col xl:overflow-y-auto relative z-10 min-w-0">
        <Header user={user} />
        <div className="flex-grow px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </div>
        <Toaster />
      </div>
    </div>
  );
}
