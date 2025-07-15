"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { Upload, Camera, Image as ImageIcon, Eye, Settings, Users, FileImage } from "lucide-react";

type AdminUser = {
  id: string;
  email: string;
  bio: string | null;
  bio_2: string | null;
  about_image_1: string | null;
  about_image_2: string | null;
  about_image_1_path?: string | null;
  about_image_2_path?: string | null;
  created_at: string;
};

// File Upload Component
type FileUploadProps = {
  onFileSelect: (file: File) => void;
  onUrlInput: (url: string) => void;
  currentImageUrl?: string;
  isUploading?: boolean;
  imageType: 'about_image_1' | 'about_image_2';
};

const FileUpload = ({ onFileSelect, onUrlInput, currentImageUrl, isUploading, imageType }: FileUploadProps) => {
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
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
    <div className="space-y-3">
      {/* Upload Mode Toggle */}
      <div className="flex border rounded-lg p-1 bg-gray-100">
        <button
          type="button"
          onClick={() => setUploadMode('file')}
          className={`flex-1 flex items-center justify-center space-x-1 py-1 px-2 rounded-md transition-colors text-xs ${
            uploadMode === 'file' 
              ? 'bg-white text-beauty-brown shadow-sm' 
              : 'text-gray-600 hover:text-beauty-brown'
          }`}
        >
          <Upload className="h-3 w-3" />
          <span>Upload</span>
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`flex-1 flex items-center justify-center space-x-1 py-1 px-2 rounded-md transition-colors text-xs ${
            uploadMode === 'url' 
              ? 'bg-white text-beauty-brown shadow-sm' 
              : 'text-gray-600 hover:text-beauty-brown'
          }`}
        >
          <ImageIcon className="h-3 w-3" />
          <span>URL</span>
        </button>
      </div>

      {uploadMode === 'file' ? (
        <div className="space-y-2">
          {/* Compact File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-beauty-brown"></div>
                <p className="text-xs text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex space-x-2">
                  <Upload className="h-6 w-6 text-beauty-brown" />
                  <Camera className="h-6 w-6 text-beauty-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-beauty-brown">
                    Drop image or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG, GIF, WebP (max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                }
              }}
              className="flex items-center justify-center space-x-1 py-2 px-3 bg-beauty-brown text-white rounded hover:bg-beauty-gold transition-colors text-sm"
              disabled={isUploading}
            >
              <Camera className="h-4 w-4" />
              <span>Camera</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                }
              }}
              className="flex items-center justify-center space-x-1 py-2 px-3 bg-beauty-beige text-beauty-brown border border-beauty-brown rounded hover:bg-gray-200 transition-colors text-sm"
              disabled={isUploading}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Gallery</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="url"
            className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold text-sm"
            value={currentImageUrl || ""}
            onChange={(e) => onUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
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

  React.useEffect(() => {
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
      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${className}`}>
        <Eye className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-1 text-xs text-gray-500">No image selected</p>
      </div>
    );
  }

  return (
    <div className={`relative h-48 w-full bg-beauty-beige rounded overflow-hidden ${className}`}>
      {imageError ? (
        <div className="flex items-center justify-center h-full bg-red-50">
          <p className="text-xs text-red-600">Failed to load image</p>
        </div>
      ) : (
        <Image
          src={previewUrl}
          alt="Preview"
          fill
          style={{ objectFit: "cover" }}
          className="rounded"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
      
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-beauty-brown"></div>
        </div>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();
  
  const [bio, setBio] = useState<string>("");
  const [bio2, setBio2] = useState<string>("");
  const [aboutImage1Url, setAboutImage1Url] = useState<string>("");
  const [aboutImage2Url, setAboutImage2Url] = useState<string>("");
  const [selectedFile1, setSelectedFile1] = useState<File | null>(null);
  const [selectedFile2, setSelectedFile2] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // File upload function
  const uploadFileToStorage = async (file: File, folder: string = 'about'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

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

  // Enhanced update mutation to handle file uploads
  const updateField = useMutation({
    mutationFn: async ({ field, value, file, imagePath }: { 
      field: keyof AdminUser, 
      value: string,
      file?: File,
      imagePath?: string
    }) => {
      if (!adminData) throw new Error("Admin data not loaded");
      
      let finalValue = value;
      let finalImagePath = imagePath;
      
      // Handle file upload for image fields
      if (file && (field === 'about_image_1' || field === 'about_image_2')) {
        setIsUploading(true);
        
        // Delete old file if it exists
        const oldPathField = field === 'about_image_1' ? 'about_image_1_path' : 'about_image_2_path';
        const oldPath = adminData[oldPathField as keyof AdminUser] as string;
        
        if (oldPath) {
          try {
            await supabase.storage
              .from('portfolio-images')
              .remove([oldPath]);
          } catch (error) {
            console.warn('Failed to delete old image:', error);
          }
        }
        
        // Upload new file
        finalImagePath = await uploadFileToStorage(file, 'about');
        const { data } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(finalImagePath);
        finalValue = data.publicUrl;
      }
      
      // Prepare update data
      const updateData: any = { [field]: finalValue };
      if (finalImagePath && (field === 'about_image_1' || field === 'about_image_2')) {
        const pathField = field === 'about_image_1' ? 'about_image_1_path' : 'about_image_2_path';
        updateData[pathField] = finalImagePath;
      }
      
      const { error } = await supabase
        .from("admin_users")
        .update(updateData)
        .eq("id", adminData.id);
        
      if (error) throw error;
      
      return { field, value: finalValue };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["adminUser"] });
      setMessage({ type: "success", text: `${data.field} updated successfully!` });
      setHasUnsavedChanges(false);
      setSelectedFile1(null);
      setSelectedFile2(null);
      setIsUploading(false);
      
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    },
    onError: (error) => {
      setMessage({ type: "error", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` });
      setIsUploading(false);
    }
  });

  // Check for unsaved changes
  useEffect(() => {
    if (adminData) {
      const hasChanges = 
        bio !== (adminData.initialBio || "") ||
        bio2 !== (adminData.initialBio2 || "") ||
        aboutImage1Url !== (adminData.initialImage1 || "") ||
        aboutImage2Url !== (adminData.initialImage2 || "") ||
        selectedFile1 !== null ||
        selectedFile2 !== null;
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [bio, bio2, aboutImage1Url, aboutImage2Url, selectedFile1, selectedFile2, adminData]);

  // Handle going back to website
  const handleBackToWebsite = async () => {
    if (hasUnsavedChanges) {
      const confirmLeave = confirm(
        "You have unsaved changes! Are you sure you want to leave? Make sure to save all your work before leaving."
      );
      if (!confirmLeave) return;
    }
    
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/");
    }
  };

  // Handle individual field updates
  const handleUpdateField = async (field: keyof AdminUser, value: string, file?: File) => {
    setIsLoading(prev => ({ ...prev, [field]: true }));
    
    try {
      const rawImagePath = field === 'about_image_1' ? adminData?.about_image_1_path : adminData?.about_image_2_path;
      const currentImagePath = rawImagePath ?? undefined;
      await updateField.mutateAsync({ field, value, file, imagePath: currentImagePath });
    } finally {
      setIsLoading(prev => ({ ...prev, [field]: false }));
    }
  };

  // Handle file selections
  const handleFile1Select = (file: File) => {
    setSelectedFile1(file);
    setAboutImage1Url("");
  };

  const handleFile2Select = (file: File) => {
    setSelectedFile2(file);
    setAboutImage2Url("");
  };

  // Handle URL inputs
  const handleUrl1Input = (url: string) => {
    setAboutImage1Url(url);
    setSelectedFile1(null);
  };

  const handleUrl2Input = (url: string) => {
    setAboutImage2Url(url);
    setSelectedFile2(null);
  };

  // Handle image URL input (legacy method)
  const handleImageUrlInput = (imageType: 'about_image_1' | 'about_image_2') => {
    const currentUrl = imageType === 'about_image_1' ? aboutImage1Url : aboutImage2Url;
    const newUrl = prompt(`Enter URL for ${imageType === 'about_image_1' ? 'About Image 1' : 'About Image 2'}:`, currentUrl);
    
    if (newUrl !== null) {
      if (imageType === 'about_image_1') {
        setAboutImage1Url(newUrl);
        setSelectedFile1(null);
      } else {
        setAboutImage2Url(newUrl);
        setSelectedFile2(null);
      }
      
      handleUpdateField(imageType, newUrl);
    }
  };

  // Show message helper
  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
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
        <h1 className="text-3xl font-bold text-beauty-brown">Admin Dashboard</h1>
        
        {/* Quick Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/admin/gallery")}
            className="flex items-center space-x-2 px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold transition"
          >
            <FileImage className="h-4 w-4" />
            <span className="hidden sm:inline">Gallery</span>
          </button>
        </div>
      </div>
      
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
              {/* Image Preview */}
              <ImagePreview 
                imageUrl={aboutImage1Url}
                file={selectedFile1 ?? undefined}
              />
              
              {/* File Upload Component */}
              <FileUpload 
                onFileSelect={handleFile1Select}
                onUrlInput={handleUrl1Input}
                currentImageUrl={aboutImage1Url}
                isUploading={isUploading}
                imageType="about_image_1"
              />
              
              {/* Legacy Browse URL Button */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleImageUrlInput('about_image_1')}
                  className="px-3 py-2 bg-beauty-beige text-beauty-brown rounded hover:bg-beauty-gold hover:text-white focus:outline-none focus:ring transition text-sm"
                >
                  Quick URL Entry
                </button>
                <button
                  onClick={() => handleUpdateField('about_image_1', aboutImage1Url, selectedFile1 || undefined)}
                  disabled={isLoading.about_image_1 || isUploading}
                  className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition disabled:opacity-50 text-sm"
                >
                  {isLoading.about_image_1 || isUploading ? "Saving..." : "Save Image"}
                </button>
              </div>
            </div>
          </div>

          {/* About Image 2 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 text-beauty-brown">About Image 2</h2>
            <div className="space-y-4">
              {/* Image Preview */}
              <ImagePreview 
                imageUrl={aboutImage2Url}
                file={selectedFile2 ?? undefined}
              />
              
              {/* File Upload Component */}
              <FileUpload 
                onFileSelect={handleFile2Select}
                onUrlInput={handleUrl2Input}
                currentImageUrl={aboutImage2Url}
                isUploading={isUploading}
                imageType="about_image_2"
              />
              
              {/* Legacy Browse URL Button */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleImageUrlInput('about_image_2')}
                  className="px-3 py-2 bg-beauty-beige text-beauty-brown rounded hover:bg-beauty-gold hover:text-white focus:outline-none focus:ring transition text-sm"
                >
                  Quick URL Entry
                </button>
                <button
                  onClick={() => handleUpdateField('about_image_2', aboutImage2Url, selectedFile2 || undefined)}
                  disabled={isLoading.about_image_2 || isUploading}
                  className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition disabled:opacity-50 text-sm"
                >
                  {isLoading.about_image_2 || isUploading ? "Saving..." : "Save Image"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation and Quick Actions */}
        <div className="bg-beauty-beige p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-beauty-brown">Navigation & Quick Actions</h2>
          
          {/* Admin Navigation */}
          <div className="mb-6 p-4 bg-white rounded border-l-4 border-beauty-brown">
            <h3 className="font-medium text-beauty-brown mb-2">Admin Tools</h3>
            <p className="text-gray-600 text-sm mb-3">
              Manage different aspects of your website content.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/admin/gallery")}
                className="flex items-center space-x-2 px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold transition"
              >
                <FileImage className="h-4 w-4" />
                <span>Manage Gallery</span>
              </button>
            </div>
          </div>
          
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
                  setSelectedFile1(null);
                  setSelectedFile2(null);
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