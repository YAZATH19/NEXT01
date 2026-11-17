import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCR3YsZj9t2rIZ4kw6IgbAmUwxpQnVH9-Y",
  authDomain: "next01-58f77.firebaseapp.com",
  projectId: "next01-58f77",
  storageBucket: "next01-58f77.firebasestorage.app",
  messagingSenderId: "554394240242",
  appId: "1:554394240242:web:1273222a9e61f948d1fc6b",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);