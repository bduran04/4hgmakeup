'use client';

import Image from 'next/image';
import Link from 'next/link';
import Carousel from '@/components/Carousel';
import Navbar from '@/components/Navbar';
import ServiceCard from '@/components/ServiceCard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchAdminData, MOCK_ADMIN_DATA } from '@/lib/utils/admin-data';

// Types
type GalleryImage = {
  id: string;
  title: string;
  category: string;
  image_url?: string;
  image_path?: string;
  alt_text: string;
  created_at: string;
};

type AboutData = {
  bio: string;
  bio_2?: string;
  about_image_1: string;
  about_image_2?: string;
  about_image_1_path?: string;
  about_image_2_path?: string;
  isLoading: boolean;
};

// Utility function to get display URL (prioritizes storage over direct URL)
const getImageDisplayUrl = (image: { image_url?: string; image_path?: string }): string => {
  if (image.image_path) {
    const { data } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(image.image_path);
    return data.publicUrl;
  }
  return image.image_url || '';
};

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
  const [previewImages, setPreviewImages] = useState<GalleryImage[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [aboutData, setAboutData] = useState<AboutData>({
    bio: '',
    bio_2: '',
    about_image_1: '',
    about_image_2: '',
    isLoading: true
  });

  useEffect(() => {
    const fetchCarouselImages = async () => {
      setIsCarouselLoading(true);
      try {
        // Fetch the oldest images from the database (earliest first)
        const { data, error } = await supabase
          .from('images')
          .select('image_url, image_path, alt_text, title, category, created_at')
          .order('created_at', { ascending: true }) // Get oldest images first
          .limit(8); // Get 8 oldest images for carousel

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform database images to carousel format with proper URLs
          const dynamicImages = data.map(img => ({
            src: getImageDisplayUrl(img),
            alt: img.alt_text || img.title || 'Portfolio makeup work'
          }));
          
          setCarouselImages(dynamicImages);
          console.log(`Using ${data.length} oldest images for carousel`);
          console.log('Oldest image date:', data[0]?.created_at);
          console.log('Most recent of the oldest:', data[data.length - 1]?.created_at);
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
        // Get recent images for gallery preview (keeping this as newest for contrast)
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .order('created_at', { ascending: false }) // Gallery preview shows newest work
          .limit(4); // Just get 4 recent images for gallery preview

        if (error) throw error;
        
        if (data && data.length > 0) {
          setPreviewImages(data);
          console.log(`Gallery preview: ${data.length} recent images displayed`);
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
        console.log('Fetching about data...');
        
        const adminData = await fetchAdminData();

        // Get proper display URLs for images (handles both storage and direct URLs)
        const displayImage1 = getImageDisplayUrl({
          image_url: adminData.about_image_1,
          image_path: adminData.about_image_1_path || undefined
        });

        const displayImage2 = getImageDisplayUrl({
          image_url: adminData.about_image_2 || '',
          image_path: adminData.about_image_2_path || undefined
        });

        setAboutData({
          bio: adminData.bio_2 || '', // Homepage shows bio_2
          bio_2: adminData.bio || '', // Store bio for potential use
          about_image_1: displayImage1, // Homepage shows about_image_1
          about_image_2: displayImage2, // Store about_image_2 for potential use
          isLoading: false
        });

        console.log('About data loaded successfully from user:', adminData.email);
      } catch (error) {
        console.error('Error fetching about data:', error);
        
        // Set fallback data if all database queries fail
        setAboutData({
          bio: MOCK_ADMIN_DATA.bio_2 || '', // Homepage shows bio_2 from mock data
          bio_2: MOCK_ADMIN_DATA.bio || '', // Store bio for potential use
          about_image_1: MOCK_ADMIN_DATA.about_image_1, // Homepage shows about_image_1 from mock data
          about_image_2: MOCK_ADMIN_DATA.about_image_2 || '', // Store about_image_2 for potential use
          isLoading: false
        });
        
        console.log('Using hardcoded fallback data');
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
          <div key="about-section-1" className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              {aboutData.isLoading ? (
                <div className="w-[500px] h-[600px] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beauty-brown"></div>
                </div>
              ) : (
                <Image
                  src={aboutData.about_image_1 || MOCK_ADMIN_DATA.about_image_1}
                  alt="Makeup Artist"
                  width={500}
                  height={600}
                  className="rounded-lg shadow-lg object-cover"
                  onError={(e) => {
                    // Fallback to default image if the loaded image fails
                    const target = e.target as HTMLImageElement;
                    if (target.src !== MOCK_ADMIN_DATA.about_image_1) {
                      target.src = MOCK_ADMIN_DATA.about_image_1;
                    }
                  }}
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
                  {aboutData.bio || MOCK_ADMIN_DATA.bio_2}
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
              // Display images from the database with proper URLs
              previewImages.map((image) => (
                <div key={image.id} className="relative group overflow-hidden rounded-lg h-48 md:h-56">
                  <Image
                    src={getImageDisplayUrl(image)}
                    alt={image.alt_text || image.title}
                    fill
                    sizes="(max-width: 768px) 45vw, 22vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback to image_url if storage URL fails
                      const target = e.target as HTMLImageElement;
                      if (image.image_url && target.src !== image.image_url) {
                        target.src = image.image_url;
                      }
                    }}
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