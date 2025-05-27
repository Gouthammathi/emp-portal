import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MdDashboard, MdRocketLaunch, MdQuiz, MdAssignment,
  MdAccessTime, MdPayments, MdExpandLess, MdExpandMore,
  MdHome, MdBeachAccess, MdFolder, MdPeople,
  MdReceipt
} from 'react-icons/md';
import {
  FaBook, FaClipboardList, FaClock, FaCalendarAlt, FaFire, FaFolderOpen,
  FaSitemap, FaFileInvoiceDollar, FaChevronDown, FaChevronUp, FaUmbrellaBeach
} from 'react-icons/fa';
 
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
 
  // Auto-open dropdowns when their child routes are active
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/salary/')) {
      setSalaryOpen(true);
    }
    if (path.startsWith('/leave/') || path === '/holiday-calendar') {
      setLeaveOpen(true);
    }
  }, [location.pathname]);
 
  const handleNavigate = (path) => {
    navigate(path);
  };
 
  const isSelected = (path) => {
    return location.pathname === path;
  };
 
  const isParentSelected = (paths) => {
    return paths.some(path => location.pathname === path);
  };
 
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between shadow-lg font-sans">
      <div>
        <div className="p-4 text-2xl font-bold text-gray-800 border-b tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </span>
        </div>
        <ul className="space-y-2 px-4 py-3 text-sm">
          <SidebarItem 
            icon={<MdHome className="text-blue-600" />} 
            label="Home" 
            onClick={() => handleNavigate('/dashboard')}
            isSelected={isSelected('/dashboard')}
          />
          <SidebarItem 
            icon={<MdRocketLaunch className="text-purple-600" />} 
            label="Engage" 
            onClick={() => handleNavigate('/engage')}
            isSelected={isSelected('/engage')}
          />
          <SidebarItem 
            icon={<MdQuiz className="text-green-600" />} 
            label="Mock Tests" 
            onClick={() => handleNavigate('/module-selection')}
            isSelected={isSelected('/module-selection')}
          />
          <SidebarItem 
            icon={<MdAssignment className="text-orange-600" />} 
            label="Daily Status" 
            onClick={() => handleNavigate('/daily-s')}
            isSelected={isSelected('/daily-s')}
          />
          <SidebarItem 
            icon={<MdAccessTime className="text-red-600" />} 
            label="Time Sheet" 
            onClick={() => handleNavigate('/Timesheet')}
            isSelected={isSelected('/Timesheet')}
          />
 
          {/* Salary Dropdown */}
          <SidebarDropdown
            icon={<MdPayments className="text-emerald-600" />}
            label="Salary"
            isOpen={salaryOpen}
            onToggle={() => setSalaryOpen(!salaryOpen)}
            items={[
              { label: 'Payslips', path: '/salary/payslips' },
              { label: 'IT Statement', path: '/salary/it-statement' },
            ]}
            handleNavigate={handleNavigate}
            isSelected={isParentSelected(['/salary/payslips', '/salary/it-statement'])}
            currentPath={location.pathname}
          />
 
          {/* Leave Dropdown */}
          <SidebarDropdown
            icon={<MdBeachAccess className="text-cyan-600" />}
            label="Leave"
            isOpen={leaveOpen}
            onToggle={() => setLeaveOpen(!leaveOpen)}
            items={[
              { label: 'Leave Apply', path: '/leave/apply' },
              { label: 'Leave Balances', path: '/leave/balances' },
              { label: 'Holiday Calendar', path: '/holiday-calendar' },
            ]}
            handleNavigate={handleNavigate}
            isSelected={isParentSelected(['/leave/apply', '/leave/balances', '/holiday-calendar'])}
            currentPath={location.pathname}
          />
 
          <SidebarItem 
            icon={<MdFolder className="text-indigo-600" />} 
            label="Document Center" 
            onClick={() => handleNavigate('/document-center')}
            isSelected={isSelected('/document-center')}
          />
          <SidebarItem 
            icon={<MdPeople className="text-pink-600" />} 
            label="People" 
            onClick={() => handleNavigate('/org')}
            isSelected={isSelected('/org')}
          />
          <SidebarItem 
            icon={<MdReceipt className="text-teal-600" />} 
            label="Reimbursement" 
            onClick={() => handleNavigate('/reimbursement')}
            isSelected={isSelected('/reimbursement')}
          />
        </ul>
      </div>
 
      <div className="text-center p-4 text-gray-500 text-sm border-t font-medium tracking-wide">
        © {new Date().getFullYear()} Artihcus Global
      </div>
    </aside>
  );
};
 
// Subcomponents
const SidebarItem = ({ icon, label, onClick, isSelected }) => (
  <li
    onClick={onClick}
    className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-all duration-200 group relative
      ${isSelected 
        ? 'bg-blue-50 text-blue-700 font-semibold' 
        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
      }`}
  >
    <span className={`text-xl transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
    <span className={`font-medium tracking-wide ${isSelected ? 'text-blue-700' : ''}`}>
      {label}
    </span>
    {isSelected && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
    )}
  </li>
);
 
const SidebarDropdown = ({ 
  icon, 
  label, 
  isOpen, 
  onToggle, 
  items, 
  handleNavigate, 
  isSelected,
  currentPath 
}) => (
  <li className="text-gray-700">
    <div
      onClick={onToggle}
      className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-all duration-200 group relative
        ${isSelected 
          ? 'bg-blue-50 text-blue-700 font-semibold' 
          : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
        }`}
    >
      <div className="flex items-center gap-3">
        <span className={`text-xl transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
          {icon}
        </span>
        <span className={`font-medium tracking-wide ${isSelected ? 'text-blue-700' : ''}`}>
          {label}
        </span>
      </div>
      <span className={`transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
        {isOpen ? <MdExpandLess /> : <MdExpandMore />}
      </span>
      {isSelected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
      )}
    </div>
    {isOpen && (
      <ul className="pl-10 mt-1 space-y-1">
        {items.map((item, idx) => (
          <li
            key={idx}
            onClick={() => handleNavigate(item.path)}
            className={`p-2 rounded cursor-pointer transition-all duration-200 font-medium tracking-wide
              ${currentPath === item.path
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            {item.label}
          </li>
        ))}
      </ul>
    )}
  </li>
);
 
export default Sidebar;