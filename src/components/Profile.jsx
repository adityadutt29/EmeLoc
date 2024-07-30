import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

// Initialize Supabase client using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center">No user data available</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center border-b-2 pb-2 border-gray-300 dark:border-gray-700">
        Operator Profile
      </h2>
      <div className="space-y-4">
        <ProfileField label="Name" value={user.name || 'Not provided'} />
        <ProfileField label="Email" value={user.email} />
        <ProfileField label="Role" value={user.role} />
        <ProfileField label="Address" value={user.address || 'Not provided'} />
        <ProfileField label="Shift" value={user.shift ? `Shift ${user.shift}` : 'Not assigned'} />
        <ProfileField label="Gender" value={user.gender === 0 ? 'Male' : user.gender === 1 ? 'Female' : 'Other'} />
        <ProfileField label="Location" value={user.location || 'Not provided'} />
      </div>
    </div>
  );
};

const ProfileField = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between">
    <span className="font-bold text-gray-600 dark:text-gray-300">{label}:</span>
    <span className="text-gray-800 dark:text-white">{value}</span>
  </div>
);

export default Profile;
