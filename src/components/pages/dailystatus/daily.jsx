import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
 
const Daily = () => {
  const [status, setStatus] = useState({
    date: '',
    tasks: [{ time: '', description: '', completed: false }],
    empId: '',
    employeeName: '',
    department: '',
    manager: ''
  });
 
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
     
      if (user) {
        const userQuery = query(collection(db, "users"), where("uid", "==", user.uid));
        const userSnapshot = await getDocs(userQuery);
       
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setStatus(prev => ({
            ...prev,
            empId: userData.empId,
            employeeName: `${userData.firstName} ${userData.lastName}`,
            department: userData.department || '',
            manager: userData.manager || ''
          }));
        }
      }
    };
 
    fetchUserData();
  }, []);
 
  const handleChange = (index, field, value) => {
    const updatedTasks = [...status.tasks];
    updatedTasks[index][field] = field === 'completed' ? value.target.checked : value;
    setStatus({ ...status, tasks: updatedTasks });
  };
 
  const addTask = () => {
    setStatus({
      ...status,
      tasks: [...status.tasks, { time: '', description: '', completed: false }],
    });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    try {
      // Save status report to Firestore
      const statusData = {
        ...status,
        submittedAt: new Date(),
        status: 'pending' // pending, reviewed
      };
 
      await addDoc(collection(db, "statusReports"), statusData);
     
      alert("Status submitted successfully!");
     
      // Reset form
      setStatus({
        date: '',
        tasks: [{ time: '', description: '', completed: false }],
        empId: status.empId,
        employeeName: status.employeeName,
        department: status.department,
        manager: status.manager
      });
    } catch (error) {
      console.error("Error submitting status:", error);
      alert("Error submitting status. Please try again.");
    }
  };
 
  return (
    <div className="h-screen overflow-y-auto bg-orange-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-orange-500 mb-4">📝 Daily Status Report</h2>
 
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Date</label>
            <input
              type="date"
              value={status.date}
              onChange={(e) => setStatus({ ...status, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-400"
              required
            />
          </div>
 
          {status.tasks.map((task, index) => (
            <div key={index} className="border p-4 rounded-md mb-4 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                <input
                  type="time"
                  value={task.time}
                  onChange={(e) => handleChange(index, 'time', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Task Description"
                  value={task.description}
                  onChange={(e) => handleChange(index, 'description', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-400"
                  required
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => handleChange(index, 'completed', e)}
                    className="h-4 w-4 text-orange-600"
                  />
                  <span className="text-gray-700">Completed</span>
                </label>
              </div>
            </div>
          ))}
 
          <div className="flex justify-between">
            <button
              type="button"
              onClick={addTask}
              className="bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 transition"
            >
              ➕ Add Task
            </button>
            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition"
            >
              Submit Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export default Daily;
 