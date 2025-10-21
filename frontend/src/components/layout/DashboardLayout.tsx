import { Sidebar } from "./Sidebar";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint is 1024px
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Expose sidebar toggle function globally for navbar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).toggleDashboardSidebar = () => setSidebarOpen(prev => !prev);
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="p-4">
        <Sidebar role={user.role} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${isMobile ? 'pt-16' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
