// ContactUs.jsx
import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare,
  Send,
  ChevronDown
} from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: 'General inquiry',
    message: ''
  });

  const contactInfo = [
    { icon: <MessageSquare className="w-5 h-5" />, title: "Say something to start a live chat!" },
    { icon: <Phone className="w-5 h-5" />, title: "09157053789" },
    { icon: <Mail className="w-5 h-5" />, title: "nectagadget@hotmail.com" },
    { icon: <MapPin className="w-5 h-5" />, title: "1) To Communicate Street", description: "Boston, Massachusetts (9786) United States" }
  ];

  const subjectOptions = [
    'General inquiry',
    'Technical support',
    'Billing questions',
    'Partnership opportunities',
    'Feedback'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Contact Info */}
          <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Contact Information</h2>
            <div className="space-y-6">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <div className="text-orange-600">{item.icon}</div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    {item.description && <p className="text-gray-600 text-sm">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Prompt */}
            <div className="mt-8 p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Live Chat Support</h3>
                  <p className="text-gray-600 text-xs">Available 24/7 for instant assistance</p>
                </div>
              </div>
              <button className="mt-3 w-full py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition duration-200">
                Start Live Chat
              </button>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Contact Us</h1>
            <p className="text-gray-600 text-sm mb-6">Any question or remarks? Just write us a message!</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                  placeholder="+102 3468 789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
                <div className="relative">
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm appearance-none bg-white"
                  >
                    {subjectOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm resize-none"
                  placeholder="Write your message here..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition duration-200 flex items-center justify-center space-x-1 text-sm"
              >
                <span>Send Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2025 Your Company. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
