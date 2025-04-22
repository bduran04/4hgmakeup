// src/app/gallery/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePortfolioItems, usePortfolioItemsByCategory } from '@/lib/queries';
import Navbar from '@/components/Navbar';
import { X } from 'lucide-react';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'bridal', name: 'Bridal' },
  { id: 'special_event', name: 'Special Events' },
  { id: 'photoshoot', name: 'Photoshoots' },
  { id: 'editorial', name: 'Editorial' },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedItemDetails, setSelectedItemDetails] = useState<{
    title: string;
    description: string;
  } | null>(null);
  
  const { data: allPortfolioItems, isLoading: allLoading } = usePortfolioItems();
  const { data: categoryItems, isLoading: categoryLoading } = 
    usePortfolioItemsByCategory(activeCategory !== 'all' ? activeCategory : '');
  
  const isLoading = activeCategory === 'all' ? allLoading : categoryLoading;
  
  const items = activeCategory === 'all' ? allPortfolioItems : categoryItems;
  
  const handleImageClick = (imageUrl: string, title: string, description: string) => {
    setSelectedImage(imageUrl);
    setSelectedItemDetails({ title, description });
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };
  
  const closeModal = () => {
    setSelectedImage(null);
    setSelectedItemDetails(null);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };
  
  return (
    <main className="min-h-screen bg-beauty-beige">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-beauty-brown">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Our Portfolio</h1>
          <p className="text-beauty-beige text-lg max-w-2xl mx-auto">
            Browse our collection of makeup looks and transformations created for various occasions and photoshoots.
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
      
      {/* Gallery Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beauty-brown"></div>
            </div>
          ) : items && items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative cursor-pointer overflow-hidden rounded-lg"
                  onClick={() => handleImageClick(item.image_url, item.title, item.description)}
                >
                  <div className="aspect-square relative">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-beauty-brown/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-lg font-medium">View</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white">
                    <h3 className="text-beauty-brown font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No portfolio items found in this category.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 flex justify-between items-center border-b">
              <h3 className="text-beauty-brown font-medium">{selectedItemDetails?.title}</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-beauty-brown"
              >
                <X size={24} />
              </button>
            </div>
            <div className="relative flex-grow overflow-auto">
              <div className="p-4">
                <div className="relative h-[60vh]">
                  <Image
                    src={selectedImage}
                    alt={selectedItemDetails?.title || "Portfolio image"}
                    fill
                    className="object-contain"
                  />
                </div>
                {selectedItemDetails?.description && (
                  <div className="mt-4">
                    <p className="text-gray-700">{selectedItemDetails.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}