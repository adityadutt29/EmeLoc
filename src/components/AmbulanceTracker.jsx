import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { toast, ToastContainer } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Custom icons for ambulance and victim markers
const ambulanceIcon = new L.Icon({
    iconUrl: '/path/to/ambulance-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const victimIcon = new L.Icon({
    iconUrl: '/path/to/victim-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const AmbulanceTracker = () => {
    const { ambulanceId } = useParams();
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState(null);
    const [assignedCase, setAssignedCase] = useState(null);
    const [victimLocation, setVictimLocation] = useState(null);
    const [ambulanceLocation, setAmbulanceLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([0, 0]);
    const [mapZoom, setMapZoom] = useState(13);

    useEffect(() => {
        fetchAssignedCase();
        let intervalId;

        const startTracking = async () => {
            setIsTracking(true);
            updateLocation(); // Initial update
            intervalId = setInterval(updateLocation, 5000); // Update every 5 seconds
        };

        const stopTracking = () => {
            setIsTracking(false);
            clearInterval(intervalId);
        };

        if (ambulanceId) {
            startTracking();
        }

        return () => {
            stopTracking();
        };
    }, [ambulanceId]);

    useEffect(() => {
        if (ambulanceLocation) {
            setMapCenter([ambulanceLocation.latitude, ambulanceLocation.longitude]);
        } else if (victimLocation) {
            setMapCenter([victimLocation.latitude, victimLocation.longitude]);
        }
    }, [ambulanceLocation, victimLocation]);

    const fetchAssignedCase = async () => {
        try {
            const { data, error } = await supabase
                .from('cases')
                .select('*')
                .eq('assigned_ambulance_id', ambulanceId)
                .eq('status', 'active')
                .single();

            if (error) throw error;

            setAssignedCase(data);
            if (data) {
                fetchVictimLocation(data.id);
            }
        } catch (error) {
            console.error('Error fetching assigned case:', error);
            setError(error.message);
        }
    };

    const fetchVictimLocation = async (caseId) => {
        try {
            const { data, error } = await supabase
                .from('ambulance_locations')
                .select('*')
                .eq('ambulance_id', ambulanceId)
                .order('timestamp', { ascending: false })
                .limit(1)
                .single();

            if (error) throw error;

            setVictimLocation(data);
        } catch (error) {
            console.error('Error fetching victim location:', error);
        }
    };

    const updateLocation = async () => {
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
                .from('ambulance_locations')
                .insert({
                    ambulance_id: ambulanceId,
                    latitude,
                    longitude,
                    timestamp: new Date().toISOString()
                });
    
            if (error) throw error;
    
            await supabase
                .from('ambulances')
                .update({ 
                    latitude,
                    longitude,
                    last_updated: new Date().toISOString()
                })
                .eq('id', ambulanceId);
    
            setAmbulanceLocation({ latitude, longitude });
            console.log('Location updated successfully');
        } catch (error) {
            console.error('Error updating location:', error);
            setError(error.message || 'Failed to update location');
            toast.error(error.message || 'Failed to update location');
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
            <h1 className="text-2xl font-bold mb-4">Ambulance Tracking</h1>
            {isTracking ? (
                <>
                    <p className="text-green-600 font-semibold mb-4">Your location is being tracked.</p>
                    {assignedCase && (
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">Assigned Case</h2>
                            <p><strong>Case ID:</strong> {assignedCase.id}</p>
                            <p><strong>Description:</strong> {assignedCase.description}</p>
                        </div>
                    )}
                    <div className="mb-4 h-96">
                        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {ambulanceLocation && (
                                <Marker position={[ambulanceLocation.latitude, ambulanceLocation.longitude]} icon={ambulanceIcon}>
                                    <Popup>
                                        Ambulance Location
                                    </Popup>
                                </Marker>
                            )}
                            {victimLocation && (
                                <Marker position={[victimLocation.latitude, victimLocation.longitude]} icon={victimIcon}>
                                    <Popup>
                                        Victim Location
                                    </Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </div>
                </>
            ) : (
                <p className="text-yellow-600 font-semibold">Tracking is not active.</p>
            )}
        </div>
    );
};

export default AmbulanceTracker;
