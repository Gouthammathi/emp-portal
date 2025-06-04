import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
 
const AccessDenied = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role?.toLowerCase());
          }
        } catch (error) {
          console.error('Error fetching user role in AccessDenied:', error);
        }
      }
      setLoading(false);
    });
 
    return () => unsubscribe();
  }, []);
 
  const handleReturnToLogin = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/login'); // Navigate to login page
    } catch (error) {
      console.error('Error signing out:', error);
      // Still try to navigate even if sign out fails
      navigate('/login'); // Navigate to login page
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard'); // Navigate client to their dashboard
  };
 
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        
        {user && userRole === 'client' ? (
          // Content for clients
          <>
            <p className="text-gray-600 mb-6">
              You have successfully logged in but do not have permission to access this specific page. Please navigate to your client dashboard.
            </p>
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        ) : (
          // Generic content for others
          <>
        <p className="text-gray-600 mb-6">
          Sorry, you don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={handleReturnToLogin}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Return to Login
        </button>
          </>
        )}
      </div>
    </div>
  );
};
 
export default AccessDenied;
 