import React, { useEffect, useState } from 'react';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import Sidebar from '../sidebar/Sidebar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
 
function Layout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
 
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
 
    return () => unsubscribe();
  }, []);
 
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        {/* Show Sidebar only if user is authenticated */}
        {isAuthenticated && <Sidebar />}
 
        {/* Main content */}
        <main className={`flex-1 p-4 bg-gray-50 ${isAuthenticated ? '' : 'w-full'}`}>
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
 
export default Layout;