import React from 'react';
import { NavLink } from 'react-router-dom';
 
const LeaveApply = () => {
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
        <form className="space-y-6">
          {/* Leave Type */}
          <div className="border border-gray-200 p-4 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave type <span className="text-red-500">*</span>
            </label>
            <select className="w-full border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300">
              <option>Select type</option>
              <option>Casual Leave</option>
              <option>Sick Leave</option>
              <option>Earned Leave</option>
            </select>
          </div>
 
          {/* From & To Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From date <span className="text-red-500">*</span>
              </label>
              <input type="date" className="w-full border-gray-300 rounded px-3 py-2" />
            </div>
            <div className="border border-gray-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
              <select className="w-full border-gray-300 rounded px-3 py-2">
                <option>Session 1</option>
                <option>Session 2</option>
              </select>
            </div>
 
            <div className="border border-gray-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To date <span className="text-red-500">*</span>
              </label>
              <input type="date" className="w-full border-gray-300 rounded px-3 py-2" />
            </div>
            <div className="border border-gray-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
              <select className="w-full border-gray-300 rounded px-3 py-2">
                <option>Session 1</option>
                <option>Session 2</option>
              </select>
            </div>
          </div>
 
          {/* Leave Balance */}
          <div className="text-right text-sm text-gray-600 border border-gray-200 p-4 rounded">
            <div>Leave Balance:</div>
            <div>Applying For:</div>
          </div>
 
          {/* Approver & CC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 p-4 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Applying to</label>
              <div className="flex items-center border border-gray-300 rounded px-3 py-2">
                <span className="material-icons text-gray-500 mr-2">person</span>
                <select className="flex-1 border-none focus:ring-0 outline-none">
                  <option>Manager</option>
                  <option>HR</option>
                </select>
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
            <input type="text" placeholder="Enter contact number or email" className="w-full border-gray-300 rounded px-3 py-2" />
          </div>
 
          {/* Reason */}
          <div className="border border-gray-200 p-4 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea placeholder="Enter reason for leave" className="w-full border-gray-300 rounded px-3 py-2" rows="3"></textarea>
          </div>
 
          {/* Attach Document */}
          <div className="border border-gray-200 p-4 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-1">Attach Document</label>
            <label className="text-blue-600 underline cursor-pointer">
              Upload file
              <input type="file" className="hidden" />
            </label>
          </div>
 
          {/* Submit Button */}
          <div className="text-right">
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Submit Leave Request</button>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export default LeaveApply;
 
 