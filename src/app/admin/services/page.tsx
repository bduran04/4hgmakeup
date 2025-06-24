"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

// Types
type Service = {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image_url: string | null;
  featured: boolean;
  created_at: string;
};

export default function ServiceManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();
  const editFormRef = useRef<HTMLDivElement>(null);
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  // Fetch services
  const { data: services, isLoading: isServicesLoading, error: servicesError } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      console.log("Fetching services...");
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching services:", error);
        throw error;
      }
      
      console.log("Services fetched:", data);
      return data as Service[];
    },
    enabled: !!adminData
  });

  // Get unique categories
  const categories = services 
    ? Array.from(new Set(services.map(service => service.category).filter(Boolean)))
    : [];

  // Filter services by category
  const filteredServices = services
    ? selectedCategory === "all" 
      ? services 
      : services.filter(service => service.category === selectedCategory)
    : [];
  
  // Create service mutation
  const createService = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Please enter a title");
      if (!description.trim()) throw new Error("Please enter a description");
      if (!price.trim()) throw new Error("Please enter a price");
      if (!duration.trim()) throw new Error("Please enter duration in minutes");
      if (!category.trim()) throw new Error("Please enter a category");
      
      setIsLoading(true);
      
      try {
        // Create service
        const { data, error } = await supabase
          .from("services")
          .insert([{
            title: title.trim(),
            description: description.trim(),
            price: parseFloat(price),
            duration: parseInt(duration),
            category: category.trim(),
            image_url: imageUrl.trim() || null,
            featured: featured
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error("Error creating service:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setMessage({ type: "success", text: "Service created successfully!" });
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
  
  // Update service mutation
  const updateService = useMutation({
    mutationFn: async () => {
      if (!selectedService) throw new Error("No service selected");
      if (!title.trim()) throw new Error("Please enter a title");
      if (!description.trim()) throw new Error("Please enter a description");
      if (!price.trim()) throw new Error("Please enter a price");
      if (!duration.trim()) throw new Error("Please enter duration in minutes");
      if (!category.trim()) throw new Error("Please enter a category");
      
      setIsLoading(true);
      
      try {
        // Update service
        const { data, error } = await supabase
          .from("services")
          .update({
            title: title.trim(),
            description: description.trim(),
            price: parseFloat(price),
            duration: parseInt(duration),
            category: category.trim(),
            image_url: imageUrl.trim() || null,
            featured: featured
          })
          .eq("id", selectedService.id)
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error("Error updating service:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setMessage({ type: "success", text: "Service updated successfully!" });
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
  
  // Delete service mutation
  const deleteService = useMutation({
    mutationFn: async (serviceId: string) => {
      try {
        const { error } = await supabase
          .from("services")
          .delete()
          .eq("id", serviceId);
          
        if (error) throw error;
        
        return { success: true };
      } catch (error) {
        console.error("Error deleting service:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setMessage({ type: "success", text: "Service deleted successfully!" });
      
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
    
    if (isEditing && selectedService) {
      updateService.mutate();
    } else {
      createService.mutate();
    }
  };
  
  // Handle edit service
  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setTitle(service.title);
    setDescription(service.description);
    setPrice(service.price.toString());
    setDuration(service.duration.toString());
    setCategory(service.category);
    setImageUrl(service.image_url || "");
    setFeatured(service.featured);
    setIsEditing(true);
    
    // Scroll to edit form after a brief delay to allow state updates
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };
  
  // Handle delete service
  const handleDeleteService = (serviceId: string) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      deleteService.mutate(serviceId);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setSelectedService(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setDuration("");
    setCategory("");
    setImageUrl("");
    setFeatured(false);
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
        <h1 className="text-3xl font-bold text-beauty-brown">Service Management</h1>
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
      {servicesError && (
        <div className="p-4 mb-4 rounded bg-red-100 text-red-800">
          <strong>Database Error:</strong> {servicesError.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div ref={editFormRef} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-beauty-brown">{isEditing ? "Edit Service" : "Add New Service"}</h2>
            
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
                <label htmlFor="description" className="block text-sm font-medium mb-1 text-beauty-brown">Description *</label>
                <textarea
                  id="description"
                  rows={4}
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1 text-beauty-brown">Price ($) *</label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium mb-1 text-beauty-brown">Duration (min) *</label>
                  <input
                    type="number"
                    id="duration"
                    min="1"
                    className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    placeholder="e.g. 60"
                  />
                </div>
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
                  placeholder="e.g. bridal, special_event, lessons"
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium mb-1 text-beauty-brown">Image URL (Optional)</label>
                <div className="space-y-2">
                  <input
                    type="url"
                    id="imageUrl"
                    className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
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
                      alt="Service image preview"
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded"
                      onError={() => setMessage({ type: "error", text: "Failed to load image. Please check the URL." })}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  className="mr-2 rounded focus:ring focus:ring-beauty-gold"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <label htmlFor="featured" className="text-sm font-medium text-beauty-brown">Featured Service</label>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : isEditing ? "Update Service" : "Add Service"}
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
              <h2 className="text-xl font-semibold text-beauty-brown">Services List ({filteredServices.length})</h2>
              
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
            
            {isServicesLoading ? (
              <div className="p-6 text-center">Loading services...</div>
            ) : filteredServices && filteredServices.length > 0 ? (
              <div className="divide-y">
                {filteredServices.map((service) => (
                  <div key={service.id} className="p-6 flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/4">
                      {service.image_url ? (
                        <div className="relative h-48 w-full bg-beauty-beige rounded overflow-hidden">
                          <Image
                            src={service.image_url}
                            alt={service.title}
                            fill
                            style={{ objectFit: "cover" }}
                            className="rounded"
                          />
                        </div>
                      ) : (
                        <div className="h-48 w-full bg-beauty-beige flex items-center justify-center rounded">
                          <span className="text-beauty-brown">No Image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="md:w-3/4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-beauty-brown">{service.title}</h3>
                        {service.featured && (
                          <span className="inline-block bg-beauty-gold text-white rounded-full px-3 py-1 text-xs font-semibold">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 my-2">{service.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mb-2">
                        <p className="font-bold text-beauty-gold">${service.price.toFixed(2)}</p>
                        <p className="text-sm text-beauty-brown">{service.duration} minutes</p>
                        <span className="inline-block bg-beauty-brown bg-opacity-20 rounded-full px-3 py-1 text-sm font-semibold text-beauty-brown">
                          {service.category}
                        </span>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="px-3 py-1 bg-beauty-beige text-beauty-brown border border-beauty-brown rounded hover:bg-gray-200 focus:outline-none focus:ring transition"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDeleteService(service.id)}
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
                  ? "No services found. Add your first service using the form."
                  : `No services found in the "${selectedCategory}" category.`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}