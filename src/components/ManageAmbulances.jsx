import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to generate a random 6-letter hash
const generateRandomId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const ManageAmbulances = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAmbulance, setCurrentAmbulance] = useState(null);

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ambulances')
        .select('*');

      if (error) throw error;
      setAmbulances(data);
    } catch (error) {
      console.error('Error fetching ambulances:', error);
      toast.error('Failed to load ambulances');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAmbulance = () => {
    setCurrentAmbulance(null);
    setIsModalOpen(true);
  };

  const handleEditAmbulance = (ambulance) => {
    setCurrentAmbulance(ambulance);
    setIsModalOpen(true);
  };

  const handleDeleteAmbulance = async (id) => {
    if (window.confirm('Are you sure you want to delete this ambulance?')) {
      try {
        const { error } = await supabase
          .from('ambulances')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Ambulance deleted successfully');
        fetchAmbulances();
      } catch (error) {
        console.error('Error deleting ambulance:', error);
        toast.error('Failed to delete ambulance');
      }
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Manage Ambulances</h1>
      <button
        onClick={handleAddAmbulance}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        <FiPlus className="inline-block mr-2" /> Add Ambulance
      </button>
      {isLoading ? (
        <p className="dark:text-white">Loading ambulances...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">Registration Number</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Location</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
              {ambulances.map((ambulance) => (
                <tr key={ambulance.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium">{ambulance.id}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <div className="flex items-center">
                      <span>{ambulance.registration_number}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span>{ambulance.status}</span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span>{`(${ambulance.location.x}, ${ambulance.location.y})`}</span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                      <button
                        onClick={() => handleEditAmbulance(ambulance)}
                        className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteAmbulance(ambulance.id)}
                        className="w-4 mr-2 transform hover:text-red-500 hover:scale-110"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isModalOpen && (
        <AmbulanceModal
          ambulance={currentAmbulance}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            fetchAmbulances();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

const AmbulanceModal = ({ ambulance, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    ambulance || {
      id: generateRandomId(),
      registration_number: '',
      status: 'available',
      location: { x: 0, y: 0 }
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name === 'latitude' ? 'x' : 'y']: parseFloat(value)
        }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        location: `(${formData.location.x},${formData.location.y})`
      };

      if (ambulance) {
        const { error } = await supabase
          .from('ambulances')
          .update(dataToSave)
          .eq('id', ambulance.id);
        if (error) throw error;
        toast.success('Ambulance updated successfully');
      } else {
        const { error } = await supabase
          .from('ambulances')
          .insert(dataToSave);
        if (error) throw error;
        toast.success('Ambulance added successfully');
      }
      onSave();
    } catch (error) {
      console.error('Error saving ambulance:', error);
      toast.error('Failed to save ambulance');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <h2 className="text-lg font-bold mb-4 dark:text-white">
          {ambulance ? 'Edit Ambulance' : 'Add Ambulance'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="id">
              ID
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              readOnly
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="registration_number">
              Registration Number
            </label>
            <input
              type="text"
              id="registration_number"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-300"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-300"
              required
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="latitude">
              Latitude
            </label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.location.x}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-300"
              required
              step="any"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="longitude">
              Longitude
            </label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.location.y}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-gray-300"
              required
              step="any"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageAmbulances;
