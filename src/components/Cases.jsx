import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Cases = () => {
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('cases')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setCases(data);
        } catch (error) {
            console.error('Error fetching cases:', error);
            toast.error('Failed to fetch cases');
        } finally {
            setIsLoading(false);
        }
    };

    const showLocationOnMap = (latitude, longitude) => {
        if (latitude && longitude) {
            const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            window.open(mapUrl, '_blank', 'noopener,noreferrer');
        } else {
            toast.warn('Location not available for this case');
        }
    };

    if (isLoading) {
        return <div>Loading cases...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ToastContainer />
            <h2 className="text-2xl font-bold mb-4">Active Cases</h2>
            <ul className="space-y-4">
                {cases.map((c) => (
                    <li key={c.id} className="border p-4 rounded-md">
                        <p><strong>Case ID:</strong> {c.id}</p>
                        <p><strong>Email:</strong> {c.email}</p>
                        <p><strong>Status:</strong> {c.status}</p>
                        <p><strong>Description:</strong> {c.description}</p>
                        <p><strong>Created At:</strong> {new Date(c.created_at).toLocaleString()}</p>
                        <p><strong>Updated At:</strong> {new Date(c.updated_at).toLocaleString()}</p>
                        <p><strong>Location:</strong> {c.latitude && c.longitude ? `${c.latitude}, ${c.longitude}` : 'Not yet shared'}</p>
                        <button
                            onClick={() => showLocationOnMap(c.latitude, c.longitude)}
                            className="mt-2 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Show on Map
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Cases;