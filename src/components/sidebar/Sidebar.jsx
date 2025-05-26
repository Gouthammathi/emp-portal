import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBook, FaClipboardList, FaClock, FaCalendarAlt,
  FaSitemap, FaFileInvoiceDollar
} from 'react-icons/fa';
 
const Sidebar = () => {
  const navigate = useNavigate();
 
  const items = [
    { label: 'Mock Tests', icon: <FaBook />, path: '/module-selection' },
    { label: 'Daily Status', icon: <FaClipboardList />, path: '/daily-s' },
    { label: 'Time Sheet', icon: <FaClock />, path: '/Timesheet' },
    { label: 'Holiday Calendar', icon: <FaCalendarAlt />, path: '/holiday-calendar' },
    { label: 'Org Chart', icon: <FaSitemap />, path: '/org' },
    { label: 'Reimbursement', icon: <FaFileInvoiceDollar />, path: '/reimbursement' },
  ];
 
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full shadow-md">
      <div className="p-4 font-bold text-xl text-gray-800">Dashboard</div>
      <ul className="space-y-2 px-4">
        {items.map((item, idx) => (
          <li
            key={idx}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
          >
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};
 
export default Sidebar;
 