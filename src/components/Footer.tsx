import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2">
              <p className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Pune Vidhyarthi Grihas College Of Engineering And Technology, Pune
              </p>
              <p className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                9766429219, 9156929930
              </p>
              <p className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                aces@pvgcoet.ac.in
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block hover:text-blue-200">Home</Link>
              <Link to="/jobs" className="block hover:text-blue-200">Jobs</Link>
              <Link to="/mentorship" className="block hover:text-blue-200">Mentorship</Link>
              <Link to="/about" className="block hover:text-blue-200">About Us</Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">About Alumni Connect</h3>
            <p className="text-sm">
              Alumni Connect helps you tap into the power of a professional network that utilizes combined resources, 
              ideas, and capabilities for your professional growth. Join Alumni Connect to connect and interact with 
              elite alumni that you can trust.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-blue-500 text-center">
          <p>&copy; {new Date().getFullYear()} Alumni Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}