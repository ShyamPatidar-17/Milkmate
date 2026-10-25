// config/firebase.js
import dotenv from "dotenv";
dotenv.config();

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyC-Vy21J19GIeNPaEn6y5hF36wDPL6fcsA",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "milkmate-7ee57.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "milkmate-7ee57",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "milkmate-7ee57.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "421497787311",
  appId: process.env.FIREBASE_APP_ID || "1:421497787311:web:688f639bda9c2691b7d55a",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-RJ0JGJKV8G"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

console.log("🔥 Firebase Firestore initialized for project:", firebaseConfig.projectId);

export { app, db, firebaseConfig };
export default { app, db, firebaseConfig };
