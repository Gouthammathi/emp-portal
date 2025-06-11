// src/ProtectedRoute/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
 
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        console.log('ProtectedRoute: User authenticated, UID:', user.uid);
        setIsAuthenticated(true);
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('ProtectedRoute: User document data:', userData);
          const role = userData.role?.toLowerCase();
          console.log('ProtectedRoute: Fetched user role:', role);
          setUserRole(role);
        } else {
          console.log('ProtectedRoute: User document not found for UID:', user.uid);
          setUserRole(null); // User exists in Auth but not in Firestore
        }
      } else {
        console.log('ProtectedRoute: User not authenticated.');
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setCheckingAuth(false);
    });
 
    return () => unsubscribe();
  }, []);
 
  console.log('ProtectedRoute: Rendering for allowed roles:', allowedRoles, 'Current user role:', userRole);
 
  if (checkingAuth) return <div>Loading...</div>;
 
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login.');
    return <Navigate to="/login" replace />;
  }
 
  // If no specific roles are required, allow access
  if (allowedRoles.length === 0) {
    console.log('ProtectedRoute: No specific roles required, allowing access.');
    return children;
  }
 
  // Check if user's role is in the allowed roles
  if (!allowedRoles.includes(userRole)) {
    console.log('ProtectedRoute: Role', userRole, 'not in allowed roles', allowedRoles, 'redirecting to access denied.');
    // Redirect to appropriate dashboard based on role if they are admin
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      // For any other role not explicitly allowed, redirect to access denied
      return <Navigate to="/access-denied" replace />;
    }
  }
 
  console.log('ProtectedRoute: Authenticated and role', userRole, 'is allowed, rendering children.');
  // If authenticated and role is allowed, render children
  return children;
};
 
export default ProtectedRoute;
 
 
 