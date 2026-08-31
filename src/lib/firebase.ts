import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "neural-access-wnm8c",
  appId: "1:919129994505:web:7b9e35a3806def0a394fd8",
  apiKey: "AIzaSyBCW4PqhJcjzMIuX3wWxU88duLhRuhFOXY",
  authDomain: "neural-access-wnm8c.firebaseapp.com",
  storageBucket: "neural-access-wnm8c.firebasestorage.app",
  messagingSenderId: "919129994505",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
