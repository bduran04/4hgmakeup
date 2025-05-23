'use client';

import { useState } from 'react';
import { useSubmitContactForm } from '../../lib/mutations';
import Navbar from '@/components/Navbar';
import { Mail, Phone, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const { mutate: submitForm, isPending } = useSubmitContactForm();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submitForm(formData, {
      onSuccess: () => {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      },
    });
  };

  return (
    <main className="min-h-screen bg-beauty-beige">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-beauty-brown">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Contact Me</h1>
          <p className="text-beauty-beige text-lg max-w-2xl mx-auto">
            Have questions or ready to book an appointment? Get in touch with me.
          </p>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Contact Information */}
            <div className="md:w-1/3">
              <h2 className="text-2xl font-serif text-beauty-brown mb-6">Get In Touch</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-beauty-brown/10 p-3 rounded-full">
                    <Phone className="text-beauty-brown h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-beauty-brown">Phone</h3>
                    <p className="text-gray-700">(469) 618-3804</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-beauty-brown/10 p-3 rounded-full">
                    <Mail className="text-beauty-brown h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-beauty-brown">Email</h3>
                    <p className="text-gray-700">4hisglorymakeup@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-medium text-beauty-brown mb-4">Follow Me</h3>
                <div className="flex gap-4">
                  <a
                    href="https://www.instagram.com/4hisglorymakeup/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-beauty-brown/10 p-3 rounded-full hover:bg-beauty-brown hover:text-white transition-all"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/share/198vDd3qnZ/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-beauty-brown/10 p-3 rounded-full hover:bg-beauty-brown hover:text-white transition-all"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:w-2/3">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-serif text-beauty-brown mb-6">Send Me a Message</h2>

                {submitted ? (
                  <div className="bg-green-100 text-green-800 p-4 rounded">
                    <h3 className="font-medium">Thank You!</h3>
                    <p>Your message has been sent. I'll respond as soon as possible.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 text-beauty-brown underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-beauty-brown focus:border-beauty-brown"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-beauty-brown focus:border-beauty-brown"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-beauty-brown focus:border-beauty-brown"
                        />
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                          Subject *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-beauty-brown focus:border-beauty-brown"
                        >
                          <option value="">Select a subject</option>
                          <option value="Booking Inquiry">Booking Inquiry</option>
                          <option value="Service Question">Service Question</option>
                          <option value="Pricing">Pricing</option>
                          <option value="Collaboration">Collaboration</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-beauty-brown focus:border-beauty-brown"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="bg-beauty-brown text-white px-6 py-3 rounded disabled:opacity-70 hover:bg-opacity-90 transition-all"
                      >
                        {isPending ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-beauty-beige">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-beauty-brown mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Find answers to common questions about my services and booking process.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-beauty-brown mb-2">
                What services do you offer?
              </h3>
              <p className="text-gray-700">
                I offer a wide range of makeup services including bridal, special event, quincenera, photoshoot, and makeup lessons. Visit my Services page for detailed information.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-beauty-brown mb-2">
                How do I book an appointment?
              </h3>
              <p className="text-gray-700">
                You can book directly through my website by sending me a message, call me at (469) 618-3804, send me an email at 4hisglorymakeup@gmail.com, or DM me via Instagram.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-beauty-brown mb-2">
                Do you travel for events?
              </h3>
              <p className="text-gray-700">
                Yes, I offer on-location services for weddings and special events. Travel fees may apply depending on the distance. Please note your location when booking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-beauty-brown mb-2">
                What brands do you use?
              </h3>
              <p className="text-gray-700">
                We use high-quality, professional makeup brands including Charlotte Tilbury, NARS, Bobbi Brown, MAC, and other premium products that ensure long-lasting, camera-ready results.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}