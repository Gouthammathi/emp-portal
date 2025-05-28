import React, { useState } from 'react';
 
const attendanceData = [
  { id: 1, name: 'Alice Johnson', date: '2025-05-25', status: 'Present' },
  { id: 2, name: 'Bob Smith', date: '2025-05-25', status: 'Absent' },
  { id: 3, name: 'Carol White', date: '2025-05-25', status: 'Present' },
  { id: 4, name: 'Alice Johnson', date: '2025-05-26', status: 'Present' },
  { id: 5, name: 'Bob Smith', date: '2025-05-26', status: 'Present' },
];
 
const Attendence = () => {
  const [filterDate, setFilterDate] = useState('');
 
  const filteredData = filterDate
    ? attendanceData.filter((record) => record.date === filterDate)
    : attendanceData;
 
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6 text-indigo-700">Attendance Records</h2>
 
      <div className="mb-6">
        <label htmlFor="date" className="block mb-2 font-medium text-gray-700">
          Filter by Date:
        </label>
        <input
          type="date"
          id="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => setFilterDate('')}
          className="ml-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Clear
        </button>
      </div>
 
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map(({ id, name, date, status }) => (
                <tr key={id} className="border-b hover:bg-indigo-50">
                  <td className="py-4 px-6">{name}</td>
                  <td className="py-4 px-6">{date}</td>
                  <td
                    className={`py-4 px-6 font-semibold ${
                      status === 'Present' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">
                  No records found for the selected date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
 
export default Attendence;
 
 