import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import {
  FaClipboardList,
  FaCalendarAlt,
  FaClock,
  FaBook,
  FaSitemap,
  FaUserCircle,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
 
const EmployeeDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };
 
    fetchUserData();
  }, []);
 
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
 
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
 
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => navigate('/'))
      .catch((error) => console.error('Logout Error:', error));
  };
 
  const tiles = [
    {
      title: 'Mock Tests',
      icon: <FaBook className="w-8 h-8" />,
      description: 'Access and take mock tests for various topics',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => navigate('/module-selection'),
    },
    {
      title: 'Daily Status',
      icon: <FaClipboardList className="w-8 h-8" />,
      description: 'View and update your daily work status',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: () => navigate('/daily-s'),
    },
    {
      title: 'Time Sheet',
      icon: <FaClock className="w-8 h-8" />,
      description: 'Manage your time sheet and attendance',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      onClick: () => navigate('/Timesheet'),
    },
    {
      title: 'Holiday Calendar',
      icon: <FaCalendarAlt className="w-8 h-8" />,
      description: 'View upcoming holidays and events',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      onClick: () => navigate('/holiday-calendar'),
    },
    {
      title: 'Org Chart',
      icon: <FaSitemap className="w-8 h-8" />,
      description: 'View the organization structure',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      onClick: () => navigate('/org'),
    },
  ];
 
  if (loading) return <div>Loading...</div>;
 
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative">
 
        {/* Profile Icon and Dropdown */}
        <div className="absolute top-0 right-0 mt-4 mr-4 flex flex-col items-center" ref={dropdownRef}>
          <div
            className="cursor-pointer flex flex-col items-center"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <FaUserCircle className="text-3xl text-gray-700 hover:text-gray-900 transition" />
            <span className="text-sm text-gray-700 font-medium mt-1">
              {userData?.firstName}
            </span>
          </div>
 
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
 
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 mt-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {userData?.firstName} {userData?.lastName}
          </h1>
          <p className="text-gray-600">Employee Dashboard</p>
        </div>
 
        {/* Dashboard Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          {tiles.map((tile, index) => (
            <div
              key={index}
              onClick={tile.onClick}
              className={`${tile.color} ${tile.hoverColor} rounded-lg shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{tile.title}</h2>
                {tile.icon}
              </div>
              <p className="text-sm opacity-90">{tile.description}</p>
            </div>
          ))}
        </div>
 
        {/* Recent Activities */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-gray-800">Daily status updated</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-800">Time sheet submitted</p>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="text-gray-800">Mock test completed</p>
              <p className="text-sm text-gray-500">2 days ago</p>
            </div>
          </div>
        </div>
 
      </div>
    </div>
  );
};
 
export default EmployeeDashboard;
 
 