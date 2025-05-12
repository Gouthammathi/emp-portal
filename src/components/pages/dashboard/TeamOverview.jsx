import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import orgChartData from '../../../data/orgchart.json';
 
const TeamOverview = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberData, setMemberData] = useState({
    timesheets: [],
    statusReports: [],
    mockTests: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
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
      } catch (error) {
        console.error("Error fetching team members:", error);
        setError("Error loading team members: " + error.message);
      }
      setLoading(false);
    };
 
    fetchTeamMembers();
  }, []);
 
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
      const mockTestsSnapshot = await getDocs(mockTestsQuery);
      const mockTests = mockTestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
 
      setMemberData({
        timesheets,
        statusReports,
        mockTests
      });
    } catch (error) {
      console.error("Error fetching member data:", error);
    }
    setLoading(false);
  };
 
  const handleMemberClick = (member) => {
    setSelectedMember(member);
    fetchMemberData(member.empId);
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
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Team Overview</h1>
       
        {/* Team Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <div
                key={member.empId}
                onClick={() => handleMemberClick(member)}
                className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                  selectedMember?.empId === member.empId ? 'ring-2 ring-orange-500' : ''
                }`}
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{member.employeeName}</h2>
                <p className="text-gray-600">Employee ID: {member.empId}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No team members found</p>
            </div>
          )}
        </div>
 
        {/* Selected Member Details */}
        {selectedMember && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              {selectedMember.employeeName}'s Details
            </h2>
 
            {/* Timesheets */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Timesheets</h3>
              <div className="space-y-4">
                {memberData.timesheets.map((timesheet) => (
                  <div key={timesheet.id} className="border rounded-lg p-4">
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
            </div>
 
            {/* Status Reports */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Status Reports</h3>
              <div className="space-y-4">
                {memberData.statusReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <p className="font-semibold">Date: {report.date}</p>
                    <p>Status: {report.status}</p>
                    <div className="mt-2">
                      <h4 className="font-medium">Tasks:</h4>
                      <div className="mt-2 space-y-2">
                        {report.tasks?.map((task, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded">
                            <p>Time: {task.time}</p>
                            <p>Description: {task.description}</p>
                            <p>Completed: {task.completed ? 'Yes' : 'No'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {memberData.statusReports.length === 0 && (
                  <p className="text-gray-500">No status reports found</p>
                )}
              </div>
            </div>
 
            {/* Mock Tests */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Mock Tests</h3>
              <div className="space-y-4">
                {memberData.mockTests.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4">
                    <p className="font-semibold">Module: {test.module}</p>
                    <p>Score: {test.score}%</p>
                    <p>Date: {new Date(test.submittedAt?.toDate()).toLocaleDateString()}</p>
                    <p>Correct Answers: {test.correctAnswers} out of {test.totalQuestions}</p>
                  </div>
                ))}
                {memberData.mockTests.length === 0 && (
                  <p className="text-gray-500">No mock tests found</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default TeamOverview;