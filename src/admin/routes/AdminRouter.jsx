// src/admin/routes/AdminRouter.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from '../Components/AdminLayout';
import AdminDashboard from '../pages/Dashboard';
import Employees from '../pages/Employees';
import Attendence from '../pages/Attendence';
import Documents from '../pages/AdminDocuments';

const AdminRouter = () => (
  <Routes>
    <Route path="/" element={<AdminLayoutWrapper />}>
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="A-employees" element={<Employees />} />
      <Route path="A-attendence" element={<Attendence />} />
      <Route path="A-documents" element={<Documents />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Route>
  </Routes>
);

const AdminLayoutWrapper = () => (
  <AdminLayout>
    <Outlet />
  </AdminLayout>
);

export default AdminRouter;
 
 