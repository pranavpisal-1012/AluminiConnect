import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8" />
            <span className="font-bold text-xl">Alumni Connect</span>
          </Link>

          <div className="flex space-x-4">
            <Link to="/" className="hover:text-blue-200">Home</Link>
            <Link to="/blog" className="hover:text-blue-200">Blog</Link>
            <Link to="/jobs" className="hover:text-blue-200">Jobs</Link>
            <Link to="/mentorship" className="hover:text-blue-200">Mentor</Link>
            <Link to="/contact" className="hover:text-blue-200">Contact</Link>
            {user ? (
              <>
                <Link to="/profile" className="hover:text-blue-200">Profile</Link>
                <button onClick={handleSignOut} className="hover:text-blue-200">Sign Out</button>
              </>
            ) : (
              <Link to="/signin" className="hover:text-blue-200">Sign In</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}