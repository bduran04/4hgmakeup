"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

// Types
type GalleryImage = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  alt_text: string;
  created_at: string;
};

export default function GalleryManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const editFormRef = useRef<HTMLDivElement>(null);

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
      
      return adminUser;
    },
    retry: false
  });

  // Fetch gallery images
  const { data: galleryImages, isLoading: isGalleryLoading, error: galleryError } = useQuery({
    queryKey: ["galleryImages"],
    queryFn: async () => {
      console.log("Fetching gallery images...");
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching gallery images:", error);
        throw error;
      }
      
      console.log("Gallery images fetched:", data);
      return data as GalleryImage[];
    },
    enabled: !!adminData
  });
  
  // Get unique categories
  const categories = galleryImages 
    ? Array.from(new Set(galleryImages.map(img => img.category).filter(Boolean)))
    : [];

  // Filter images by category
  const filteredImages = galleryImages
    ? selectedCategory === "all" 
      ? galleryImages 
      : galleryImages.filter(img => img.category === selectedCategory)
    : [];

  // Create gallery image mutation
  const createGalleryImage = useMutation({
    mutationFn: async () => {
      if (!imageUrl.trim()) throw new Error("Please enter an image URL");
      if (!title.trim()) throw new Error("Please enter a title");
      if (!category.trim()) throw new Error("Please enter a category");
      if (!altText.trim()) throw new Error("Please enter alt text for accessibility");
      
      setIsLoading(true);
      
      try {
        // Create gallery entry
        const { data, error } = await supabase
          .from("images")
          .insert([{
            title: title.trim(),
            category: category.trim(),
            image_url: imageUrl.trim(),
            alt_text: altText.trim()
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error("Error creating gallery image:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
      setMessage({ type: "success", text: "Image added to gallery successfully!" });
      resetForm();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    },
    onError: (error) => {
      setMessage({ type: "error", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` });
    }
  });
  
  // Update gallery image mutation
  const updateGalleryImage = useMutation({
    mutationFn: async () => {
      if (!selectedImage) throw new Error("No image selected");
      if (!imageUrl.trim()) throw new Error("Please enter an image URL");
      if (!title.trim()) throw new Error("Please enter a title");
      if (!category.trim()) throw new Error("Please enter a category");
      if (!altText.trim()) throw new Error("Please enter alt text for accessibility");
      
      setIsLoading(true);
      
      try {        
        // Update gallery entry
        const { data, error } = await supabase
          .from("images")
          .update({
            title: title.trim(),
            category: category.trim(),
            image_url: imageUrl.trim(),
            alt_text: altText.trim()
          })
          .eq("id", selectedImage.id)
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error("Error updating gallery image:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
      setMessage({ type: "success", text: "Gallery image updated successfully!" });
      resetForm();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    },
    onError: (error) => {
      setMessage({ type: "error", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` });
    }
  });
  
  // Delete gallery image mutation
  const deleteGalleryImage = useMutation({
    mutationFn: async (imageId: string) => {
      try {
        const { error } = await supabase
          .from("images")
          .delete()
          .eq("id", imageId);
          
        if (error) throw error;
        
        return { success: true };
      } catch (error) {
        console.error("Error deleting gallery image:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
      setMessage({ type: "success", text: "Gallery image deleted successfully!" });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    },
    onError: (error) => {
      setMessage({ type: "error", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` });
    }
  });
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && selectedImage) {
      updateGalleryImage.mutate();
    } else {
      createGalleryImage.mutate();
    }
  };
  
  // Handle edit image
  const handleEditImage = (image: GalleryImage) => {
    setSelectedImage(image);
    setTitle(image.title);
    setCategory(image.category);
    setImageUrl(image.image_url);
    setAltText(image.alt_text);
    setIsEditing(true);
    
    // Scroll to edit form after a brief delay to allow state updates
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };
  
  // Handle delete image
  const handleDeleteImage = (imageId: string) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      deleteGalleryImage.mutate(imageId);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setSelectedImage(null);
    setTitle("");
    setCategory("");
    setImageUrl("");
    setAltText("");
    setIsEditing(false);
  };

  // Handle image URL input with prompt
  const handleImageUrlInput = () => {
    const newUrl = prompt("Enter image URL:", imageUrl);
    if (newUrl !== null) {
      setImageUrl(newUrl);
    }
  };

  // Handle going back to admin dashboard
  const handleBackToAdmin = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/");
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-beauty-brown">Gallery Management</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-beauty-beige text-beauty-brown rounded hover:bg-gray-200 focus:outline-none focus:ring transition"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={handleBackToAdmin}
            className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition"
          >
            Logout & Exit
          </button>
        </div>
      </div>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {/* Debug Info */}
      {galleryError && (
        <div className="p-4 mb-4 rounded bg-red-100 text-red-800">
          <strong>Database Error:</strong> {galleryError.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div ref={editFormRef} className="bg-white rounded-lg shadow p-6">{/* Added ref here */}
            <h2 className="text-xl font-semibold mb-4 text-beauty-brown">{isEditing ? "Edit Gallery Image" : "Add Gallery Image"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1 text-beauty-brown">Title *</label>
                <input
                  type="text"
                  id="title"
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1 text-beauty-brown">Category *</label>
                <input
                  type="text"
                  id="category"
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  placeholder="e.g. wedding, portrait, editorial"
                />
              </div>

              <div>
                <label htmlFor="altText" className="block text-sm font-medium mb-1 text-beauty-brown">Alt Text *</label>
                <input
                  type="text"
                  id="altText"
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  required
                  placeholder="Description for accessibility"
                />
              </div>
              
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium mb-1 text-beauty-brown">Image URL *</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    id="imageUrl"
                    className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={handleImageUrlInput}
                    className="px-3 py-1 bg-beauty-beige text-beauty-brown rounded hover:bg-beauty-gold hover:text-white focus:outline-none focus:ring transition text-sm"
                  >
                    Browse URL
                  </button>
                </div>
                
                {imageUrl && (
                  <div className="relative h-48 w-full mt-2 bg-beauty-beige rounded overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt="Image preview"
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded"
                      onError={() => setMessage({ type: "error", text: "Failed to load image. Please check the URL." })}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : isEditing ? "Update Image" : "Add Image"}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-beauty-beige text-beauty-brown rounded hover:bg-gray-200 focus:outline-none focus:ring transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-beauty-brown">Gallery Images ({filteredImages.length})</h2>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="categoryFilter" className="text-sm font-medium text-beauty-brown">Filter:</label>
                <select
                  id="categoryFilter"
                  className="p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {isGalleryLoading ? (
              <div className="p-6 text-center">Loading gallery images...</div>
            ) : filteredImages && filteredImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-6">
                {filteredImages.map((image) => (
                  <div key={image.id} className="border rounded overflow-hidden bg-beauty-beige">
                    <div className="relative h-64 w-full">
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || image.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-beauty-brown">{image.title}</h3>
                      <p className="text-gray-600 text-sm my-1">{image.alt_text}</p>
                      <span className="inline-block bg-beauty-brown bg-opacity-20 rounded-full px-3 py-1 text-sm font-semibold text-beauty-brown mt-2">
                        {image.category}
                      </span>
                      
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => handleEditImage(image)}
                          className="px-3 py-1 bg-beauty-beige text-beauty-brown border border-beauty-brown rounded hover:bg-gray-200 focus:outline-none focus:ring transition"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 focus:outline-none focus:ring transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                {selectedCategory === "all" 
                  ? "No gallery images found. Add your first image using the form."
                  : `No images found in the "${selectedCategory}" category.`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}