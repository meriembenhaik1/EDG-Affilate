// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);