import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// Gallery Image Types
export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  image_url?: string;
  image_path?: string;
  alt_text: string;
  created_at: string;
}

// Contact form submission to Supabase
export const useSubmitContactFormToSupabase = () => {
  return useMutation({
    mutationFn: async (formData: ContactFormData) => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert([formData])
        .select();
      
      if (error) throw error;
      return data;
    },
  });
};

// Contact form submission to Formspree
export function useSubmitContactForm() {
  return useMutation({
    mutationFn: async (data: ContactFormData) => {
      // Get the endpoint from environment variables
      const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
      
      if (!endpoint) {
        throw new Error('Formspree endpoint not configured');
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          // Formspree special fields for better email formatting
          _replyto: data.email,
          _subject: `New Contact Form Submission: ${data.subject}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
  });
}

// Utility function to upload file to storage
const uploadImageFile = async (file: File, category: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${category}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('portfolio-images') // Updated to use your portfolio-images bucket
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Storage upload error:', error);
    throw error;
  }

  return data.path;
};

// Utility function to get display URL
const getImageDisplayUrl = (image: { image_path?: string; image_url?: string }): string => {
  if (image.image_path) {
    const { data } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(image.image_path);
    return data.publicUrl;
  }
  return image.image_url || '';
};

// Create gallery image mutation (supports both file upload and URL)
export const useCreateGalleryImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (imageData: {
      title: string;
      category: string;
      alt_text: string;
      file?: File;
      image_url?: string;
    }) => {
      const { title, category, alt_text, file, image_url } = imageData;
      
      if (!file && !image_url?.trim()) {
        throw new Error("Please provide either a file or image URL");
      }
      
      let finalImagePath: string | null = null;
      let finalImageUrl: string | null = image_url || null;

      // Upload file if provided
      if (file) {
        finalImagePath = await uploadImageFile(file, category);
        // Get the public URL for the uploaded file
        const { data } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(finalImagePath);
        finalImageUrl = data.publicUrl;
      }

      // Insert into database
      const { data, error } = await supabase
        .from('images') // Updated to use your images table
        .insert([{
          title: title.trim(),
          category: category.trim(),
          alt_text: alt_text.trim(),
          image_url: finalImageUrl,
          image_path: finalImagePath
        }])
        .select()
        .single();

      if (error) {
        // Clean up uploaded file if database insert fails
        if (finalImagePath) {
          await supabase.storage
            .from('portfolio-images')
            .remove([finalImagePath]);
        }
        throw error;
      }

      return {
        ...data,
        display_url: getImageDisplayUrl(data)
      };
    },
    onSuccess: () => {
      // Invalidate and refetch images
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
};

// Update gallery image mutation
export const useUpdateGalleryImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updateData: {
      id: string;
      title: string;
      category: string;
      alt_text: string;
      file?: File;
      image_url?: string;
      currentImagePath?: string;
    }) => {
      const { id, title, category, alt_text, file, image_url, currentImagePath } = updateData;
      
      let finalImagePath: string | null = currentImagePath || null;
      let finalImageUrl: string | null = image_url || null;

      // Upload new file if provided
      if (file) {
        // Delete old file if it exists
        if (currentImagePath) {
          try {
            await supabase.storage
              .from('portfolio-images')
              .remove([currentImagePath]);
          } catch (error) {
            console.warn('Failed to delete old image:', error);
          }
        }

        // Upload new file
        finalImagePath = await uploadImageFile(file, category);
        const { data } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(finalImagePath);
        finalImageUrl = data.publicUrl;
      }

      // Update database
      const { data, error } = await supabase
        .from('images')
        .update({
          title: title.trim(),
          category: category.trim(),
          alt_text: alt_text.trim(),
          image_url: finalImageUrl,
          image_path: finalImagePath
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        display_url: getImageDisplayUrl(data)
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
};

// Delete gallery image mutation
export const useDeleteGalleryImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (image: GalleryImage) => {
      // Delete from database first
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', image.id);

      if (dbError) throw dbError;

      // Delete from storage if it exists
      if (image.image_path) {
        try {
          await supabase.storage
            .from('portfolio-images')
            .remove([image.image_path]);
        } catch (storageError) {
          console.warn('Failed to delete file from storage:', storageError);
          // Don't throw here as the database record is already deleted
        }
      }

      return image.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
};

// Legacy portfolio mutation (if you still need it for the old portfolio table)
export const useCreatePortfolioItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // First upload the image to storage
      const file = formData.get('image') as File;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;
      
      // Updated to use portfolio-images bucket instead of images
      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(filePath);
      
      // Then create the portfolio item record
      const portfolioData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        image_url: publicUrl,
        featured: formData.get('featured') === 'true',
      };
      
      const { data, error } = await supabase
        .from('portfolio')
        .insert([portfolioData])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
};