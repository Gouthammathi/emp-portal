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
    return <div className="p-6 text-center">Loading IT statements...</div>;
  }
 
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">IT Statements</h1>
      {statements.length === 0 ? (
        <p className="text-gray-600">No IT statements available.</p>
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