// src/components/pages/Login.jsx
import React, { useState, useEffect } from "react"; // Import useEffect
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth
 
const Login = () => {
  const [email, setEmail] = useState(""); // Employee email
  const [password, setPassword] = useState(""); // Password
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // For toggling password visibility
  const navigate = useNavigate();
  const auth = getAuth(); // Initialize Firebase auth
 
  // Clear email and password on component mount
  useEffect(() => {
    setEmail("");
    setPassword("");
  }, []);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
 
    try {
      await signInWithEmailAndPassword(auth, email, password); // Sign in with email and password
      localStorage.setItem("isLoggedIn", "true"); //save login status
      navigate("/dashboard",{replace:true}); // Redirect to dashboard on success
 
      // Assuming authentication is successful
      const isAuthenticated = true; // R eplace with actual authentication check
      if (isAuthenticated) {
        // Define the hierarchy for report sending
        const reportHierarchy = {
          222003: 111069,
          222002: 222001,
          222001: 222001, // 222001 sends to themselves
        };
 
        // Function to send email
        function sendEmail(to, subject, body) {
          // ... code to send email ...
          console.log(`Email sent to ${to} with subject: ${subject}`);
        }
 
        // Function to handle employee login
        function handleEmployeeLogin(empId, reportData) {
          const reportRecipientId = reportHierarchy[empId];
          if (reportRecipientId) {
            const subject = "New Report Submission";
            const body = `Report for employee ID ${empId}: ${reportData}`;
            sendEmail(reportRecipientId, subject, body);
          } else {
            console.log("No report recipient found for this employee.");
          }
        }
 
        // Example report data (you may want to fetch this from your database)
        const reportData = "Report data for employee " + email;
 
        // Call the function to handle report sending
        handleEmployeeLogin(email, reportData);
      }
    } catch (err) {
      console.error("Login error:", err); // Log the error to the console
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
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
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
            {/* Email */}
            <div className="relative">
  <label htmlFor="email" className="sr-only">
    Email
  </label>
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
    <FaUser className="h-5 w-5 text-gray-400" />
  </div>
  <input
    id="email"
    name="email"
    type="email"
    required
    className="appearance-none rounded-t-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-0 sm:text-sm"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
 
 
            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
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
 
          {/* Forgot Password */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="text-sm text-orange-600 hover:text-orange-800 font-medium transition duration-150 ease-in-out"
              onClick={() => navigate("/forget-password")} // Redirect to the Forget Password page
            >
              Forgot Password?
            </button>
          </div>
 
          {/* Sign In Button */}
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 ease-in-out"
            >
              Sign In
            </button>
          </div>
 
          {/* Registration Link */}
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