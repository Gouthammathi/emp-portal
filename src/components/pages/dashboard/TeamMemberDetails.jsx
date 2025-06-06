import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaClock, FaClipboardList, FaFileInvoiceDollar, FaBook, FaArrowLeft } from 'react-icons/fa';

const TeamMemberDetails = () => {
  const { empId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const member = location.state?.member;

  const [activeTab, setActiveTab] = useState('timesheets');
  const [memberData, setMemberData] = useState({
    timesheets: [],
    statusReports: [],
    mockTests: [],
    reimbursements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!member) return;
      
      setLoading(true);
      try {
        // Fetch timesheets
        const timesheetsQuery = query(
          collection(db, "timesheets"),
          where("empId", "==", empId)
        );
        const timesheetsSnapshot = await getDocs(timesheetsQuery);
        const timesheets = timesheetsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch status reports
        const statusQuery = query(
          collection(db, "statusReports"),
          where("empId", "==", empId)
        );
        const statusSnapshot = await getDocs(statusQuery);
        const statusReports = statusSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch mock tests
        const mockTestsQuery = query(
          collection(db, "mockTests"),
          where("empId", "==", empId)
        );
        const mockTestsSnapshot = await getDocs(mockTestsQuery);
        const mockTests = mockTestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch reimbursement requests
        const reimbursementsQuery = query(
          collection(db, "reimbursements"),
          where("empId", "==", empId)
        );
        const reimbursementsSnapshot = await getDocs(reimbursementsQuery);
        const reimbursements = reimbursementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setMemberData({
          timesheets,
          statusReports,
          mockTests,
          reimbursements
        });
      } catch (error) {
        console.error("Error fetching member data:", error);
      }
      setLoading(false);
    };

    fetchMemberData();
  }, [empId, member]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timesheets':
        return (
          <div className="space-y-4">
            {memberData.timesheets.map((timesheet) => (
              <div key={timesheet.id} className="border rounded-lg p-4 bg-white shadow-sm">
                {/* Timesheet content */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-semibold">Month: {timesheet.month}</p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(timesheet.submittedAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    timesheet.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : timesheet.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                  </span>
                </div>
                {/* Add timesheet details here */}
              </div>
            ))}
            {memberData.timesheets.length === 0 && (
              <p className="text-gray-500">No timesheets found</p>
            )}
          </div>
        );
      case 'status':
        return (
          <div className="space-y-4">
            {memberData.statusReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 bg-white shadow-sm">
                {/* Status report content */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-semibold">Date: {report.date}</p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(report.submittedAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    report.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : report.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>
                {/* Add status report details here */}
              </div>
            ))}
            {memberData.statusReports.length === 0 && (
              <p className="text-gray-500">No status reports found</p>
            )}
          </div>
        );
      case 'reimbursements':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reimbursement Requests</h3>
            {memberData.reimbursements.length > 0 ? (
              <div className="space-y-4">
                {memberData.reimbursements.map((reimbursement) => (
                  <div key={reimbursement.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Request #{reimbursement.id}</h4>
                        <p className="text-sm text-gray-600">
                          Submitted: {reimbursement.submittedAt?.toDate().toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        reimbursement.status === 'approved' ? 'bg-green-100 text-green-800' :
                        reimbursement.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reimbursement.status.charAt(0).toUpperCase() + reimbursement.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium">₹{reimbursement.totalAmount || reimbursement.entries.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">{reimbursement.entries[0]?.category}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Justification</p>
                      <p className="text-gray-800">{reimbursement.justification}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Expense Entries:</p>
                      {reimbursement.entries.map((entry, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Date</p>
                              <p className="font-medium">{entry.date}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Amount</p>
                              <p className="font-medium">₹{entry.amount}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm text-gray-600">Description</p>
                              <p className="font-medium">{entry.description}</p>
                            </div>
                            {entry.receipt && (
                              <div className="col-span-2">
                                <p className="text-sm text-gray-600">Receipt</p>
                                <a 
                                  href={entry.receipt.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {entry.receipt.name}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {reimbursement.status === 'pending' && (
                      <div className="flex justify-end space-x-4 mt-4">
                        <button
                          onClick={() => handleApproveReimbursement(reimbursement.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectReimbursement(reimbursement.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reimbursement requests found</p>
            )}
          </div>
        );
      case 'mocktests':
        return (
          <div className="space-y-4">
            {memberData.mockTests.map((test) => (
              <div key={test.id} className="border rounded-lg p-4 bg-white shadow-sm">
                {/* Mock test content */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{test.module.toUpperCase()}</p>
                    <p className="text-sm text-gray-600">
                      Score: {test.score.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(test.submittedAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    test.score >= 70
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {test.score >= 70 ? 'Passed' : 'Failed'}
                  </span>
                </div>
                {/* Add mock test details here */}
              </div>
            ))}
            {memberData.mockTests.length === 0 && (
              <p className="text-gray-500">No mock tests found</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">Member not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Back to Team Overview</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {member.employeeName?.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{member.employeeName}</h1>
                <p className="text-gray-600">Employee ID: {member.empId}</p>
                <p className="text-gray-600">{member.designation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'timesheets', icon: FaClock, label: 'Timesheets' },
                { id: 'status', icon: FaClipboardList, label: 'Daily Status' },
                { id: 'reimbursements', icon: FaFileInvoiceDollar, label: 'Reimbursement' },
                { id: 'mocktests', icon: FaBook, label: 'Mock Tests' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {renderTabContent()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDetails; 