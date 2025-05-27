import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
 
const ITStatement = () => {
  const [statements, setStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
 
  useEffect(() => {
    const fetchStatements = async () => {
      const user = auth.currentUser;
      if (!user) return;
 
      try {
        const statementRef = collection(db, 'it_statements'); // each doc: { financialYear, grossIncome, taxPaid, deductions }
        const q = query(statementRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStatements(data);
      } catch (error) {
        console.error('Error fetching IT statements:', error);
      }
      setLoading(false);
    };
 
    fetchStatements();
  }, []);
 
  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading IT statements...</div>;
  }
 
  return (
    <div className="p-6 min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">IT Statements</h1>
 
      {statements.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-gray-500 mt-20">
          {/* Optional Icon */}
          <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-6 0H9m6 0h.01M9 17H9m6-10H9m0 0V7a2 2 0 012-2h2a2 2 0 012 2v.5M9 7h6" />
          </svg>
 
          <p className="text-lg">No IT statements available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {statements.map(s => (
            <div key={s.id} className="border p-4 rounded shadow bg-white">
              <p className="font-semibold text-lg">FY {s.financialYear}</p>
              <p>Gross Income: ₹{s.grossIncome}</p>
              <p>Deductions: ₹{s.deductions}</p>
              <p className="font-semibold">Tax Paid: ₹{s.taxPaid}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
 
export default ITStatement;
 
 