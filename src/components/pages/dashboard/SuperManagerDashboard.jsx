import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaClipboardList, FaCalendarAlt, FaClock, FaBook, FaUsers, FaChartLine, FaTasks, FaSitemap } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
 
const SuperManagerDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
 
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
 
  if (loading) {
    return <div>Loading...</div>;
  }
 
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome, {userData?.firstName} {userData?.lastName}
        </h1>
        <p className="text-gray-600">Manager Dashboard</p>
      </div>
 
      {/* Manager Features Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Manager Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div
            onClick={() => navigate('/org')}
            className="bg-orange-500 hover:bg-orange-600 rounded-lg shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Org Chart</h2>
              <FaSitemap className="w-8 h-8" />
            </div>
            <p className="text-sm opacity-90">View the organization structure</p>
          </div>
        </div>
      </div>
 
      {/* Manager Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Department Overview Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Department Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Teams</span>
              <span className="font-semibold">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Employees</span>
              <span className="font-semibold">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Projects</span>
              <span className="font-semibold">8</span>
            </div>
          </div>
        </div>
 
        {/* Performance Metrics Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Department Productivity</span>
              <span className="font-semibold text-green-600">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Project Success Rate</span>
              <span className="font-semibold text-blue-600">88%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Team Satisfaction</span>
              <span className="font-semibold text-purple-600">4.5/5</span>
            </div>
          </div>
        </div>
 
        {/* Quick Actions Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
              Schedule Department Meeting
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors">
              Review Team Performance
            </button>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors">
              Generate Department Report
            </button>
          </div>
        </div>
      </div>
 
      {/* Department Activities */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-gray-800">Department meeting scheduled</p>
            <p className="text-sm text-gray-500">2 hours ago</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-gray-800">Project milestone achieved</p>
            <p className="text-sm text-gray-500">1 day ago</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="text-gray-800">New team lead assigned</p>
            <p className="text-sm text-gray-500">2 days ago</p>
          </div>
        </div>
      </div>
 
      {/* Budget Overview */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Budget Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Budget</h3>
            <p className="text-2xl font-bold text-blue-600">$500,000</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Utilized</h3>
            <p className="text-2xl font-bold text-green-600">$350,000</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Remaining</h3>
            <p className="text-2xl font-bold text-purple-600">$150,000</p>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default SuperManagerDashboard;