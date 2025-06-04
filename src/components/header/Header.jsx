import React, { useEffect, useState, useRef } from 'react';
import art from '../images/artihlogo.png';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { getAuth, signOut } from 'firebase/auth';
 
function Header() {
  const [userInfo, setUserInfo] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const auth = getAuth();
 
  useEffect(() => {
    // Get user info from localStorage
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
 
    // Handle click outside dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
 
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
 
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear all localStorage items
      localStorage.removeItem('userInfo');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
 
  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm flex justify-between items-center h-16 px-4">
      <div>
        <Link to="/dashboard">
          <img src={art} alt="logo" className="h-12 cursor-pointer" />
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        
        {userInfo && (
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
            >
              <FaUser className="text-indigo-600" />
              <span className="text-gray-700">
                {userInfo.name} ({userInfo.empId || userInfo.clientId})
              </span>
            </div>
           
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-red-600 hover:bg-gray-100 rounded-b-lg flex items-center space-x-2"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
 
export default Header;
 