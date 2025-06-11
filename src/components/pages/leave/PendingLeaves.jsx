import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getPendingLeaveRequests, updateLeaveRequestStatus } from '../../Services/leaveService';
import { FaCheck, FaTimes, FaDownload } from 'react-icons/fa';

const PendingLeaves = () => {
  const auth = getAuth();
  const [userData, setUserData] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [approverComment, setApproverComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Please login to continue');
          setLoading(false);
          return;
        }

        // Get pending leave requests for the current user
        const leaves = await getPendingLeaveRequests(user.uid);
        setPendingLeaves(leaves);
      } catch (err) {
        setError('Failed to fetch pending leaves');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (leaveId) => {
    try {
      await updateLeaveRequestStatus(leaveId, 'approved', approverComment);
      setPendingLeaves(prev => prev.filter(leave => leave.id !== leaveId));
      setSelectedLeave(null);
      setApproverComment('');
    } catch (err) {
      setError('Failed to approve leave request');
      console.error(err);
    }
  };

  const handleReject = async (leaveId) => {
    try {
      await updateLeaveRequestStatus(leaveId, 'rejected', approverComment);
      setPendingLeaves(prev => prev.filter(leave => leave.id !== leaveId));
      setSelectedLeave(null);
      setApproverComment('');
    } catch (err) {
      setError('Failed to reject leave request');
      console.error(err);
    }
  };

  const downloadAttachment = (attachment) => {
    if (attachment) {
      const link = document.createElement('a');
      link.href = attachment;
      link.download = 'leave_attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded p-6">
        {/* Tabs as NavLinks */}
        <div className="flex border-b mb-6">
          <NavLink
            to="/leave/apply"
            className={({ isActive }) =>
              `px-6 py-2 font-medium ${
                isActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
              }`
            }
          >
            Apply
          </NavLink>
          <NavLink
            to="/leave/pending"
            className={({ isActive }) =>
              `px-6 py-2 font-medium ${
                isActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
              }`
            }
          >
            Pending
          </NavLink>
          <NavLink
            to="/leave/history"
            className={({ isActive }) =>
              `px-6 py-2 font-medium ${
                isActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
              }`
            }
          >
            History
          </NavLink>
        </div>

        {/* Pending Leaves List */}
        <div className="space-y-4">
          {pendingLeaves.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No pending leave requests</div>
          ) : (
            pendingLeaves.map(leave => (
              <div
                key={leave.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{leave.employeeName}</h3>
                    <p className="text-gray-600 text-sm">
                      {leave.leaveType} Leave
                    </p>
                    <p className="text-gray-600 text-sm">
                      From: {leave.fromDate} ({leave.fromSession})
                    </p>
                    <p className="text-gray-600 text-sm">
                      To: {leave.toDate} ({leave.toSession})
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      Reason: {leave.reason}
                    </p>
                    {leave.contactDetails && (
                      <p className="text-gray-600 text-sm">
                        Contact: {leave.contactDetails}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {leave.attachment && (
                      <button
                        onClick={() => downloadAttachment(leave.attachment)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Download Attachment"
                      >
                        <FaDownload />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedLeave(leave)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h2 className="text-xl font-medium mb-4">Review Leave Request</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment
                  </label>
                  <textarea
                    value={approverComment}
                    onChange={(e) => setApproverComment(e.target.value)}
                    className="w-full border-gray-300 rounded px-3 py-2"
                    rows="3"
                    placeholder="Enter your comment (optional)"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setSelectedLeave(null);
                      setApproverComment('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedLeave.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedLeave.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                  >
                    <FaCheck className="mr-2" />
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingLeaves; 