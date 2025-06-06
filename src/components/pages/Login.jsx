import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import artihcusLogo from '../../assets/artihcus-logo1.svg';
 
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
      // 🔍 Query Firestore for user by empId or clientId
      const q = query(collection(db, "users"), where("empId", "==", empId));
      let querySnapshot = await getDocs(q);
 
      // If no user found by empId, try searching by clientId
      if (querySnapshot.empty) {
        const clientQ = query(collection(db, "users"), where("clientId", "==", empId));
        querySnapshot = await getDocs(clientQ);
      }
 
      if (querySnapshot.empty) {
        setError("Invalid Employee ID or Client ID");
        return;
      }
 
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const email = userData.email;
 
      // 🔐 Sign in using Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
 
      // 💾 Save login state and user data
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", userData.role);
      localStorage.setItem("userId", userDoc.id);
      localStorage.setItem("userInfo", JSON.stringify({
        name: `${userData.firstName} ${userData.lastName}`,
        empId: userData.empId,
        clientId: userData.clientId,
        role: userData.role
      }));
 
      // 🚀 Redirect based on role
      const role = userData.role?.toLowerCase();
      switch (role) {
        case 'admin':
          navigate("/admin/dashboard");
          break;
        case 'c-suite':
          navigate("/csuite");
          break;
        case 'hr':
        case 'manager':
        case 'supermanager':
        case 'tl':
        case 'employee':
        case 'client':
          navigate("/dashboard");
          break;
        default:
          navigate("/access-denied");
      }
 
      // Optional: notify reporting manager
      
 
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
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back!
            </h2>
            <p className="text-gray-600 mb-8">
              Simplify your workflow and boost your productivity<br />
              with Artihcus. <span className="text-orange-500 font-medium">Get started .</span>
            </p>
          </div>
 
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
 
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                id="empId"
                name="empId"
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Employee ID or Client ID"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
              />
            </div>
 
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
 
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-800"
                onClick={() => navigate("/forget-password")}
              >
                Forgot Password?
              </button>
            </div>
 
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-full font-medium hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
            >
              Login
            </button>
          </form>
 
          {/* <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Not a member?{" "}
              <Link to="/register" className="text-orange-500 hover:text-orange-600 font-medium">
                Register now
              </Link>
            </p>
          </div> */}
        </div>
      </div>
 
      {/* Right side - Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 relative overflow-hidden">
        <div className="relative z-10 text-center">
          {/* Main illustration - person meditating */}
          <div className="relative inline-block mb-8">
            {/* Decorative elements around the person */}
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-orange-200 rounded-full opacity-60"></div>
            <div className="absolute -top-4 -right-12 w-12 h-12 bg-orange-300 rounded-full opacity-40"></div>
            <div className="absolute -bottom-6 -left-16 w-20 h-20 bg-orange-200 rounded-full opacity-50"></div>
           
            {/* Person illustration placeholder */}
            <div className="w-80 h-80 bg-orange-200 rounded-full flex items-center justify-center">
              <div className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
 
            {/* Floating avatars */}
            <div className="absolute -top-12 left-12 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
            </div>
            <div className="absolute top-16 -right-8 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
            </div>
            <div className="absolute bottom-12 -left-8 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
            </div>
          </div>
 
          {/* Task card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg max-w-xs mx-auto mb-8">
            <div className="flex items-center justify-center h-20">
              <img
                src={artihcusLogo}
                alt="Artihcus Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
 
          {/* Bottom text */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Make your work easier and organized<br />
              with <span className="text-orange-500">Artihcus</span>
            </h3>
          </div>
        </div>
 
        {/* Background decorative dots */}
       
      </div>
    </div>
  );
};
 
export default Login;