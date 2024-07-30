import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const OperatorAmbulance = () => {
    const [ambulances, setAmbulances] = useState([]);
    const [newAmbulance, setNewAmbulance] = useState({ license_plate: '', driver_email: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [sendingTracker, setSendingTracker] = useState(null);

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

    return (
        <div className="container mx-auto px-4 py-8">
            <ToastContainer />
            <h2 className="text-2xl font-bold mb-4">Manage Ambulances</h2>
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="mb-4">
                    <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700">
                        License Plate
                    </label>
                    <input
                        type="text"
                        id="license_plate"
                        name="license_plate"
                        value={newAmbulance.license_plate}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="driver_email" className="block text-sm font-medium text-gray-700">
                        Driver Email
                    </label>
                    <input
                        type="email"
                        id="driver_email"
                        name="driver_email"
                        value={newAmbulance.driver_email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {isLoading ? 'Adding...' : 'Add Ambulance'}
                </button>
            </form>
            <h3 className="text-xl font-bold mb-2">Ambulance List</h3>
            <ul>
                {ambulances.map((ambulance) => (
                    <li key={ambulance.id} className="mb-2 flex items-center justify-between">
                        <span>{ambulance.license_plate} - {ambulance.status} - {ambulance.driver_email}</span>
                        <button
                            onClick={() => handleSendTracker(ambulance.id, ambulance.driver_email)}
                            disabled={sendingTracker === ambulance.id}
                            className={`ml-4 py-1 px-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                sendingTracker === ambulance.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {sendingTracker === ambulance.id ? 'Sending...' : 'Send Tracker Link'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OperatorAmbulance;
