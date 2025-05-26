import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import {
  FaUserCircle, FaSignOutAlt,
  FaCalendarAlt, FaClipboardList, FaClock, FaBell
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
    signOut(auth).then(() => navigate('/')).catch(console.error);
  };
 
  if (loading) return <div>Loading...</div>;
 
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-7xl mx-auto relative">
 
        {/* Profile Dropdown */}
        <div className="absolute top-0 right-0 mt-4 mr-4" ref={dropdownRef}>
          <div onClick={() => setShowDropdown(!showDropdown)} className="cursor-pointer flex flex-col items-center">
            <FaUserCircle className="text-3xl text-gray-700 hover:text-gray-900" />
            <span className="text-sm text-gray-700 font-medium">ID: {userData?.empId}</span>
            <span className="text-sm text-gray-700 font-medium">{userData?.firstName} {userData?.lastName}</span>
          </div>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
 
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow p-6 mt-14">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {userData?.firstName} {userData?.lastName}</h1>
          <p className="text-gray-600 mt-1">Employee ID: {userData?.empId}</p>
        </div>
 
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
            <FaClock className="text-blue-500 text-3xl" />
            <div>
              <p className="text-gray-700 font-semibold">Timesheet</p>
              <p className="text-sm text-gray-500">Pending for today</p>
            </div>
          </div>
 
          <div className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
            <FaClipboardList className="text-green-500 text-3xl" />
            <div>
              <p className="text-gray-700 font-semibold">Daily Status</p>
              <p className="text-sm text-gray-500">2 updates submitted</p>
            </div>
          </div>
 
          <div className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
            <FaCalendarAlt className="text-orange-500 text-3xl" />
            <div>
              <p className="text-gray-700 font-semibold">Upcoming Holiday</p>
              <p className="text-sm text-gray-500">Diwali - Nov 1</p>
            </div>
          </div>
        </div>
 
        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/daily-s')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Submit Status</button>
            <button onClick={() => navigate('/Timesheet')} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Fill Timesheet</button>
            <button onClick={() => navigate('/holiday-calendar')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Holiday Calendar</button>
          </div>
        </div>
 
        {/* Activity Feed */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
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