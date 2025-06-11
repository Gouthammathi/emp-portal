import React, { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db, auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
 
const HrReimbursement = () => {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedReimbursement, setSelectedReimbursement] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
 
  useEffect(() => {
    fetchReimbursements();
  }, []);
 
  const fetchReimbursements = async () => {
    try {
      const reimbursementsQuery = query(
        collection(db, 'reimbursements'),
        where('status', '==', 'manager_approved'),
        where('hrStatus', '==', 'pending')
      );
     
      const reimbursementsSnapshot = await getDocs(reimbursementsQuery);
      const reimbursementsData = reimbursementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
     
      setReimbursements(reimbursementsData);
    } catch (error) {
      console.error('Error fetching reimbursements:', error);
      setError('Failed to load reimbursements');
    } finally {
      setLoading(false);
    }
  };
 
  const handleApprove = async (reimbursementId) => {
    try {
      const reimbursementRef = doc(db, 'reimbursements', reimbursementId);
      await updateDoc(reimbursementRef, {
        status: 'approved',
        hrStatus: 'approved',
        hrApprovedAt: serverTimestamp(),
        hrApprovedBy: auth.currentUser.uid
      });
 
      // Create notification for employee
      const reimbursement = reimbursements.find(r => r.id === reimbursementId);
      if (reimbursement) {
        await addDoc(collection(db, 'notifications'), {
          type: 'reimbursement',
          status: 'approved',
          reimbursementId: reimbursementId,
          employeeId: reimbursement.userId,
          amount: reimbursement.totalAmount,
          createdAt: serverTimestamp(),
          read: false,
          message: `Your reimbursement request for ₹${reimbursement.totalAmount} has been approved by HR`
        });
      }
 
      setSuccess('Reimbursement approved successfully');
      fetchReimbursements();
    } catch (error) {
      console.error('Error approving reimbursement:', error);
      setError('Failed to approve reimbursement');
    }
  };
 
  const handleReject = async (reimbursementId) => {
    try {
      const reimbursementRef = doc(db, 'reimbursements', reimbursementId);
      await updateDoc(reimbursementRef, {
        status: 'rejected',
        hrStatus: 'rejected',
        hrRejectedAt: serverTimestamp(),
        hrRejectedBy: auth.currentUser.uid
      });
 
      // Create notification for employee
      const reimbursement = reimbursements.find(r => r.id === reimbursementId);
      if (reimbursement) {
        await addDoc(collection(db, 'notifications'), {
          type: 'reimbursement',
          status: 'rejected',
          reimbursementId: reimbursementId,
          employeeId: reimbursement.userId,
          amount: reimbursement.totalAmount,
          createdAt: serverTimestamp(),
          read: false,
          message: `Your reimbursement request for ₹${reimbursement.totalAmount} has been rejected by HR`
        });
      }
 
      setSuccess('Reimbursement rejected successfully');
      fetchReimbursements();
    } catch (error) {
      console.error('Error rejecting reimbursement:', error);
      setError('Failed to reject reimbursement');
    }
  };
 
  const PreviewView = () => {
    if (!selectedReimbursement) return null;
 
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px) saturate(180%)',
        WebkitBackdropFilter: 'blur(8px) saturate(180%)',
      }}>
        <div className="bg-white bg-opacity-80 rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto z-50 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Reimbursement Details</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Employee Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium">{selectedReimbursement.empId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee Name</p>
                  <p className="font-medium">{selectedReimbursement.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">{selectedReimbursement.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Request Date</p>
                  <p className="font-medium">{selectedReimbursement.requestDate}</p>
                </div>
              </div>
            </div>
 
            {/* Expense Entries */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Expense Entries</h3>
                <span className="text-lg font-bold text-blue-700">Total: ₹{selectedReimbursement.totalAmount.toLocaleString()}</span>
              </div>
              <div className="space-y-4">
                {selectedReimbursement.entries.map((entry, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{entry.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">{entry.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="font-medium">{entry.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-medium">₹{entry.amount}</p>
                      </div>
                      {entry.receipt && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Receipt</p>
                          {entry.receipt.type.startsWith('image/') ? (
                            <img
                              src={entry.receipt.data}
                              alt={entry.receipt.name}
                              className="max-w-xs mt-2 rounded"
                            />
                          ) : (
                            <a
                              href={entry.receipt.data}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {entry.receipt.name}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
 
            {/* Justification */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Justification</h3>
              <p className="whitespace-pre-wrap">{selectedReimbursement.justification}</p>
            </div>
 
            {/* Approval Actions */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => handleReject(selectedReimbursement.id)}
                className="flex items-center px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <FaTimes className="mr-2" /> Reject
              </button>
              <button
                onClick={() => handleApprove(selectedReimbursement.id)}
                className="flex items-center px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <FaCheck className="mr-2" /> Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-8 lg:px-12">
      {showPreview && <PreviewView />}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HR Reimbursement Approvals</h1>
          <p className="mt-2 text-sm text-gray-600">Review and approve manager-approved reimbursement requests</p>
        </div>
 
        {error && <div className="text-red-600 text-sm font-medium mb-4">{error}</div>}
        {success && <div className="text-green-600 text-sm font-medium mb-4">{success}</div>}
 
        <div className="bg-white p-8 rounded-lg shadow-lg">
          {reimbursements.length > 0 ? (
            <div className="space-y-6">
              {reimbursements.map((reimbursement) => (
                <div key={reimbursement.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Request #{reimbursement.id}</h3>
                      <p className="text-sm text-gray-600">Employee: {reimbursement.name}</p>
                      <p className="text-sm text-gray-600">Department: {reimbursement.department}</p>
                      <p className="text-sm text-gray-600">
                        Submitted: {reimbursement.submittedAt?.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      Pending HR Approval
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium">₹{reimbursement.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-medium">{reimbursement.entries[0]?.category}</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setSelectedReimbursement(reimbursement);
                        setShowPreview(true);
                      }}
                      className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <FaEye className="mr-2" /> View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No pending reimbursement requests</p>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default HrReimbursement;
 