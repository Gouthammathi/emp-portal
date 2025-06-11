import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaUsers, FaTicketAlt, FaProjectDiagram, FaCalendarAlt } from 'react-icons/fa';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const CSuiteDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [ticketStatusCounts, setTicketStatusCounts] = useState({
    Open: 0,
    'In Progress': 0,
    Resolved: 0,
    Closed: 0
  });
  const [employeeRoleCounts, setEmployeeRoleCounts] = useState({});
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all users (excluding clients) and calculate total and role counts
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const allUsers = usersSnapshot.docs.map(doc => doc.data());
        const employees = allUsers.filter(user => user.role !== 'client');
        setTotalEmployees(employees.length);

        const roleCounts = {};
        employees.forEach(emp => {
          const role = emp.role || 'employee'; // Default to employee if role is missing
          roleCounts[role] = (roleCounts[role] || 0) + 1;
        });
        setEmployeeRoleCounts(roleCounts);

        // Fetch all tickets and calculate total and status counts
        const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
        const allTickets = ticketsSnapshot.docs.map(doc => doc.data());
        setTotalTickets(allTickets.length);

        const statusCounts = {
          Open: 0,
          'In Progress': 0,
          Resolved: 0,
          Closed: 0
        };
        allTickets.forEach(ticket => {
          const status = ticket.status || 'Open'; // Default to Open if status is missing
          if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
          }
        });
        setTicketStatusCounts(statusCounts);

        // Fetch total projects
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        setTotalProjects(projectsSnapshot.size);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching C-Suite dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">C-Suite Dashboard</h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Employees Tile */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FaUsers className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Total Tickets Tile */}
          <div
            onClick={() => navigate('/csuite-tickets')}
            className="bg-white rounded-xl shadow p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FaTicketAlt className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Total Projects Tile */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaProjectDiagram className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          {/* Leave Requests Tile */}
          <div
            onClick={() => navigate('/leave/pending')}
            className="bg-white rounded-xl shadow p-6 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leave Requests</p>
                <p className="text-2xl font-bold text-gray-900">View</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaCalendarAlt className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Status Overview */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ticket Status Overview (All Tickets)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-lg font-bold text-gray-900">{ticketStatusCounts.Open}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-lg font-bold text-gray-900">{ticketStatusCounts['In Progress']}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-lg font-bold text-gray-900">{ticketStatusCounts.Resolved}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <div>
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-lg font-bold text-gray-900">{ticketStatusCounts.Closed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Role Breakdown */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Employee Breakdown by Role (Excluding Clients)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(employeeRoleCounts).map(([role, count]) => (
              <div key={role} className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>{/* Consider different colors based on role */}
                <div>
                  <p className="text-sm text-gray-600">{role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}</p>
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add more C-Suite relevant sections here */}
        {/* For example: Project status summary, financial overview, etc. */}

      </main>
    </div>
  );
};

export default CSuiteDashboard;
