import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWkua5fkeauCWeCXNjMG02-4Bu66Q5ILc",
  authDomain: "emp-login-3dd3c.firebaseapp.com",
  projectId: "emp-login-3dd3c",
  storageBucket: "emp-login-3dd3c.firebasestorage.app",
  messagingSenderId: "679178333432",
  appId: "1:679178333432:web:f44efc4a6b5766154c1f0d",
  measurementId: "G-YGEVWRS83Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// --- Firestore update: Assign team lead 111069 to HR 22222 ---

const tlRef = doc(db, "users", "111069");
await updateDoc(tlRef, { hrId: "22222" });

export { app, auth, db, analytics };
