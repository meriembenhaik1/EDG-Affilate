// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJICEa5I8DW5_H5IVWHN83wk6nbCB-CJQ",
  authDomain: "edg-affiliate.firebaseapp.com",
  projectId: "edg-affiliate",
  storageBucket: "edg-affiliate.firebasestorage.app",
  messagingSenderId: "905129584436",
  appId: "1:905129584436:web:bb97485ccbc06ad0302761",
  measurementId: "G-5PKB6VHDQT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (optional - only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;