import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaClipboardList, FaCalendarAlt, FaClock, FaBook, FaUsers, FaChartLine, FaTasks, FaSitemap, FaBell, FaTimes, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import OrgChartPage from '../Org';
import TeamOverview from './TeamOverview';
import orgChartData from '../../../data/orgchart.json';

// Create a global notifications state
let globalNotifications = [];
let notificationListeners = [];

const ManagerDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [teamMembersCount, setTeamMembersCount] = useState(0);
  const [notifications, setNotifications] = useState(globalNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
     
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
         
          // Fetch team members count
          if (data.empId) {
            const orgChartTeamMembers = orgChartData.organizationChart.filter(
              emp => String(emp.managerId) === String(data.empId)
            );
           
            // Check which team members are registered in the database
            const registeredTeamMembers = [];
            for (const member of orgChartTeamMembers) {
              const userQuery = query(
                collection(db, "users"),
                where("empId", "==", member.empId)
              );
              const userSnapshot = await getDocs(userQuery);
              if (!userSnapshot.empty) {
                registeredTeamMembers.push(member);
              }
            }
           
            setTeamMembersCount(registeredTeamMembers.length);
          }
        }
      }
      setLoading(false);
    };
 
    fetchUserData();
  }, []);
 
  useEffect(() => {
    let unsubscribes = [];
    if (!userData?.empId) return;

    // Helper to add notification
    const addNotification = (type, docData) => {
      const newNotification = {
        title: `${docData.employeeName || docData.name} submitted a ${type}`,
        time: new Date(docData.submittedAt?.toDate ? docData.submittedAt.toDate() : docData.submittedAt).toLocaleString(),
        type,
        id: docData.id || docData.empId || Math.random().toString(36)
      };
      
      globalNotifications = [newNotification, ...globalNotifications];
      setNotifications(globalNotifications);
      
      // Notify all listeners
      notificationListeners.forEach(listener => listener(globalNotifications));
    };

    // Get team member empIds
    const teamEmpIds = orgChartData.organizationChart
      .filter(emp => String(emp.managerId) === String(userData.empId))
      .map(emp => String(emp.empId));

    // Listen to timesheets
    const timesheetUnsub = onSnapshot(
      query(collection(db, 'timesheets')),
      (snapshot) => {
        snapshot.docChanges().forEach(change => {
          const data = change.doc.data();
          if (change.type === 'added' && teamEmpIds.includes(String(data.empId))) {
            addNotification('timesheet', data);
          }
        });
      }
    );
    unsubscribes.push(timesheetUnsub);

    // Listen to status reports
    const statusUnsub = onSnapshot(
      query(collection(db, 'statusReports')),
      (snapshot) => {
        snapshot.docChanges().forEach(change => {
          const data = change.doc.data();
          if (change.type === 'added' && teamEmpIds.includes(String(data.empId))) {
            addNotification('status report', data);
          }
        });
      }
    );
    unsubscribes.push(statusUnsub);

    // Listen to mock tests
    const mockUnsub = onSnapshot(
      query(collection(db, 'mockTests')),
      (snapshot) => {
        snapshot.docChanges().forEach(change => {
          const data = change.doc.data();
          if (change.type === 'added' && teamEmpIds.includes(String(data.empId))) {
            addNotification('mock test', data);
          }
        });
      }
    );
    unsubscribes.push(mockUnsub);

    // Listen to reimbursements
    try {
      const reimbursementUnsub = onSnapshot(
        query(collection(db, 'reimbursements')),
        (snapshot) => {
          snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            if (change.type === 'added' && teamEmpIds.includes(String(data.empId))) {
              addNotification('reimbursement', data);
            }
          });
        }
      );
      unsubscribes.push(reimbursementUnsub);
    } catch { /* ignore if collection doesn't exist */ }

    // Add this component as a listener
    const listener = (newNotifications) => setNotifications(newNotifications);
    notificationListeners.push(listener);

    return () => {
      unsubscribes.forEach(unsub => unsub());
      // Remove this component's listener
      notificationListeners = notificationListeners.filter(l => l !== listener);
    };
  }, [userData]);

  // Function to clear notifications
  const clearNotifications = () => {
    globalNotifications = [];
    setNotifications([]);
    // Notify all listeners
    notificationListeners.forEach(listener => listener([]));
  };

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
      onClick: () => navigate('/team-overview')
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
 
  // Notification bell click handler
  const handleBellClick = () => setShowNotifications((prev) => !prev);
  const handleProfileClick = () => setShowProfileDropdown((prev) => !prev);
  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    navigate('/team-overview');
  };
 
  if (loading) {
    return <div>Loading...</div>;
  }
 
  if (activeView === 'team') {
    return <TeamOverview />;
  }
 
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header and Name Card */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-gray-900 mr-4">Dashboard</h1>
          <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-lg font-medium">Team Lead View</span>
        </div>
        <div className="flex items-center space-x-4 relative">
          {/* Notification Bell */}
          <div className="relative">
            <button className="relative" onClick={handleBellClick}>
              <FaBell className="w-7 h-7 text-gray-700" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            {/* Notification Dropdown - now positioned below bell */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b font-semibold text-gray-700">
                  <span>Notifications</span>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-200 rounded-full" title="Hide">
                      <FaChevronDown className="w-4 h-4" />
                    </button>
                    <button onClick={clearNotifications} className="p-1 hover:bg-gray-200 rounded-full" title="Clear All">
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-500">No new notifications</div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div key={idx} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="font-medium text-gray-800">{notif.title}</div>
                      <div className="text-sm text-gray-500">{notif.time}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {/* Profile Card */}
          <div className="relative">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleProfileClick}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {userData?.firstName?.[0]}{userData?.lastName?.[0]}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{userData?.firstName} {userData?.lastName}</p>
                <p className="text-sm text-purple-500 font-medium">Team Lead</p>
              </div>
            </div>
            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50">
                <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100 rounded-b-lg">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
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
                <span className="font-semibold">{teamMembersCount}</span>
              </div>
            </div>
          </div>
 
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => window.open('msteams://teams.microsoft.com/calendar', '_blank')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaCalendarAlt className="w-5 h-5" />
                Schedule Team Meeting
              </button>
            </div>
          </div>
        </div>
 
        {/* Recent Activities Section */}
        {/* <div className="bg-white rounded-lg shadow-lg p-6">
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
        </div> */}
      </div>
    </div>
  );
};
 
export default ManagerDashboard;