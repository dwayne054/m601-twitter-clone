// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";




// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUmqpknRtpycCX6kU4ILsJZITH0hbkFNY",
  authDomain: "twitter-clone-ec696.firebaseapp.com",
  projectId: "twitter-clone-ec696",
  storageBucket: "twitter-clone-ec696.appspot.com",
  messagingSenderId: "575820873905",
  appId: "1:575820873905:web:4241070e5d18a7a11ca290",
  measurementId: "G-ZCNPLHG3XZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth }