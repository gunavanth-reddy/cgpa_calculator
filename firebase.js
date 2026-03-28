// Import Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your config (you already have this ✅)
const firebaseConfig = {
  apiKey: "AIzaSyBPs69ENZsPxGlUmFx1NYClLwMjlV2LmhU",
  authDomain: "cgpa-calulator.firebaseapp.com",
  projectId: "cgpa-calulator",
  storageBucket: "cgpa-calulator.firebasestorage.app",
  messagingSenderId: "235823047984",
  appId: "1:235823047984:web:a06ac3950da5cba82b94f5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ ADD THIS (IMPORTANT)
export const db = getFirestore(app);