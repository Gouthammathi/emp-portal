import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
 
const Engage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const allEmployees = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmployees(allEmployees);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
      setLoading(false);
    };
 
    fetchEmployees();
  }, []);
 
  const getUpcomingBirthdays = () => {
    const today = new Date();
    return employees.filter(emp => {
      if (!emp.dateOfBirth) return false;
      const dob = new Date(emp.dateOfBirth);
      return dob.getMonth() === today.getMonth() && dob.getDate() >= today.getDate();
    });
  };
 
  const getUpcomingAnniversaries = () => {
    const today = new Date();
    return employees.filter(emp => {
      if (!emp.joiningDate) return false;
      const doj = new Date(emp.joiningDate);
      return doj.getMonth() === today.getMonth() && doj.getDate() >= today.getDate();
    });
  };
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
 
  const birthdays = getUpcomingBirthdays();
  const anniversaries = getUpcomingAnniversaries();
 
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Engage</h1>
 
      {/* Birthdays Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-orange-600 mb-3">🎂 Upcoming Birthdays</h2>
        {birthdays.length > 0 ? (
          <ul className="space-y-2">
            {birthdays.map(emp => (
              <li key={emp.id} className="bg-orange-100 p-4 rounded shadow">
                <p className="text-lg font-medium">{emp.name}</p>
                <p className="text-sm text-gray-600">DOB: {new Date(emp.dateOfBirth).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No upcoming birthdays this month.</p>
        )}
      </div>
 
      {/* Anniversaries Section */}
      <div>
        <h2 className="text-2xl font-semibold text-blue-600 mb-3">🎉 Work Anniversaries</h2>
        {anniversaries.length > 0 ? (
          <ul className="space-y-2">
            {anniversaries.map(emp => (
              <li key={emp.id} className="bg-blue-100 p-4 rounded shadow">
                <p className="text-lg font-medium">{emp.name}</p>
                <p className="text-sm text-gray-600">Joined: {new Date(emp.joiningDate).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No upcoming work anniversaries this month.</p>
        )}
      </div>
    </div>
  );
};
 
export default Engage;