'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useServices } from '@/lib/queries';
import { Clock, DollarSign, Users, Calendar } from 'lucide-react';

// Define the Service type
type Service = {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    category: string; // Add this line to define the 'category' property
    icon: string;
    created_at: string;
    long_description?: string; // Optional property
  };


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
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Our Services</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredServices.map((service) => (
                <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                  <div className="aspect-video relative">
                    <Image 
                      src={`/images/services/${service.category}.jpg`}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 flex-grow">
                    <h2 className="text-2xl font-serif text-beauty-brown mb-2">{service.title}</h2>
                    <p className="text-gray-700 mb-4">{service.description}</p>
                    
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock size={16} className="mr-1" />
                        <span>{service.duration} minutes</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign size={16} className="mr-1" />
                        <span>${service.price}</span>
                      </div>
                    </div>
                    
                    {service.description && (
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-beauty-brown mb-2">What to Expect</h3>
                        <p className="text-gray-700">{service.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-6 pt-0 mt-auto">
                    <Link 
                      href="/scheduling"
                      className="block w-full bg-beauty-brown text-white text-center py-3 rounded hover:bg-opacity-90 transition-all"
                    >
                      Book Now
                    </Link>
                  </div>
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
      
      {/* Process Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-beauty-brown mb-4">Our Process</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              We believe in a personalized approach to makeup. Here's what to expect when you book with us.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-beauty-brown/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-beauty-brown h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif text-beauty-brown mb-2">1. Book</h3>
              <p className="text-gray-700">
                Schedule your appointment online or give us a call to find a time that works for you.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-beauty-brown/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-beauty-brown h-8 w-8" />
              </div>
              <h3 className="text-xl font-serif text-beauty-brown mb-2">2. Consult</h3>
              <p className="text-gray-700">
                We'll discuss your vision, preferences, and the occasion to create your perfect look.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-beauty-brown/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-beauty-brown h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-beauty-brown mb-2">3. Create</h3>
              <p className="text-gray-700">
                Our artists use premium products to enhance your natural beauty and create your ideal look.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-beauty-brown/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="text-beauty-brown h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-beauty-brown mb-2">4. Enjoy</h3>
              <p className="text-gray-700">
                Look and feel your best with makeup that enhances your natural beauty and lasts throughout your event.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Products Section */}
      <section className="py-20 px-4 bg-beauty-beige">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <Image 
                src="/images/products.jpg" 
                alt="Premium Makeup Products" 
                width={500} 
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-serif text-beauty-brown mb-6">Premium Products</h2>
              <p className="text-gray-700 mb-4">
                We use only high-quality, cruelty-free products that look beautiful on camera and in person.
              </p>
              <p className="text-gray-700 mb-6">
                Our professional kit includes brands like Charlotte Tilbury, Pat McGrath, NARS, Bobbi Brown, and more to ensure flawless, long-lasting makeup for any occasion.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-medium text-beauty-brown mb-1">Long-Lasting</h3>
                  <p className="text-sm text-gray-600">Makeup that stays fresh from day to night</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-medium text-beauty-brown mb-1">Skin-Friendly</h3>
                  <p className="text-sm text-gray-600">Non-comedogenic formulas for all skin types</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-medium text-beauty-brown mb-1">HD-Ready</h3>
                  <p className="text-sm text-gray-600">Camera-friendly for perfect photos</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-medium text-beauty-brown mb-1">Cruelty-Free</h3>
                  <p className="text-sm text-gray-600">Ethical products that perform beautifully</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-beauty-gold/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-beauty-brown mb-4">Ready to Book Your Appointment?</h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Schedule your makeup service today and let us enhance your natural beauty for your special occasion.
          </p>
          <Link 
            href="/scheduling" 
            className="bg-beauty-brown text-white px-8 py-3 rounded hover:bg-opacity-90 transition-all inline-block"
          >
            Book Now
          </Link>
        </div>
      </section>
    </main>
  );
}