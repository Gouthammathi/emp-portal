import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
 
const AdminProtectedRoute = ({ children }) => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
 
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAuthorized(true);
        }
      }
      setCheckingAuth(false);
    });
 
    return () => unsubscribe();
  }, []);
 
  if (checkingAuth) return <div>Loading...</div>;
 
  return isAuthorized ? children : <Navigate to="/" replace />;
};
 
export default AdminProtectedRoute;
 
 