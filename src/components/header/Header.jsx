import React from 'react';
import art from '../images/artihlogo.png';
import {Link} from 'react-router-dom';
function Header() {
  return (
    <div className="flex justify-between items-center h-18 px-4 ">
      <div>
        <Link to ='/dashboard'>
        <img src={art} alt="logo" className="h-12" />
       </Link></div>
     
      <div>
        <h1 className="text-lg font-semibold">Employee Portal</h1>
      </div>
    </div>
  );
}

export default Header;
