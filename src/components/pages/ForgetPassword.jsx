// src/components/pages/ForgetPassword.jsx
import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth"; // Import Firebase auth
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(); // Initialize Firebase auth

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email); // Send password reset email
      setSuccess("Password reset email sent! Please check your inbox.");
      setError(""); // Clear any previous error
    } catch (err) {
      console.error("Error sending password reset email:", err);
      setError("Failed to send password reset email. Please try again.");
      setSuccess(""); // Clear any previous success message
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset Your Password
        </h2>
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 ease-in-out"
          >
            Send Reset Link
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Remembered your password?{" "}
            <Link to="/" className="text-orange-600 hover:text-orange-800">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;