import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import TlDashboard from './dashboard/TlDashboard';
import HrDashboard from './dashboard/HrDashboard';
import ManagerDashboard from './dashboard/ManagerDashboard';
import EmployeeDashboard from './dashboard/EmployeeDashboard';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        navigate('/');
        return;
      }

      try {
        // First try to get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          // If not in Firestore, check static credentials
          const staticUser = JSON.parse(localStorage.getItem('userData'));
          if (staticUser) {
            setUserData(staticUser);
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate('/');
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, [navigate, auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Render the appropriate dashboard based on user role
  switch (userData?.role) {
    case 'tl':
      return <TlDashboard />;
    case 'hr':
      return <HrDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this dashboard.</p>
          </div>
        </div>
      );
  }
};

export default Dashboard; 