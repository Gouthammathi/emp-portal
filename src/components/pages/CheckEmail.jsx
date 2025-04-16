// src/components/pages/CheckEmail.jsx
import React, { useState } from "react";
import { getAuth, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Import Firestore
import { db } from "../../firebase"; // Adjust the path as necessary

const CheckEmail = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      // Check if the email exists in Firebase Authentication
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length === 0) {
        // Email does NOT exist
        setError("This email is not registered in our system. Please contact HR or your administrator.");
      } else {
        // Email exists, attempt to sign in with a default password
        const defaultPassword = "yourDefaultPassword"; // Replace with your logic for default password
        await signInWithEmailAndPassword(auth, email, defaultPassword);
        
        // Check Firestore for user profile
        const user = auth.currentUser;
        const userDoc = await getDoc(doc(db, "employees", user.uid)); // Assuming uid is used as the document ID
        if (userDoc.exists()) {
          // Profile exists, redirect to login page
          navigate("/login");
        } else {
          // Profile does NOT exist, redirect to set new password page
          navigate("/setnewpassword");
        }
      }
    } catch (err) {
      console.error("Login error:", err); // Log the error to the console
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please enter your company-registered email address to continue.
        </p>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-600">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckEmail;