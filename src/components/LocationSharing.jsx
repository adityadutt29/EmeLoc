import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const LocationSharing = () => {
    const { caseId } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isShared, setIsShared] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkLocationStatus();
    }, [caseId]);

    const checkLocationStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('cases')
                .select('latitude, longitude')
                .eq('id', caseId)
                .single();

            if (error) throw error;

            if (data && data.latitude && data.longitude) {
                setIsShared(true);
            }
        } catch (error) {
            console.error('Error checking location status:', error);
            setError('Failed to check location status. Please try again.');
        }
    };

    const shareLocation = async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by your browser');
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;

            const { data, error } = await supabase
                .from('cases')
                .update({ 
                    latitude: parseFloat(latitude.toFixed(8)),
                    longitude: parseFloat(longitude.toFixed(8)),
                    updated_at: new Date().toISOString()
                })
                .eq('id', caseId)
                .select();

            if (error) throw error;

            if (data) {
                toast.success('Location shared successfully');
                setIsShared(true);
            } else {
                throw new Error('No data returned from update operation');
            }
        } catch (error) {
            console.error('Error sharing location:', error);
            setError(error.message || 'Failed to share location. Please try again.');
            toast.error(error.message || 'Failed to share location');
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">Error</h1>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Emergency Location Sharing</h1>
            {isShared ? (
                <p className="text-green-600 font-semibold">Your location has been shared successfully.</p>
            ) : (
                <>
                    <p className="mb-4">Click the button below to share your location with emergency services:</p>
                    <button
                        onClick={shareLocation}
                        disabled={isLoading}
                        className={`py-2 px-4 bg-blue-500 text-white rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                    >
                        {isLoading ? 'Sharing...' : 'Share My Location'}
                    </button>
                </>
            )}
        </div>
    );
};

export default LocationSharing;