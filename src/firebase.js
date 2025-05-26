import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAWkua5fkeauCWeCXNjMG02-4Bu66Q5ILc",
  authDomain: "emp-login-3dd3c.firebaseapp.com",
  projectId: "emp-login-3dd3c",
  storageBucket: "emp-login-3dd3c.appspot.com",
  messagingSenderId: "679178333432",
  appId: "1:679178333432:web:f44efc4a6b5766154c1f0d",
  measurementId: "G-YGEVWRS83Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, auth, db, storage, analytics };
