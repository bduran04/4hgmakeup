'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Clock, DollarSign } from 'lucide-react';
import { useServices } from '@/lib/queries';

// Service categories
const categories = [
  { id: 'all', name: 'All Services' },
  { id: 'bridal', name: 'Bridal' },
  { id: 'special_event', name: 'Special Events' },
  { id: 'photoshoot', name: 'Photoshoots' },
  { id: 'lesson', name: 'Lessons' },
  { id: 'editorial', name: 'Editorial' },
];

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const { data: services, isLoading } = useServices();
  
  // Filter services based on active category
  const filteredServices = activeCategory === 'all'
    ? services
    : services?.filter(service => service.category === activeCategory);
    
  return (
    <main className="min-h-screen bg-beauty-beige">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-beauty-brown">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">My Services</h1>
          <p className="text-beauty-beige text-lg max-w-2xl mx-auto">
            Professional makeup services tailored to your unique style and occasion.
          </p>
        </div>
      </section>
      
      {/* Category Filters */}
      <section className="py-8 px-4 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full transition-all ${
                  activeCategory === category.id
                    ? 'bg-beauty-brown text-white'
                    : 'bg-beauty-beige hover:bg-beauty-brown/20'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beauty-brown"></div>
            </div>
          ) : filteredServices && filteredServices.length > 0 ? (
            <div className="space-y-8">
              {filteredServices.map((service) => (
                <div key={service.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-serif text-beauty-brown mb-2">{service.title}</h2>
                    </div>
                    
                    <div className="flex flex-col space-y-2 md:items-end mt-4 md:mt-0">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock size={16} className="mr-1" />
                        <span>{service.duration} minutes</span>
                      </div>
                      <div className="flex items-center text-sm font-medium text-beauty-brown">
                        <DollarSign size={16} className="mr-1" />
                        <span>{service.price}</span>
                      </div>
                      <Link 
                        href="/scheduling"
                        className="mt-2 inline-block bg-beauty-brown text-white px-4 py-2 rounded text-sm hover:bg-opacity-90 transition-all"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                  
                  {service.description && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h3 className="text-lg font-medium text-beauty-brown mb-2">Details</h3>
                      <p className="text-gray-700">{service.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No services found in this category.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Booking Process Section */}
      <section className="py-16 px-4 bg-beauty-beige">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-beauty-brown mb-6">How to Book</h2>
          <p className="text-gray-700 mb-10 max-w-2xl mx-auto">
            Booking your makeup service is simple! Follow these steps to schedule your appointment:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-beauty-brown text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-medium">1</div>
              <h3 className="text-lg font-medium text-beauty-brown mb-2">Choose a Service</h3>
              <p className="text-gray-600">Select the service that best fits your needs and occasion.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-beauty-brown text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-medium">2</div>
              <h3 className="text-lg font-medium text-beauty-brown mb-2">Select a Date & Time</h3>
              <p className="text-gray-600">Pick from available dates and times that work with your schedule.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-beauty-brown text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-medium">3</div>
              <h3 className="text-lg font-medium text-beauty-brown mb-2">Confirm Details</h3>
              <p className="text-gray-600">Provide your information and any special requests or needs.</p>
            </div>
          </div>
          
          <div className="mt-12">
            <Link 
              href="/scheduling" 
              className="bg-beauty-brown text-white px-8 py-3 rounded hover:bg-opacity-90 transition-all"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>
      
      {/* FAQ Preview Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-beauty-brown mb-4">Common Questions</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Here are some frequently asked questions about my services.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-beauty-beige rounded-lg p-6">
              <h3 className="text-lg font-medium text-beauty-brown mb-2">How long does a makeup session take?</h3>
              <p className="text-gray-700">Most makeup applications take between 45-60 minutes depending on the complexity of the look. Bridal makeup may take 60-90 minutes.</p>
            </div>
            
            <div className="bg-beauty-beige rounded-lg p-6">
              <h3 className="text-lg font-medium text-beauty-brown mb-2">Do you offer trials for bridal makeup?</h3>
              <p className="text-gray-700">Yes, I highly recommend scheduling a trial 2-4 weeks before your wedding to perfect your look and address any concerns.</p>
            </div>
            
            <div className="bg-beauty-beige rounded-lg p-6">
              <h3 className="text-lg font-medium text-beauty-brown mb-2">Do you travel to clients?</h3>
              <p className="text-gray-700">Yes, I offer on-location services for weddings and special events. Travel fees may apply depending on the distance.</p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link 
              href="/faq" 
              className="text-beauty-brown border-b-2 border-beauty-brown pb-1 hover:text-beauty-gold hover:border-beauty-gold transition-all"
            >
              View All FAQs
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-beauty-gold/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-beauty-brown mb-4">Ready to Book Your Appointment?</h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Let me help you look and feel your best for your special occasion.
          </p>
          <Link 
            href="/scheduling" 
            className="bg-beauty-brown text-white px-8 py-3 rounded hover:bg-opacity-90 transition-all"
          >
            Book Now
          </Link>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}