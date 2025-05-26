import React, { useState } from 'react';
 
const LeaveApply = () => {
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Leave applied:", form);
    // TODO: Save to Firestore
  };
 
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Leave Application</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input name="startDate" type="date" onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="endDate" type="date" onChange={handleChange} className="w-full p-2 border rounded" />
        <textarea name="reason" placeholder="Reason" onChange={handleChange} className="w-full p-2 border rounded" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Apply</button>
      </form>
    </div>
  );
};
 
export default LeaveApply;
 