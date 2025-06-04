import React from 'react';
import art from '../images/artihlogo.png';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

function Header({ userData, onLogout }) {
  return (
    <div className="sticky top-0 z-50 bg-white shadow-md flex justify-between items-center h-16 px-4">
      <div>
        <Link to="/dashboard">
          <img src={art} alt="logo" className="h-12 cursor-pointer" />
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {userData ? (
          <div className="flex items-center space-x-2">
            <FaUserCircle className="text-xl text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{userData.firstName} {userData.lastName}</span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Loading user...</span>
        )}
      </div>
    </div>
  );
}

export default Header;
 
 