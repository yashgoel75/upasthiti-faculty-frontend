import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDJ6cDtt4Qj5QVNEumymf22m8dVckrP94g",
  authDomain: "upasthiti-faculty.firebaseapp.com",
  projectId: "upasthiti-faculty",
  storageBucket: "upasthiti-faculty.firebasestorage.app",
  messagingSenderId: "289620425868",
  appId: "1:289620425868:web:e1ae85b31f2edd50b54fa9",
  measurementId: "G-JJFZL1V8N6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {auth}