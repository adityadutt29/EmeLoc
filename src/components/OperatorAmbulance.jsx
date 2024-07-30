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
        <div className="container mx-auto px-4 py-8 dark:text-white">
            <ToastContainer autoClose={3000} /> {/* Auto-close toasts after 3000ms (3 seconds) */}
            <h2 className="text-3xl font-bold mb-6 text-center">Ambulance List</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Tracker Link</th>
                            <th className="py-3 px-6 text-left">License Plate</th>
                            <th className="py-3 px-6 text-left">Status</th>
                            <th className="py-3 px-6 text-left">Driver Email</th>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OperatorAmbulance;
