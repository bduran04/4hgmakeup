import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Portfolio, Service } from './supabase';

// Types
export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  image_url?: string;
  image_path?: string;
  alt_text: string;
  created_at: string;
  // Computed property for display URL
  display_url?: string;
}

// Utility function to get display URL (from storage path or direct URL)
const getImageDisplayUrl = (image: GalleryImage): string => {
  if (image.image_path) {
    const { data } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(image.image_path);
    return data.publicUrl;
  }
  return image.image_url || '';
};

// Transform function to add display URL to images
const transformImageWithDisplayUrl = (image: any): GalleryImage => ({
  ...image,
  display_url: getImageDisplayUrl(image)
});

// Upload file to Supabase Storage
export const uploadImageFile = async (file: File, category: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${category}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('portfolio-images')
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

// Portfolio Queries
export const usePortfolioItems = () => {
  return useQuery({
    queryKey: ['images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include display URLs
      return data.map(transformImageWithDisplayUrl);
    },
  });
};

// Fetch portfolio items by category
export const usePortfolioItemsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['images', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include display URLs
      return data.map(transformImageWithDisplayUrl);
    },
    enabled: !!category,
  });
};

// Create image mutation (supports both file upload and URL)
export const useCreateImage = () => {
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
        .from('images')
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

      return transformImageWithDisplayUrl(data);
    },
    onSuccess: () => {
      // Invalidate and refetch images
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
};

// Update image mutation
export const useUpdateImage = () => {
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

      return transformImageWithDisplayUrl(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
};

// Delete image mutation
export const useDeleteImage = () => {
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

// Fetch all FAQ items
export const useFAQs = () => {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

// Fetch FAQ items by category
export const useFAQsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['faqs', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .ilike('category', category)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!category && category !== 'all', // Only run if a valid category is provided
  });
};

// Services Queries
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['services', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Service;
    },
    enabled: !!id,
  });
};