import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaSitemap, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
 
const HrDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
 
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
 
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };
 
    fetchUserData();
  }, []);
 
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };
 
  if (loading) {
    return <div>Loading...</div>;
  }
 
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-7xl mx-auto relative">
 
        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100  mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {userData?.firstName} {userData?.lastName}</h1>
          <p className="text-gray-600 mt-1">HR Dashboard</p>
        </div>
 
        {/* HR Features Section */}
        {/* <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">HR Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={() => navigate('/org')}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer border border-white/10 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Org Chart</h2>
                <FaSitemap className="w-8 h-8" />
              </div>
              <p className="text-sm opacity-90">View the organization structure</p>
            </div>
          </div>
        </div> */}
 
        {/* HR Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Employee Management Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Employee Management</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total Employees</span>
                <span className="text-xl font-semibold text-gray-900">150</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">New Hires This Month</span>
                <span className="text-xl font-semibold text-gray-900">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Open Positions</span>
                <span className="text-xl font-semibold text-gray-900">8</span>
              </div>
            </div>
          </div>
 
          {/* Leave Management Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Leave Management</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Pending Requests</span>
                <span className="text-xl font-semibold text-yellow-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Approved This Month</span>
                <span className="text-xl font-semibold text-green-600">25</span>
              </div>
            </div>
          </div>
 
          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow font-medium">
                Process Leave Requests
              </button>
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors shadow font-medium">
                Add New Employee
              </button>
              <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow font-medium">
                Generate Reports
              </button>
            </div>
          </div>
        </div>
 
        {/* Recent HR Activities */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-600 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors duration-200">
              <p className="text-gray-800 font-medium">New employee onboarding scheduled</p>
              <p className="text-sm text-gray-500 mt-1">1 hour ago</p>
            </div>
            <div className="border-l-4 border-green-600 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors duration-200">
              <p className="text-gray-800 font-medium">Leave request approved</p>
              <p className="text-sm text-gray-500 mt-1">3 hours ago</p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4 py-3 hover:bg-gray-50 rounded-r-lg transition-colors duration-200">
              <p className="text-gray-800 font-medium">New job posting created</p>
              <p className="text-sm text-gray-500 mt-1">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default HrDashboard;