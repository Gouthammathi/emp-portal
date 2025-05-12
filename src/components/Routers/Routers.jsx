// src/components/Routers/Routers.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import SetNewPassword from '../pages/SetNewPassword';
import CheckEmail from '../pages/CheckEmail'; // Import the new CheckEmail component
import ForgetPassword from '../pages/ForgetPassword'; // Import the Forget Password component
import Dashboard from '../pages/Dashboard';
import Moduleselection from '../pages/Mocktest/Moduleselection';
import Testins from '../pages/Mocktest/Testins';
import Test from '../pages/Mocktest/Test';
import EWMTest from '../pages/Mocktest/EWMTest';
import TestResult from '../pages/Mocktest/TestResult';
import Certificate from '../pages/Mocktest/Certificate';
import Timesheet from '../pages/Timesheet/Timesheet';
import Holidaycal from '../pages/holidaycal/holcal';
import Dailys from '../pages/dailystatus/daily';
import Org from '../pages/Org';
function Routers() {
  return (
    <Routes>
      <Route path='/' element={<Login />} /> {/* Set Login as the main page */}
      <Route path='/register' element={<Register />} /> {/* Registration Page */}
      <Route path='/check-email' element={<CheckEmail />} /> {/* Email Entry Page */}
      <Route path='/setnewpassword' element={<SetNewPassword />} /> {/* Set New Password Page */}
      <Route path='/forget-password' element={<ForgetPassword />} /> {/* Forget Password Page */}
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/module-selection' element={<Moduleselection />} />
      <Route path='/test-instructions/:moduleId' element={<Testins />} />
      <Route path='/test/:moduleId' element={<Test />} />
      <Route path='/ewm-test' element={<EWMTest />} />
      <Route path='/mocktest/result' element={<TestResult />} />
      <Route path='/certificate/:moduleId' element={<Certificate />} />
      <Route path='/Timesheet' element={<Timesheet />} />
      <Route path='/holiday-calendar' element={<Holidaycal />} />
      <Route path='/daily-s' element={<Dailys />} />
      <Route path='/org' element={<Org/>}/>
    </Routes>
  );
}

export default Routers;