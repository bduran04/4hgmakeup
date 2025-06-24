import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

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