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
        setIsAuthenticated(true);
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        const role = docSnap.exists() ? docSnap.data().role?.toLowerCase() : null;
        setUserRole(role);
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      setCheckingAuth(false);
    });
 
    return () => unsubscribe();
  }, [allowedRoles]);
 
  if (checkingAuth) return <div>Loading...</div>;
 
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles.length && !allowedRoles.includes(userRole)) return <Navigate to="/admin/dashboard" replace />;
 
  return children;
};
 
export default ProtectedRoute;
 
 