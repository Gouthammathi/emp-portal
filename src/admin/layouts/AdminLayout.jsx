import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../Components/AdminHeader';
import AdminSidebar from '../Components/AdminSidebar';
import AdminFooter from '../Components/AdminFooter';

const AdminLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
          <AdminFooter />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 