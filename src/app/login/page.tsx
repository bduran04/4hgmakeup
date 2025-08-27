"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // State for form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleRegisterLoading, setGoogleRegisterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Toggle between login and register views
  const [isRegisterView, setIsRegisterView] = useState(false);
  // State for Google registration flow
  const [showGoogleSecretForm, setShowGoogleSecretForm] = useState(false);
  
  // Store user info for Google registration
  const [pendingGoogleUser, setPendingGoogleUser] = useState<{id: string, email: string} | null>(null);

  // Check for session on initial load and handle URL errors
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log("Initial session check:", session);
      
      if (session) {
        // Check if user is admin
        const { data: adminUsers, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("user_id", session.user.id);
          
        const adminUser = adminUsers && adminUsers.length > 0 ? adminUsers[0] : null;
        console.log("Admin user check:", adminUser, adminError);
          
        if (!adminError && adminUser) {
          // If admin, redirect to admin dashboard
          router.push("/admin");
          return;
        } else if (session.user && !adminUser) {
          // User is authenticated but not an admin, check if they came from Google registration
          const urlParams = new URLSearchParams(window.location.search);
          const isGoogleRegistration = urlParams.get('google_registration');
          const userId = urlParams.get('user_id');
          
          if (isGoogleRegistration === 'true') {
            // Store user info for the secret form
            setPendingGoogleUser({
              id: session.user.id,
              email: session.user.email || ''
            });
            
            // Show the secret form for Google registration
            setShowGoogleSecretForm(true);
            setIsRegisterView(true);
            // Clear the URL parameters
            window.history.replaceState({}, '', window.location.pathname);
            return;
          } else {
            // Regular login attempt without admin privileges
            await supabase.auth.signOut();
            setError('Access denied. You are not authorized to access the admin panel.');
          }
        }
      } else {
        // No session, but check if we have URL params indicating we should have one
        const urlParams = new URLSearchParams(window.location.search);
        const isGoogleRegistration = urlParams.get('google_registration');
        
        if (isGoogleRegistration === 'true') {
          // Session was lost, show error
          setError('Session expired during registration. Please try again.');
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    };
    
    // Check for error messages in URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      switch (errorParam) {
        case 'unauthorized':
          setError('Access denied. You are not authorized to access the admin panel.');
          break;
        case 'admin_creation_failed':
          setError('Failed to create admin account. Please try again or contact support.');
          break;
        case 'auth_failed':
          setError('Authentication failed. Please try again.');
          break;
        default:
          setError('An authentication error occurred. Please try again.');
      }
      // Clear the error parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    checkSession();
  }, [supabase, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
              if (data.user) {
          // Check if user is admin and has one of the allowed emails
          const { data: adminUsers, error: adminError } = await supabase
            .from("admin_users")
            .select("*")
            .eq("user_id", data.user.id);
            
          const adminUser = adminUsers && adminUsers.length > 0 ? adminUsers[0] : null;
          if (adminError || !adminUser) {
            // If not an admin, sign out
            await supabase.auth.signOut();
            throw new Error("Access denied. You are not authorized to access the admin panel.");
          }
          
          // Check if the admin user has the specific email
          if (adminUser.email !== '4hisglorymakeup@gmail.com') {
            await supabase.auth.signOut();
            throw new Error("Access denied. Only the primary admin can access the admin panel.");
          }
          
          // If admin with correct email, redirect to admin dashboard
          router.push("/admin");
        }
    } catch (error) {
      console.error("Error during login:", error);
      setError(error instanceof Error ? error.message : "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
      
      // The user will be redirected to Google for authentication
    } catch (error) {
      console.error("Error during Google login:", error);
      setError(error instanceof Error ? error.message : "Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleRegisterLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?google_registration=true`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) throw error;
      
      // The user will be redirected to Google for authentication
      // After successful authentication, they'll be redirected back to show the secret form
    } catch (error) {
      console.error("Error during Google registration:", error);
      setError(error instanceof Error ? error.message : "Google registration failed. Please try again.");
      setGoogleRegisterLoading(false);
    }
  };

  const handleGoogleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Check for admin secret
    const validAdminSecret = "Mittens-is-beautiful";
    
    if (adminSecret !== validAdminSecret) {
      setError("Invalid admin secret key");
      setLoading(false);
      return;
    }

    try {
      console.log("Starting Google secret submit process...");
      
      // First try to get the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      console.log("Session data:", sessionData);
      console.log("Session error:", sessionError);
      
      let userToRegister;
      
      if (sessionData?.session?.user) {
        // Use session user if available
        userToRegister = sessionData.session.user;
        console.log("Using session user:", userToRegister);
      } else if (pendingGoogleUser) {
        // Use stored pending user if session is lost but we have user info
        console.log("Using pending user info:", pendingGoogleUser);
        userToRegister = pendingGoogleUser;
      } else {
        throw new Error("No user information available. Please try the registration process again.");
      }

      // Check if user already exists in admin_users
      console.log("Checking if user already exists in admin_users...");
      const { data: existingUsers, error: checkError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", userToRegister.id);
        
      const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;
      console.log("Existing user check:", existingUser);
      console.log("Check error:", checkError);

      if (existingUser) {
        setError("This Google account is already registered as an admin.");
        setLoading(false);
        return;
      }

      // Try to insert the new admin user
      console.log("Attempting to insert new admin user...");
      const insertData = {
        user_id: userToRegister.id,
        email: userToRegister.email || pendingGoogleUser?.email
      };
      
      console.log("Insert data:", insertData);
      
      const { data: insertResult, error: adminError } = await supabase
        .from("admin_users")
        .insert([insertData])
        .select();
        
      console.log("Insert result:", insertResult);
      console.log("Admin error:", adminError);
      
      if (adminError) {
        console.error("Detailed admin error:", {
          message: adminError.message,
          details: adminError.details,
          hint: adminError.hint,
          code: adminError.code
        });
        
        if (adminError.code === '23505') {
          setError("This Google account is already registered as an admin.");
        } else {
          throw new Error(`Database error: ${adminError.message} (Code: ${adminError.code})`);
        }
      } else {
        // Success
        console.log("Admin user created successfully!");
        setSuccess("Admin registration successful! Redirecting to dashboard...");
        
        // Clear pending user
        setPendingGoogleUser(null);
        
        // If we don't have a session, try to sign them in again
        if (!sessionData?.session) {
          setSuccess("Admin registration successful! Please login to continue.");
          setTimeout(() => {
            setShowGoogleSecretForm(false);
            setIsRegisterView(false);
            setAdminSecret("");
          }, 2000);
        } else {
          setTimeout(() => {
            router.push("/admin");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error during Google admin registration:", error);
      setError(error instanceof Error ? error.message : "Failed to complete admin registration.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    // Simple check for admin secret to prevent unauthorized registrations
    const validAdminSecret = "Mittens-is-beautiful";
    
    if (adminSecret !== validAdminSecret) {
      setError("Invalid admin secret key");
      setLoading(false);
      return;
    }
    
    try {
      // Register new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Add user to admin_users table
        const { error: adminError } = await supabase
          .from("admin_users")
          .insert([
            { 
              user_id: authData.user.id,
              email: authData.user.email
            }
          ]);
          
        if (adminError) throw adminError;
        
        // Show success message
        setSuccess("Registration successful! Please check your email to confirm your account before logging in.");
        
        // Reset form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAdminSecret("");
        
        // Switch back to login view
        setIsRegisterView(false);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setError(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setIsRegisterView(!isRegisterView);
    setShowGoogleSecretForm(false);
    setPendingGoogleUser(null);
    setError(null);
    setSuccess(null);
    setAdminSecret("");
    // Clear form fields
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const cancelGoogleRegistration = async () => {
    await supabase.auth.signOut();
    setShowGoogleSecretForm(false);
    setIsRegisterView(false);
    setPendingGoogleUser(null);
    setAdminSecret("");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beauty-beige">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-beauty-brown">
          {showGoogleSecretForm ? "Complete Google Registration" : 
           isRegisterView ? "Admin Registration" : "Admin Login"}
        </h1>
        
        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
            {success}
          </div>
        )}
        
        {showGoogleSecretForm ? (
          <form onSubmit={handleGoogleSecretSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <p className="text-sm text-blue-800">
                To complete your admin registration with Google{pendingGoogleUser ? ` (${pendingGoogleUser.email})` : ''}, please enter the admin secret key below.
              </p>
            </div>
            
            <div>
              <label htmlFor="adminSecret" className="block text-sm font-medium mb-1 text-beauty-brown">Admin Secret Key</label>
              <input
                id="adminSecret"
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                required
                placeholder="Enter admin secret key"
              />
              <p className="text-xs text-gray-500 mt-1">Required to complete admin registration</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition disabled:opacity-50"
              >
                {loading ? "Completing..." : "Complete Registration"}
              </button>
              
              <button
                type="button"
                onClick={cancelGoogleRegistration}
                disabled={loading}
                className="flex-1 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring transition disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : isRegisterView ? (
          <>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1 text-beauty-brown">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1 text-beauty-brown">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-beauty-brown">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="adminSecret" className="block text-sm font-medium mb-1 text-beauty-brown">Admin Secret Key</label>
                <input
                  id="adminSecret"
                  type="password"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Required for admin registration</p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition disabled:opacity-50"
              >
                {loading ? "Registering..." : "Register with Email"}
              </button>
            </form>
            
            <div className="relative flex items-center justify-center mt-6 mb-6">
              <div className="absolute w-full border-t border-gray-300"></div>
              <div className="relative bg-white px-4 text-sm text-gray-500">Or register with</div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={googleRegisterLoading}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-beauty-gold focus:ring-opacity-50"
            >
              <div className="relative w-5 h-5">
                <Image 
                  src="/google.svg" 
                  alt="Google" 
                  fill
                  style={{ objectFit: "contain" }}
                  unoptimized
                />
              </div>
              <span>{googleRegisterLoading ? "Connecting..." : "Register with Google"}</span>
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={toggleView}
                className="text-beauty-brown hover:text-beauty-gold hover:underline focus:outline-none"
              >
                Already have an account? Login
              </button>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1 text-beauty-brown">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1 text-beauty-brown">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            
            <div className="relative flex items-center justify-center mt-6 mb-6">
              <div className="absolute w-full border-t border-gray-300"></div>
              <div className="relative bg-white px-4 text-sm text-gray-500">Or continue with</div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-beauty-gold focus:ring-opacity-50"
            >
              <div className="relative w-5 h-5">
                <Image 
                  src="/google.svg" 
                  alt="Google" 
                  fill
                  style={{ objectFit: "contain" }}
                  unoptimized
                />
              </div>
              <span>{googleLoading ? "Connecting..." : "Login with Google"}</span>
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={toggleView}
                className="text-beauty-brown hover:text-beauty-gold hover:underline focus:outline-none"
              >
                Need an admin account? Register
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}