import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBook, FaClipboardList, FaClock, FaCalendarAlt, FaFire, FaFolderOpen,
  FaSitemap, FaFileInvoiceDollar, FaChevronDown, FaChevronUp, FaHome,
  FaUmbrellaBeach
} from 'react-icons/fa';
 
const Sidebar = () => {
  const navigate = useNavigate();
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
 
  const handleNavigate = (path) => {
    navigate(path);
  };
 
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between shadow-lg">
      <div>
        <div className="p-4 text-2xl font-bold text-gray-800 border-b">Dashboard</div>
        <ul className="space-y-1 px-4 py-2 text-sm">
          <SidebarItem icon={<FaHome />} label="Home" onClick={() => handleNavigate('/dashboard')} />
          <SidebarItem icon={<FaFire />} label="Engage" onClick={() => handleNavigate('/engage')} />
          <SidebarItem icon={<FaBook />} label="Mock Tests" onClick={() => handleNavigate('/module-selection')} />
          <SidebarItem icon={<FaClipboardList />} label="Daily Status" onClick={() => handleNavigate('/daily-s')} />
          <SidebarItem icon={<FaClock />} label="Time Sheet" onClick={() => handleNavigate('/Timesheet')} />
 
          {/* Salary Dropdown */}
          <SidebarDropdown
            icon={<FaFileInvoiceDollar />}
            label="Salary"
            isOpen={salaryOpen}
            onToggle={() => setSalaryOpen(!salaryOpen)}
            items={[
              { label: 'Payslips', path: '/salary/payslips' },
              { label: 'IT Statement', path: '/salary/it-statement' },
            ]}
            handleNavigate={handleNavigate}
          />
 
          {/* Leave Dropdown */}
          <SidebarDropdown
            icon={<FaUmbrellaBeach />}
            label="Leave"
            isOpen={leaveOpen}
            onToggle={() => setLeaveOpen(!leaveOpen)}
            items={[
              { label: 'Leave Apply', path: '/leave/apply' },
              { label: 'Leave Balances', path: '/leave/balances' },
              { label: 'Holiday Calendar', path: '/holiday-calendar' },
            ]}
            handleNavigate={handleNavigate}
          />
 
          <SidebarItem icon={<FaFolderOpen />} label="Document Center" onClick={() => handleNavigate('/document-center')} />
          <SidebarItem icon={<FaSitemap />} label="People" onClick={() => handleNavigate('/org')} />
          <SidebarItem icon={<FaFileInvoiceDollar />} label="Reimbursement" onClick={() => handleNavigate('/reimbursement')} />
        </ul>
      </div>
 
      <div className="text-center p-4 text-gray-500 text-sm border-t">
        © {new Date().getFullYear()} Artihcus Global
      </div>
    </aside>
  );
};
 
// Subcomponents
const SidebarItem = ({ icon, label, onClick }) => (
  <li
    onClick={onClick}
    className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
  >
    {icon}
    <span>{label}</span>
  </li>
);
 
const SidebarDropdown = ({ icon, label, isOpen, onToggle, items, handleNavigate }) => (
  <li className="text-gray-700">
    <div
      onClick={onToggle}
      className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
    </div>
    {isOpen && (
      <ul className="pl-10 mt-1 space-y-1">
        {items.map((item, idx) => (
          <li
            key={idx}
            onClick={() => handleNavigate(item.path)}
            className="p-1 hover:bg-gray-100 rounded cursor-pointer transition"
          >
            {item.label}
          </li>
        ))}
      </ul>
    )}
  </li>
);
 
export default Sidebar;