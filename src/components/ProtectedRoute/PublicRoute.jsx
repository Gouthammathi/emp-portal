import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
 
const PublicRoute = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
 
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setCheckingAuth(false);
    });
 
    return () => unsubscribe();
  }, []);
 
  if (checkingAuth) {
    return <div>Loading...</div>; // or a spinner if you have one
  }
 
  // If user is logged in, redirect to dashboard
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};
 
export default PublicRoute;
 
 