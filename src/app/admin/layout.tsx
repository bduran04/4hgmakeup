"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Check if user is authenticated and an admin
  const { data: adminData, isLoading, error } = useQuery({
    queryKey: ["adminUser"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        throw new Error("Not authenticated");
      }
      
      // Check if user is admin
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
        
      if (adminError || !adminUser) {
        router.push("/");
        throw new Error("Not authorized as admin");
      }
      
      return adminUser;
    },
    retry: false
  });

  // Navigation items
  const navItems = [
    { path: "/admin", label: "Dashboard", exact: true },
    { path: "/admin/services", label: "Services" },
    { path: "/admin/gallery", label: "Gallery" },
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Access denied. Please log in as an admin.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-beauty-beige">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-beauty-brown">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Logged in as {adminData?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1 bg-beauty-beige text-beauty-brown rounded hover:bg-gray-200 focus:outline-none focus:ring transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-md">
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`block px-4 py-2 rounded-md ${
                      isActive(item.path, item.exact)
                        ? "bg-beauty-brown text-white"
                        : "text-gray-700 hover:bg-beauty-beige hover:text-beauty-brown"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}