import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Users, Calendar, DollarSign, FileText, 
  Search, ChevronDown, LogOut, User,
  Bell, Settings, Menu
} from 'lucide-react'
import { getAuth, signOut } from 'firebase/auth'

const AdminHeader = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const navigate = useNavigate()
  const auth = getAuth()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      // Clear any local storage or state if needed
      localStorage.removeItem('user')
      // Redirect to login page
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const headerNavItems = [
    {
      title: "Employees",
      icon: Users,
      link: "/admin/employees",
      submenu: [
        { title: "All Employees", link: "/admin/employees" },
        { title: "Add Employee", link: "/admin/employees/add" }
      ]
    },
    {
      title: "Leave",
      icon: Calendar,
      link: "/admin/leave",
      submenu: [
        { title: "Requests", link: "/admin/leave/requests" },
        { title: "Calendar", link: "/admin/leave/calendar" }
      ]
    },
    {
      title: "Payroll",
      icon: DollarSign,
      link: "/admin/payroll",
      submenu: [
        { title: "Process Payroll", link: "/admin/payroll/process" },
        { title: "Reports", link: "/admin/payroll/reports" }
      ]
    },
    {
      title: "Documents",
      icon: FileText,
      link: "/admin/documents",
      submenu: [
        { title: "Company Policies", link: "/admin/documents/policies" },
        { title: "Employee Docs", link: "/admin/documents/employee" }
      ]
    }
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section: Logo and Mobile Menu */}
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/admin/dashboard" className="ml-2 lg:ml-0 text-xl font-bold text-gray-900">
              HR Portal
            </Link>
          </div>

          {/* Center Section: Search */}
          <div className="hidden lg:flex flex-1 justify-center max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search employees, documents..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Right Section: Navigation and Profile */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {headerNavItems.map((item, index) => (
                <div key={index} className="relative group">
                  <Link
                    to={item.link}
                    className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.title}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Link>
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.link}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </nav>

            {/* Notifications and Profile */}
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900"
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium">Admin</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        to="/admin/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        to="/admin/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {headerNavItems.map((item, index) => (
                <div key={index}>
                  <Link
                    to={item.link}
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                  <div className="pl-10">
                    {item.submenu.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.link}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default AdminHeader
 