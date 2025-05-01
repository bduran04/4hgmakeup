'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useFAQs } from '@/lib/queries';
import Link from 'next/link';

// FAQ item interface
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
}

const categories = [
  { id: 'all', name: 'All' },
  { id: 'Services', name: 'Services' },
  { id: 'Booking', name: 'Booking' },
  { id: 'Products', name: 'Products' },
  { id: 'Payment', name: 'Payment' },
  { id: 'Policies', name: 'Policies' }
];

export default function FAQ() {

  function useFAQsByCategory(category: string): { data: FAQItem[] | null; isLoading: boolean } {
    const [data, setData] = useState<FAQItem[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
      const fetchFAQs = async () => {
        setIsLoading(true);
        try {
          const { data: fetchedData, error } = await supabase
            .from('faqs')
            .select('*')
            .eq('category', category)
            .order('display_order', { ascending: true });

          if (error) {
            console.error('Error fetching FAQs by category:', error);
            setData(null);
          } else {
            setData(fetchedData);
          }
        } catch (err) {
          console.error('Unexpected error fetching FAQs by category:', err);
          setData(null);
        } finally {
          setIsLoading(false);
        }
      };

      if (category) {
        fetchFAQs();
      } else {
        setData(null);
        setIsLoading(false);
      }
    }, [category]);

    return { data, isLoading };
  }
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Use the appropriate query hook based on selected category
  const { data: allFAQs, isLoading: allLoading } = useFAQs();
  const { data: categoryFAQs, isLoading: categoryLoading } =
    useFAQsByCategory(activeCategory !== 'all' ? activeCategory : '');

  // Determine which data and loading state to use
  const isLoading = activeCategory === 'all' ? allLoading : categoryLoading;
  const faqItems: FAQItem[] = (activeCategory === 'all' ? allFAQs : categoryFAQs) ?? [];

  // Toggle FAQ item expansion
  const toggleItem = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // Filter FAQ items based on search query
  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-beauty-beige">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-beauty-brown">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-beauty-beige text-lg max-w-2xl mx-auto">
            Find answers to common questions about my services, booking process, and policies.
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 px-4 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-1/2">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-beauty-brown focus:border-beauty-brown"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2 w-full md:w-1/2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${activeCategory === category.id
                      ? 'bg-beauty-brown text-white'
                      : 'bg-beauty-beige hover:bg-beauty-brown/20'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Items Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beauty-brown"></div>
            </div>
          ) : filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex justify-between items-center p-5 text-left hover:bg-beauty-beige/30 transition-colors"
                  >
                    <h3 className="text-lg font-medium text-beauty-brown">{item.question}</h3>
                    <span className="ml-4 flex-shrink-0">
                      {expandedItems.includes(item.id) ? (
                        <ChevronUp className="h-5 w-5 text-beauty-brown" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-beauty-brown" />
                      )}
                    </span>
                  </button>
                  {expandedItems.includes(item.id) && (
                    <div className="p-5 border-t border-beauty-beige">
                      <p className="text-gray-700">{item.answer}</p>
                      <div className="mt-3 text-sm text-beauty-gold">
                        Category: {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No FAQ items found matching your search criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-4 text-beauty-brown underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-24 px-4 bg-beauty-gold/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-beauty-brown mb-4">Ready to Transform Your Look?</h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Book your appointment today and let us enhance your natural beauty.
          </p>
          <div className="flex justify-center">
            <Link
              href="/contact"
              className="bg-transparent border-2 border-beauty-brown text-beauty-brown px-8 py-3 rounded hover:bg-beauty-brown hover:text-white transition-all"
            >
              Contact Me
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

