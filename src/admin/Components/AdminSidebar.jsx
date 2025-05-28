import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaUsers, FaFileAlt, FaTachometerAlt } from 'react-icons/fa';
 
const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-white border-r shadow h-full">
      <div className="p-4 text-xl font-bold">Admin Panel</div>
      <nav className="space-y-2 px-4">
        <NavLink to="/admin/dashboard" className="block p-2 rounded hover:bg-gray-100">
          <FaTachometerAlt className="inline-block mr-2" /> Dashboard
        </NavLink>
        <NavLink to="/admin/A-employees" className="block p-2 rounded hover:bg-gray-100">
          <FaUsers className="inline-block mr-2" /> Employees
        </NavLink>
        <NavLink to="/admin/A-attendence" className="block p-2 rounded hover:bg-gray-100">
          <FaFileAlt className="inline-block mr-2" /> Attendnce
        </NavLink>
        <NavLink to="/admin/A-documents" className="block p-2 rounded hover:bg-gray-100">
          <FaFileAlt className="inline-block mr-2" /> Documents
        </NavLink>
      </nav>
    </aside>
  );
};
 
export default AdminSidebar;