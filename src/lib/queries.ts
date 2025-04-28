import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Portfolio, Service } from './supabase';

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
      return data;
    },
  });
};

// Fetch portfolio items by category
export const usePortfolioItemsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['images', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('images')  // Changed from 'portfolio' to 'images'
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!category,
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