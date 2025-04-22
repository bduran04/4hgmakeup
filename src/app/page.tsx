import Image from 'next/image';
import Link from 'next/link';
import Carousel from '@/components/Carousel';
import Navbar from '@/components/Navbar';
import ServiceCard from '@/components/ServiceCard';

// Sample carousel images - you'll replace these with your actual images
const carouselImages = [
  {
    src: '/images/makeup-1.jpg',
    alt: 'Bridal makeup',
  },
  {
    src: '/images/makeup-2.jpg',
    alt: 'Fashion makeup',
  },
  {
    src: '/images/makeup-3.jpg',
    alt: 'Special event makeup',
  },
  {
    src: '/images/makeup-4.jpg',
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
  return (
    <main className="min-h-screen bg-beauty-beige">
      <Navbar />

      {/* Hero Section with Carousel */}
      <section className="relative w-full h-[600px]">
        <Carousel images={carouselImages} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 bg-black/20">
          <h1 className="text-5xl md:text-6xl font-light text-white mb-4">
            <span className="block font-serif italic">Simple</span>
            <span className="block text-beauty-gold font-medium tracking-wider">BEAUTY</span>
          </h1>
          <p className="text-white text-xl mb-8 max-w-lg px-4">Enhancing your natural beauty with a touch of artistry</p>
          <Link
            href="/scheduling"
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
              <Image
                src="/images/about.jpg"
                alt="Makeup Artist"
                width={500}
                height={600}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-serif text-beauty-brown mb-6">About Simple Beauty</h2>
              <p className="text-gray-700 mb-4">
                With over 10 years of experience in the beauty industry, Simple Beauty
                was founded on the principle that makeup should enhance your natural
                beauty, not mask it.
              </p>
              <p className="text-gray-700 mb-6">
                We specialize in creating timeless looks for brides, photo shoots,
                special events, and everyday glamour that make you feel confident and beautiful.
              </p>
              <Link
                href="/about"
                className="text-beauty-brown border-b-2 border-beauty-brown pb-1 hover:text-beauty-gold hover:border-beauty-gold transition-all"
              >
                Learn more about us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-beauty-beige">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-beauty-brown mb-4">Our Services</h2>
          <p className="text-gray-700 mb-12 max-w-2xl mx-auto">
            From bridal makeup to personal lessons, we offer a variety of beauty services
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
            Browse our collection of makeup looks and transformations for inspiration.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="relative group overflow-hidden rounded-lg">
                <Image
                  src={`/images/gallery-${num}.jpg`}
                  alt={`Gallery image ${num}`}
                  width={300}
                  height={300}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-beauty-brown/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">View</span>
                </div>
              </div>
            ))}
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/scheduling"
              className="bg-beauty-brown text-white px-8 py-3 rounded hover:bg-opacity-90 transition-all"
            >
              Book Now
            </Link>
            <Link
              href="/contact"
              className="bg-transparent border-2 border-beauty-brown text-beauty-brown px-8 py-3 rounded hover:bg-beauty-brown hover:text-white transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}