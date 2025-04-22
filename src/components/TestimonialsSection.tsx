'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  client_name: string;
  client_image_url?: string;
  service_type: string;
  testimonial: string;
  rating: number;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleTestimonials, setVisibleTestimonials] = useState<Testimonial[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // Update visible testimonials based on screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      const maxVisible = mobile ? 1 : 3;
      updateVisibleTestimonials(maxVisible);
    };
    
    // Call once on mount
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [testimonials]);
  
  const updateVisibleTestimonials = (maxVisible: number) => {
    if (testimonials.length === 0) return;
    
    const endIndex = Math.min(currentIndex + maxVisible, testimonials.length);
    const startIndex = endIndex - maxVisible < 0 ? 0 : endIndex - maxVisible;
    
    setVisibleTestimonials(testimonials.slice(startIndex, endIndex));
  };
  
  const goToPrevious = () => {
    const maxVisible = isMobile ? 1 : 3;
    const newIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(newIndex);
    updateVisibleTestimonials(maxVisible);
  };
  
  const goToNext = () => {
    const maxVisible = isMobile ? 1 : 3;
    const newIndex = Math.min(currentIndex + 1, testimonials.length - maxVisible);
    setCurrentIndex(newIndex);
    updateVisibleTestimonials(maxVisible);
  };
  
  const canGoPrevious = currentIndex > 0;
  const canGoNext = isMobile 
    ? currentIndex < testimonials.length - 1 
    : currentIndex < testimonials.length - 3;
  
  return (
    <section className="py-20 px-4 bg-beauty-beige">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif text-beauty-brown mb-4">What Our Clients Say</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Read testimonials from real clients who have experienced our services.
          </p>
        </div>
        
        <div className="relative">
          {/* Desktop Navigation Arrows */}
          <div className="hidden md:block">
            <button
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-beauty-brown/80 text-white p-2 rounded-full transform -translate-x-1/2 ${
                !canGoPrevious ? 'opacity-50 cursor-not-allowed' : 'hover:bg-beauty-brown'
              }`}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-beauty-brown/80 text-white p-2 rounded-full transform translate-x-1/2 ${
                !canGoNext ? 'opacity-50 cursor-not-allowed' : 'hover:bg-beauty-brown'
              }`}
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          {/* Testimonials */}
          <div className="flex flex-col md:flex-row md:justify-center gap-6 overflow-x-hidden">
            {visibleTestimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="bg-white p-6 rounded-lg shadow-md flex-1 min-w-[280px] max-w-sm mx-auto md:mx-0"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-beauty-gold">
                    {testimonial.client_image_url ? (
                      <Image
                        src={testimonial.client_image_url}
                        alt={testimonial.client_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-beauty-brown text-white text-xl font-medium">
                        {testimonial.client_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-beauty-brown">{testimonial.client_name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.service_type}</p>
                    
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < testimonial.rating ? 'text-beauty-gold fill-beauty-gold' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <blockquote className="text-gray-700 italic">
                  "{testimonial.testimonial}"
                </blockquote>
              </div>
            ))}
          </div>
          
          {/* Mobile Pagination */}
          <div className="flex justify-center mt-6 md:hidden">
            <button
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              className={`mx-2 bg-beauty-brown/80 text-white p-2 rounded-full ${
                !canGoPrevious ? 'opacity-50 cursor-not-allowed' : 'hover:bg-beauty-brown'
              }`}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center mx-4">
              <span className="text-beauty-brown font-medium">{currentIndex + 1}</span>
              <span className="text-gray-500 mx-1">/</span>
              <span className="text-gray-500">{testimonials.length}</span>
            </div>
            
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className={`mx-2 bg-beauty-brown/80 text-white p-2 rounded-full ${
                !canGoNext ? 'opacity-50 cursor-not-allowed' : 'hover:bg-beauty-brown'
              }`}
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}