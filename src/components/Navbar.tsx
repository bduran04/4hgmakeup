'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const navigation = [
  { name: 'HOME', href: '/' },
  { name: 'ABOUT', href: '/about' },
  { name: 'SERVICES', href: '/services' },
  { name: 'GALLERY', href: '/gallery' },
  { name: 'FAQ', href: '/faq' },
  { name: 'CONTACT', href: '/contact' },
  { name: 'LOGIN', href: '/login' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image 
                src="/monogram-hq.svg" 
                alt="4HG_Makeup_Logo"
                width={150}
                height={60}
                className={`transition-all duration-300 ${
                  isScrolled ? 'h-12 w-auto' : 'h-16 w-auto'
                }`}
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm tracking-wider transition-colors ${
                    isScrolled 
                      ? 'text-beauty-brown hover:text-beauty-gold' 
                      : 'text-white hover:text-beauty-gold'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              className={`p-2 rounded-md ${
                isScrolled ? 'text-beauty-brown' : 'text-white'
              }`}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-beauty-beige flex flex-col">
          <div className="flex-shrink-0 p-4 flex justify-between items-center border-b border-beauty-brown border-opacity-20">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Image 
                src="/monogram-hq.svg" 
                alt="4 His Glory Makeup Logo"
                width={120}
                height={48}
                className="h-12 w-auto"
              />
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-beauty-brown hover:text-beauty-gold transition-colors"
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-8">
              <div className="flex flex-col space-y-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-beauty-brown text-lg tracking-wider hover:text-beauty-gold transition-colors py-3 border-b border-beauty-brown border-opacity-10 text-center"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <div className="text-beauty-brown text-sm opacity-70">
                  © 2025 For His Glory Makeup. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}