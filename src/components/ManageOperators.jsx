import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ManageOperators = () => {
  const [operators, setOperators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOperator, setCurrentOperator] = useState(null);

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'operator');

      if (error) throw error;
      setOperators(data);
    } catch (error) {
      console.error('Error fetching operators:', error);
      toast.error('Failed to load operators');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOperator = () => {
    setCurrentOperator(null);
    setIsModalOpen(true);
  };

  const handleEditOperator = (operator) => {
    setCurrentOperator(operator);
    setIsModalOpen(true);
  };

  const handleDeleteOperator = async (id) => {
    if (window.confirm('Are you sure you want to delete this operator?')) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Operator deleted successfully');
        fetchOperators();
      } catch (error) {
        console.error('Error deleting operator:', error);
        toast.error('Failed to delete operator');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Manage Operators</h1>
      <button
        onClick={handleAddOperator}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        <FiPlus className="inline-block mr-2" /> Add Operator
      </button>
      {isLoading ? (
        <p>Loading operators...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-center">Shift</th>
                <th className="py-3 px-6 text-center">Gender</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
              {operators.map((operator) => (
                <tr key={operator.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium">{operator.id}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium">{operator.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <div className="flex items-center">
                      <span>{operator.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span>{operator.shift}</span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span>{operator.gender === 0 ? 'Male' : 'Female'}</span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                      <button
                        onClick={() => handleEditOperator(operator)}
                        className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteOperator(operator.id)}
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
        <OperatorModal
          operator={currentOperator}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            fetchOperators();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

const OperatorModal = ({ operator, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    operator || {
      name: '',
      email: '',
      address: '',
      shift: '',
      gender: '',
      location: '',
    }
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (operator) {
        const { error } = await supabase
          .from('users')
          .update(formData)
          .eq('id', operator.id);
        if (error) throw error;
        toast.success('Operator updated successfully');
      } else {
        const { error } = await supabase
          .from('users')
          .insert({ ...formData, role: 'operator' });
        if (error) throw error;
        toast.success('Operator added successfully');
      }
      onSave();
    } catch (error) {
      console.error('Error saving operator:', error);
      toast.error('Failed to save operator');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <h2 className="text-lg font-bold mb-4 dark:text-white">
          {operator ? 'Edit Operator' : 'Add Operator'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="shift">
              Shift
            </label>
            <input
              type="text"
              id="shift"
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">Select Gender</option>
              <option value="0">Male</option>
              <option value="1">Female</option>
            </select>
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

export default ManageOperators;
