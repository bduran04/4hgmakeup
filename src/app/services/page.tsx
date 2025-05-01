'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Clock, DollarSign, X } from 'lucide-react';
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

// Service modal interface
interface ServiceModalProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

// Service Modal Component
const ServiceModal = ({ service, isOpen, onClose }: ServiceModalProps) => {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-serif text-beauty-brown">{service.title}</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-beauty-brown transition-colors"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={16} className="mr-1" />
              <span>{service.duration} minutes</span>
            </div>
            <div className="flex items-center text-sm font-medium text-beauty-brown">
              <DollarSign size={16} className="mr-1" />
              <span>{service.price}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-line">{service.description}</p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-end">
              <Link
                href="/contact"
                className="bg-beauty-brown text-white px-6 py-3 rounded hover:bg-opacity-90 transition-all"
              >
                Contact for Booking
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: services, isLoading } = useServices();

  // Filter services based on active category
  const filteredServices = activeCategory === 'all'
    ? services
    : services?.filter(service => service.category === activeCategory);
    
  const openServiceModal = (service: any) => {
    setSelectedService(service);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };
  
  const closeServiceModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div 
                  key={service.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openServiceModal(service)}
                >
                  <div className="p-6">
                    <h2 className="text-xl font-serif text-beauty-brown mb-3">{service.title}</h2>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock size={16} className="mr-1" />
                        <span>{service.duration} minutes</span>
                      </div>
                      <div className="flex items-center text-sm font-medium text-beauty-brown">
                        <DollarSign size={16} className="mr-1" />
                        <span>{service.price}</span>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-beauty-brown">
                      <span className="flex justify-center">Click for details</span>
                    </div>
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

      {/* Service Modal */}
      <ServiceModal 
        service={selectedService} 
        isOpen={isModalOpen} 
        onClose={closeServiceModal} 
      />

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

      {/* Contact CTA Section */}
      <section className="py-24 px-4 bg-beauty-gold/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-beauty-brown mb-4">Ready to Transform Your Look?</h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Get in touch to discuss your makeup needs and book your appointment.
          </p>
          <div className="flex justify-center">
            <Link
              href="/contact"
              className="bg-beauty-brown text-white px-8 py-3 rounded hover:bg-opacity-90 transition-all"
            >
              Contact Me
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}