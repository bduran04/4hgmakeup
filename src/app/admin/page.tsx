"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

type AdminUser = {
  id: string;
  email: string;
  bio: string | null;
  bio_2: string | null;
  about_image_1: string | null;
  about_image_2: string | null;
  created_at: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();
  
  const [bio, setBio] = useState<string>("");
  const [bio2, setBio2] = useState<string>("");
  const [aboutImage1Url, setAboutImage1Url] = useState<string>("");
  const [aboutImage2Url, setAboutImage2Url] = useState<string>("");
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check if user is authenticated and an admin
  const { data: adminData, isLoading: isAdminLoading, error: adminError } = useQuery({
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
      
      // Set initial values
      if (adminUser.bio) setBio(adminUser.bio);
      if (adminUser.bio_2) setBio2(adminUser.bio_2);
      if (adminUser.about_image_1) setAboutImage1Url(adminUser.about_image_1);
      if (adminUser.about_image_2) setAboutImage2Url(adminUser.about_image_2);
      
      // Track initial values for change detection
      const initialBio = adminUser.bio || "";
      const initialBio2 = adminUser.bio_2 || "";
      const initialImage1 = adminUser.about_image_1 || "";
      const initialImage2 = adminUser.about_image_2 || "";
      
      return { ...adminUser, initialBio, initialBio2, initialImage1, initialImage2 } as AdminUser & {
        initialBio: string;
        initialBio2: string; 
        initialImage1: string;
        initialImage2: string;
      };
    },
    retry: false
  });

  // Individual update mutations
  const updateField = useMutation({
    mutationFn: async ({ field, value }: { field: keyof AdminUser, value: string }) => {
      if (!adminData) throw new Error("Admin data not loaded");
      
      const { error } = await supabase
        .from("admin_users")
        .update({ [field]: value })
        .eq("id", adminData.id);
        
      if (error) throw error;
      
      return { field, value };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminUser"] });
      setMessage({ type: "success", text: `${data.field} updated successfully!` });
      setHasUnsavedChanges(false); // Reset unsaved changes after successful save
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    },
    onError: (error) => {
      setMessage({ type: "error", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` });
    }
  });

  // Check for unsaved changes
  useEffect(() => {
    if (adminData) {
      const hasChanges = 
        bio !== (adminData.initialBio || "") ||
        bio2 !== (adminData.initialBio2 || "") ||
        aboutImage1Url !== (adminData.initialImage1 || "") ||
        aboutImage2Url !== (adminData.initialImage2 || "");
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [bio, bio2, aboutImage1Url, aboutImage2Url, adminData]);

  // Handle going back to website
  const handleBackToWebsite = async () => {
    if (hasUnsavedChanges) {
      const confirmLeave = confirm(
        "You have unsaved changes! Are you sure you want to leave? Make sure to save all your work before leaving."
      );
      if (!confirmLeave) return;
    }
    
    try {
      // Log out the user
      await supabase.auth.signOut();
      
      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      // Still redirect even if logout fails
      router.push("/");
    }
  };

  // Handle individual field updates
  const handleUpdateField = async (field: keyof AdminUser, value: string) => {
    setIsLoading(prev => ({ ...prev, [field]: true }));
    
    try {
      await updateField.mutateAsync({ field, value });
    } finally {
      setIsLoading(prev => ({ ...prev, [field]: false }));
    }
  };

  // Show message helper
  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Handle image URL input
  const handleImageUrlInput = (imageType: 'about_image_1' | 'about_image_2') => {
    const currentUrl = imageType === 'about_image_1' ? aboutImage1Url : aboutImage2Url;
    const newUrl = prompt(`Enter URL for ${imageType === 'about_image_1' ? 'About Image 1' : 'About Image 2'}:`, currentUrl);
    
    if (newUrl !== null) { // User didn't cancel
      if (imageType === 'about_image_1') {
        setAboutImage1Url(newUrl);
      } else {
        setAboutImage2Url(newUrl);
      }
      
      // Auto-save the URL
      handleUpdateField(imageType, newUrl);
    }
  };
  
  if (isAdminLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (adminError) {
    return <div className="text-red-500 p-4">Access denied. Please log in as an admin.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-beauty-brown">Admin Dashboard</h1>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="p-4 mb-4 rounded bg-yellow-100 border border-yellow-400 text-yellow-800">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">You have unsaved changes!</span>
            <span className="ml-2">Remember to save each section before leaving.</span>
          </div>
        </div>
      )}
      
      <div className="space-y-8">
        {/* Bio Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 text-beauty-brown">Primary Bio</h2>
          <div className="space-y-4">
            <textarea
              rows={6}
              className="w-full p-3 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enter your primary bio here..."
            />
            <button
              onClick={() => handleUpdateField('bio', bio)}
              disabled={isLoading.bio}
              className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition disabled:opacity-50"
            >
              {isLoading.bio ? "Saving..." : "Save Bio"}
            </button>
          </div>
        </div>

        {/* Bio 2 Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 text-beauty-brown">Secondary Bio</h2>
          <div className="space-y-4">
            <textarea
              rows={6}
              className="w-full p-3 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
              value={bio2}
              onChange={(e) => setBio2(e.target.value)}
              placeholder="Enter your secondary bio here..."
            />
            <button
              onClick={() => handleUpdateField('bio_2', bio2)}
              disabled={isLoading.bio_2}
              className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition disabled:opacity-50"
            >
              {isLoading.bio_2 ? "Saving..." : "Save Secondary Bio"}
            </button>
          </div>
        </div>

        {/* Images Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* About Image 1 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 text-beauty-brown">About Image 1</h2>
            <div className="space-y-4">
              {aboutImage1Url && (
                <div className="relative h-48 w-full mb-4 bg-beauty-beige rounded overflow-hidden">
                  <Image
                    src={aboutImage1Url}
                    alt="About image 1 preview"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded"
                    onError={() => showMessage("error", "Failed to load image. Please check the URL.")}
                  />
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full p-3 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold text-sm"
                  value={aboutImage1Url}
                  onChange={(e) => setAboutImage1Url(e.target.value)}
                  placeholder="Enter image URL..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleImageUrlInput('about_image_1')}
                    className="px-3 py-2 bg-beauty-beige text-beauty-brown rounded hover:bg-beauty-gold hover:text-white focus:outline-none focus:ring transition text-sm"
                  >
                    Browse URL
                  </button>
                  <button
                    onClick={() => handleUpdateField('about_image_1', aboutImage1Url)}
                    disabled={isLoading.about_image_1}
                    className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition disabled:opacity-50 text-sm"
                  >
                    {isLoading.about_image_1 ? "Saving..." : "Save Image"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About Image 2 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 text-beauty-brown">About Image 2</h2>
            <div className="space-y-4">
              {aboutImage2Url && (
                <div className="relative h-48 w-full mb-4 bg-beauty-beige rounded overflow-hidden">
                  <Image
                    src={aboutImage2Url}
                    alt="About image 2 preview"
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded"
                    onError={() => showMessage("error", "Failed to load image. Please check the URL.")}
                  />
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full p-3 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold text-sm"
                  value={aboutImage2Url}
                  onChange={(e) => setAboutImage2Url(e.target.value)}
                  placeholder="Enter image URL..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleImageUrlInput('about_image_2')}
                    className="px-3 py-2 bg-beauty-beige text-beauty-brown rounded hover:bg-beauty-gold hover:text-white focus:outline-none focus:ring transition text-sm"
                  >
                    Browse URL
                  </button>
                  <button
                    onClick={() => handleUpdateField('about_image_2', aboutImage2Url)}
                    disabled={isLoading.about_image_2}
                    className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition disabled:opacity-50 text-sm"
                  >
                    {isLoading.about_image_2 ? "Saving..." : "Save Image"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation and Quick Actions */}
        <div className="bg-beauty-beige p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-beauty-brown">Navigation & Quick Actions</h2>
          
          {/* Back to Website Button */}
          <div className="mb-6 p-4 bg-white rounded border-l-4 border-beauty-brown">
            <h3 className="font-medium text-beauty-brown mb-2">Ready to go back?</h3>
            <p className="text-gray-600 text-sm mb-3">
              Make sure you've saved all your changes before returning to the website. 
              You will be logged out and redirected to the homepage.
            </p>
            <button
              onClick={handleBackToWebsite}
              className={`px-6 py-3 rounded font-medium transition ${
                hasUnsavedChanges 
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                  : 'bg-beauty-brown text-white hover:bg-beauty-gold'
              }`}
            >
              {hasUnsavedChanges ? '⚠️ Logout & Back to Website (Unsaved Changes)' : '✓ Logout & Back to Website'}
            </button>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-medium text-beauty-brown mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setBio("");
                  setBio2("");
                  setAboutImage1Url("");
                  setAboutImage2Url("");
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring transition"
              >
                Clear All Fields
              </button>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["adminUser"] })}
                className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}