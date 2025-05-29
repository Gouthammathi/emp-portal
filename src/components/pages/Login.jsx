// src/components/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
 
const Login = () => {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
 
  useEffect(() => {
    setEmpId("");
    setPassword("");
  }, []);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
 
    if (!empId || !password) {
      setError("Please fill in all fields");
      return;
    }
 
    try {
      // 🔍 Query Firestore for user by empId
      const q = query(collection(db, "users"), where("empId", "==", empId));
      const querySnapshot = await getDocs(q);
 
      if (querySnapshot.empty) {
        setError("Employee ID not found");
        return;
      }
 
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const email = userData.email;
 
      // 🔐 Sign in using Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
 
      // 💾 Save login state
      localStorage.setItem("isLoggedIn", "true");
 
      // 🚀 Redirect based on role
      const role = userData.role?.toLowerCase();
      switch (role) {
        case 'admin':
          navigate("/admin/dashboard");
          break;
        case 'hr':
          navigate("/dashboard");
          break;
        case 'manager':
        case 'supermanager':
        case 'tl':
        case 'employee':
          navigate("/dashboard");
          break;
        default:
          navigate("/access-denied");
      }
 
      // Optional: notify reporting manager
      const reportHierarchy = {
        222003: 111069,
        222002: 222001,
        222001: 222001,
      };
 
      const sendEmail = (to, subject, body) => {
        console.log(`Email sent to ${to} with subject: ${subject}`);
      };
 
      const handleEmployeeLogin = (empId, reportData) => {
        const reportRecipientId = reportHierarchy[empId];
        if (reportRecipientId) {
          const subject = "New Report Submission";
          const body = `Report for employee ID ${empId}: ${reportData}`;
          sendEmail(reportRecipientId, subject, body);
        } else {
          console.log("No report recipient found for this employee.");
        }
      };
 
      const reportData = "Report data for employee " + empId;
      handleEmployeeLogin(empId, reportData);
 
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials.");
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in to your account
          </p>
        </div>
 
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
 
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <label htmlFor="empId" className="sr-only">Employee ID</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="empId"
                name="empId"
                type="text"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-0 sm:text-sm"
                placeholder="Employee ID"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
              />
            </div>
 
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-500" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
          </div>
 
          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="text-sm text-orange-600 hover:text-orange-800 font-medium"
              onClick={() => navigate("/forget-password")}
            >
              Forgot Password?
            </button>
          </div>
 
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Sign in
            </button>
          </div>
 
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-orange-600 hover:text-orange-800">
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export default Login;
 
 