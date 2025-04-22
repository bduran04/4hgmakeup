// src/lib/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

interface BookingData {
  client_name: string;
  client_email: string;
  client_phone: string;
  service_id: string;
  service_name: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  client_id?: string;
}

export const useAddBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookingData: BookingData) => {
      // Get the authenticated user's ID if available
      const { data: { user } } = await supabase.auth.getUser();
      
      // Add the user ID to the booking data if they're logged in
      if (user) {
        bookingData.client_id = user.id;
      }
      
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries after successful booking
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate both the general bookings list and any specific booking queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export const useSubmitContactForm = () => {
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

// Admin mutations
export const useCreatePortfolioItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // First upload the image to storage
      const file = formData.get('image') as File;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `portfolio/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('images')
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

// Add more mutations as needed