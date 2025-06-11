import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaClipboardList, FaCalendarAlt, FaClock, FaBook, FaUsers, FaChartLine, FaTasks, FaSitemap, FaBell, FaTimes, FaChevronDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import orgChartData from '../../../data/orgchart.json';
 
// Create a global notifications state
let globalNotifications = [];
let notificationListeners = [];
 
const SuperManagerDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [teamMembersCount, setTeamMembersCount] = useState(0);
  const [notifications, setNotifications] = useState(globalNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
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
 
  // Super Manager specific tiles
  const superManagerTiles = [
    {
      title: 'Team Overview',
      icon: <FaUsers className="w-8 h-8" />,
      description: 'View and manage your team members',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      onClick: () => navigate('/supermanager-team-overview')
    },
    {
      title: 'Tickets',
      icon: <FaTasks className="w-8 h-8" />,
      description: 'View all tickets from your managers',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => navigate('/supermanager-tickets')
    },
    {
      title: 'Performance',
      icon: <FaChartLine className="w-8 h-8" />,
      description: 'Track team performance metrics',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      onClick: () => navigate('/manager/performance')
    },
    {
      title: 'Leave Requests',
      icon: <FaCalendarAlt className="w-8 h-8" />,
      description: 'View and manage team leave requests',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      onClick: () => navigate('/leave/pending')
    }
  ];
 
  // Notification bell click handler
  const handleBellClick = () => setShowNotifications((prev) => !prev);
 
  if (loading) {
    return <div>Loading...</div>;
  }
 
  if (activeView === 'team') {
    return <SuperManagerTeamOverview />;
  }
 
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header and Name Card - Handled by Header component in Layout */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Super Manager Features Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Team Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {superManagerTiles.map((tile, index) => (
              <div
                key={index}
                onClick={tile.onClick}
                className={`${tile.color} ${tile.hoverColor} rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer border border-white/10 flex flex-col justify-between`}
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
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Team Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total Team Members</span>
                <span className="text-3xl font-bold text-gray-900">{teamMembersCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => window.open('msteams://teams.microsoft.com/calendar', '_blank')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow"
              >
                <FaCalendarAlt className="w-5 h-5" />
                Schedule Department Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Department Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Department Overview Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Department Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total Teams</span>
                <span className="font-semibold text-gray-900">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total Employees</span>
                <span className="font-semibold text-gray-900">45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Active Projects</span>
                <span className="font-semibold text-gray-900">8</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Department Productivity</span>
                <span className="font-semibold text-green-600">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Project Success Rate</span>
                <span className="font-semibold text-blue-600">88%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Team Satisfaction</span>
                <span className="font-semibold text-purple-600">4.5/5</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow">
                Schedule Department Meeting
              </button>
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors shadow">
                Review Team Performance
              </button>
              <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow">
                Generate Department Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default SuperManagerDashboard;
 