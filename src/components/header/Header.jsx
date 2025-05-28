import React from 'react';
import art from '../images/artihlogo.png';
import { Link } from 'react-router-dom';
 
function Header() {
  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm flex justify-between items-center h-16 px-4">
      <div>
        <Link to="/dashboard">
          <img src={art} alt="logo" className="h-12 cursor-pointer" />
        </Link>
      </div>
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Employee Portal</h1>
      </div>
    </div>
  );
}
 
export default Header;
 
 