'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Award, Heart, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

export default function About() {
  const [aboutData, setAboutData] = useState({
    bio: '',
    bio_2: '',
    about_image_1: '',
    about_image_2: '',
    isLoading: true
  });

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        console.log('Fetching about data...');
        
        // First, try to get data from the specific email user
        const { data: primaryUser, error: primaryError } = await supabase
          .from('admin_users')
          .select('bio, bio_2, about_image_1, about_image_2, about_image_1_path, about_image_2_path, email')
          .eq('email', '4hisglorymakeup@gmail.com')
          .single();

        let userData = null;

        if (primaryUser && !primaryError) {
          console.log('Found primary user with specific email');
          userData = primaryUser;
        } else {
          console.log('Primary user not found, trying fallback admin user...');
          
          // If specific email user doesn't exist, get any admin user
          const { data: fallbackUser, error: fallbackError } = await supabase
            .from('admin_users')
            .select('bio, bio_2, about_image_1, about_image_2, about_image_1_path, about_image_2_path, email')
            .limit(1)
            .single();

          if (fallbackUser && !fallbackError) {
            console.log('Using fallback admin user:', fallbackUser.email);
            userData = fallbackUser;
          } else {
            console.log('No admin users found, using fallback data');
            throw new Error('No admin users found');
          }
        }

        if (userData) {
          // Clean any extra quotes from the image URLs in the event there is unclean data
          const cleanImage1 = userData?.about_image_1 ? userData.about_image_1.replace(/^["']|["']$/g, '') : '';
          const cleanImage2 = userData?.about_image_2 ? userData.about_image_2.replace(/^["']|["']$/g, '') : '';

          // Get proper display URLs for images (handles both storage and direct URLs)
          const displayImage1 = getImageDisplayUrl({
            image_url: cleanImage1,
            image_path: userData?.about_image_1_path
          });

          const displayImage2 = getImageDisplayUrl({
            image_url: cleanImage2,
            image_path: userData?.about_image_2_path
          });

          setAboutData({
            bio: userData?.bio || '',
            bio_2: userData?.bio_2 || '',
            about_image_1: displayImage1,
            about_image_2: displayImage2,
            isLoading: false
          });

          console.log('About data loaded successfully from user:', userData.email);
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
        
        // Set fallback data if all database queries fail
        setAboutData({
          bio: 'With over 10 years of experience in the beauty industry, my journey as a makeup artist began with a simple passion for enhancing natural beauty. What started as a creative outlet soon blossomed into a fulfilling career where I get to help others feel confident and beautiful.\n\nI specialize in creating timeless, elegant looks for weddings, quinceañeras, special events, and photoshoots. My philosophy is that makeup should enhance your features, not mask them. Each face I work on is unique, and I take pride in customizing my approach to complement your individual beauty.\n\nI continually update my techniques and product knowledge to provide you with the best possible experience.',
          bio_2: 'Every makeup session is a collaborative experience where I work closely with you to achieve your vision. I believe in creating a comfortable, relaxing environment where you can unwind and enjoy the transformation process.\n\nWhether it\'s your wedding day, a special photoshoot, or a milestone celebration, I\'m here to ensure you look and feel your absolute best. My attention to detail and commitment to excellence means every look is perfectly tailored to you.',
          about_image_1: 'https://res.cloudinary.com/dzrlbq2wf/image/upload/v1746067227/IMG_2974_t0paza.jpg',
          about_image_2: '',
          isLoading: false
        });
        
        console.log('Using hardcoded fallback data');
      }
    };

    fetchAboutData();
  }, []);

  return (
    <main className="min-h-screen bg-beauty-beige">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-beauty-brown">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">About Natalie</h1>
          <p className="text-beauty-beige text-lg max-w-2xl mx-auto">
            Passionate makeup artist with a mission to enhance your natural beauty.
          </p>
        </div>
      </section>

      {/* Main Bio Section with Primary Image */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              {aboutData.isLoading ? (
                <div className="w-[500px] h-[600px] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beauty-brown"></div>
                </div>
              ) : (
                <Image
                  src={aboutData.about_image_1 || 'https://res.cloudinary.com/dzrlbq2wf/image/upload/v1746067227/IMG_2974_t0paza.jpg'}
                  alt="Natalie Villela"
                  width={500}
                  height={600}
                  className="rounded-lg shadow-lg object-cover"
                  onError={(e) => {
                    // Fallback to default image if the loaded image fails
                    const target = e.target as HTMLImageElement;
                    if (target.src !== 'https://res.cloudinary.com/dzrlbq2wf/image/upload/v1746067227/IMG_2974_t0paza.jpg') {
                      target.src = 'https://res.cloudinary.com/dzrlbq2wf/image/upload/v1746067227/IMG_2974_t0paza.jpg';
                    }
                  }}
                />
              )}
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-serif text-beauty-brown mb-6">My Story</h2>
              {aboutData.isLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                </div>
              ) : (
                <div className="text-gray-700 whitespace-pre-line">
                  {aboutData.bio || 'With over 10 years of experience in the beauty industry, my journey as a makeup artist began with a simple passion for enhancing natural beauty. What started as a creative outlet soon blossomed into a fulfilling career where I get to help others feel confident and beautiful.\n\nI specialize in creating timeless, elegant looks for weddings, quinceañeras, special events, and photoshoots. My philosophy is that makeup should enhance your features, not mask them. Each face I work on is unique, and I take pride in customizing my approach to complement your individual beauty.\n\nI continually update my techniques and product knowledge to provide you with the best possible experience.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Second Image Section (if about_image_2 exists) */}
      {!aboutData.isLoading && aboutData.about_image_2 && (
        <section className="py-16 px-4 bg-beauty-beige">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
              <div className="md:w-1/2">
                <Image
                  src={aboutData.about_image_2}
                  alt="Natalie Villela at work"
                  width={500}
                  height={600}
                  className="rounded-lg shadow-lg object-cover"
                  onError={(e) => {
                    // Hide the section if the second image fails to load
                    const section = e.currentTarget.closest('section');
                    if (section) {
                      section.style.display = 'none';
                    }
                  }}
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-serif text-beauty-brown mb-6">Behind the Scenes</h2>
                <div className="text-gray-700 whitespace-pre-line">
                  {aboutData.bio_2 || 'Every makeup session is a collaborative experience where I work closely with you to achieve your vision. I believe in creating a comfortable, relaxing environment where you can unwind and enjoy the transformation process.\n\nWhether it\'s your wedding day, a special photoshoot, or a milestone celebration, I\'m here to ensure you look and feel your absolute best. My attention to detail and commitment to excellence means every look is perfectly tailored to you.'}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Philosophy Section */}
      <section className="py-16 px-4 bg-beauty-beige">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-beauty-brown mb-4">My Philosophy</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              My approach to makeup is guided by these core principles:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="bg-beauty-brown/10 w-16 h-16 rounded-full flex items-center justify-center">
                  <Heart className="text-beauty-brown h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-serif text-beauty-brown mb-3 text-center">Enhancing Natural Beauty</h3>
              <p className="text-gray-700 text-center">
                Makeup should highlight your unique features and enhance your natural beauty, not mask or change who you are.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="bg-beauty-brown/10 w-16 h-16 rounded-full flex items-center justify-center">
                  <Star className="text-beauty-brown h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-serif text-beauty-brown mb-3 text-center">Quality Products</h3>
              <p className="text-gray-700 text-center">
                I use only high-quality, professional-grade products that are gentle on your skin and provide beautiful, long-lasting results.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex justify-center mb-4">
                <div className="bg-beauty-brown/10 w-16 h-16 rounded-full flex items-center justify-center">
                  <Award className="text-beauty-brown h-8 w-8" />
                </div>
              </div>
              <h3 className="text-xl font-serif text-beauty-brown mb-3 text-center">Personalized Service</h3>
              <p className="text-gray-700 text-center">
                Every client receives a customized approach tailored to their unique features, preferences, and the occasion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Training & Expertise */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-beauty-brown mb-4">Training & Expertise</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              My professional development and areas of specialization:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-beauty-beige p-8 rounded-lg">
              <h3 className="text-xl font-serif text-beauty-brown mb-3">Professional Background</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-beauty-brown mr-2">•</span>
                  <span>Certified Professional Makeup Artist</span>
                </li>
                <li className="flex items-start">
                  <span className="text-beauty-brown mr-2">•</span>
                  <span>Trained in the latest techniques and trends</span>
                </li>
                <li className="flex items-start">
                  <span className="text-beauty-brown mr-2">•</span>
                  <span>Experienced with diverse skin types and tones</span>
                </li>
                <li className="flex items-start">
                  <span className="text-beauty-brown mr-2">•</span>
                  <span>Regular advanced training workshops</span>
                </li>
              </ul>
            </div>

            <div className="bg-beauty-beige p-8 rounded-lg">
              <h3 className="text-xl font-serif text-beauty-brown mb-3">Areas of Specialization</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-beauty-brown mr-2">•</span>
                  <span>Bridal and wedding makeup</span>
                </li>
                <li className="flex items-start">
                  <span className="text-beauty-brown mr-2">•</span>
                  <span>Quinceañera and special event makeup</span>
                </li>
                <li className="flex items-start">
                  <span className="text-beauty-brown mr-2">•</span>
                  <span>Editorial and photoshoot styling</span>
                </li>
                <li className="flex items-start">
                  <span className="text-beauty-brown mr-2">•</span>
                  <span>Personalized makeup lessons</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-beauty-gold/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-beauty-brown mb-4">What Clients Say</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Don't just take my word for it - here's what some of my clients have to say:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="text-beauty-gold flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-beauty-gold" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 italic mb-4">
                "Natalie did my makeup for my wedding and I couldn't have been happier. She listened to exactly what I wanted and made me feel like the most beautiful version of myself. My makeup lasted all day and night through tears, hugs, and dancing!"
              </p>
              <p className="font-medium text-beauty-brown">- Belen D., Wedding Guest</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="text-beauty-gold flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-beauty-gold" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 italic mb-4">
                "The best!! I always get so many compliments after I get my makeup done too 😍"
              </p>
              <p className="font-medium text-beauty-brown">- Anonymous, Client</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/gallery"
              className="bg-beauty-brown text-white px-8 py-3 rounded hover:bg-opacity-90 transition-all"
            >
              View My Work
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