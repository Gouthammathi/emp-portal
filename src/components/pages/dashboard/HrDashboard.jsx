import React, { useState, useEffect, useRef } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaSitemap, FaUserCircle, FaSignOutAlt, FaMoneyBillWave } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
 
const HrDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [reimbursementStats, setReimbursementStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
 
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
 
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };
 
    fetchUserData();
    fetchReimbursementStats();
  }, []);
 
  const fetchReimbursementStats = async () => {
    try {
      // Fetch pending reimbursements
      const pendingQuery = query(
        collection(db, 'reimbursements'),
        where('status', '==', 'manager_approved'),
        where('hrStatus', '==', 'pending')
      );
      const pendingSnapshot = await getDocs(pendingQuery);
     
      // Fetch approved reimbursements
      const approvedQuery = query(
        collection(db, 'reimbursements'),
        where('status', '==', 'approved'),
        where('hrStatus', '==', 'approved')
      );
      const approvedSnapshot = await getDocs(approvedQuery);
     
      // Fetch rejected reimbursements
      const rejectedQuery = query(
        collection(db, 'reimbursements'),
        where('status', '==', 'rejected'),
        where('hrStatus', '==', 'rejected')
      );
      const rejectedSnapshot = await getDocs(rejectedQuery);
 
      // Calculate total amount for pending reimbursements
      const totalAmount = pendingSnapshot.docs.reduce((sum, doc) => {
        const data = doc.data();
        return sum + (data.totalAmount || 0);
      }, 0);
 
      setReimbursementStats({
        pending: pendingSnapshot.size,
        approved: approvedSnapshot.size,
        rejected: rejectedSnapshot.size,
        totalAmount
      });
    } catch (error) {
      console.error('Error fetching reimbursement stats:', error);
    }
  };
 
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };
 
  if (loading) {
    return <div>Loading...</div>;
  }
 
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-7xl mx-auto relative">
 
        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100  mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {userData?.firstName} {userData?.lastName}</h1>
          <p className="text-gray-600 mt-1">HR Dashboard</p>
        </div>
 
        {/* HR Features Section */}
        {/* <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">HR Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={() => navigate('/org')}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg p-6 text-white transform transition-all duration-300 hover:scale-105 cursor-pointer border border-white/10 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Org Chart</h2>
                <FaSitemap className="w-8 h-8" />
              </div>
              <p className="text-sm opacity-90">View the organization structure</p>
            </div>
          </div>
        </div> */}
 
        {/* HR Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Employee Management Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Employee Management</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Total Employees</span>
                <span className="text-xl font-semibold text-gray-900">150</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">New Hires This Month</span>
                <span className="text-xl font-semibold text-gray-900">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Open Positions</span>
                <span className="text-xl font-semibold text-gray-900">8</span>
              </div>
            </div>
          </div>
 
          {/* Leave Management Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Leave Management</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Pending Requests</span>
                <span className="text-xl font-semibold text-yellow-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Approved This Month</span>
                <span className="text-xl font-semibold text-green-600">25</span>
              </div>
            </div>
          </div>
 
          {/* Reimbursement Card */}
          <div
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => navigate('/hr-reimbursements')}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Reimbursements</h2>
              <FaMoneyBillWave className="text-2xl text-blue-600" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Pending Approvals</span>
                <span className="text-xl font-semibold text-yellow-600">{reimbursementStats.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Approved</span>
                <span className="text-xl font-semibold text-green-600">{reimbursementStats.approved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Rejected</span>
                <span className="text-xl font-semibold text-red-600">{reimbursementStats.rejected}</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Total Pending Amount</span>
                  <span className="text-xl font-semibold text-blue-600">₹{reimbursementStats.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        {/* Quick Actions Card */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow font-medium">
              Process Leave Requests
            </button>
            <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors shadow font-medium">
              Add New Employee
            </button>
            <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow font-medium">
              Generate Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default HrDashboard;
 