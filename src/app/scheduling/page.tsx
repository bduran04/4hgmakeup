'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import BookingForm from '@/components/BookingForm';
import Image from 'next/image';
import { Calendar, Clock, CreditCard, CheckCircle } from 'lucide-react';

export default function Scheduling() {
  return (
    <main className="min-h-screen bg-beauty-beige">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-beauty-brown">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Schedule an Appointment</h1>
          <p className="text-beauty-beige text-lg max-w-2xl mx-auto">
            Book your makeup service in just a few simple steps.
          </p>
        </div>
      </section>
      
      {/* Booking Form Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Booking Form */}
            <div className="md:w-2/3">
              <BookingForm />
            </div>
            
            {/* Sidebar Info */}
            <div className="md:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-serif text-beauty-brown mb-4">How It Works</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-beauty-brown/10 p-2 rounded-full mt-1">
                      <Calendar className="text-beauty-brown h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-beauty-brown">Choose a Service</h3>
                      <p className="text-gray-600 text-sm">Select from our range of professional makeup services.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-beauty-brown/10 p-2 rounded-full mt-1">
                      <Clock className="text-beauty-brown h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-beauty-brown">Pick a Date & Time</h3>
                      <p className="text-gray-600 text-sm">Select your preferred appointment time from our available slots.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-beauty-brown/10 p-2 rounded-full mt-1">
                      <CheckCircle className="text-beauty-brown h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-beauty-brown">Confirm Details</h3>
                      <p className="text-gray-600 text-sm">Fill in your information and any special requests.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-beauty-brown/10 p-2 rounded-full mt-1">
                      <CreditCard className="text-beauty-brown h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-beauty-brown">Secure Your Spot</h3>
                      <p className="text-gray-600 text-sm">We'll confirm your appointment via email within 24 hours.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-beauty-gold/20 p-6 rounded-lg">
                <h2 className="text-xl font-serif text-beauty-brown mb-4">Need Assistance?</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions or need help with your booking, please don't hesitate to contact us.
                </p>
                <div className="space-y-2">
                  <p className="text-beauty-brown font-medium">Call us: (469) 618-3804</p>
                  <p className="text-beauty-brown font-medium">Email: 4hisglorymakeup@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-beauty-brown mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-700">
              Find answers to common questions about our booking process and services.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-beauty-beige p-6 rounded-lg">
              <h3 className="text-lg font-medium text-beauty-brown mb-2">
                How far in advance should I book?
              </h3>
              <p className="text-gray-700">
                We recommend booking at least 2-3 weeks in advance for regular appointments, and 3-6 months ahead for weddings or major events, especially during peak season (May-September).
              </p>
            </div>
            
            <div className="bg-beauty-beige p-6 rounded-lg">
              <h3 className="text-lg font-medium text-beauty-brown mb-2">
                What is your cancellation policy?
              </h3>
              <p className="text-gray-700">
                We require 48 hours notice for cancellations. Cancellations made with less than 48 hours notice may be subject to a 50% fee. No-shows are charged the full service amount.
              </p>
            </div>
            
            <div className="bg-beauty-beige p-6 rounded-lg">
              <h3 className="text-lg font-medium text-beauty-brown mb-2">
                Do you offer trials for bridal makeup?
              </h3>
              <p className="text-gray-700">
                Yes, we highly recommend a trial run for bridal makeup. This allows us to perfect your look and make any adjustments before your big day. Trials can be booked separately through our booking system.
              </p>
            </div>
            
            <div className="bg-beauty-beige p-6 rounded-lg">
              <h3 className="text-lg font-medium text-beauty-brown mb-2">
                Do you travel to clients?
              </h3>
              <p className="text-gray-700">
                Yes, we offer on-location services for weddings and special events. Travel fees may apply depending on the distance. Please note your location in the booking notes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}