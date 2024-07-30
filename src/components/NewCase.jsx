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

const NewCase = () => {
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [selectedAmbulance, setSelectedAmbulance] = useState('');
    const [ambulances, setAmbulances] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchCurrentUser();
        fetchAvailableAmbulances();
    }, []);

    const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };

    const fetchAvailableAmbulances = async () => {
        const { data, error } = await supabase
            .from('ambulances')
            .select('id, license_plate, driver_email')
            .eq('status', 'available');

        if (error) {
            console.error('Error fetching ambulances:', error);
            toast.error('Failed to fetch available ambulances');
        } else {
            setAmbulances(data);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const caseId = generateUniqueId();
            const locationLink = `${window.location.origin}/location/${caseId}`;

            // Create new case
            const { data, error } = await supabase
                .from('cases')
                .insert({
                    id: caseId,
                    operator_id: currentUser?.id,
                    email: email,
                    status: 'active',
                    description: description,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    assigned_ambulance_id: selectedAmbulance
                });

            if (error) throw error;

            // Update ambulance status
            if (selectedAmbulance) {
                const { error: ambulanceError } = await supabase
                    .from('ambulances')
                    .update({ status: 'busy' })
                    .eq('id', selectedAmbulance);

                if (ambulanceError) throw ambulanceError;

                // Send email to ambulance driver
                const selectedAmbulanceData = ambulances.find(amb => amb.id === selectedAmbulance);
                if (selectedAmbulanceData) {
                    const driverEmailSubject = "New Emergency Case Assigned";
                    const driverEmailText = `You have been assigned a new emergency case. Case ID: ${caseId}. Description: ${description}`;
                    const driverEmailHtml = `
                        <h3>New Emergency Case Assigned</h3>
                        <p>You have been assigned a new emergency case.</p>
                        <p><strong>Case ID:</strong> ${caseId}</p>
                        <p><strong>Description:</strong> ${description}</p>
                        <p>Please check your tracking system for more details.</p>
                    `;
                    await sendEmail(selectedAmbulanceData.driver_email, driverEmailSubject, driverEmailText, driverEmailHtml);
                }
            }

            // Send email to the case reporter
            await sendEmail(
                email,
                "Emergency Response Link",
                `Please click on this link to share your location: ${locationLink}`,
                `<h3>Please click on this <a href="${locationLink}">link</a> to share your location.</h3>`
            );

            toast.success('Case created and emails sent successfully');
            setEmail('');
            setDescription('');
            setSelectedAmbulance('');
            fetchAvailableAmbulances();
        } catch (error) {
            console.error('Error creating case or sending email:', error);
            toast.error('Failed to create case and send emails');
        } finally {
            setIsLoading(false);
        }
    };

    const generateUniqueId = () => {
        return 'case-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    };

    return (
        <div className="container mx-auto px-4 py-8 dark:text-white">
            <ToastContainer />
            <h2 className="text-3xl font-bold mb-6 text-center">Create New Case</h2>
            <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white bg-gray-100 text-gray-900"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white bg-gray-100 text-gray-900"
                            rows="3"
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="ambulance" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            Assign Ambulance
                        </label>
                        <select
                            id="ambulance"
                            value={selectedAmbulance}
                            onChange={(e) => setSelectedAmbulance(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white bg-gray-100 text-gray-900"
                        >
                            <option value="">Select an ambulance</option>
                            {ambulances.map((ambulance) => (
                                <option key={ambulance.id} value={ambulance.id}>
                                    {ambulance.license_plate}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Creating...' : 'Create Case'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NewCase;
