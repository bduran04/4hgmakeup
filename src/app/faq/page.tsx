'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

// FAQ item interface
interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

// FAQ categories
const categories = [
  'All',
  'Services',
  'Booking',
  'Products',
  'Payment',
  'Policies'
];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  
  // Toggle FAQ item expansion
  const toggleItem = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };
  
  // Sample FAQ data
  const faqItems: FAQItem[] = [
    {
      question: "What services do you offer?",
      answer: "I offer a wide range of makeup services including bridal makeup, special event makeup, photoshoot makeup, editorial makeup, and personalized makeup lessons. Each service is tailored to your unique features and style preferences.",
      category: "Services"
    },
    {
      question: "How far in advance should I book for my wedding?",
      answer: "For weddings, I recommend booking 3-6 months in advance, especially during peak wedding season (May-October). This ensures we can accommodate your preferred date and allows time for a trial session if desired.",
      category: "Booking"
    },
    {
      question: "Do you offer trials for bridal makeup?",
      answer: "Yes, I highly recommend scheduling a bridal trial 1-2 months before your wedding. This allows us to perfect your look and make any adjustments needed before your big day.",
      category: "Services"
    },
    {
      question: "What makeup brands do you use?",
      answer: "I use high-quality, professional makeup brands including Charlotte Tilbury, NARS, Bobbi Brown, MAC, and other premium products. All products are chosen for their performance, quality, and staying power.",
      category: "Products"
    },
    {
      question: "How long does a makeup application take?",
      answer: "Application times vary by service: standard makeup takes 45-60 minutes, while bridal makeup typically takes 60-90 minutes. We recommend allowing extra time for your appointment to ensure a relaxed experience.",
      category: "Services"
    },
    {
      question: "Do you travel to clients?",
      answer: "Yes, I offer on-location services for weddings and special events. Travel fees may apply depending on the distance. Please note your location when booking.",
      category: "Services"
    },
    {
      question: "What is your cancellation policy?",
      answer: "I require 48 hours notice for cancellations. Cancellations made with less than 48 hours notice may be subject to a 50% fee. No-shows are charged the full service amount.",
      category: "Policies"
    },
    {
      question: "Do you offer group services for weddings?",
      answer: "Yes, I offer services for the entire bridal party. For groups of 4 or more, we can bring additional makeup artists to ensure everyone is ready on time.",
      category: "Services"
    },
    {
      question: "How can I prepare for my makeup appointment?",
      answer: "Please arrive with a clean, moisturized face. Wear a button-up or zip-up top that can be easily removed without disturbing your makeup. Bring reference photos of looks you like if you have specific ideas in mind.",
      category: "Services"
    },
    {
      question: "What forms of payment do you accept?",
      answer: "We accept credit/debit cards, Venmo, and PayPal. For weddings and large events, a 50% deposit is required to secure your date, with the balance due on the day of service.",
      category: "Payment"
    },
    {
      question: "Are your makeup products hypoallergenic?",
      answer: "Many of our products are hypoallergenic, but I recommend informing us of any allergies or sensitivities during booking. I can tailor our product selection to accommodate your needs.",
      category: "Products"
    },
    {
      question: "Can I book a makeup lesson?",
      answer: "Yes, I offer personalized makeup lessons where you'll learn techniques specific to your features, style, and skill level. I also provide product recommendations tailored to your needs.",
      category: "Booking"
    },
    {
      question: "How long will my makeup last?",
      answer: "Our professional techniques and high-quality products ensure your makeup will last 8-12 hours. For extended wear, we can use setting products to maximize longevity.",
      category: "Products"
    },
    {
      question: "Do you do makeup for photoshoots?",
      answer: "Yes, we specialize in photo-ready makeup that looks beautiful both in person and on camera. We understand lighting considerations and how to create flawless looks for different types of photography.",
      category: "Services"
    },
    {
      question: "What is your booking process?",
      answer: "You can book through our online scheduling system, by phone, or email. We'll confirm your appointment and send a reminder 48 hours before. For special events, we'll discuss your needs and preferences in advance.",
      category: "Booking"
    }
  ];
  
  // Filter FAQ items based on category and search query
  const filteredFAQs = faqItems.filter(item => 
    (activeCategory === 'All' || item.category === activeCategory) &&
    (item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <main className="min-h-screen bg-beauty-beige">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-beauty-brown">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-beauty-beige text-lg max-w-2xl mx-auto">
            Find answers to common questions about our services, booking process, and policies.
          </p>
        </div>
      </section>
      
      {/* Search & Filter Section */}
      <section className="py-8 px-4 bg-white shadow-sm sticky top-0 z-20">
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
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    activeCategory === category
                      ? 'bg-beauty-brown text-white'
                      : 'bg-beauty-beige hover:bg-beauty-brown/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Items Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((item, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full flex justify-between items-center p-5 text-left hover:bg-beauty-beige/30 transition-colors"
                  >
                    <h3 className="text-lg font-medium text-beauty-brown">{item.question}</h3>
                    <span className="ml-4 flex-shrink-0">
                      {expandedItems.includes(index) ? (
                        <ChevronUp className="h-5 w-5 text-beauty-brown" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-beauty-brown" />
                      )}
                    </span>
                  </button>
                  {expandedItems.includes(index) && (
                    <div className="p-5 border-t border-beauty-beige">
                      <p className="text-gray-700">{item.answer}</p>
                      <div className="mt-3 text-sm text-beauty-gold">
                        Category: {item.category}
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
                  setActiveCategory('All');
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
      <section className="py-16 px-4 bg-beauty-gold/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-beauty-brown mb-4">Still Have Questions?</h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            If you couldn't find the answer you were looking for, feel free to contact us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-beauty-brown text-white px-8 py-3 rounded hover:bg-opacity-90 transition-all"
            >
              Contact Us
            </a>
            <a 
              href="/scheduling" 
              className="bg-transparent border-2 border-beauty-brown text-beauty-brown px-8 py-3 rounded hover:bg-beauty-brown hover:text-white transition-all"
            >
              Book Consultation
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}