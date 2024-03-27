// Import the Firebase core App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";

// Import Firebase Authentication
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";


// Import Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Optionally, import the Realtime Database if needed
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Import Firebase Storage
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";


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

// Initialize Firebase services
const auth = getAuth(app);
const dbFirestore = getFirestore(app);
const dbRealtime = getDatabase(app); // If using Realtime Database
// Initialize Firebase Storage
const storage = getStorage(app);
export { app, auth, dbFirestore, dbRealtime, storage }