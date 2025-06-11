import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { createLeaveRequest, getUserSuperior } from '../../Services/leaveService';
import { FaUpload, FaTimes } from 'react-icons/fa';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';

const LeaveApply = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [userData, setUserData] = useState(null);
  const [approver, setApprover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: '',
    fromSession: 'Session 1',
    toDate: '',
    toSession: 'Session 1',
    contactDetails: '',
    reason: '',
    attachment: null
  });
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Please login to continue');
          setLoading(false);
          return;
        }

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = {
            id: userDoc.id,
            ...userDoc.data()
          };
          setUserData(userData);
          
          // Get approver data
          const approverData = await getUserSuperior(userData.id);
          if (approverData) {
            setApprover(approverData);
          } else {
            setError('No approver found for your role');
          }
        }
      } catch (err) {
        setError('Failed to fetch user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        attachment: file
      }));
      setAttachmentPreview(URL.createObjectURL(file));
    }
  };

  const removeAttachment = () => {
    setFormData(prev => ({
      ...prev,
      attachment: null
    }));
    setAttachmentPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!userData) {
        throw new Error('User data not found');
      }

      // Convert file to base64
      let attachmentBase64 = null;
      if (formData.attachment) {
        const reader = new FileReader();
        attachmentBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(formData.attachment);
        });
      }

      const leaveData = {
        employeeId: userData.id,
        employeeName: `${userData.firstName} ${userData.lastName}`,
        approverId: approver?.id,
        approverName: approver ? `${approver.firstName} ${approver.lastName}` : 'Not Assigned',
        ...formData,
        attachment: attachmentBase64
      };

      await createLeaveRequest(leaveData);
      navigate('/leave/pending');
    } catch (err) {
      setError('Failed to submit leave request');
      console.error(err);
    } finally {
      setLoading(false);
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

        {/* Info Alert */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded mb-6 text-sm flex justify-between">
          <span>
            Leave is earned by an employee and granted by the employer to take time off work. The employee is free to avail this leave in accordance with the company policy.
          </span>
          <button className="text-blue-600 font-medium">Hide</button>
        </div>

        {/* Apply Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type */}
          <div className="border border-gray-200 p-4 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave type <span className="text-red-500">*</span>
            </label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleInputChange}
              required
              className="w-full border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="">Select type</option>
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="earned">Earned Leave</option>
            </select>
          </div>

          {/* From & To Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleInputChange}
                required
                className="w-full border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="border border-gray-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
              <select
                name="fromSession"
                value={formData.fromSession}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded px-3 py-2"
              >
                <option value="Session 1">Session 1</option>
                <option value="Session 2">Session 2</option>
              </select>
            </div>

            <div className="border border-gray-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleInputChange}
                required
                className="w-full border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="border border-gray-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
              <select
                name="toSession"
                value={formData.toSession}
                onChange={handleInputChange}
                className="w-full border-gray-300 rounded px-3 py-2"
              >
                <option value="Session 1">Session 1</option>
                <option value="Session 2">Session 2</option>
              </select>
            </div>
          </div>

          {/* Leave Balance */}
          <div className="text-right text-sm text-gray-600 border border-gray-200 p-4 rounded">
            <div>Leave Balance: 10 days</div>
            <div>Applying For: 2 days</div>
          </div>

          {/* Approver & CC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Applying to</label>
              <div className="flex items-center border border-gray-300 rounded px-3 py-2">
                <span className="material-icons text-gray-500 mr-2">person</span>
                <span className="flex-1">
                  {approver ? `${approver.firstName} ${approver.lastName}` : 'Not Assigned'}
                </span>
              </div>
            </div>
            <div className="border border-gray-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">CC to</label>
              <button type="button" className="flex items-center text-blue-600 border border-dashed border-blue-400 px-3 py-2 rounded">
                <span className="material-icons mr-2">add</span> Add
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="border border-gray-200 p-4 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact details</label>
            <input
              type="text"
              name="contactDetails"
              value={formData.contactDetails}
              onChange={handleInputChange}
              placeholder="Enter contact number or email"
              className="w-full border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Reason */}
          <div className="border border-gray-200 p-4 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Enter reason for leave"
              className="w-full border-gray-300 rounded px-3 py-2"
              rows="3"
            ></textarea>
          </div>

          {/* Attach Document */}
          <div className="border border-gray-200 p-4 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-1">Attach Document</label>
            <div className="space-y-2">
              <label className="flex items-center text-blue-600 cursor-pointer">
                <FaUpload className="mr-2" />
                <span>Upload file</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {attachmentPreview && (
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600 truncate">
                    {formData.attachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveApply;
 
