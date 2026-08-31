import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCKLurB1ouMd6Ji-85wSfwrX6geceGwL8s",
  authDomain: "shivjyot-mandal.firebaseapp.com",
  projectId: "shivjyot-mandal",
  storageBucket: "shivjyot-mandal.firebasestorage.app",
  messagingSenderId: "966143718041",
  appId: "1:966143718041:web:23a252f7b3faec01c37e08",
  measurementId: "G-3JVCLRQ3JL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
