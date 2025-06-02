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
  const isSidebarVisible = isAuthenticated && !noSidebarRoutes.includes(location.pathname);
 
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header (fixed height assumed 64px) */}
      <Header />
 
      {/* Main content wrapper (sidebar + page content) */}
      <div className="flex flex-1 h-[calc(100vh-64px)] relative">
        {/* Fixed Sidebar */}
        {isSidebarVisible && (
          <div className="w-64 fixed top-16 left-0 h-[calc(100vh-64px)] bg-white border-r z-10">
            <Sidebar role={userRole} />
          </div>
        )}
 
        {/* Scrollable content with left margin if sidebar is present */}
        <main
          className={`flex-1 p-4 overflow-y-auto bg-gray-50 ${
            isSidebarVisible ? 'ml-64' : ''
          }`}
          style={{ height: 'calc(100vh - 64px)' }}
        >
          {children}
        </main>
      </div>
 
      {/* Footer */}
      <Footer />
    </div>
  );
}
 
export default Layout;
 