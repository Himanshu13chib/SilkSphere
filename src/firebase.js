import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace this with your actual Firebase config!
// You can find this in your Firebase Console -> Project Settings -> General -> Your apps (Web App)
const firebaseConfig = {
  apiKey: "AIzaSyDkJ4j-EaSBgvE1e5VT5VABrdqXgh8c3GQ",
  authDomain: "silksphere-34f61.firebaseapp.com",
  databaseURL: "https://silksphere-34f61-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "silksphere-34f61",
  storageBucket: "silksphere-34f61.firebasestorage.app",
  messagingSenderId: "256905302208",
  appId: "1:256905302208:web:5822cccf1f05f4648b9d25",
  measurementId: "G-ZP05X16KCT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth to use across the app
export const db = getFirestore(app);
export const auth = getAuth(app);
