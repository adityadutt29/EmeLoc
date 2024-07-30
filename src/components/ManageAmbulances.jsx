import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function sendEmail(to, subject, textPart, htmlPart) {
    const response = await fetch('https://mailsender-nine.vercel.app/api/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, subject, textPart, htmlPart })
    });

    if (!response.ok) {
        throw new Error('Failed to send email');
    }

    return await response.json();
}

const ManageAmbulances = () => {
    const [ambulances, setAmbulances] = useState([]);
    const [newAmbulance, setNewAmbulance] = useState({ license_plate: '', driver_email: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [sendingTracker, setSendingTracker] = useState(null);
    const [editingAmbulance, setEditingAmbulance] = useState(null);

    useEffect(() => {
        fetchAmbulances();
    }, []);

    const fetchAmbulances = async () => {
        const { data, error } = await supabase
            .from('ambulances')
            .select('*');
        
        if (error) {
            console.error('Error fetching ambulances:', error);
            toast.error('Failed to fetch ambulances');
        } else {
            setAmbulances(data);
        }
    };

    const handleInputChange = (e) => {
        setNewAmbulance({ ...newAmbulance, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const ambulanceId = 'amb-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            const { data, error } = await supabase
                .from('ambulances')
                .insert({
                    id: ambulanceId,
                    license_plate: newAmbulance.license_plate,
                    driver_email: newAmbulance.driver_email,
                    status: 'available',
                });

            if (error) throw error;

            await sendTrackerLink(ambulanceId, newAmbulance.driver_email);

            toast.success('Ambulance added and email sent successfully');
            setNewAmbulance({ license_plate: '', driver_email: '' });
            fetchAmbulances();
        } catch (error) {
            console.error('Error adding ambulance:', error);
            toast.error('Failed to add ambulance and send email');
        } finally {
            setIsLoading(false);
        }
    };

    const sendTrackerLink = async (ambulanceId, email) => {
        const trackingLink = `${window.location.origin}/track/${ambulanceId}`;
        
        await sendEmail(
            email,
            "Ambulance Tracking Link",
            `Please click on this link to start sharing your location: ${trackingLink}`,
            `<h3>Please click on this <a href="${trackingLink}">link</a> to start sharing your location.</h3>`
        );
    };

    const handleSendTracker = async (ambulanceId, email) => {
        setSendingTracker(ambulanceId);
        try {
            await sendTrackerLink(ambulanceId, email);
            toast.success('Tracker link sent successfully');
        } catch (error) {
            console.error('Error sending tracker link:', error);
            toast.error('Failed to send tracker link');
        } finally {
            setSendingTracker(null);
        }
    };

    const handleEdit = (ambulance) => {
        setEditingAmbulance(ambulance);
        setNewAmbulance({ license_plate: ambulance.license_plate, driver_email: ambulance.driver_email });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from('ambulances')
                .update({
                    license_plate: newAmbulance.license_plate,
                    driver_email: newAmbulance.driver_email,
                })
                .eq('id', editingAmbulance.id);

            if (error) throw error;

            toast.success('Ambulance updated successfully');
            setNewAmbulance({ license_plate: '', driver_email: '' });
            setEditingAmbulance(null);
            fetchAmbulances();
        } catch (error) {
            console.error('Error updating ambulance:', error);
            toast.error('Failed to update ambulance');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (ambulanceId) => {
        setIsLoading(true);

        try {
            const { data, error } = await supabase
                .from('ambulances')
                .delete()
                .eq('id', ambulanceId);

            if (error) throw error;

            toast.success('Ambulance deleted successfully');
            fetchAmbulances();
        } catch (error) {
            console.error('Error deleting ambulance:', error);
            toast.error('Failed to delete ambulance');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 dark:text-white">
            <ToastContainer />
            <h2 className="text-3xl font-bold mb-6 text-center">Manage Ambulances</h2>
            <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <form onSubmit={editingAmbulance ? handleUpdate : handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="license_plate" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            License Plate
                        </label>
                        <input
                            type="text"
                            id="license_plate"
                            name="license_plate"
                            value={newAmbulance.license_plate}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white bg-gray-100 text-gray-900"
                        />
                    </div>
                    <div>
                        <label htmlFor="driver_email" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            Driver Email
                        </label>
                        <input
                            type="email"
                            id="driver_email"
                            name="driver_email"
                            value={newAmbulance.driver_email}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white bg-gray-100 text-gray-900"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (editingAmbulance ? 'Updating...' : 'Adding...') : (editingAmbulance ? 'Update Ambulance' : 'Add Ambulance')}
                    </button>
                </form>
            </div>
            <h3 className="text-2xl font-bold mt-8 mb-4 text-center">Ambulance List</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Tracker Link</th>
                            <th className="py-3 px-6 text-left">License Plate</th>
                            <th className="py-3 px-6 text-left">Status</th>
                            <th className="py-3 px-6 text-left">Driver Email</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
                        {ambulances.map((ambulance) => (
                            <tr key={ambulance.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                                <td className="py-3 px-6 text-left">
                                    <button
                                        onClick={() => handleSendTracker(ambulance.id, ambulance.driver_email)}
                                        disabled={sendingTracker === ambulance.id}
                                        className={`py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${sendingTracker === ambulance.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Send Tracker Link
                                    </button>
                                </td>
                                <td className="py-3 px-6 text-left">{ambulance.license_plate}</td>
                                <td className="py-3 px-6 text-left">{ambulance.status}</td>
                                <td className="py-3 px-6 text-left">{ambulance.driver_email}</td>
                                <td className="py-3 px-6 text-center space-x-2">
                                    <button
                                        onClick={() => handleEdit(ambulance)}
                                        className="py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ambulance.id)}
                                        className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageAmbulances;
