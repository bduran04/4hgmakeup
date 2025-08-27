"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { fetchAdminDataByUserId } from "@/lib/utils/admin-data";

// Types
type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  created_at: string;
};

export default function FAQManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();
  const editFormRef = useRef<HTMLDivElement>(null);
  
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [displayOrder, setDisplayOrder] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Check if user is authenticated and an admin
  const { data: adminData, isLoading: isAdminLoading, error: adminError } = useQuery({
    queryKey: ["adminUser"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        throw new Error("Not authenticated");
      }
      
      // Check if user is admin and get their data
      const { data: adminUsers, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", session.user.id);
        
      const adminUser = adminUsers && adminUsers.length > 0 ? adminUsers[0] : null;
        
      if (adminError || !adminUser) {
        router.push("/");
        throw new Error("Not authorized as admin");
      }
      
      // Fetch admin data using utility function
      const adminData = await fetchAdminDataByUserId(session.user.id);
      
      if (!adminData) {
        throw new Error("Failed to fetch admin data");
      }
      
      return { ...adminUser, ...adminData };
    },
    retry: false
  });

  // Fetch FAQs
  const { data: faqs, isLoading: isFAQsLoading, error: faqsError } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      console.log("Fetching FAQs...");
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching FAQs:", error);
        throw error;
      }
      
      console.log("FAQs fetched:", data);
      return data as FAQ[];
    },
    enabled: !!adminData
  });

  // Get unique categories
  const categories = faqs 
    ? Array.from(new Set(faqs.map(faq => faq.category).filter(Boolean)))
    : [];

  // Filter FAQs by category
  const filteredFAQs = faqs
    ? selectedCategory === "all" 
      ? faqs 
      : faqs.filter(faq => faq.category === selectedCategory)
    : [];
  
  // Create FAQ mutation
  const createFAQ = useMutation({
    mutationFn: async () => {
      if (!question.trim()) throw new Error("Please enter a question");
      if (!answer.trim()) throw new Error("Please enter an answer");
      if (!category.trim()) throw new Error("Please enter a category");
      
      setIsLoading(true);
      
      try {
        // Create FAQ
        const { data, error } = await supabase
          .from("faqs")
          .insert([{
            question: question.trim(),
            answer: answer.trim(),
            category: category.trim(),
            display_order: displayOrder.trim() ? parseInt(displayOrder) : 0
          }])
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error("Error creating FAQ:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setMessage({ type: "success", text: "FAQ created successfully!" });
      resetForm();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    },
    onError: (error) => {
      setMessage({ type: "error", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` });
    }
  });
  
  // Update FAQ mutation
  const updateFAQ = useMutation({
    mutationFn: async () => {
      if (!selectedFAQ) throw new Error("No FAQ selected");
      if (!question.trim()) throw new Error("Please enter a question");
      if (!answer.trim()) throw new Error("Please enter an answer");
      if (!category.trim()) throw new Error("Please enter a category");
      
      setIsLoading(true);
      
      try {
        // Update FAQ
        const { data, error } = await supabase
          .from("faqs")
          .update({
            question: question.trim(),
            answer: answer.trim(),
            category: category.trim(),
            display_order: displayOrder.trim() ? parseInt(displayOrder) : 0
          })
          .eq("id", selectedFAQ.id)
          .select()
          .single();
          
        if (error) throw error;
        
        return data;
      } catch (error) {
        console.error("Error updating FAQ:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setMessage({ type: "success", text: "FAQ updated successfully!" });
      resetForm();
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    },
    onError: (error) => {
      setMessage({ type: "error", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` });
    }
  });
  
  // Delete FAQ mutation
  const deleteFAQ = useMutation({
    mutationFn: async (faqId: string) => {
      try {
        const { error } = await supabase
          .from("faqs")
          .delete()
          .eq("id", faqId);
          
        if (error) throw error;
        
        return { success: true };
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setMessage({ type: "success", text: "FAQ deleted successfully!" });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    },
    onError: (error) => {
      setMessage({ type: "error", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` });
    }
  });
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && selectedFAQ) {
      updateFAQ.mutate();
    } else {
      createFAQ.mutate();
    }
  };
  
  // Handle edit FAQ
  const handleEditFAQ = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category);
    setDisplayOrder(faq.display_order.toString());
    setIsEditing(true);
    
    // Scroll to edit form after a brief delay to allow state updates
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };
  
  // Handle delete FAQ
  const handleDeleteFAQ = (faqId: string) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      deleteFAQ.mutate(faqId);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setSelectedFAQ(null);
    setQuestion("");
    setAnswer("");
    setCategory("");
    setDisplayOrder("");
    setIsEditing(false);
  };

  // Handle going back to admin dashboard
  const handleBackToAdmin = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      router.push("/");
    }
  };
  
  if (isAdminLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (adminError) {
    return <div className="text-red-500 p-4">Access denied. Please log in as an admin.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-beauty-brown">FAQ Management</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-beauty-beige text-beauty-brown rounded hover:bg-gray-200 focus:outline-none focus:ring transition"
          >
            Back to Dashboard
          </button>
          <button 
            onClick={handleBackToAdmin}
            className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition"
          >
            Logout & Exit
          </button>
        </div>
      </div>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {/* Debug Info */}
      {faqsError && (
        <div className="p-4 mb-4 rounded bg-red-100 text-red-800">
          <strong>Database Error:</strong> {faqsError.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div ref={editFormRef} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-beauty-brown">{isEditing ? "Edit FAQ" : "Add New FAQ"}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="question" className="block text-sm font-medium mb-1 text-beauty-brown">Question *</label>
                <textarea
                  id="question"
                  rows={3}
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  placeholder="Enter the frequently asked question..."
                />
              </div>
              
              <div>
                <label htmlFor="answer" className="block text-sm font-medium mb-1 text-beauty-brown">Answer *</label>
                <textarea
                  id="answer"
                  rows={6}
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  placeholder="Enter the detailed answer..."
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1 text-beauty-brown">Category *</label>
                <input
                  type="text"
                  id="category"
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  placeholder="e.g. general, booking, pricing, services"
                />
              </div>

              <div>
                <label htmlFor="displayOrder" className="block text-sm font-medium mb-1 text-beauty-brown">Display Order</label>
                <input
                  type="number"
                  id="displayOrder"
                  min="0"
                  className="w-full p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  placeholder="0 (lower numbers appear first)"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first. Leave empty or 0 for default ordering.</p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-beauty-brown text-white rounded hover:bg-beauty-gold focus:outline-none focus:ring transition disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : isEditing ? "Update FAQ" : "Add FAQ"}
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-beauty-beige text-beauty-brown rounded hover:bg-gray-200 focus:outline-none focus:ring transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-beauty-brown">FAQs List ({filteredFAQs.length})</h2>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="categoryFilter" className="text-sm font-medium text-beauty-brown">Filter:</label>
                <select
                  id="categoryFilter"
                  className="p-2 border rounded focus:ring focus:ring-beauty-gold focus:border-beauty-gold"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {isFAQsLoading ? (
              <div className="p-6 text-center">Loading FAQs...</div>
            ) : filteredFAQs && filteredFAQs.length > 0 ? (
              <div className="divide-y">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-beauty-brown">{faq.question}</h3>
                          <span className="inline-block bg-beauty-brown bg-opacity-20 rounded-full px-3 py-1 text-sm font-semibold text-beauty-brown">
                            {faq.category}
                          </span>
                          {faq.display_order > 0 && (
                            <span className="inline-block bg-beauty-gold text-white rounded-full px-2 py-1 text-xs font-semibold">
                              #{faq.display_order}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Created: {new Date(faq.created_at).toLocaleDateString()}
                      </p>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditFAQ(faq)}
                          className="px-3 py-1 bg-beauty-beige text-beauty-brown border border-beauty-brown rounded hover:bg-gray-200 focus:outline-none focus:ring transition"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 focus:outline-none focus:ring transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                {selectedCategory === "all" 
                  ? "No FAQs found. Add your first FAQ using the form."
                  : `No FAQs found in the "${selectedCategory}" category.`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}