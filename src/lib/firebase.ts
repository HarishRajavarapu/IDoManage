import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";

// Loaded from /firebase-applet-config.json configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiEGx_ercpNBly6YIlcZuSCh_iPChTa_8",
  authDomain: "gen-lang-client-0161937931.firebaseapp.com",
  projectId: "gen-lang-client-0161937931",
  storageBucket: "gen-lang-client-0161937931.firebasestorage.app",
  messagingSenderId: "1049556592693",
  appId: "1:1049556592693:web:63a9cd788f150a9681a97c"
};

const app = initializeApp(firebaseConfig);

// Explicitly use the Firestore Database ID from metadata instructions
export const db = getFirestore(app, "ai-studio-75190510-99f8-448c-b13b-a7d60d904676");
export const auth = getAuth(app);

// Basic Google Auth Provider (Standard profile & email scopes - ZERO unverified warnings)
export const googleProvider = new GoogleAuthProvider();

// Advanced Google Workspace Auth Provider (Contains sensitive scopes, used optionally inside the app)
export const workspaceProvider = new GoogleAuthProvider();
workspaceProvider.addScope("https://www.googleapis.com/auth/calendar");
workspaceProvider.addScope("https://www.googleapis.com/auth/gmail.readonly");
workspaceProvider.addScope("https://www.googleapis.com/auth/gmail.send");
workspaceProvider.addScope("https://www.googleapis.com/auth/drive.readonly");
workspaceProvider.addScope("https://www.googleapis.com/auth/drive.file");

export {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
};
export type { User };
