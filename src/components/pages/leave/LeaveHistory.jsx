
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getEmployeeLeaveRequests } from '../../Services/leaveService';
import { FaDownload, FaCheck, FaTimes } from 'react-icons/fa';

const LeaveHistory = () => {
  const auth = getAuth();
  const [userData, setUserData] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Please login to continue');
          setLoading(false);
          return;
        }

        // Get leave history for the current user
        const leaves = await getEmployeeLeaveRequests(user.uid);
        setLeaveHistory(leaves);
      } catch (err) {
        setError('Failed to fetch leave history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheck className="mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimes className="mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
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

        {/* Leave History List */}
        <div className="space-y-4">
          {leaveHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No leave history found</div>
          ) : (
            leaveHistory.map(leave => (
              <div
                key={leave.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-lg">{leave.leaveType} Leave</h3>
                      {getStatusBadge(leave.status)}
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
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
                    {leave.approverComment && (
                      <p className="text-gray-600 text-sm mt-2">
                        <span className="font-medium">Approver Comment:</span> {leave.approverComment}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mt-2">
                      <span className="font-medium">Approver:</span> {leave.approverName}
                    </p>
                  </div>
                  {leave.attachment && (
                    <button
                      onClick={() => downloadAttachment(leave.attachment)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Download Attachment"
                    >
                      <FaDownload />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory; 


