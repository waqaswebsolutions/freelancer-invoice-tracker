"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const mainContent = document.getElementById('dashboard-main-content');
    if (mainContent) {
      if (isCollapsed) {
        mainContent.style.paddingLeft = '5rem';
      } else {
        mainContent.style.paddingLeft = '16rem';
      }
    }
    
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed, mounted]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Always render the sidebar - no placeholder
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out bg-indigo-700 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-indigo-600 text-white rounded-full p-1.5 hover:bg-indigo-500 transition-colors cursor-pointer shadow-lg z-50"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Logo area */}
      <div className="flex items-center flex-shrink-0 h-16 px-4 bg-indigo-800">
        {!isCollapsed ? (
          <h1 className="text-xl font-bold text-white truncate">InvoiceTracker</h1>
        ) : (
          <span className="mx-auto text-xl font-bold text-white">IT</span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-100 hover:bg-indigo-600"
                } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                title={isCollapsed ? item.name : ''}
              >
                <item.icon
                  className={`flex-shrink-0 ${
                    isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
                  } ${isActive ? "text-white" : "text-indigo-300"}`}
                />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </Link>
            );
          })}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-600 cursor-pointer transition-all duration-200 ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
            title={isCollapsed ? 'Sign Out' : ''}
          >
            <LogOut className={`flex-shrink-0 ${
              isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
            } text-indigo-300`} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </nav>
      </div>
    </div>
  );
}