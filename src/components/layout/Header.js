"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { useState } from "react";
import MobileSidebar from "./MobileSidebar";

export default function Header() {
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <MobileSidebar open={sidebarOpen} onClose={closeSidebar} />
      
      <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
        <button
          type="button"
          className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={openSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6 cursor-pointer" />
        </button>
        
        <div className="flex-1 flex justify-between px-4">
          <div className="flex-1 flex items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome back, {user?.firstName || 'Freelancer'}!
            </h2>
          </div>
          
          <div className="ml-4 flex items-center md:ml-6">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </>
  );
}