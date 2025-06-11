import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
 
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import PublicRoute from '../ProtectedRoute/PublicRoute';
 
import AccessDenied from '../pages/AccessDenied';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CheckEmail from '../pages/CheckEmail';
import SetNewPassword from '../pages/SetNewPassword';
import ForgetPassword from '../pages/ForgetPassword';
 
import Dashboard from '../pages/Dashboard';
import Moduleselection from '../pages/Mocktest/Moduleselection';
import Testins from '../pages/Mocktest/Testins';
import Test from '../pages/Mocktest/Test';
import EWMTest from '../pages/Mocktest/Tests/EWMTest';
import TestResult from '../pages/Mocktest/TestResult';
import Certificate from '../pages/Mocktest/Certificate';
 
import Timesheet from '../pages/Timesheet/Timesheet';
import Holidaycal from '../pages/leave/holcal';
import Dailys from '../pages/dailystatus/daily';
import Org from '../pages/Org';
import ReimbursementRequest from '../pages/ReimbursementRequest';
import HrReimbursement from '../pages/HrReimbursement';
import TeamMemberDetails from '../pages/dashboard/TeamMemberDetails';
import TeamOverview from '../pages/dashboard/TeamOverview';
import SuperManagerTeamOverview from '../pages/dashboard/SuperManagerTeamOverview';
import SuperManagerTickets from '../pages/dashboard/SuperManagerTickets';
import Engage from '../pages/Engage';
 
import Payslip from '../pages/salary/Payslips';
import ITStatement from '../pages/salary/ItStatemnet';
 
import LeaveApply from '../pages/leave/LeaveApply';
import LeaveBalances from '../pages/leave/LeaveBalances';
import PendingLeaves from '../pages/leave/PendingLeaves';
import LeaveHistory from '../pages/leave/LeaveHistory';
 
import DocumentCenter from '../pages/document/DocumentCenter';
import EmpDocs from '../pages/document/Emp-Docs';
import EmpPlayslips from '../pages/document/Emp-Payslips';
import Form16 from '../pages/document/Form16';
import CompanyPolicies from '../pages/document/CompaniesPolicies';
 
import Tickets from '../pages/Tickets';
import ConferenceHall from '../pages/confhall/ConferenceHall';
import ClientForm from '../pages/Client/ClientForm';
import EmployeeAssignedTickets from '../pages/EmployeeAssignedTickets';
import TicketReports from '../pages/TicketReports';
 
import Layout from '../layout/Layout';
import AdminRouter from '../../admin/routes/AdminRouter';
import CSuiteDashboard from '../pages/dashboard/CSuiteDashboard';
import CSuiteTickets from '../pages/dashboard/CSuiteTickets';
const UserLayoutWrapper = () => (
<Layout>
<Outlet />
</Layout>
);
 
const Routers = () => {
  const [, loading] = useAuthState(auth);
 
  if (loading) return <div>Loading...</div>;
 
  return (
<Routes>
      {/* Public Routes */}
<Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
<Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
<Route path="/check-email" element={<PublicRoute><CheckEmail /></PublicRoute>} />
<Route path="/setnewpassword" element={<PublicRoute><SetNewPassword /></PublicRoute>} />
<Route path="/forget-password" element={<PublicRoute><ForgetPassword /></PublicRoute>} />
<Route path="/access-denied" element={<AccessDenied />} />
 
      {/* Admin Routes */}
<Route path="/admin/*" element={
<ProtectedRoute allowedRoles={['admin']}>
<AdminRouter />
</ProtectedRoute>
      } />
{/* C-Suite Dashboard Route */}
{/* <Route path="/csuite" element={
<ProtectedRoute allowedRoles={['c-suite']}>
<CSuiteDashboard />
</ProtectedRoute>
      } /> */}
      {/* Employee / Manager / HR / TL / Supermanager */}
<Route path="/" element={
<ProtectedRoute allowedRoles={['employee', 'manager', 'hr', 'supermanager', 'tl', 'client', 'c-suite']}>
<UserLayoutWrapper />
</ProtectedRoute>
      }>
<Route index element={<Dashboard />} />
<Route path="dashboard" element={<Dashboard />} />
<Route path="engage" element={<Engage />} />
<Route path="module-selection" element={<Moduleselection />} />
<Route path="test-instructions/:moduleId" element={<Testins />} />
<Route path="test/:moduleId" element={<Test />} />
<Route path="ewm-test" element={<EWMTest />} />
<Route path="mocktest/result" element={<TestResult />} />
<Route path="certificate/:moduleId" element={<Certificate />} />
<Route path="timesheet" element={<Timesheet />} />
<Route path="salary/payslips" element={<Payslip />} />
<Route path="salary/it-statement" element={<ITStatement />} />
<Route path="leave/balances" element={<LeaveBalances />} />  
<Route path="apply" element={<LeaveApply />} />
<Route path="pending" element={<PendingLeaves />} />
<Route path="history" element={<LeaveHistory />} />
{/* <Route path="balances" element={<LeaveBalances />} /> */}
<Route path="holiday-calendar" element={<Holidaycal />} />
<Route path="daily-s" element={<Dailys />} />
<Route path="org" element={<Org />} />
<Route path="reimbursement" element={<ReimbursementRequest />} />
<Route path="hr-reimbursements" element={<HrReimbursement />} />
<Route path="team-member/:empId" element={<TeamMemberDetails />} />
<Route path="team-overview" element={<TeamOverview />} />
<Route path="supermanager-team-overview" element={<SuperManagerTeamOverview />} />
<Route path="supermanager-tickets" element={<SuperManagerTickets />} />
<Route path="document-center" element={<DocumentCenter />} />
<Route path="emp-docs" element={<EmpDocs />} />
<Route path="emp-payslips" element={<EmpPlayslips />} />
<Route path="form16" element={<Form16 />} />
<Route path="company-policies" element={<CompanyPolicies />} />
<Route path="tickets" element={<Tickets />} />
<Route path="my-tickets" element={<EmployeeAssignedTickets />} />
<Route path="conference-hall" element={<ConferenceHall />} />
<Route path="clientform" element={<ClientForm />} />
<Route path="csuite" element={<CSuiteDashboard />} />
<Route path="csuite-tickets" element={<CSuiteTickets />} />
<Route path="ticket-reports" element={<TicketReports />} />
</Route>
 
      {/* Catch-All Route */}
<Route path="*" element={<Navigate to="/login" replace />} />
</Routes>
  );
};
 
export default Routers;