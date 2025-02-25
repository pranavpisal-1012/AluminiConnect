import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Phone, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'alumni';
  graduation_year: number;
  academic_year: 'FE' | 'SE' | 'TE' | 'BE' | 'Alumni';
  phone_number: string;
  bio: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setTimeout(fetchProfile, 1000);
          return;
        }
        throw error;
      }
      setProfile(data);
      setEditForm(data);
    } catch (error) {
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('users')
        .update(editForm)
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Error updating profile');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-12">
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center">
              <User className="h-20 w-20 text-blue-600" />
            </div>
          </div>
        </div>

        {editing ? (
          <div className="px-6 py-8">
            <form onSubmit={updateProfile} className="space-y-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  value={editForm.full_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  value={editForm.phone_number || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit phone number"
                />
              </div>

              <div>
                <label htmlFor="academic_year" className="block text-sm font-medium text-gray-700">
                  Academic Year
                </label>
                <select
                  id="academic_year"
                  value={editForm.academic_year || ''}
                  onChange={(e) => setEditForm({ ...editForm, academic_year: e.target.value as UserProfile['academic_year'] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="FE">First Year</option>
                  <option value="SE">Second Year</option>
                  <option value="TE">Third Year</option>
                  <option value="BE">Fourth Year</option>
                  <option value="Alumni">Alumni</option>
                </select>
              </div>

              <div>
                <label htmlFor="graduation_year" className="block text-sm font-medium text-gray-700">
                  Graduation Year
                </label>
                <input
                  type="number"
                  id="graduation_year"
                  value={editForm.graduation_year || ''}
                  onChange={(e) => setEditForm({ ...editForm, graduation_year: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min={2000}
                  max={2100}
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="px-6 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
              <p className="text-gray-600">{profile.role}</p>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-2" />
                {profile.email}
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-5 w-5 mr-2" />
                {profile.phone_number || 'No phone number added'}
              </div>
              <div className="flex items-center text-gray-600">
                <GraduationCap className="h-5 w-5 mr-2" />
                {profile.academic_year || 'Academic year not set'}
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                Graduation Year: {profile.graduation_year}
              </div>
              <div className="text-gray-600">
                <h3 className="font-semibold mb-2">About</h3>
                <p>{profile.bio || 'No bio provided'}</p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setEditing(true)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}