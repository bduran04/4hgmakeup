export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export async function fetcher<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}