"use client";

import { useMutation } from '@tanstack/react-query';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export function useContactForm() {
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
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
  });
}