import React from 'react';
import { FaUsers, FaCalendarAlt, FaMoneyBillWave, FaFileAlt, 
         FaUserShield, FaBullhorn, FaChartBar, FaStar, 
         FaReceipt, FaDoorOpen, FaHistory, FaCog } from 'react-icons/fa';
import AdminLayout from './AdminLayout';

const Admin = () => {
  const stats = [
    { id: 1, name: 'Total Employees', value: '1,234', icon: <FaUsers className="h-6 w-6 text-blue-500" /> },
    { id: 2, name: 'On Leave Today', value: '45', icon: <FaCalendarAlt className="h-6 w-6 text-green-500" /> },
    { id: 3, name: 'Pending Approvals', value: '12', icon: <FaFileAlt className="h-6 w-6 text-yellow-500" /> },
    { id: 4, name: 'Total Departments', value: '8', icon: <FaUserShield className="h-6 w-6 text-purple-500" /> },
  ];

  const recentActivities = [
    { id: 1, action: 'New employee joined', user: 'John Doe', time: '2 hours ago' },
    { id: 2, action: 'Leave request approved', user: 'Jane Smith', time: '3 hours ago' },
    { id: 3, action: 'Payroll processed', user: 'System', time: '5 hours ago' },
    { id: 4, action: 'Document uploaded', user: 'Mike Johnson', time: '1 day ago' },
  ];

  const quickActions = [
    { id: 1, name: 'Add Employee', icon: <FaUsers />, color: 'bg-blue-500' },
    { id: 2, name: 'Process Payroll', icon: <FaMoneyBillWave />, color: 'bg-green-500' },
    { id: 3, name: 'Create Announcement', icon: <FaBullhorn />, color: 'bg-yellow-500' },
    { id: 4, name: 'Generate Reports', icon: <FaChartBar />, color: 'bg-purple-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, Admin!</h2>
          <p className="mt-1 text-gray-600">Here's what's happening in your organization today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className={`flex items-center justify-center p-4 rounded-lg ${action.color} text-white hover:opacity-90 transition-opacity`}
              >
                <span className="mr-2">{action.icon}</span>
                {action.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">by {activity.user}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Admin;