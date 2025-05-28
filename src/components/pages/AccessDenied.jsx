import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
 
const AccessDenied = () => {
  const navigate = useNavigate();
 
  const handleReturnToLogin = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still try to navigate even if sign out fails
      navigate('/');
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          Sorry, you don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={handleReturnToLogin}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};
 
export default AccessDenied;
 