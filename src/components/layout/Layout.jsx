import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import Sidebar from '../sidebar/Sidebar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
 
function Layout({ children }) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userRole, setUserRole] = useState(null);
 
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
      setAuthChecked(true);
    });
 
    return () => unsubscribe();
  }, []);
 
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
 
  // Define routes where the sidebar should be hidden
  const noSidebarRoutes = ['/login', '/signup', '/forgot-password'];
  const isSidebarVisible = isAuthenticated && !noSidebarRoutes.includes(location.pathname) && userRole !== 'client';
 
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && userRole !== 'client' && <Header />}
      <div className="flex">
        {isSidebarVisible && <Sidebar role={userRole} />}
        <main className={`flex-1 ${isSidebarVisible ? 'ml-64' : ''}`}>
          {children}
        </main>
      </div>
      {isAuthenticated && userRole !== 'client' && <Footer />}
    </div>
  );
}
 
export default Layout;
 
 