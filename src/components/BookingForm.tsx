'use client';

import { useState } from 'react';
import { useServices } from '@/lib/queries';
import { useAddBooking } from '../lib/mutations';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  serviceId: string;
  date: Date | null;
  time: string;
  notes: string;
}

export default function BookingForm() {
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    serviceId: '',
    date: null,
    time: '',
    notes: '',
  });
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitted, setSubmitted] = useState(false);
  
  const { data: services, isLoading: servicesLoading } = useServices();
  const { mutate: addBooking, isPending: isSubmitting } = useAddBooking();
  
  // Available times for demo purposes
  const availableTimes = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleDateSelect = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, date }));
  };
  
  const goToNextStep = () => {
    if (step === 1 && formData.serviceId) {
      setStep(2);
    } else if (step === 2 && formData.date && formData.time) {
      setStep(3);
    }
  };
  
  const goToPreviousStep = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.serviceId) {
      return;
    }
    
    const selectedService = services?.find(service => service.id === formData.serviceId);
    
    if (!selectedService) {
      return;
    }
    
    // Calculate end time based on service duration
    const startTime = formData.time;
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const durationMinutes = selectedService.duration;
    
    const endDate = new Date();
    endDate.setHours(startHour);
    endDate.setMinutes(startMinute + durationMinutes);
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    
    const bookingData = {
      client_name: formData.name,
      client_email: formData.email,
      client_phone: formData.phone,
      service_id: formData.serviceId,
      service_name: selectedService.title,
      booking_date: format(formData.date, 'yyyy-MM-dd'),
      start_time: startTime,
      end_time: endTime,
      notes: formData.notes,
    };
    
    addBooking(bookingData, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: (error) => {
        console.error('Booking failed:', error);
      }
    });
  };
  
  if (submitted) {
    return (
      <div className="bg-beauty-beige p-8 rounded-lg text-center">
        <h2 className="text-2xl font-serif text-beauty-brown mb-4">Thank You!</h2>
        <p className="text-gray-700 mb-6">
          Your booking request has been submitted. We'll contact you shortly to confirm your appointment.
        </p>
        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              serviceId: '',
              date: null,
              time: '',
              notes: '',
            });
            setStep(1);
            setSubmitted(false);
          }}
          className="bg-beauty-brown text-white px-6 py-2 rounded hover:bg-opacity-90 transition-all"
        >
          Book Another Appointment
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-beauty-beige p-8 rounded-lg">
      <h2 className="text-2xl font-serif text-beauty-brown mb-6 text-center">Schedule an Appointment</h2>
      
      {/* Step indicators */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            step >= 1 ? 'bg-beauty-brown text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <div className={`h-1 w-12 ${step >= 2 ? 'bg-beauty-brown' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            step >= 2 ? 'bg-beauty-brown text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
          <div className={`h-1 w-12 ${step >= 3 ? 'bg-beauty-brown' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
            step >= 3 ? 'bg-beauty-brown text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            3
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-beauty-brown">Select a Service</h3>
            {servicesLoading ? (
              <p>Loading services...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services?.map((service) => (
                  <div 
                    key={service.id}
                    onClick={() => setFormData(prev => ({ ...prev, serviceId: service.id }))}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.serviceId === service.id 
                        ? 'border-beauty-brown bg-beauty-brown/10' 
                        : 'border-gray-200 hover:border-beauty-brown/50'
                    }`}
                  >
                    <h4 className="text-beauty-brown font-medium">{service.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                    <div className="flex justify-between text-sm">
                      <span>${service.price}</span>
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!formData.serviceId}
                className="bg-beauty-brown text-white px-6 py-2 rounded disabled:opacity-50 hover:bg-opacity-90 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-beauty-brown">Select Date & Time</h3>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Date
                </label>
                <Calendar
                  mode="single"
                  required={true}
                  selected={formData.date || undefined}
                  onSelect={handleDateSelect}
                  className="border rounded-md p-2"
                  disabled={(date: Date) => {
                    const day = date.getDay();
                    // Disable weekends for this example
                    return day === 0; // Sunday
                  }}
                />
              </div>
              
              <div className="md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select a Time
                </label>
                {formData.date ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, time }))}
                        className={`p-2 border rounded-md text-center ${
                          formData.time === time 
                            ? 'bg-beauty-brown text-white border-beauty-brown' 
                            : 'hover:border-beauty-brown'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Please select a date first</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="border border-beauty-brown text-beauty-brown px-6 py-2 rounded hover:bg-beauty-brown/10 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!formData.date || !formData.time}
                className="bg-beauty-brown text-white px-6 py-2 rounded disabled:opacity-50 hover:bg-opacity-90 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Personal Details */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-beauty-brown">Your Information</h3>
            
            <div className="space-y-4">
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
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-beauty-brown focus:border-beauty-brown"
                />
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-beauty-brown focus:border-beauty-brown"
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={goToPreviousStep}
                className="border border-beauty-brown text-beauty-brown px-6 py-2 rounded hover:bg-beauty-brown/10 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                className="bg-beauty-brown text-white px-6 py-2 rounded disabled:opacity-50 hover:bg-opacity-90 transition-all"
              >
                {isSubmitting ? 'Submitting...' : 'Book Appointment'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}