import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Cases = ({ isSidebarVisible }) => {
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('cases')
                .select('*');
            if (error) throw error;

            const sortedCases = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setCases(sortedCases);
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

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleSortByDate = () => {
        const sortedCases = [...cases].sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
        setCases(sortedCases);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    if (isLoading) {
        return <div>Loading cases...</div>;
    }

    return (
        <div className={`container mx-auto px-4 py-8 dark:text-white ${isSidebarVisible ? 'with-sidebar' : 'without-sidebar'}`}>
            <ToastContainer />
            <h2 className="text-2xl font-bold mb-4">Active Cases</h2>
            <button
                onClick={handleSortByDate}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
                Sort by Date ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
            </button>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Show on Map</th>
                            <th className="py-3 px-6 text-left">ID</th>
                            <th className="py-3 px-6 text-left">Email</th>
                            <th className="py-3 px-6 text-left">Description</th>
                            <th className="py-3 px-6 text-center">Status</th>
                            <th className="py-3 px-6 text-center">Created At</th>
                            <th className="py-3 px-6 text-center">Updated At</th>
                            <th className="py-3 px-6 text-center">Location</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
                        {cases.map((c) => (
                            <tr key={c.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                                <td className="py-3 px-6 text-left">
                                    <button
                                        onClick={() => showLocationOnMap(c.latitude, c.longitude)}
                                        className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-32 text-sm"
                                    >
                                        Show on Map
                                    </button>
                                </td>
                                <td className="py-3 px-6 text-left">{c.id}</td>
                                <td className="py-3 px-6 text-left">{c.email}</td>
                                <td className="py-3 px-6 text-left">{c.description}</td>
                                <td className="py-3 px-6 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-center">{formatDate(c.created_at)}</td>
                                <td className="py-3 px-6 text-center">{formatDate(c.updated_at)}</td>
                                <td className="py-3 px-6 text-center">{c.latitude && c.longitude ? `${c.latitude}, ${c.longitude}` : 'Not yet shared'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Cases;
