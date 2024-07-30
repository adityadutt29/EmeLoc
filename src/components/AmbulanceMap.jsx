import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { createClient } from '@supabase/supabase-js';
import 'leaflet/dist/leaflet.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AmbulanceMap = () => {
    const [ambulances, setAmbulances] = useState([]);

    useEffect(() => {
        fetchAmbulanceLocations();
        const interval = setInterval(fetchAmbulanceLocations, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchAmbulanceLocations = async () => {
        const { data, error } = await supabase
            .from('ambulance_locations')
            .select(`
                id,
                ambulance_id,
                latitude,
                longitude,
                timestamp,
                ambulances (
                    license_plate,
                    status
                )
            `)
            .order('timestamp', { ascending: true });

        if (error) {
            console.error('Error fetching ambulance locations:', error);
        } else {
            // Group locations by ambulance_id
            const groupedLocations = data.reduce((acc, location) => {
                if (!acc[location.ambulance_id]) {
                    acc[location.ambulance_id] = [];
                }
                acc[location.ambulance_id].push(location);
                return acc;
            }, {});

            const ambulancesWithPaths = Object.entries(groupedLocations).map(([ambulanceId, locations]) => ({
                id: ambulanceId,
                currentLocation: locations[locations.length - 1],
                path: locations.map(loc => [loc.latitude, loc.longitude]),
                licensePlate: locations[0].ambulances.license_plate,
                status: locations[0].ambulances.status
            }));

            setAmbulances(ambulancesWithPaths);
        }
    };

    return (
        <div className="h-screen w-full">
            <MapContainer center={[0, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {ambulances.map((ambulance) => (
                    <React.Fragment key={ambulance.id}>
                        <Marker position={[ambulance.currentLocation.latitude, ambulance.currentLocation.longitude]}>
                            <Popup>
                                <div>
                                    <h3 className="font-bold">{ambulance.licensePlate}</h3>
                                    <p>Status: {ambulance.status}</p>
                                    <p>Last Updated: {new Date(ambulance.currentLocation.timestamp).toLocaleString()}</p>
                                </div>
                            </Popup>
                        </Marker>
                        <Polyline 
                            positions={ambulance.path}
                            color="blue"
                            weight={3}
                            opacity={0.7}
                        />
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
};

export default AmbulanceMap;
