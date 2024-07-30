import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import SignIn from './components/SignIn';
import OperatorDashboard from './components/OperatorDashboard';
import AdminDashboard from './components/AdminDashboard';
import LocationSharing from './components/LocationSharing';
import Loading from './components/Loading';
import OperatorAmbulance from './components/OperatorAmbulance';
import AmbulanceTracker from './components/AmbulanceTracker';
import AmbulanceMap from './components/AmbulanceMap';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/location/:caseId" element={<LocationSharing />} />
        <Route path="/track/:ambulanceId" element={<AmbulanceTracker />} />

        {/* Auth routes */}
        <Route path="/signin" element={!session ? <SignIn /> : <Navigate to="/dashboard" replace />} />

        {/* Protected routes */}
        <Route path="/dashboard/*" element={session ? <OperatorDashboard /> : <Navigate to="/signin" replace />} />
        <Route path="/admin-dashboard/*" element={session ? <AdminDashboard /> : <Navigate to="/signin" replace />} />
        <Route path="/manage-ambulances" element={session ? <OperatorAmbulance /> : <Navigate to="/signin" replace />} />
        <Route path="/ambulance-map" element={session ? <AmbulanceMap /> : <Navigate to="/signin" replace />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to={session ? "/dashboard" : "/signin"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
