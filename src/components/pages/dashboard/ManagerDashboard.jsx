import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaClipboardList, FaCalendarAlt, FaClock, FaBook, FaUsers, FaChartLine, FaTasks, FaSitemap } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import OrgChartPage from '../Org';
import TeamOverview from './TeamOverview';
 
const ManagerDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
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
 
  // Employee features tiles
  const employeeTiles = [
    {
      title: 'Mock Tests',
      icon: <FaBook className="w-8 h-8" />,
      description: 'Access and take mock tests for various topics',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => navigate('/module-selection')
    },
    {
      title: 'Daily Status',
      icon: <FaClipboardList className="w-8 h-8" />,
      description: 'View and update your daily work status',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: () => navigate('/daily-s')
    },
    {
      title: 'Time Sheet',
      icon: <FaClock className="w-8 h-8" />,
      description: 'Manage your time sheet and attendance',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      onClick: () => navigate('/Timesheet')
    },
    {
      title: 'Holiday Calendar',
      icon: <FaCalendarAlt className="w-8 h-8" />,
      description: 'View upcoming holidays and events',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      onClick: () => navigate('/holiday-calendar')
    },
  ];
 
  // Team Lead specific tiles
  const teamLeadTiles = [
    {
      title: 'Team Overview',
      icon: <FaUsers className="w-8 h-8" />,
      description: 'View and manage your team members',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      onClick: () => setActiveView('team')
    },
    {
      title: 'Performance Metrics',
      icon: <FaChartLine className="w-8 h-8" />,
      description: 'Track team performance and metrics',
      color: 'bg-teal-500',
      hoverColor: 'hover:bg-teal-600',
      onClick: () => navigate('/team-performance')
    },
    {
      title: 'Team Tasks',
      icon: <FaTasks className="w-8 h-8" />,
      description: 'Assign and monitor team tasks',
      color: 'bg-pink-500',
      hoverColor: 'hover:bg-pink-600',
      onClick: () => navigate('/team-tasks')
    },
    {
      title: 'Org Chart',
      icon: <FaSitemap className="w-8 h-8" />,
      description: 'View the organization structure',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      onClick: () => navigate('/org')
    },
  ];
 
  if (loading) {
    return <div>Loading...</div>;
  }
 
  if (activeView === 'team') {
    return <TeamOverview />;
  }
 
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {userData?.firstName} {userData?.lastName}
          </h1>
          <p className="text-gray-600">Team Lead Dashboard</p>
        </div>
 
        {/* Team Lead Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Team Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {teamLeadTiles.map((tile, index) => (
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
        </div>
 
        {/* Employee Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Employee Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {employeeTiles.map((tile, index) => (
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
        </div>
 
        {/* Team Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Team Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Team Members</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Projects</span>
                <span className="font-semibold">3</span>
              </div>
            </div>
          </div>
 
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Team Productivity</span>
                <span className="font-semibold text-green-600">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Project Completion</span>
                <span className="font-semibold text-blue-600">70%</span>
              </div>
            </div>
          </div>
 
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Schedule Team Meeting
              </button>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors">
                Submit Team Report
              </button>
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors">
                Review Team Performance
              </button>
            </div>
          </div>
        </div>
 
        {/* Recent Activities Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-gray-800">Team meeting scheduled for tomorrow</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="text-gray-800">Project milestone completed</p>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="text-gray-800">New team member onboarded</p>
              <p className="text-sm text-gray-500">2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ManagerDashboard;