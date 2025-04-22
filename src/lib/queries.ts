// src/lib/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Portfolio, Service } from './supabase';

// Portfolio Queries
export const usePortfolioItems = () => {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Portfolio[];
    },
  });
};

export const usePortfolioItemsByCategory = (category: string) => {
  return useQuery({
    queryKey: ['portfolio', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Portfolio[];
    },
    enabled: !!category,
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