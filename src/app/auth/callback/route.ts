import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  const googleRegistration = requestUrl.searchParams.get('google_registration');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);
      
      // Get the user from the session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        // Check if user is already in admin_users table
        const { data: existingAdmin } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        // If user is already an admin, redirect to admin dashboard
        if (existingAdmin) {
          return NextResponse.redirect(`${requestUrl.origin}/admin`);
        }
        
        // Handle Google registration flow - always require secret
        if (googleRegistration === 'true') {
          // Redirect back to login page with google_registration flag and user info
          // This will show the secret form
          return NextResponse.redirect(`${requestUrl.origin}/login?google_registration=true&user_id=${session.user.id}`);
        }
        
        // Handle regular Google login (not registration)
        // User tried to login with Google but isn't an admin
        await supabase.auth.signOut();
        return NextResponse.redirect(`${requestUrl.origin}/login?error=unauthorized`);
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`);
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${requestUrl.origin}/login`);
}