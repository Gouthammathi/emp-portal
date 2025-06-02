import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import orgChartData from '../../../data/orgchart.json';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaClipboardList, FaFileInvoiceDollar, FaBook } from 'react-icons/fa';
 
const TeamOverview = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState('timesheets');
  const [memberData, setMemberData] = useState({
    timesheets: [],
    statusReports: [],
    mockTests: [],
    reimbursements: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchTeamMembers = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
     
      if (!user) {
        setError("Please log in to view team members");
        setLoading(false);
        return;
      }
 
      try {
        // Step 1: Get current user's data from Firestore
        const userQuery = query(collection(db, "users"), where("uid", "==", user.uid));
        const userSnapshot = await getDocs(userQuery);
       
        let userData;
        if (userSnapshot.empty) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (!userDoc.exists()) {
            setError("User data not found");
            setLoading(false);
            return;
          }
          userData = userDoc.data();
        } else {
          userData = userSnapshot.docs[0].data();
        }
 
        console.log("User data from Firestore:", userData);
 
        if (!userData?.empId) {
          setError("Employee ID not found");
          setLoading(false);
          return;
        }
 
        // Step 2: Check if the current user is a manager in orgchart.json
        console.log("Looking for user in orgchart with empId:", userData.empId);
       
        const currentUserInOrgChart = orgChartData.organizationChart.find(
          emp => String(emp.empId) === String(userData.empId)
        );
 
        console.log("Found user in orgchart:", currentUserInOrgChart);
 
        if (!currentUserInOrgChart) {
          setError("User not found in organization chart");
          setLoading(false);
          return;
        }
 
        // Step 3: Find all employees who have this manager's empId as their managerId
        console.log("Finding team members with managerId:", userData.empId);
        const orgChartTeamMembers = orgChartData.organizationChart.filter(
          emp => String(emp.managerId) === String(userData.empId)
        );
 
        console.log("Found team members in orgchart:", orgChartTeamMembers);
 
        if (orgChartTeamMembers.length === 0) {
          setError("No team members found in organization chart");
          setLoading(false);
          return;
        }
 
        // Step 4: Check which of these employees are registered in the database
        const registeredTeamMembers = [];
       
        for (const member of orgChartTeamMembers) {
          console.log("Checking registration for employee:", member.empId);
         
          // Check if employee is registered in users collection
          const userQuery = query(
            collection(db, "users"),
            where("empId", "==", member.empId)
          );
          const userSnapshot = await getDocs(userQuery);
         
          console.log("Registration check result for", member.empId, ":", !userSnapshot.empty);
         
          if (!userSnapshot.empty) {
            // Employee is registered, add their data
            const userData = userSnapshot.docs[0].data();
            registeredTeamMembers.push({
              ...member,
              ...userData,
              isRegistered: true
            });
          }
        }
 
        console.log("Final registered team members:", registeredTeamMembers);
 
        if (registeredTeamMembers.length === 0) {
          setError("No registered team members found");
          setLoading(false);
          return;
        }
 
        setTeamMembers(registeredTeamMembers);
        setFilteredMembers(registeredTeamMembers);
      } catch (error) {
        console.error("Error fetching team members:", error);
        setError("Error loading team members: " + error.message);
      }
      setLoading(false);
    };
 
    fetchTeamMembers();
  }, []);
 
  // Add search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(teamMembers);
    } else {
      const filtered = teamMembers.filter(member =>
        member.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.empId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, teamMembers]);
 
  const fetchMemberData = async (empId) => {
    setLoading(true);
    try {
      console.log("Fetching data for employee:", empId);
 
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
      console.log("Fetched timesheets:", timesheets);
 
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
      console.log("Fetching mock tests for empId:", empId);
      const mockTestsSnapshot = await getDocs(mockTestsQuery);
      const mockTests = mockTestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Fetched mock tests:", mockTests);
 
      // Fetch reimbursement requests
      const reimbursementsQuery = query(
        collection(db, "reimbursements"),
        where("employeeId", "==", empId)
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
 
  const handleMemberClick = (member) => {
    // Navigate to the team member details page
    navigate(`/team-member/${member.empId}`, { state: { member } });
  };
 
  const closeModal = () => {
    setShowModal(false);
    setSelectedMember(null);
  };
 
  const handleApproveTimesheet = async (timesheetId) => {
    try {
      const timesheetRef = doc(db, "timesheets", timesheetId);
      await updateDoc(timesheetRef, {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: getAuth().currentUser.uid
      });
     
      // Refresh the timesheet data
      if (selectedMember) {
        fetchMemberData(selectedMember.empId);
      }
     
      alert('Timesheet approved successfully!');
    } catch (error) {
      console.error("Error approving timesheet:", error);
      alert('Error approving timesheet. Please try again.');
    }
  };
 
  const handleApproveStatusReport = async (statusReportId) => {
    try {
      const statusReportRef = doc(db, "statusReports", statusReportId);
      await updateDoc(statusReportRef, {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: getAuth().currentUser.uid
      });
     
      // Refresh the status report data
      if (selectedMember) {
        fetchMemberData(selectedMember.empId);
      }
     
      alert('Status report approved successfully!');
    } catch (error) {
      console.error("Error approving status report:", error);
      alert('Error approving status report. Please try again.');
    }
  };
 
  const handleApproveReimbursement = async (reimbursementId) => {
    try {
      const reimbursementRef = doc(db, "reimbursements", reimbursementId);
      await updateDoc(reimbursementRef, {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: getAuth().currentUser.uid
      });
     
      // Refresh the reimbursement data
      if (selectedMember) {
        fetchMemberData(selectedMember.empId);
      }
     
      alert('Reimbursement request approved successfully!');
    } catch (error) {
      console.error("Error approving reimbursement:", error);
      alert('Error approving reimbursement request. Please try again.');
    }
  };
 
  const handleRejectReimbursement = async (reimbursementId, comments) => {
    try {
      const reimbursementRef = doc(db, "reimbursements", reimbursementId);
      await updateDoc(reimbursementRef, {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: getAuth().currentUser.uid,
        approverComments: comments
      });
     
      // Refresh the reimbursement data
      if (selectedMember) {
        fetchMemberData(selectedMember.empId);
      }
     
      alert('Reimbursement request rejected successfully!');
    } catch (error) {
      console.error("Error rejecting reimbursement:", error);
      alert('Error rejecting reimbursement request. Please try again.');
    }
  };
 
  const getDesignation = (member) => {
    // Check if the member has a role in the hierarchy
    if (member.role) {
      return member.role.charAt(0).toUpperCase() + member.role.slice(1);
    }
    // If no specific role is set, check if they have a managerId
    if (member.managerId) {
      return 'Employee';
    }
    return 'Employee';
  };
 
  const getCardColor = (member) => {
    const role = member.role?.toLowerCase();
    switch (role) {
      case 'manager':
        return 'from-blue-500 to-blue-600';
      case 'supermanager':
        return 'from-purple-500 to-purple-600';
      case 'hr':
        return 'from-green-500 to-green-600';
      default:
        return 'from-orange-500 to-orange-600';
    }
  };
 
  const renderTabContent = () => {
    switch (activeTab) {
      case 'timesheets':
        return (
          <div className="space-y-4">
            {memberData.timesheets.map((timesheet) => (
              <div key={timesheet.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-semibold">Month: {timesheet.month}</p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(timesheet.submittedAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      timesheet.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : timesheet.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                    </span>
                    {timesheet.status === 'pending' && (
                      <button
                        onClick={() => handleApproveTimesheet(timesheet.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
 
                {/* Excel-like table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Date</th>
                        <th className="border px-4 py-2">Day</th>
                        <th className="border px-4 py-2">Shift</th>
                        <th className="border px-4 py-2">In Time</th>
                        <th className="border px-4 py-2">Out Time</th>
                        <th className="border px-4 py-2">In Time</th>
                        <th className="border px-4 py-2">Out Time</th>
                        <th className="border px-4 py-2">Hours</th>
                        <th className="border px-4 py-2">Overtime</th>
                        <th className="border px-4 py-2">Total Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timesheet.entries?.map((entry, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border px-4 py-2">{entry.date}</td>
                          <td className="border px-4 py-2">{entry.day}</td>
                          <td className="border px-4 py-2">{entry.shift}</td>
                          <td className="border px-4 py-2">{entry.inTime1}</td>
                          <td className="border px-4 py-2">{entry.outTime1}</td>
                          <td className="border px-4 py-2">{entry.inTime2}</td>
                          <td className="border px-4 py-2">{entry.outTime2}</td>
                          <td className="border px-4 py-2">{entry.hoursCompleted}</td>
                          <td className="border px-4 py-2">{entry.overtime}</td>
                          <td className="border px-4 py-2">{entry.totalHours}</td>
                        </tr>
                      ))}
                      {/* Total row */}
                      <tr className="bg-gray-100 font-semibold">
                        <td colSpan="7" className="border px-4 py-2 text-right">Total:</td>
                        <td className="border px-4 py-2">
                          {timesheet.entries?.reduce((sum, entry) => sum + Number(entry.hoursCompleted || 0), 0)}
                        </td>
                        <td className="border px-4 py-2">
                          {timesheet.entries?.reduce((sum, entry) => sum + Number(entry.overtime || 0), 0)}
                        </td>
                        <td className="border px-4 py-2">
                          {timesheet.entries?.reduce((sum, entry) => sum + Number(entry.totalHours || 0), 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="font-semibold">Date: {report.date}</p>
                    <p className="text-sm text-gray-500">
                      Submitted: {new Date(report.submittedAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      report.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : report.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                    {report.status === 'pending' && (
                      <button
                        onClick={() => handleApproveStatusReport(report.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
 
                {/* Excel-like table with fixed styling */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full table-fixed border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="w-1/6 border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">Time</th>
                        <th className="w-2/6 border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">Description</th>
                        <th className="w-1/6 border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                        <th className="w-2/6 border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.tasks?.map((task, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{task.time}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{task.description}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              task.completed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {task.completed ? 'Completed' : 'Pending'}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{task.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {memberData.statusReports.length === 0 && (
              <p className="text-gray-500">No status reports found</p>
            )}
          </div>
        );
      case 'reimbursement':
        return (
          <div className="space-y-4">
            {memberData.reimbursements.map((reimbursement) => (
              <div key={reimbursement.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Amount: ₹{reimbursement.amount}</p>
                    <p className="text-sm text-gray-600">Type: {reimbursement.expenseType}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(reimbursement.expenseDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Status: <span className={`font-medium ${
                      reimbursement.status === 'approved' ? 'text-green-600' :
                      reimbursement.status === 'rejected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>{reimbursement.status}</span></p>
                  </div>
                  {reimbursement.status === 'pending' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleApproveReimbursement(reimbursement.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const comments = prompt('Please enter rejection comments:');
                          if (comments) {
                            handleRejectReimbursement(reimbursement.id, comments);
                          }
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
                {reimbursement.approverComments && (
                  <p className="text-sm text-gray-600 mt-2">
                    Comments: {reimbursement.approverComments}
                  </p>
                )}
              </div>
            ))}
            {memberData.reimbursements.length === 0 && (
              <p className="text-gray-500">No reimbursement requests found</p>
            )}
          </div>
        );
      case 'mocktests':
        return (
          <div className="space-y-4">
            {memberData.mockTests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Answers</th>
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Questions</th>
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {memberData.mockTests.map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {test.module.toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            test.score >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {test.score.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {test.correctAnswers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {test.totalQuestions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(test.submittedAt?.toDate()).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            test.score >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {test.score >= 70 ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No mock tests found</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
 
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Team Overview</h1>
            <p className="text-gray-600">Manage and monitor your team's activities</p>
          </div>
          <div className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
       
        {/* Team Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((member) => (
            <div
              key={member.empId}
              onClick={() => handleMemberClick(member)}
              className="bg-white rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-100 relative overflow-hidden h-[200px] group"
            >
              {/* Glossy effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
             
              <div className="relative z-10 h-full flex flex-col">
                {/* Header Section */}
                <div className={`p-4 bg-gradient-to-r ${getCardColor(member)} text-white`}>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <span className="text-xl font-bold text-orange-600">
                          {member.employeeName?.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold truncate group-hover:text-white/90 transition-colors">
                        {member.employeeName}
                      </h2>
                      <p className="text-sm text-white/90">ID: {member.empId}</p>
                    </div>
                  </div>
                </div>
 
                {/* Content Section */}
                <div className="flex-1 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{member.email}</p>
                      </div>
                    </div>
 
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Designation</p>
                        <p className="text-sm font-medium text-gray-800 truncate">{getDesignation(member)}</p>
                      </div>
                    </div>
                  </div>
                </div>
 
                {/* Footer Section */}
                <div className="p-3 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">View Details</span>
                    <svg
                      className="w-4 h-4 text-gray-400 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
 
export default TeamOverview;
 