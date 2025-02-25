import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600">Get in touch with us</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Location Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold ml-4">Our Location</h2>
          </div>
          <p className="text-gray-600">
            Pune Vidhyarthi Grihas College Of Engineering And Technology, 44,
            Shiv Darshan Rd, Parvati. Nirmal Baug Colony, Vidya Nagari, Parvati
            Paytha, Pune, Maharashtra 411009
          </p>
        </div>

        {/* Phone Numbers Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold ml-4">Phone Numbers</h2>
          </div>
          <ul className="space-y-2 text-gray-600">
            <li>9156909930 - Sanika Shinde</li>
            <li>8308678574 - Shubodh Kamble</li>
            <li>8530992376 - Aryan Kadam</li>
            <li>9766429219 - Pranav Pisal</li>
            <li>9657053686 - Gauri Kharad</li>
            <li>9604396910 - Pratikaha Bhure</li>
          </ul>
        </div>

        {/* Email Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold ml-4">Email Us</h2>
          </div>
          <a href="mailto:aces@pvgcoet.ac.in" className="text-blue-600 hover:text-blue-700">
            aces@pvgcoet.ac.in
          </a>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <iframe
            title="PVG COET Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.0673780426696!2d73.84661147499179!3d18.49740798261836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c07f4d7b0f43%3A0x68cc954eaf74e4b8!2sPVG&#39;s%20College%20of%20Engineering%20and%20Technology!5e0!3m2!1sen!2sin!4v1708156947351!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}