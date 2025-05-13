import React from 'react';
import { FaDesktop } from 'react-icons/fa';

const MobileNotSupported = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <FaDesktop className="text-6xl text-[#ff6600] mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Desktop View Required</h2>
        <p className="text-gray-600 mb-6">
          The test interface is optimized for desktop viewing. Please access this test on a desktop or laptop computer for the best experience.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>• Full question navigation</p>
          <p>• Better readability</p>
          <p>• Proper timer display</p>
          <p>• Enhanced user experience</p>
        </div>
      </div>
    </div>
  );
};

export default MobileNotSupported; 