"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { Upload, Camera, Image as ImageIcon, X, Eye } from "lucide-react";
import { fetchAdminDataByUserId } from "@/lib/utils/admin-data";

// Types
type GalleryImage = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  image_path?: string;
  alt_text: string;
  created_at: string;
};

// File Upload Component
type FileUploadProps = {
  onFileSelect: (file: File) => void;
  onUrlInput: (url: string) => void;
  currentImageUrl?: string;
  isUploading?: boolean;
};

const FileUpload = ({ onFileSelect, onUrlInput, currentImageUrl, isUploading }: FileUploadProps) => {
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('url'); // Default to URL mode
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Mode Toggle */}
      <div className="flex border rounded-lg p-1 bg-gray-100">
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-colors ${
            uploadMode === 'url' 
              ? 'bg-white text-beauty-brown shadow-sm' 
              : 'text-gray-600 hover:text-beauty-brown'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Image URL</span>
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('file')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-colors ${
            uploadMode === 'file' 
              ? 'bg-white text-beauty-brown shadow-sm' 
              : 'text-gray-600 hover:text-beauty-brown'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span className="text-sm font-medium">Upload File</span>
        </button>
      </div>

      {uploadMode === 'url' ? (
        <div className="space-y-3">
          <input
            type="url"
            className="w-full p-3 border rounded-lg focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
            value={currentImageUrl || ""}
            onChange={(e) => onUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragActive 
                ? 'border-beauty-brown bg-beauty-brown/5' 
                : 'border-gray-300 hover:border-beauty-brown hover:bg-gray-50'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beauty-brown"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex space-x-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Drop an image here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports JPG, PNG, GIF, WebP (max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile-specific buttons */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                }
              }}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-beauty-brown text-white rounded-lg hover:bg-beauty-gold transition-colors"
              disabled={isUploading}
            >
              <Camera className="h-4 w-4" />
              <span className="text-sm">Take Photo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                }
              }}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-beauty-beige text-beauty-brown border border-beauty-brown rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isUploading}
            >
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm">Choose File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Image Preview Component
type ImagePreviewProps = {
  imageUrl?: string;
  file?: File;
  className?: string;
};

const ImagePreview = ({ imageUrl, file, className = "" }: ImagePreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate preview URL for file uploads
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (imageUrl) {
      setPreviewUrl(imageUrl);
    } else {
      setPreviewUrl("");
    }
  }, [file, imageUrl]);

  if (!previewUrl) {
    return (
      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <Eye className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          Upload an image or enter URL to see preview
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative border rounded-lg overflow-hidden bg-gray-50">
        {imageError ? (
          <div className="flex items-center justify-center h-48 bg-red-50">
            <div className="text-center">
              <p className="mt-2 text-sm text-red-600">
                Failed to load image
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-48 p-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-48 object-contain"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </div>
        )}
        
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-beauty-brown"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function GalleryManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const editFormRef = useRef<HTMLDivElement>(null);

  // Utility function to get display URL
  const getImageDisplayUrl = (image: GalleryImage): string => {
    if (image.image_path) {
      const { data } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(image.image_path);
      return data.publicUrl;
    }
    return image.image_url || '';
  };

  // File upload function
  const uploadFileToStorage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${category || 'uncategorized'}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('portfolio-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data.path;
  };

  // Check if user is authenticated and an admin
  const { data: adminData, isLoading: isAdminLoading, error: adminError } = useQuery({
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
      
      // Fetch admin data using utility function
      const adminData = await fetchAdminDataByUserId(session.user.id);
      
      if (!adminData) {
        throw new Error("Failed to fetch admin data");
      }
      
      return { ...adminUser, ...adminData };
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

  // Create gallery image mutation (updated to support file uploads)
  const createGalleryImage = useMutation({
    mutationFn: async () => {
      if (!selectedFile && !imageUrl.trim()) {
        throw new Error("Please select a file or enter an image URL");
      }
      if (!title.trim()) throw new Error("Please enter a title");
      if (!category.trim()) throw new Error("Please enter a category");
      if (!altText.trim()) throw new Error("Please enter alt text for accessibility");
      
      setIsLoading(true);
      setIsUploading(true);
      
      try {
        let finalImageUrl = imageUrl;
        let imagePath = null;

        // Upload file if selected
        if (selectedFile) {
          imagePath = await uploadFileToStorage(selectedFile);
          const { data } = supabase.storage
            .from('portfolio-images')
            .getPublicUrl(imagePath);
          finalImageUrl = data.publicUrl;
        }

        // Create gallery entry
        const { data, error } = await supabase
          .from("images")
          .insert([{
            title: title.trim(),
            category: category.trim(),
            image_url: finalImageUrl,
            image_path: imagePath,
            alt_text: altText.trim()
          }])
          .select()
          .single();
          
        if (error) {
          // Clean up uploaded file if database insert fails
          if (imagePath) {
            await supabase.storage
              .from('portfolio-images')
              .remove([imagePath]);
          }
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Error creating gallery image:", error);
        throw error;
      } finally {
        setIsLoading(false);
        setIsUploading(false);
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
  
  // Update gallery image mutation (updated to support file uploads)
  const updateGalleryImage = useMutation({
    mutationFn: async () => {
      if (!selectedImage) throw new Error("No image selected");
      if (!selectedFile && !imageUrl.trim()) {
        throw new Error("Please select a file or enter an image URL");
      }
      if (!title.trim()) throw new Error("Please enter a title");
      if (!category.trim()) throw new Error("Please enter a category");
      if (!altText.trim()) throw new Error("Please enter alt text for accessibility");
      
      setIsLoading(true);
      setIsUploading(true);
      
      try {
        let finalImageUrl = imageUrl;
        let imagePath = selectedImage.image_path;

        // Upload new file if selected
        if (selectedFile) {
          // Delete old file if it exists
          if (selectedImage.image_path) {
            try {
              await supabase.storage
                .from('portfolio-images')
                .remove([selectedImage.image_path]);
            } catch (error) {
              console.warn('Failed to delete old image:', error);
            }
          }

          // Upload new file
          imagePath = await uploadFileToStorage(selectedFile);
          const { data } = supabase.storage
            .from('portfolio-images')
            .getPublicUrl(imagePath);
          finalImageUrl = data.publicUrl;
        }
        
        // Update gallery entry
        const { data, error } = await supabase
          .from("images")
          .update({
            title: title.trim(),
            category: category.trim(),
            image_url: finalImageUrl,
            image_path: imagePath,
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
        setIsUploading(false);
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
  
  // Delete gallery image mutation (updated to handle storage cleanup)
  const deleteGalleryImage = useMutation({
    mutationFn: async (imageId: string) => {
      try {
        // Find the image to get its path
        const imageToDelete = galleryImages?.find(img => img.id === imageId);
        
        // Delete from database first
        const { error } = await supabase
          .from("images")
          .delete()
          .eq("id", imageId);
          
        if (error) throw error;

        // Delete from storage if it exists
        if (imageToDelete?.image_path) {
          try {
            await supabase.storage
              .from('portfolio-images')
              .remove([imageToDelete.image_path]);
          } catch (storageError) {
            console.warn('Failed to delete file from storage:', storageError);
          }
        }
        
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
    setImageUrl(getImageDisplayUrl(image)); // Use display URL
    setAltText(image.alt_text);
    setIsEditing(true);
    setSelectedFile(null); // Clear any selected file when editing
    
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
    setSelectedFile(null);
    setAltText("");
    setIsEditing(false);
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setImageUrl(""); // Clear URL when file is selected
  };

  // Handle URL input
  const handleUrlInput = (url: string) => {
    setImageUrl(url);
    setSelectedFile(null); // Clear file when URL is entered
  };

  // Handle image URL input with prompt (keeping your existing functionality)
  const handleImageUrlInput = () => {
    const newUrl = prompt("Enter image URL:", imageUrl);
    if (newUrl !== null) {
      setImageUrl(newUrl);
      setSelectedFile(null); // Clear file when URL is set
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
          <div ref={editFormRef} className="bg-white rounded-lg shadow p-6">
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
                <label className="block text-sm font-medium mb-2 text-beauty-brown">Image *</label>
                
                {/* File Upload Component */}
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  onUrlInput={handleUrlInput}
                  currentImageUrl={imageUrl}
                  isUploading={isUploading}
                />

                {/* Keep your existing Browse URL button for compatibility */}
                <button
                  type="button"
                  onClick={handleImageUrlInput}
                  className="mt-2 px-3 py-1 bg-beauty-beige text-beauty-brown rounded hover:bg-beauty-gold hover:text-white focus:outline-none focus:ring transition text-sm"
                >
                  Browse URL (Alternative)
                </button>
                
                {/* Image Preview */}
                <ImagePreview 
                  imageUrl={imageUrl}
                  file={selectedFile ?? undefined}
                  className="mt-4"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isLoading || isUploading}
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
                        src={getImageDisplayUrl(image)} // Use display URL function
                        alt={image.alt_text || image.title}
                        fill
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          // Fallback to image_url if display_url fails
                          const target = e.target as HTMLImageElement;
                          if (image.image_url && target.src !== image.image_url) {
                            target.src = image.image_url;
                          }
                        }}
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