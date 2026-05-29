import React, { useState } from 'react';
import {
  ChevronDown,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-react';
import { publicApi } from '@/lib/api';

const BUSINESS_PHONE = '09157053789';
const BUSINESS_EMAIL = 'nectagadget@hotmail.com';
const BUSINESS_LOCATION = 'Owerri, Imo State, Nigeria';

const subjectOptions = [
  'General inquiry',
  'Product support',
  'Billing questions',
  'Partnership opportunities',
  'Feedback',
];

const contactInfo = [
  {
    icon: MessageSquare,
    title: 'Need help with an order?',
    description: 'Send the message here and it goes straight to the support inbox.',
  },
  {
    icon: Phone,
    title: BUSINESS_PHONE,
    description: 'Call for order questions, product guidance, or delivery updates.',
  },
  {
    icon: Mail,
    title: BUSINESS_EMAIL,
    description: 'Prefer email? We will get back to you as soon as possible.',
  },
  {
    icon: MapPin,
    title: BUSINESS_LOCATION,
    description: 'Serving customers across Nigeria with delivery support and follow-up.',
  },
];

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  subject: 'General inquiry',
  message: '',
};

const ContactUs = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setError('Please complete the required fields before sending your message.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
      };

      const res = await publicApi.post('/contact', payload);
      setSuccess(res?.data?.message || 'Your message has been sent successfully.');
      setFormData(initialForm);
    } catch (err) {
      const message = err?.response?.data?.error || err?.message || 'Failed to submit your message';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickContact = () => {
    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent('Support request')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-md lg:p-8">
            <h2 className="mb-6 text-xl font-bold text-gray-800">Contact Information</h2>
            <div className="space-y-6">
              {contactInfo.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex items-start space-x-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                      <div className="text-orange-600">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-lg bg-orange-50 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Quick contact</h3>
                  <p className="text-xs text-gray-600">Use this if you want a fast response by email.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickContact}
                className="mt-3 w-full rounded-lg bg-orange-600 py-2 text-sm text-white transition duration-200 hover:bg-orange-700"
              >
                Start Live Chat
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md lg:p-8">
            <h1 className="mb-2 text-2xl font-bold text-gray-800">Contact Us</h1>
            <p className="mb-6 text-sm text-gray-600">Any question or remarks? Just write us a message!</p>

            {error && (
              <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" role="status">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="+234..."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Select Subject</label>
                <div className="relative">
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  >
                    {subjectOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="Write your message here..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center space-x-1 rounded-md bg-orange-600 py-2 text-sm font-medium text-white transition duration-200 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Questions about a product, a delivery, or a payment? This form is the fastest way to reach the team.</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
