import React, { useEffect, useState } from 'react';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import Sidebar from '../sidebar/Sidebar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useLocation } from 'react-router-dom';

function Layout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const location = useLocation();
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthLoading) {
    return null;
  }

  // For login page, render only the content without header, sidebar, and footer
  if (isLoginPage) {
    return (
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sticky Sidebar */}
        {isAuthenticated && (
          <div className="w-64 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16">
            <div className="h-full overflow-y-auto scrollbar-hide">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main content with separate scrolling */}
        <main className={`flex-1 overflow-y-auto h-[calc(100vh-4rem)] ${isAuthenticated ? '' : 'w-full'}`}>
          <div className="p-4 bg-gray-50">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
