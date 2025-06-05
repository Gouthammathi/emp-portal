import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

const shiftOptions = ['Morning', 'Evening', 'Night'];
const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
 
const calculateTimeDiff = (start, end) => {
  if (!start || !end) return 0;
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const diff = (endH * 60 + endM) - (startH * 60 + startM);
  return Math.max(diff, 0) / 60; // hours
};
 
const Timesheet = () => {
  const [employeeInfo, setEmployeeInfo] = useState({
    month: '',
    empId: '',
    name: '',
    manager: '',
    superManager: '',
  });
 
  const [timesheet, setTimesheet] = useState([]);
 
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
 
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
 
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('User Data:', data);
 
          let managerName = '';
 
          if (data.empId) {
            // If user is a manager, fetch their super manager
            if (data.role === 'manager' && data.superManagerId) {
              console.log('Manager found, superManagerId:', data.superManagerId);
              
              // Find the super manager's user document by empId
              const usersRef = collection(db, 'users');
              const q = query(usersRef, where('empId', '==', data.superManagerId));
              const querySnapshot = await getDocs(q);
              
              if (!querySnapshot.empty) {
                const superManagerDoc = querySnapshot.docs[0];
                console.log('Super Manager Doc:', superManagerDoc.data());
                const superManagerData = superManagerDoc.data();
                managerName = `${superManagerData.firstName} ${superManagerData.lastName}`.trim();
                console.log('Super Manager Name:', managerName);
              }
            } else if (data.role === 'super_manager' && data.cid) {
              // If user is a super manager, fetch their CID
              console.log('Super Manager found, CID:', data.cid);
              
              // Find the CID's user document by empId
              const usersRef = collection(db, 'users');
              const q = query(usersRef, where('empId', '==', data.cid));
              const querySnapshot = await getDocs(q);
              
              if (!querySnapshot.empty) {
                const cidDoc = querySnapshot.docs[0];
                console.log('CID Doc:', cidDoc.data());
                const cidData = cidDoc.data();
                managerName = `${cidData.firstName} ${cidData.lastName}`.trim();
                console.log('CID Name:', managerName);
              }
            } else {
              // For employees, find their manager from users collection
              const usersRef = collection(db, 'users');
              const q = query(usersRef, where('empId', '==', data.managerId));
              const querySnapshot = await getDocs(q);
              
              if (!querySnapshot.empty) {
                const managerDoc = querySnapshot.docs[0];
                const managerData = managerDoc.data();
                managerName = `${managerData.firstName} ${managerData.lastName}`.trim();
              }
            }
          }
 
          const currentMonth = new Date().toLocaleString('default', { month: 'long' });
 
          setEmployeeInfo({
            month: currentMonth,
            empId: data.empId ?? '',
            name: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
            manager: managerName
          });
        }
      }
    };
 
    fetchUserData();
  }, []);
 
  const handleTimesheetChange = (index, field, value) => {
    const updatedSheet = [...timesheet];
    updatedSheet[index][field] = value;
 
    const fh = calculateTimeDiff(updatedSheet[index].inTime1, updatedSheet[index].outTime1);
    const ah = calculateTimeDiff(updatedSheet[index].inTime2, updatedSheet[index].outTime2);
    const total = fh + ah;
    const overtime = Math.max(0, total - 8);
 
    updatedSheet[index].hoursCompleted = fh.toFixed(2);
    updatedSheet[index].overtime = overtime.toFixed(2);
    updatedSheet[index].totalHours = total.toFixed(2);
 
    setTimesheet(updatedSheet);
  };
 
  const addRow = () => {
    const today = new Date();
    const date = today.toISOString().split('T')[0];
    const day = dayOptions[today.getDay() - 1] || 'Monday';
 
    setTimesheet([
      ...timesheet,
      {
        date,
        day,
        shift: '',
        inTime1: '',
        outTime1: '',
        inTime2: '',
        outTime2: '',
        hoursCompleted: '',
        overtime: '',
        totalHours: '',
      },
    ]);
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    try {
      if (!employeeInfo.empId || !employeeInfo.month) {
        alert('Employee ID and Month are required');
        return;
      }
 
      // Get current user's data from Firestore
      const auth = getAuth();
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
 
      // Determine the approver based on user's role
      let approverId = '';
      let status = 'pending';
 
      if (userData.role === 'employee') {
        // If employee submits, send to their manager
        approverId = userData.managerId;
        status = 'pending_manager';
      } else if (userData.role === 'manager') {
        // If manager submits, send to super manager
        approverId = userData.superManagerId;
        status = 'pending_super_manager';
      } else if (userData.role === 'super_manager') {
        // If super manager submits, send to CID
        approverId = userData.cid;
        status = 'pending_cid';
      }
 
      const timesheetData = {
        ...employeeInfo,
        entries: timesheet,
        submittedAt: new Date(),
        status: status,
        type: 'timesheet',
        submittedBy: user.uid,
        approverId: approverId,
        currentRole: userData.role
      };
 
      await addDoc(collection(db, 'timesheets'), timesheetData);
      alert('Timesheet submitted successfully!');
      setTimesheet([]);
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      alert('Error submitting timesheet. Please try again.');
    }
  };
 
  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-orange-500 mb-6">📅 Timesheet Submission</h1>
        <form onSubmit={handleSubmit}>
          {/* Employee Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(employeeInfo).map(([key, val]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1 capitalize">{key}</label>
                <input
                  type="text"
                  name={key}
                  value={val}
                  disabled
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>
            ))}
          </div>
 
          {/* Timesheet Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-orange-100">
                <tr>
                  <th className="border px-3 py-2">Date</th>
                  <th className="border px-3 py-2">Day</th>
                  <th className="border px-3 py-2">Shift</th>
                  <th className="border px-3 py-2" colSpan={2}>Forenoon</th>
                  <th className="border px-3 py-2" colSpan={2}>Afternoon</th>
                  <th className="border px-3 py-2">Hours Completed</th>
                  <th className="border px-3 py-2">Overtime</th>
                  <th className="border px-3 py-2">Total Daily Hours</th>
                </tr>
                <tr className="bg-orange-50">
                  <td colSpan={3}></td>
                  <th className="border px-3 py-1">In</th>
                  <th className="border px-3 py-1">Out</th>
                  <th className="border px-3 py-1">In</th>
                  <th className="border px-3 py-1">Out</th>
                  <td colSpan={3}></td>
                </tr>
              </thead>
              <tbody>
                {timesheet.map((row, index) => (
                  <tr key={index}>
                    <td className="border px-2 py-1">{row.date}</td>
                    <td className="border px-2 py-1">
                      <select value={row.day} onChange={(e) => handleTimesheetChange(index, 'day', e.target.value)} className="w-full">
                        {dayOptions.map(day => <option key={day}>{day}</option>)}
                      </select>
                    </td>
                    <td className="border px-2 py-1">
                      <select value={row.shift} onChange={(e) => handleTimesheetChange(index, 'shift', e.target.value)} className="w-full">
                        <option value="">Select</option>
                        {shiftOptions.map(shift => <option key={shift}>{shift}</option>)}
                      </select>
                    </td>
                    {['inTime1', 'outTime1', 'inTime2', 'outTime2'].map(field => (
                      <td className="border px-2 py-1" key={field}>
                        <input
                          type="time"
                          value={row[field]}
                          onChange={(e) => handleTimesheetChange(index, field, e.target.value)}
                          className="w-full"
                        />
                      </td>
                    ))}
                    <td className="border px-2 py-1">{row.hoursCompleted}</td>
                    <td className="border px-2 py-1">{row.overtime}</td>
                    <td className="border px-2 py-1">{row.totalHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
          {/* Add Row & Submit */}
          <div className="mt-6 flex justify-between">
            <button type="button" onClick={addRow} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              ➕ Add Row
            </button>
            <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600">
              Submit Timesheet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export default Timesheet;
 