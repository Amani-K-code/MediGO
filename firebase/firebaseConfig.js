//Initialization: Firebase App
import { initializeApp } from "firebase/app";
//Authentication
import { getAuth } from "firebase/auth";
//Firestore DB
import { getFirestore } from "firebase/firestore";
//Storage
import { getStorage } from "firebase/storage";

//Config
const firebaseConfig = {
  apiKey: "AIzaSyD96uwjq-zhAIr-q9yKE5Oa2HqBiAqJx4U",
  authDomain: "medigo-26d33.firebaseapp.com",
  projectId: "medigo-26d33",
  storageBucket: "medigo-26d33.firebasestorage.app",
  messagingSenderId: "224108682927",
  appId: "1:224108682927:web:958e28c99477bd01d7be5a",
  measurementId: "G-GDXL2D5VJ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Authentication service
export const auth = getAuth(app);

//Firestore service
export const db = getFirestore(app);

//Storage services
export const storage = getStorage(app);

