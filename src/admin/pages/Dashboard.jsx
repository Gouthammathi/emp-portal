import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaUsers, FaUserTie, FaUserPlus, FaChartLine, FaCalendarAlt, FaTasks, FaBell } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0,
    departments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch employees
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const employees = snapshot.docs.map(doc => doc.data());

      // Calculate stats
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter(emp => emp.status === 'active').length;
      const newHires = employees.filter(emp => {
        const hireDate = new Date(emp.hireDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return hireDate >= thirtyDaysAgo;
      }).length;
      const departments = [...new Set(employees.map(emp => emp.department))].length;

      setStats({
        totalEmployees,
        activeEmployees,
        newHires,
        departments,
      });

      // Generate sample attendance data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }).reverse();

      setAttendanceData({
        labels: last7Days,
        datasets: [
          {
            label: 'Attendance',
            data: last7Days.map(() => Math.floor(Math.random() * 50) + 30),
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back, Admin</h1>
              <p className="mt-1 text-sm text-gray-500">Here's what's happening with your team today</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500 bg-gray-50 rounded-full">
                <FaBell className="h-6 w-6" />
              </button>
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                M
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <FaUsers className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <span className="text-green-500 mr-2">↑ 12%</span>
                <span>from last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Employees</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeEmployees}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <FaUserTie className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <span className="text-green-500 mr-2">↑ 8%</span>
                <span>from last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">New Hires</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.newHires}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FaUserPlus className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <span className="text-green-500 mr-2">↑ 15%</span>
                <span>from last month</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Departments</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.departments}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <FaChartLine className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <span className="text-green-500 mr-2">↑ 5%</span>
                <span>from last month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Attendance Overview</h2>
                <p className="text-sm text-gray-500">Last 7 days attendance</p>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <FaCalendarAlt className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <div className="h-80">
              <Line
                data={attendanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                <p className="text-sm text-gray-500">Latest updates from your team</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <FaTasks className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">U{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      User {index + 1} completed their task
                    </p>
                    <p className="text-sm text-gray-500">
                      {index + 1} hour{index !== 0 ? 's' : ''} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 