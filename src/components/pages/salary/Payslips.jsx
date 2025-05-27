import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
 
const Payslip = () => {
  const [payslips, setPayslips] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
 
  useEffect(() => {
    const fetchPayslips = async () => {
      const user = auth.currentUser;
      if (!user) return;
 
      try {
        const payslipRef = collection(db, 'payslips');
        const q = query(payslipRef, where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPayslips(data);
        if (data.length > 0) {
          setSelectedMonth(`${data[0].month}-${data[0].year}`);
        }
      } catch (error) {
        console.error('Error fetching payslips:', error);
      }
      setLoading(false);
    };
 
    fetchPayslips();
  }, []);
 
  const selectedPayslip = payslips.find(
    (p) => `${p.month}-${p.year}` === selectedMonth
  );
 
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };
 
  const isEmpty = !selectedPayslip;
 
  const data = selectedPayslip || {
    month: '',
    year: '',
    basic: '',
    hra: '',
    deductions: '',
    net: '',
    name: '',
    employeeId: '',
    joiningDate: '',
    designation: '',
    location: '',
    bankName: '',
    bankAccount: '',
    pan: '',
    lop: ''
  };
 
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={isEmpty}
        >
          ⬇ Download Payslip
        </button>
        <select
          className="border border-gray-300 rounded px-3 py-2"
          value={selectedMonth}
          onChange={handleMonthChange}
          disabled={payslips.length === 0}
        >
          {payslips.length > 0 ? (
            payslips.map((p) => (
              <option key={p.id} value={`${p.month}-${p.year}`}>
                {p.month} {p.year}
              </option>
            ))
          ) : (
            <option>No Payslips</option>
          )}
        </select>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Earnings */}
        <div className="bg-white p-4 border rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Earnings</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-gray-600">
                <th className="text-left p-2">Type</th>
                <th className="text-right p-2">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">Basic</td>
                <td className="p-2 text-right">{data.basic || 'N/A'}</td>
              </tr>
              <tr>
                <td className="p-2">HRA</td>
                <td className="p-2 text-right">{data.hra || 'N/A'}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="font-semibold border-t">
                <td className="p-2">Total</td>
                <td className="p-2 text-right">
                  {data.basic && data.hra
                    ? parseFloat(data.basic) + parseFloat(data.hra)
                    : 'N/A'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
 
        {/* Deductions */}
        <div className="bg-white p-4 border rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Deductions</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-gray-600">
                <th className="text-left p-2">Type</th>
                <th className="text-right p-2">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">Total Deductions</td>
                <td className="p-2 text-right">{data.deductions || 'N/A'}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="font-semibold border-t">
                <td className="p-2">Total</td>
                <td className="p-2 text-right">{data.deductions || 'N/A'}</td>
              </tr>
            </tfoot>
          </table>
        </div>
 
        {/* Employee Details */}
        <div className="bg-yellow-50 p-4 border rounded shadow text-sm">
          <h2 className="text-lg font-semibold mb-2">Employee Details</h2>
          <div className="grid grid-cols-2 gap-y-1">
            <p className="text-gray-600">Name:</p>
            <p>{data.name || 'N/A'}</p>
 
            <p className="text-gray-600">Employee No:</p>
            <p>{data.employeeId || 'N/A'}</p>
 
            <p className="text-gray-600">Joining Date:</p>
            <p>{data.joiningDate || 'N/A'}</p>
 
            <p className="text-gray-600">Designation:</p>
            <p>{data.designation || 'N/A'}</p>
 
            <p className="text-gray-600">Location:</p>
            <p>{data.location || 'N/A'}</p>
 
            <p className="text-gray-600">Bank:</p>
            <p>{data.bankName || 'N/A'}</p>
 
            <p className="text-gray-600">Bank A/C No:</p>
            <p>{data.bankAccount || 'N/A'}</p>
 
            <p className="text-gray-600">PAN:</p>
            <p>{data.pan || 'N/A'}</p>
 
            <p className="text-gray-600">LOP:</p>
            <p>{data.lop || 'N/A'}</p>
          </div>
        </div>
      </div>
 
      {/* Net Pay */}
      <div className="mt-6 bg-white p-4 border rounded shadow text-right">
        <span className="text-lg font-semibold">Net Pay: </span>
        <span className="text-green-600 text-xl font-bold">
          {data.net ? `₹${data.net}` : 'N/A'}
        </span>
      </div>
    </div>
  );
};
 
export default Payslip;
 
 