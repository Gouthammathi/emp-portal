import React, { useState } from 'react';
import { FaUsers, FaCalendarAlt, FaMoneyBillWave, FaFileAlt, 
         FaUserShield, FaBullhorn, FaChartBar, FaStar, 
         FaReceipt, FaDoorOpen, FaHistory, FaCog, FaBell, 
         FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, message: 'New leave request from John Doe', time: '5 min ago' },
    { id: 2, message: 'Payroll processing completed', time: '1 hour ago' },
    { id: 3, message: 'New employee joined', time: '2 hours ago' },
  ];

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'employees', label: 'Employees', icon: <FaUsers /> },
    { id: 'attendance', label: 'Attendance', icon: <FaCalendarAlt /> },
    { id: 'payroll', label: 'Payroll', icon: <FaMoneyBillWave /> },
    { id: 'documents', label: 'Documents', icon: <FaFileAlt /> },
    { id: 'roles', label: 'Roles & Permissions', icon: <FaUserShield /> },
    { id: 'announcements', label: 'Announcements', icon: <FaBullhorn /> },
    { id: 'reports', label: 'Reports', icon: <FaChartBar /> },
    { id: 'appraisals', label: 'Appraisals', icon: <FaStar /> },
    { id: 'expenses', label: 'Expenses', icon: <FaReceipt /> },
    { id: 'exit', label: 'Exit Management', icon: <FaDoorOpen /> },
    { id: 'audit', label: 'Audit Logs', icon: <FaHistory /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <FaBell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    {notifications.map((notification) => (
                      <div key={notification.id} className="px-4 py-3 hover:bg-gray-50">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                    <div className="px-4 py-2 border-t border-gray-200">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <FaUserCircle className="h-8 w-8" />
                  <span className="text-sm font-medium">Admin</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Your Profile
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </a>
                    <div className="border-t border-gray-200"></div>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
                      <FaSignOutAlt className="mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16">
        <div className="flex">
          {/* Navigation Sidebar */}
          <div className="w-64 flex-shrink-0 fixed h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="p-4 space-y-1">
              {navigationItems.map((item) => (
                <a
                  key={item.id}
                  href="#"
                  className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg group"
                >
                  <span className="mr-3 text-gray-400 group-hover:text-gray-500">
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 ml-64 p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 