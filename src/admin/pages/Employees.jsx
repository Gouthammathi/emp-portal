import React from 'react';
 
const employees = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Developer' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Designer' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'HR' },
];
 
const Employees = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6 text-indigo-700">Employees</h2>
 
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(({ id, name, email, role }) => (
              <tr key={id} className="border-b hover:bg-indigo-50">
                <td className="py-4 px-6">{name}</td>
                <td className="py-4 px-6">{email}</td>
                <td className="py-4 px-6">{role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
 
export default Employees;
 
 