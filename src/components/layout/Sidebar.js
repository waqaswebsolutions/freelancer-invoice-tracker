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

export default function Sidebar({ onCollapse }) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load saved state after mount
  useEffect(() => {
    if (mounted && !isMobile) {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
    }
  }, [mounted, isMobile]);

  // Update main content margin when sidebar state changes
  useEffect(() => {
    if (!mounted) return;
    
    const mainContent = document.getElementById('dashboard-main-content');
    if (mainContent) {
      if (isMobile) {
        mainContent.style.marginLeft = '0px';
      } else {
        mainContent.style.marginLeft = isCollapsed ? '5rem' : '16rem';
      }
    }
  }, [isCollapsed, isMobile, mounted]);

  // Notify parent of state change
  useEffect(() => {
    if (!mounted) return;
    
    if (onCollapse) {
      onCollapse(isCollapsed);
    }
    if (!isMobile) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isMobile, onCollapse, mounted]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (isMobile) return null;

  return (
    <div
      className={`fixed inset-y-0 left-0 z-20 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div className="relative flex flex-col flex-1 min-h-0 bg-indigo-700">
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-indigo-600 text-white rounded-full p-1.5 hover:bg-indigo-500 transition-colors cursor-pointer shadow-lg z-10 hidden lg:block"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 cursor-pointer" />
          ) : (
            <ChevronLeft className="w-4 h-4 cursor-pointer" />
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
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer transition-all duration-200 ${isActive
                      ? "bg-indigo-800 text-white"
                      : "text-indigo-100 hover:bg-indigo-600"
                    } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                  title={isCollapsed ? item.name : ''}
                >
                  <item.icon
                    className={`flex-shrink-0 cursor-pointer ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
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
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-600 cursor-pointer transition-all duration-200 ${isCollapsed ? 'justify-center' : 'justify-start'
                }`}
              title={isCollapsed ? 'Sign Out' : ''}
            >
              <LogOut className={`flex-shrink-0 cursor-pointer ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5 mr-3'
                } text-indigo-300`} />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}