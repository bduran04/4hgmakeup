import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { fetchAdminDataByUserId } from '@/lib/utils/admin-data';

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      // Check if user is admin and get their data
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email')
        .eq('user_id', user.id);
      
      if (!data || error || data.length === 0) return false;
      
      // Allow access for both admin emails
      return data[0].email === '4hisglorymakeup@gmail.com' || data[0].email === 'bduran04@gmail.com';
    },
    enabled: !!user?.id,
  });

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return { isAdmin, isLoading, signIn, signOut, user };
};