"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Menu, X, Home, Image, Briefcase, LogOut, HelpCircle } from "lucide-react";
import { fetchAdminDataByUserId } from "@/lib/utils/admin-data";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if user is authenticated and an admin
  const { data: adminData, isLoading, error } = useQuery({
    queryKey: ["adminUser"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        throw new Error("Not authenticated");
      }
      
      // Check if user is admin and get their data
      const { data: adminUsers, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", session.user.id);
        
      const adminUser = adminUsers && adminUsers.length > 0 ? adminUsers[0] : null;
        
      if (adminError || !adminUser) {
        router.push("/");
        throw new Error("Not authorized as admin");
      }
      
      // Check if user has one of the allowed admin emails
      if (adminUser.email !== '4hisglorymakeup@gmail.com' && adminUser.email !== 'bduran04@gmail.com') {
        router.push("/");
        throw new Error("Not authorized as admin");
      }
      
      // Fetch admin data using utility function
      const adminData = await fetchAdminDataByUserId(session.user.id);
      
      if (!adminData) {
        throw new Error("Failed to fetch admin data");
      }
      
      return { ...adminUser, ...adminData };
    },
    retry: false
  });

  // Navigation items with icons
  const navItems = [
    { 
      path: "/admin", 
      label: "Dashboard", 
      icon: Home,
      exact: true 
    },
    { 
      path: "/admin/services", 
      label: "Services",
      icon: Briefcase
    },
    { 
      path: "/admin/gallery", 
      label: "Gallery",
      icon: Image
    },
       { 
      path: "/admin/faqs", 
      label: "FAQs",
      icon: HelpCircle
    },
  ];

  // Check if path is active
  const isActive = (path: string, exact = false) => {
    if (exact) {
      return pathname === path;
    }
    return pathname === path || pathname?.startsWith(path + "/");
  };

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beauty-brown mx-auto mb-4"></div>
          <p className="text-beauty-brown">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">Access denied. Please log in as an admin.</p>
          <button 
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo/Title and Mobile Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="mr-3 p-2 rounded-md text-beauty-brown hover:bg-beauty-beige focus:outline-none focus:ring-2 focus:ring-beauty-gold lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-beauty-brown">Admin Panel</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Content Management</p>
              </div>
            </div>

            {/* Right side - User info and sign out */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="text-xs font-medium text-beauty-brown truncate max-w-32">
                  {adminData?.email}
                </p>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center px-2 sm:px-3 py-1 sm:py-2 bg-beauty-beige text-beauty-brown rounded hover:bg-beauty-brown hover:text-white focus:outline-none focus:ring-2 focus:ring-beauty-gold transition text-sm"
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="fixed inset-y-0 left-0 w-80 max-w-sm bg-white shadow-xl">
            {/* Mobile menu header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-semibold text-beauty-brown">Navigation</h2>
                <p className="text-sm text-gray-500">{adminData?.email}</p>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-500 hover:text-beauty-brown hover:bg-beauty-beige focus:outline-none focus:ring-2 focus:ring-beauty-gold"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile navigation items */}
            <nav className="p-4">
              <ul className="space-y-3">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`flex items-center px-4 py-3 rounded-lg transition ${
                          isActive(item.path, item.exact)
                            ? "bg-beauty-brown text-white"
                            : "text-gray-700 hover:bg-beauty-beige hover:text-beauty-brown"
                        }`}
                      >
                        <IconComponent className="h-5 w-5 mr-3" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              
              {/* Mobile sign out button */}
              <div className="mt-8 pt-4 border-t">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <nav className="hidden lg:flex lg:flex-col lg:w-64 bg-white shadow-sm border-r">
          <div className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition ${
                        isActive(item.path, item.exact)
                          ? "bg-beauty-brown text-white"
                          : "text-gray-700 hover:bg-beauty-beige hover:text-beauty-brown"
                      }`}
                    >
                      <IconComponent className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}