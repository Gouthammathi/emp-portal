import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import CheckEmail from '../pages/CheckEmail';
import SetNewPassword from '../pages/SetNewPassword';
import ForgetPassword from '../pages/ForgetPassword';
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
import TeamMemberDetails from '../pages/dashboard/TeamMemberDetails';
import TeamOverview from '../pages/dashboard/TeamOverview';
import Engage from '../pages/Engage';
import Payslip from '../pages/salary/Payslips';
import ITStatement from '../pages/salary/ItStatemnet';
import LeaveApply from '../pages/leave/LeaveApply';
import LeaveBalances from '../pages/leave/LeaveBalances';
import DocumentCenter from '../pages/document/DocumentCenter';
// import LeavePending from '../pages/leave/LeavePending';
// import LeaveHistory from '../pages/leave/LeaveHistory';
import EmpDocs from '../pages/document/Emp-Docs';
import EmpPlayslips from '../pages/document/Emp-Payslips';
import Form16 from '../pages/document/Form16';
import CompanyPolicies from '../pages/document/CompaniesPolicies';
 
function Routers() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/setnewpassword" element={<SetNewPassword />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
 
      {/* Protected Routes */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/engage" element={<Engage />} />
              <Route path="/module-selection" element={<Moduleselection />} />
              <Route path="/test-instructions/:moduleId" element={<Testins />} />
              <Route path="/test/:moduleId" element={<Test />} />
              <Route path="/ewm-test" element={<EWMTest />} />
              <Route path="/mocktest/result" element={<TestResult />} />
              <Route path="/certificate/:moduleId" element={<Certificate />} />
              <Route path="/timesheet" element={<Timesheet />} />
              <Route path="/salary/payslips" element={<Payslip />} />
              <Route path="/salary/it-statement" element={<ITStatement />} />
              <Route path="/leave/apply" element={<LeaveApply />} />
              <Route path="/leave/balances" element={<LeaveBalances />} />
              {/* <Route path="/leave/pending" element={<LeavePending />} />
              <Route path="/leave/history" element={<LeaveHistory />} /> */}
              <Route path="/holiday-calendar" element={<Holidaycal />} />
              <Route path="/daily-s" element={<Dailys />} />
              <Route path="/org" element={<Org />} />
              <Route path="/reimbursement" element={<ReimbursementRequest />} />
              <Route path="/team-member/:empId" element={<TeamMemberDetails />} />
              <Route path="/team-overview" element={<TeamOverview />} />
              <Route path="/document-center" element={<DocumentCenter />} />
              <Route path="/emp-docs" element={<EmpDocs />} />
              <Route path="/emp-payslips" element={<EmpPlayslips />} />
              <Route path="/form16" element={<Form16 />} />
              <Route path="/company-policies" element={<CompanyPolicies />} />
             
         
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
 
export default Routers;