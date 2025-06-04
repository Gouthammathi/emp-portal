import React from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
 
const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 py-4 pr-4 pl-2 bg-gray-100">{children}</main>
      </div>
    </div>
  );
};
 
export default AdminLayout;