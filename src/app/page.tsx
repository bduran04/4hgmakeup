'use client';

import Image from 'next/image';
import Link from 'next/link';
import Carousel from '@/components/Carousel';
import Navbar from '@/components/Navbar';
import ServiceCard from '@/components/ServiceCard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Fallback carousel images in case database is empty
const fallbackCarouselImages = [
  {
    src: 'https://res.cloudinary.com/dzrlbq2wf/image/upload/v1745344480/IMG_2897_rqsnjs.png',
    alt: 'Bridal makeup',
  },
  {
    src: 'https://res.cloudinary.com/dzrlbq2wf/image/upload/v1745344461/IMG_2896_q8cvoo.png',
    alt: 'Fashion makeup',
  },
  {
    src: 'https://res.cloudinary.com/dzrlbq2wf/image/upload/v1745344410/IMG_2899_e0kn0e.png',
    alt: 'Special event makeup',
  },
  {
    src: 'https://res.cloudinary.com/dzrlbq2wf/image/upload/v1745344390/IMG_2900_buc2vo.png',
    alt: 'Natural makeup look',
  },
];

// Sample services
const services = [
  {
    title: 'Bridal Makeup',
    description: 'Look your best on your special day with personalized bridal makeup services.',
    icon: 'wedding',
  },
  {
    title: 'Special Event',
    description: 'Perfect makeup for photoshoots, galas, and other special occasions.',
    icon: 'event',
  },
  {
    title: 'Makeup Lessons',
    description: 'Learn professional makeup techniques tailored to your features and style.',
    icon: 'learn',
  },
];

export default function Home() {
  const [carouselImages, setCarouselImages] = useState(fallbackCarouselImages);
  const [isCarouselLoading, setIsCarouselLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState<{ [key: string]: any }[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [aboutData, setAboutData] = useState({
    bio: '',
    about_image_1: '',
    isLoading: true
  });

  useEffect(() => {
    const fetchCarouselImages = async () => {
      setIsCarouselLoading(true);
      try {
        // First, let's try to fetch the most recent images regardless of category
        // We'll prioritize images based on creation date and limit to recent ones
        const { data, error } = await supabase
          .from('images')
          .select('image_url, alt_text, title, category')
          .order('created_at', { ascending: false })
          .limit(6); // Get the 6 most recent images

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform database images to carousel format
          const dynamicImages = data.map(img => ({
            src: img.image_url,
            alt: img.alt_text || img.title || 'Makeup artwork'
          }));
          setCarouselImages(dynamicImages);
          console.log('Using recent images for carousel:', data.length, 'images found');
        } else {
          // Use fallback images if no images in database
          console.log('No images in database, using fallback carousel images');
          setCarouselImages(fallbackCarouselImages);
        }
      } catch (error) {
        console.error('Error fetching carousel images:', error);
        // Use fallback images on error
        setCarouselImages(fallbackCarouselImages);
      } finally {
        setIsCarouselLoading(false);
      }
    };

    const fetchPreviewImages = async () => {
      setIsGalleryLoading(true);
      try {
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10); // Get 10 images to ensure we have enough

        if (error) throw error;
        
        if (data && data.length > 0) {
          let galleryImages;
          
          if (data.length >= 10) {
            // If we have 10+ images, use images 7-10 for gallery (skip first 6 for carousel)
            galleryImages = data.slice(6, 10);
          } else if (data.length >= 6) {
            // If we have 6-9 images, use what we can after carousel
            galleryImages = data.slice(6);
            
            // If we don't have 4 gallery images, fill with earlier images
            if (galleryImages.length < 4) {
              const needed = 4 - galleryImages.length;
              const additionalImages = data.slice(0, needed);
              galleryImages = [...galleryImages, ...additionalImages];
            }
          } else {
            // If we have fewer than 6 images, use all available (some overlap with carousel is okay)
            galleryImages = data.slice(0, Math.min(4, data.length));
          }
          
          setPreviewImages(galleryImages);
          console.log(`Gallery preview: ${galleryImages.length} images displayed`);
        } else {
          setPreviewImages([]);
        }
      } catch (error) {
        console.error('Error fetching preview images:', error);
        setPreviewImages([]);
      } finally {
        setIsGalleryLoading(false);
      }
    };

    const fetchAboutData = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('bio, about_image_1')
          .single(); // Assuming you have only one admin user

        if (error) throw error;
        
        setAboutData({
          bio: data?.bio || '',
          about_image_1: data?.about_image_1 || '',
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching about data:', error);
        // Set fallback data if fetch fails
        setAboutData({
          bio: 'With over 10 years of experience in the beauty industry, I am dedicated to enhancing your natural beauty. My passion for makeup artistry began at a young age, and I have honed my skills through extensive training and hands-on experience. I specialize in creating timeless looks for brides, photo shoots, special events, quinceneras and everyday glamour that make you feel confident and beautiful.',
          about_image_1: 'https://res.cloudinary.com/dzrlbq2wf/image/upload/v1746067204/IMG_2972_htx11w.jpg',
          isLoading: false
        });
      }
    };

    fetchCarouselImages();
    fetchPreviewImages();
    fetchAboutData();
  }, []);

  return (
    <main className="min-h-screen bg-beauty-beige">
      <Navbar />

      {/* Hero Section with Dynamic Carousel */}
      <section className="relative w-full h-[500px]">
        {isCarouselLoading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beauty-brown"></div>
          </div>
        ) : (
          <Carousel images={carouselImages} />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 bg-black/20">
          <h1 className="text-5xl md:text-6xl font-light text-white mb-4">
            <span className="block font-serif italic">For His Glory</span>
            <span className="block text-beauty-gold font-medium tracking-wider">MAKEUP</span>
          </h1>
          <p className="text-white text-xl mb-8 max-w-lg px-4">Enhancing your natural beauty with a touch of artistry</p>
          <Link
            href="/contact"
            className="bg-beauty-brown text-white px-8 py-3 rounded hover:bg-opacity-90 transition-all"
          >
            Book Now
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              {aboutData.isLoading ? (
                <div className="w-[500px] h-[600px] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beauty-brown"></div>
                </div>
              ) : (
                <Image
                  src={aboutData.about_image_1 || 'https://res.cloudinary.com/dzrlbq2wf/image/upload/v1746067204/IMG_2972_htx11w.jpg'}
                  alt="Makeup Artist"
                  width={500}
                  height={600}
                  className="rounded-lg shadow-lg"
                />
              )}
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-serif text-beauty-brown mb-6">About Natalie Villela</h2>
              {aboutData.isLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                </div>
              ) : (
                <div className="text-gray-700 mb-6 whitespace-pre-line">
                  {aboutData.bio || 'With over 10 years of experience in the beauty industry, I am dedicated to enhancing your natural beauty. My passion for makeup artistry began at a young age, and I have honed my skills through extensive training and hands-on experience.\n\nI specialize in creating timeless looks for brides, photo shoots, special events, quinceneras and everyday glamour that make you feel confident and beautiful.'}
                </div>
              )}
              <Link
                href="/about"
                className="text-beauty-brown border-b-2 border-beauty-brown pb-1 hover:text-beauty-gold hover:border-beauty-gold transition-all"
              >
                Learn more about me
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-beauty-beige">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-beauty-brown mb-4">My Services</h2>
          <p className="text-gray-700 mb-12 max-w-2xl mx-auto">
            From bridal makeup to personal lessons, I offer a variety of beauty services
            tailored to your unique style and occasion.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/services"
              className="bg-beauty-brown text-white px-8 py-3 rounded hover:bg-opacity-90 transition-all"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-beauty-brown mb-4">Portfolio Gallery</h2>
          <p className="text-gray-700 mb-12 max-w-2xl mx-auto">
            Browse my collection of makeup looks and transformations for inspiration.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isGalleryLoading ? (
              // Loading state - show 4 skeleton placeholders
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-48 md:h-56 bg-gray-200 rounded-lg animate-pulse"></div>
              ))
            ) : previewImages.length > 0 ? (
              // Display images from the database
              previewImages.map((image) => (
                <div key={image.id} className="relative group overflow-hidden rounded-lg h-48 md:h-56">
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || image.title}
                    fill
                    sizes="(max-width: 768px) 45vw, 22vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-beauty-brown/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">View</span>
                  </div>
                </div>
              ))
            ) : (
              // Fallback if no images are found
              <div className="col-span-4 text-center py-8">
                <p className="text-gray-500">No gallery images available.</p>
              </div>
            )}
          </div>

          <div className="mt-12">
            <Link
              href="/gallery"
              className="text-beauty-brown border-b-2 border-beauty-brown pb-1 hover:text-beauty-gold hover:border-beauty-gold transition-all"
            >
              View Full Gallery
            </Link>
          </div>
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