import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome, FaFire, FaBook, FaClipboardList, FaClock,
  FaFolderOpen, FaSitemap, FaFileInvoiceDollar, FaChevronDown,
  FaChevronUp, FaUmbrellaBeach
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const isSelected = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-64px)] shadow-lg overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="overflow-y-auto flex-grow">
          <div className="p-6 text-2xl font-bold text-gray-800 border-b">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </span>
          </div>
          <ul className="space-y-2 px-5 py-4 text-sm">
            <SidebarItem 
              icon={<FaHome className="text-blue-500 group-hover:text-blue-600" />} 
              label="Home" 
              onClick={() => handleNavigate('/dashboard')}
              isSelected={isSelected('/dashboard')}
            />
            <SidebarItem 
              icon={<FaFire className="text-red-500 group-hover:text-red-600" />} 
              label="Engage" 
              onClick={() => handleNavigate('/engage')}
              isSelected={isSelected('/engage')}
            />
            <SidebarItem 
              icon={<FaBook className="text-purple-600 group-hover:text-purple-700" />} 
              label="Mock Tests" 
              onClick={() => handleNavigate('/module-selection')}
              isSelected={isSelected('/module-selection')}
            />
            <SidebarItem 
              icon={<FaClipboardList className="text-yellow-500 group-hover:text-yellow-600" />} 
              label="Daily Status" 
              onClick={() => handleNavigate('/daily-s')}
              isSelected={isSelected('/daily-s')}
            />
            <SidebarItem 
              icon={<FaClock className="text-pink-500 group-hover:text-pink-600" />} 
              label="Time Sheet" 
              onClick={() => handleNavigate('/Timesheet')}
              isSelected={isSelected('/Timesheet')}
            />

            <div className="pt-2 pb-1">
              <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Finance
              </div>
            </div>

            {/* Salary Dropdown */}
            <SidebarDropdown
              icon={<FaFileInvoiceDollar className="text-green-600 group-hover:text-green-700" />}
              label="Salary"
              isOpen={salaryOpen}
              onToggle={() => setSalaryOpen(!salaryOpen)}
              items={[
                { label: 'Payslips', path: '/salary/payslips' },
                { label: 'IT Statement', path: '/salary/it-statement' },
              ]}
              handleNavigate={handleNavigate}
              isSelected={isSelected('/salary/payslips') || isSelected('/salary/it-statement')}
              currentPath={location.pathname}
            />

            <div className="pt-2 pb-1">
              <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Time Off
              </div>
            </div>

            {/* Leave Dropdown */}
            <SidebarDropdown
              icon={<FaUmbrellaBeach className="text-indigo-500 group-hover:text-indigo-600" />}
              label="Leave"
              isOpen={leaveOpen}
              onToggle={() => setLeaveOpen(!leaveOpen)}
              items={[
                { label: 'Leave Apply', path: '/leave/apply' },
                { label: 'Leave Balances', path: '/leave/balances' },
                { label: 'Holiday Calendar', path: '/holiday-calendar' },
              ]}
              handleNavigate={handleNavigate}
              isSelected={isSelected('/leave/apply') || isSelected('/leave/balances') || isSelected('/holiday-calendar')}
              currentPath={location.pathname}
            />

            <div className="pt-2 pb-1">
              <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Resources
              </div>
            </div>

            <SidebarItem 
              icon={<FaFolderOpen className="text-orange-500 group-hover:text-orange-600" />} 
              label="Document Center" 
              onClick={() => handleNavigate('/document-center')}
              isSelected={isSelected('/document-center')}
            />
            <SidebarItem 
              icon={<FaSitemap className="text-emerald-500 group-hover:text-emerald-600" />} 
              label="People" 
              onClick={() => handleNavigate('/org')}
              isSelected={isSelected('/org')}
            />
            <SidebarItem 
              icon={<FaFileInvoiceDollar className="text-teal-600 group-hover:text-teal-700" />} 
              label="Reimbursement" 
              onClick={() => handleNavigate('/reimbursement')}
              isSelected={isSelected('/reimbursement')}
            />
          </ul>
        </div>

        <div className="text-center p-4 text-gray-500 text-sm border-t">
          © {new Date().getFullYear()} Artihcus Global
        </div>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, onClick, isSelected }) => (
  <li
    onClick={onClick}
    className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-all duration-200 group relative
      ${isSelected 
        ? 'bg-blue-50 text-blue-700 font-semibold' 
        : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
      }`}
  >
    <span className={`text-lg transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
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

const SidebarDropdown = ({ icon, label, isOpen, onToggle, items, handleNavigate, isSelected, currentPath }) => (
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
        <span className={`text-lg transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
          {icon}
        </span>
        <span className={`font-medium tracking-wide ${isSelected ? 'text-blue-700' : ''}`}>
          {label}
        </span>
      </div>
      <span className={`transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
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
 