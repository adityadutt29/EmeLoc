import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiUsers, FiFolder, FiTruck, FiUser, FiLogOut, FiMoon, FiSun, FiMenu } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '/logo.jpg';

// Import the separate component files
import ManageOperators from './ManageOperators';
import AllCases from './AllCases';
import ManageAmbulances from './ManageAmbulances';
import Profile from './Profile';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar is initially open
  const [isDarkMode, setIsDarkMode] = useState(false);  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/signin');
    } catch (error) {
      toast.error('Error signing out. Please try again.');
    }
  };

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-indigo-800 dark:bg-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0"
          >
            <div className="flex items-center justify-center h-20 shadow-md">
              <img src={logo} alt="Logo" className="h-12 w-12" />
              <h1 className="ml-2 text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <nav className="mt-5 flex-1">
              <Link
                to="/admin-dashboard"
                className={`flex items-center mt-4 py-2 px-6 ${
                  location.pathname === '/admin-dashboard' ? 'bg-indigo-700 dark:bg-gray-700 text-white' : 'text-indigo-200 dark:text-gray-300 hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-white'
                }`}
              >
                <FiHome className="h-5 w-5" />
                <span className="mx-3">Overview</span>
              </Link>
              <Link
                to="/admin-dashboard/operators"
                className={`flex items-center mt-4 py-2 px-6 ${
                  location.pathname === '/admin-dashboard/operators' ? 'bg-indigo-700 dark:bg-gray-700 text-white' : 'text-indigo-200 dark:text-gray-300 hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-white'
                }`}
              >
                <FiUsers className="h-5 w-5" />
                <span className="mx-3">Manage Operators</span>
              </Link>
              <Link
                to="/admin-dashboard/cases"
                className={`flex items-center mt-4 py-2 px-6 ${
                  location.pathname === '/admin-dashboard/cases' ? 'bg-indigo-700 dark:bg-gray-700 text-white' : 'text-indigo-200 dark:text-gray-300 hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-white'
                }`}
              >
                <FiFolder className="h-5 w-5" />
                <span className="mx-3">All Cases</span>
              </Link>
              <Link
                to="/admin-dashboard/ambulances"
                className={`flex items-center mt-4 py-2 px-6 ${
                  location.pathname === '/admin-dashboard/ambulances' ? 'bg-indigo-700 dark:bg-gray-700 text-white' : 'text-indigo-200 dark:text-gray-300 hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-white'
                }`}
              >
                <FiTruck className="h-5 w-5" />
                <span className="mx-3">Manage Ambulances</span>
              </Link>
              <Link
                to="/admin-dashboard/profile"
                className={`flex items-center mt-4 py-2 px-6 ${
                  location.pathname === '/admin-dashboard/profile' ? 'bg-indigo-700 dark:bg-gray-700 text-white' : 'text-indigo-200 dark:text-gray-300 hover:bg-indigo-700 dark:hover:bg-gray-700 hover:text-white'
                }`}
              >
                <FiUser className="h-5 w-5" />
                <span className="mx-3">Profile</span>
              </Link>
            </nav>
            <div className="absolute bottom-0 left-0 w-full p-4">
              <button
                onClick={handleLogout}
                className="flex items-center py-2 px-6 text-indigo-200 dark:text-gray-300 hover:bg-red-600 hover:text-white focus:outline-none rounded-md"
              >
                <FiLogOut className="h-5 w-5" />
                <span className="mx-3">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="flex justify-between items-center py-4 px-6 bg-white dark:bg-gray-800 border-b-4 border-indigo-600">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className={`text-gray-500 focus:outline-none z-50 ${isSidebarOpen ? 'sidebar-open' : ''}`}
            >
              <FiMenu className="h-6 w-6" />
            </button>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              {isDarkMode ? <FiSun className="h-6 w-6" /> : <FiMoon className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="profile" element={<Profile />} />
              <Route path="operators" element={<ManageOperators />} />
              <Route path="cases" element={<AllCases />} />
              <Route path="ambulances" element={<ManageAmbulances />} />
            </Routes>
          </div>
        </main>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalOperators: 0,
    totalCases: 0,
    activeCases: 0,
    totalAmbulances: 0,
  });

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      const { count: operatorCount } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('role', 'operator');

      const { count: totalCases } = await supabase
        .from('cases')
        .select('id', { count: 'exact' });

      const { count: activeCases } = await supabase
        .from('cases')
        .select('id', { count: 'exact' })
        .eq('status', 'active');

      const { count: ambulanceCount } = await supabase
        .from('ambulances')
        .select('id', { count: 'exact' });

      setStats({
        totalOperators: operatorCount,
        totalCases,
        activeCases,
        totalAmbulances: ambulanceCount,
      });
    } catch (error) {
      console.error('Error fetching overview stats:', error);
      toast.error('Failed to load overview stats');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DashboardCard title="Total Operators" value={stats.totalOperators} />
      <DashboardCard title="Total Cases" value={stats.totalCases} />
      <DashboardCard title="Active Cases" value={stats.activeCases} />
      <DashboardCard title="Total Ambulances" value={stats.totalAmbulances} />
    </div>
  );
};

const DashboardCard = ({ title, value }) => {
  return (
    <div className="bg-blue-500 dark:bg-blue-700 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-4xl font-bold text-white mt-2">{value}</p>
    </div>
  );
};

export default AdminDashboard;
