import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, GraduationCap, Users, Network, Award, BookOpen, Building2, Target } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section with College Image */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-800/90" />
        <div className="relative h-[500px] bg-cover bg-center" style={{ backgroundImage: 'url("/college.jpg")' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="text-white max-w-2xl">
              <h1 className="text-4xl font-bold mb-4">Welcome to Alumni Connect</h1>
              <p className="text-xl mb-8">
                Connecting PVG COET alumni and students for mentorship, career opportunities, and professional growth.
              </p>
              <Link to="/signup" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block">
                Join Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* About College Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center">
            <img src="/5-COET.jpg" alt="PVG COET" className="w-1/3 h-auto mr-4" />
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">About PVG COET</h2>
              <p className="text-lg text-gray-600" >
                Pune Vidhyarthi Griha's College of Engineering and Technology (PVG's COET) 
                is committed to excellence in engineering education, research, and innovation. 
                Established with a vision to create future-ready engineers, we foster an 
                environment of learning and growth.

              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Established Legacy</h3>
            <p className="text-gray-600">
              A rich history of academic excellence and innovation in engineering education.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">NAAC Accredited</h3>
            <p className="text-gray-600">
              Recognized for maintaining high standards in education and infrastructure.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Industry Focus</h3>
            <p className="text-gray-600">
              Strong industry connections and placement opportunities for students.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect & Grow Together</h2>
            <p className="text-lg text-gray-600">Discover the benefits of being part of our alumni network</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Job Search */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Search Jobs</h3>
              <p className="text-gray-600 mb-4">Find opportunities posted by trusted alumni in your field.</p>
              <Link to="/jobs" className="text-blue-600 hover:text-blue-700 font-medium">
                Explore Jobs →
              </Link>
            </div>

            {/* Mentorship */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seek Mentorship</h3>
              <p className="text-gray-600 mb-4">Get guidance from experienced alumni in your domain.</p>
              <Link to="/mentorship" className="text-blue-600 hover:text-blue-700 font-medium">
                Find Mentors →
              </Link>
            </div>

            {/* Knowledge Sharing */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Knowledge</h3>
              <p className="text-gray-600 mb-4">Contribute to our community through blogs and discussions.</p>
              <Link to="/blog" className="text-blue-600 hover:text-blue-700 font-medium">
                Read Blogs →
              </Link>
            </div>

            {/* Network */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Network className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Network & Connect</h3>
              <p className="text-gray-600 mb-4">Build meaningful connections within your college community.</p>
              <Link to="/profile" className="text-blue-600 hover:text-blue-700 font-medium">
                View Profiles →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-xl mb-8">Join our growing community of alumni and students.</p>
          <Link to="/signup" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
