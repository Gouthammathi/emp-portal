import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
 
const Payslip = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
 
  useEffect(() => {
    const fetchPayslips = async () => {
      const user = auth.currentUser;
      if (!user) return;
 
      try {
        const payslipRef = collection(db, 'payslips'); // each doc: { month, year, basic, hra, deductions, net }
        const q = query(payslipRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayslips(data);
      } catch (error) {
        console.error('Error fetching payslips:', error);
      }
      setLoading(false);
    };
 
    fetchPayslips();
  }, []);
 
  if (loading) {
    return <div className="p-6 text-center">Loading payslips...</div>;
  }
 
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">My Payslips</h1>
      {payslips.length === 0 ? (
        <p className="text-gray-600">No payslips available.</p>
      ) : (
        <div className="space-y-4">
          {payslips.map(p => (
            <div key={p.id} className="border p-4 rounded shadow bg-white">
              <p className="font-semibold text-lg">{p.month} {p.year}</p>
              <p>Basic: ₹{p.basic}</p>
              <p>HRA: ₹{p.hra}</p>
              <p>Deductions: ₹{p.deductions}</p>
              <p className="font-semibold">Net Pay: ₹{p.net}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
 
export default Payslip;