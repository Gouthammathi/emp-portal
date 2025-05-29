// src/admin/routes/AdminRouter.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from '../Components/AdminLayout';
import AdminDashboard from '../pages/Dashboard';
import Employees from '../pages/Employees';
import Attendence from '../pages/Attendence';
import Documents from '../pages/AdminDocuments';
import EmployeeImport from '../pages/AddEmployee';
import AdminOrgChart from '../pages/AdminOrgChart';
import EditEmployee from '../pages/EditEmployee';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const AdminRouter = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  // Check if user is admin
  const checkAdminAccess = async () => {
    if (!user) return false;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    return userDoc.exists() && userDoc.data().role?.toLowerCase() === 'admin';
  };

  // If not admin, redirect to access denied
  if (!checkAdminAccess()) {
    return <Navigate to="/access-denied" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminLayoutWrapper />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="A-employees" element={<Employees />} />
        <Route path="A-employees/import" element={<EmployeeImport />} />
        <Route path="A-employees/edit/:id" element={<EditEmployee />} />
        <Route path="A-attendence" element={<Attendence />} />
        <Route path="A-documents" element={<Documents />} />
        <Route path="A-org-chart" element={<AdminOrgChart />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

const AdminLayoutWrapper = () => (
  <AdminLayout>
    <Outlet />
  </AdminLayout>
);

export default AdminRouter;
 
 