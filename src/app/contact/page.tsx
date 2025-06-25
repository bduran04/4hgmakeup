'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSubmitContactForm } from '../../lib/mutations';
import Navbar from '@/components/Navbar';
import { Mail, Phone, Instagram, Facebook, AlertCircle } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  created_at: string;
};

export default function Contact() {
  const supabase = createClientComponentClient();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const { mutate: submitForm, isPending, error, isError } = useSubmitContactForm();

  // Fetch first 4 FAQs
  const { data: faqs, isLoading: isFaqsLoading } = useQuery({
    queryKey: ["contactPageFaqs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(4);
        
      if (error) {
        console.error("Error fetching FAQs:", error);
        throw error;
      }
      
      return data as FAQ[];
    }
  });

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

                {/* Success Message */}
                {submitted && (
                  <div className="bg-green-100 text-green-800 p-4 rounded mb-6">
                    <h3 className="font-medium">Thank You!</h3>
                    <p>Your message has been sent successfully. I'll respond as soon as possible.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 text-beauty-brown underline hover:no-underline"
                    >
                      Send another message
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {isError && (
                  <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <h3 className="font-medium">Something went wrong</h3>
                    </div>
                    <p className="mt-1">
                      {error?.message || 'Unable to send your message. Please try again or contact me directly.'}
                    </p>
                  </div>
                )}

                {!submitted && (
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
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-beauty-brown focus:border-beauty-brown transition-colors"
                          placeholder="Your full name"
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
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-beauty-brown focus:border-beauty-brown transition-colors"
                          placeholder="your@email.com"
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
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-beauty-brown focus:border-beauty-brown transition-colors"
                          placeholder="(000) 000-0000"
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
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-beauty-brown focus:border-beauty-brown transition-colors"
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
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-beauty-brown focus:border-beauty-brown transition-colors resize-none"
                        placeholder="Tell me about your event, preferred date, or any questions you have..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="bg-beauty-brown text-white px-8 py-3 rounded-md disabled:opacity-70 hover:bg-opacity-90 transition-all transform hover:scale-105 disabled:hover:scale-100 font-medium"
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

      {/* Dynamic FAQ Section */}
      <section className="py-16 px-4 bg-beauty-beige">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-beauty-brown mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Find answers to common questions about my services and booking process.
            </p>
          </div>

          {isFaqsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading FAQs...</p>
            </div>
          ) : faqs && faqs.length > 0 ? (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-beauty-brown mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No FAQs available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}