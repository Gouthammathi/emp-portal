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
import Holidaycal from '../pages/holidaycal/holcal';
import Dailys from '../pages/dailystatus/daily';
import Org from '../pages/Org';
 
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
              <Route path="/module-selection" element={<Moduleselection />} />
              <Route path="/test-instructions/:moduleId" element={<Testins />} />
              <Route path="/test/:moduleId" element={<Test />} />
              <Route path="/ewm-test" element={<EWMTest />} />
              <Route path="/mocktest/result" element={<TestResult />} />
              <Route path="/certificate/:moduleId" element={<Certificate />} />
              <Route path="/timesheet" element={<Timesheet />} />
              <Route path="/holiday-calendar" element={<Holidaycal />} />
              <Route path="/daily-s" element={<Dailys />} />
              <Route path="/org" element={<Org />} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
 
export default Routers;