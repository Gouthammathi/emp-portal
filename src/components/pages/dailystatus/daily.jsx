import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';
import orgChartData from '../../../data/orgchart.json';
 
const DailyStatus = () => {
  const [status, setStatus] = useState({
    date: new Date().toISOString().split('T')[0],
    empId: '',
    employeeName: '',
    manager: '',
    tasks: [
      {
        time: '',
        description: '',
        completed: false,
        remarks: ''
      }
    ]
  });
 
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
     
      console.log("Current user:", user); // Debug log
     
      if (user) {
        // Get the user document directly using the UID as document ID
        const userDoc = await getDoc(doc(db, "users", user.uid));
       
        console.log("User document exists:", userDoc.exists()); // Debug log
       
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("Fetched user data:", data);
         
          // Find manager name from orgchart
          let managerName = '';
          if (data.empId) {
            const employeeInOrgChart = orgChartData.organizationChart.find(
              emp => String(emp.empId) === String(data.empId)
            );
           
            if (employeeInOrgChart && employeeInOrgChart.managerId) {
              const managerInOrgChart = orgChartData.organizationChart.find(
                emp => String(emp.empId) === String(employeeInOrgChart.managerId)
              );
              if (managerInOrgChart) {
                managerName = managerInOrgChart.employeeName;
              }
            }
          }
         
          // Set all initial values from user data
          setStatus(prev => {
            const newStatus = {
              ...prev,
              empId: data.empId ?? '',
              employeeName: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : '',
              manager: managerName
            };
            console.log("Updated status:", newStatus); // Debug log
            return newStatus;
          });
        } else {
          console.log("No user data found in Firestore"); // Debug log
        }
      } else {
        console.log("No authenticated user found"); // Debug log
      }
    };
 
    fetchUserData();
  }, []);
 
  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...status.tasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      [field]: value
    };
    setStatus(prev => ({
      ...prev,
      tasks: updatedTasks
    }));
  };
 
  const addTask = () => {
    setStatus(prev => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          time: '',
          description: '',
          completed: false,
          remarks: ''
        }
      ]
    }));
  };
 
  const removeTask = (index) => {
    setStatus(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    try {
      // Validate required fields
      if (!status.empId) {
        alert('Employee ID is required');
        return;
      }
 
      if (!status.employeeName) {
        alert('Employee Name is required');
        return;
      }
 
      if (!status.date) {
        alert('Date is required');
        return;
      }
 
      // Validate tasks
      const hasEmptyFields = status.tasks.some(task =>
        !task.time || !task.description
      );
 
      if (hasEmptyFields) {
        alert('Please fill in all required fields in the tasks');
        return;
      }
 
      // Save status report to Firestore
      const statusData = {
        ...status,
        submittedAt: new Date(),
        status: 'pending', // pending, approved, rejected
        type: 'statusReport'
      };
 
      console.log("Submitting status report:", statusData);
      const docRef = await addDoc(collection(db, "statusReports"), statusData);
      console.log("Status report saved with ID:", docRef.id);
     
      alert('Status report submitted successfully!');
     
      // Reset form
      setStatus(prev => ({
        ...prev,
        tasks: [{
          time: '',
          description: '',
          completed: false,
          remarks: ''
        }]
      }));
    } catch (error) {
      console.error("Error submitting status report:", error);
      alert('Error submitting status report. Please try again.');
    }
  };
 
  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-orange-500 mb-6">📝 Daily Status Report</h1>
 
        {/* Employee Info */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={status.date}
                className="w-full border rounded px-3 py-2 bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Employee ID</label>
              <input
                type="text"
                name="empId"
                value={status.empId}
                className="w-full border rounded px-3 py-2 bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Employee Name</label>
              <input
                type="text"
                name="employeeName"
                value={status.employeeName}
                className="w-full border rounded px-3 py-2 bg-gray-50"
                readOnly
              />
            </div>
           
            <div>
              <label className="block text-sm font-medium mb-1">Manager</label>
              <input
                type="text"
                name="manager"
                value={status.manager}
                className="w-full border rounded px-3 py-2 bg-gray-50"
                readOnly
              />
            </div>
          </div>
 
          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Time</th>
                  <th className="border px-4 py-2">Description</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Remarks</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {status.tasks.map((task, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border px-4 py-2">
                      <input
                        type="time"
                        value={task.time}
                        onChange={(e) => handleTaskChange(index, 'time', e.target.value)}
                        className="w-full"
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <input
                        type="text"
                        value={task.description}
                        onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                        className="w-full"
                        placeholder="Task description"
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <select
                        value={task.completed}
                        onChange={(e) => handleTaskChange(index, 'completed', e.target.value === 'true')}
                        className="w-full"
                      >
                        <option value="false">Pending</option>
                        <option value="true">Completed</option>
                      </select>
                    </td>
                    <td className="border px-4 py-2">
                      <input
                        type="text"
                        value={task.remarks}
                        onChange={(e) => handleTaskChange(index, 'remarks', e.target.value)}
                        className="w-full"
                        placeholder="Add remarks"
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={status.tasks.length === 1}
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
          {/* Add Task & Submit */}
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={addTask}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              ➕ Add Task
            </button>
 
            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export default DailyStatus;
 