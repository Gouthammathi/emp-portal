import React from 'react';
 
const LeaveBalances = () => {
  const balances = {
    casual: 5,
    sick: 3,
    earned: 10,
  };
 
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Leave Balances</h2>
      <ul className="space-y-2">
        {Object.entries(balances).map(([type, days]) => (
          <li key={type} className="border p-2 rounded bg-white shadow">
            <strong className="capitalize">{type} Leave:</strong> {days} days
          </li>
        ))}
      </ul>
    </div>
  );
};
 
export default LeaveBalances;
 