// src/ProtectedRoute/PublicRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
 
const PublicRoute = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        const role = docSnap.exists() ? docSnap.data().role?.toLowerCase() : null;
        if (role === 'admin') setRedirectPath('/admin/dashboard');
        else setRedirectPath('/dashboard');
      }
      setCheckingAuth(false);
    });
 
    return () => unsubscribe();
  }, []);
 
  if (checkingAuth) return <div>Loading...</div>;
  if (redirectPath) return <Navigate to={redirectPath} replace />;
 
  return children;
};
 
export default PublicRoute;
 
 