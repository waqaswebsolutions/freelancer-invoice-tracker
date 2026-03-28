"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function SidebarWrapper() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load saved sidebar state
  useEffect(() => {
    if (!isMobile) {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
    }
  }, [isMobile]);

  // Update main content margin when sidebar state changes
  useEffect(() => {
    const mainContent = document.getElementById('dashboard-main-content');
    if (mainContent) {
      if (isMobile) {
        mainContent.style.marginLeft = '0px';
      } else {
        mainContent.style.marginLeft = isCollapsed ? '5rem' : '16rem';
      }
    }
  }, [isCollapsed, isMobile]);

  const handleSidebarCollapse = (collapsed) => {
    setIsCollapsed(collapsed);
  };

  return (
    <Sidebar onCollapse={handleSidebarCollapse} />
  );
}