import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  Settings, 
  BarChart2, 
  Briefcase,
  Building,
  Mail,
  Bell,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Clock,
  FileCheck,
  Award,
  Shield,
  Database,
  HelpCircle,
  LogOut,
  LayoutDashboard,
  FolderOpen,
  Receipt,
  UserCog,
  Building2,
  MessageSquare,
  FileSpreadsheet,
  BookOpen,
  FileArchive,
  ClipboardList,
  Users2,
  GraduationCap
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    hr: true,
    finance: true,
    operations: true,
    system: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = {
    hr: [
      { name: 'Performance Reviews', path: '/admin/performance', icon: <Award size={20} /> },
      { name: 'Training Programs', path: '/admin/training', icon: <GraduationCap size={20} /> },
      { name: 'Employee Documents', path: '/admin/employee-documents', icon: <FolderOpen size={20} /> },
      { name: 'Recruitment', path: '/admin/recruitment', icon: <UserPlus size={20} /> },
      { name: 'Team Management', path: '/admin/teams', icon: <Users2 size={20} /> }
    ],
    finance: [
      { name: 'Financial Reports', path: '/admin/financial-reports', icon: <FileSpreadsheet size={20} /> },
      { name: 'Tax Management', path: '/admin/tax', icon: <FileText size={20} /> },
      { name: 'Expense Claims', path: '/admin/expenses', icon: <Receipt size={20} /> },
      { name: 'Budget Planning', path: '/admin/budget', icon: <DollarSign size={20} /> }
    ],
    operations: [
      { name: 'Department Management', path: '/admin/departments', icon: <Building size={20} /> },
      { name: 'Asset Management', path: '/admin/assets', icon: <Database size={20} /> },
      { name: 'Company Policies', path: '/admin/policies', icon: <BookOpen size={20} /> },
      { name: 'Document Archive', path: '/admin/archive', icon: <FileArchive size={20} /> },
      { name: 'Task Management', path: '/admin/tasks', icon: <ClipboardList size={20} /> }
    ],
    system: [
      { name: 'User Management', path: '/admin/users', icon: <UserCog size={20} /> },
      { name: 'Role Management', path: '/admin/roles', icon: <Shield size={20} /> },
      { name: 'System Settings', path: '/admin/settings', icon: <Settings size={20} /> },
      { name: 'Help & Support', path: '/admin/support', icon: <HelpCircle size={20} /> }
    ]
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0">
      {/* Logo Section */}
      {/* <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
      </div> */}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {Object.entries(menuItems).map(([section, items]) => (
          <div key={section} className="mb-4">
            <button
              onClick={() => toggleSection(section)}
              className="w-full px-4 py-2 flex items-center justify-between text-gray-700 hover:bg-gray-50"
            >
              <span className="font-medium capitalize">{section}</span>
              {expandedSections[section] ? 
                <ChevronDown size={18} /> : 
                <ChevronRight size={18} />
              }
            </button>
            
            {expandedSections[section] && (
              <div className="mt-1">
                {items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-2 text-sm ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions and User Section */}
      {/* <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bell size={16} className="text-blue-600" />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Notifications</span>
          </div>
          <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">3</span>
        </div>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Quick Actions
          </button>
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center justify-center">
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default AdminSidebar;