// src/components/Footer.tsx
'use client';

import React, { useEffect, useState } from 'react';

export default function Footer() {
  // This will allow us to change the footer styles based on what section is closest
  const [footerStyle, setFooterStyle] = useState({
    backgroundColor: 'var(--beauty-beige)',
    textColor: '#666'
  });
  
  // This effect determines the background color based on the closest section
  useEffect(() => {
    const updateFooterBackground = () => {
      // Get all sections that could be potential backgrounds
      const sections = document.querySelectorAll('section');
      if (!sections.length) return;
      
      // Get the last section in the document
      const lastSection = sections[sections.length - 1];
      
      // Get computed style to find background color
      const style = window.getComputedStyle(lastSection);
      const bgColor = style.backgroundColor;
      
      // Set the footer style based on the last section's background
      if (bgColor.includes('rgb(245, 241, 237)') || lastSection.classList.contains('bg-beauty-beige')) {
        setFooterStyle({
          backgroundColor: 'var(--beauty-beige)',
          textColor: '#666'
        });
      } else if (bgColor.includes('rgb(166, 134, 116)') || lastSection.classList.contains('bg-beauty-brown')) {
        setFooterStyle({
          backgroundColor: 'var(--beauty-brown)',
          textColor: '#fff'
        });
      } else if (bgColor.includes('rgb(212, 184, 140)') || lastSection.classList.contains('bg-beauty-gold')) {
        setFooterStyle({
          backgroundColor: 'var(--beauty-gold)',
          textColor: '#333'
        });
      } else if (bgColor.includes('rgb(255, 255, 255)') || lastSection.classList.contains('bg-white')) {
        setFooterStyle({
          backgroundColor: '#fff',
          textColor: '#666'
        });
      } else {
        // Default fallback
        setFooterStyle({
          backgroundColor: 'var(--beauty-beige)',
          textColor: '#666'
        });
      }
    };
    
    // Run once on mount
    updateFooterBackground();
    
    // Add a resize listener in case page layout changes
    window.addEventListener('resize', updateFooterBackground);
    
    return () => {
      window.removeEventListener('resize', updateFooterBackground);
    };
  }, []);
  
  return (
    <footer 
      className="mt-auto transition-colors duration-300"
      style={{ backgroundColor: footerStyle.backgroundColor }}
    >
      <div className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div 
            className="text-center text-sm"
            style={{ color: footerStyle.textColor }}
          >
            <p className="mb-4">
              <span className="font-medium">For His Glory Makeup</span>
              <span className="mx-2">•</span>
              <span>469.618.3804</span>
              <span className="mx-2">•</span>
              <span>4hisglorymakeup@gmail.com</span>
            </p>
            <span>all rights reserved</span>
            <span className="mx-2">|</span>
            <span>Made with ♡ by Belle</span>
          </div>
        </div>
      </div>
    </footer>
  );
}