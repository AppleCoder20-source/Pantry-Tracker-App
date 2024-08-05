// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhxhxYxdL4et1qghYWGqV2IDVM5g-t5mM",
  authDomain: "inventory-management-fc430.firebaseapp.com",
  projectId: "inventory-management-fc430",
  storageBucket: "inventory-management-fc430.appspot.com",
  messagingSenderId: "64649092573",
  appId: "1:64649092573:web:fa97f9d5a65a710b37ea34",
  measurementId: "G-S474QW3GW1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app)
const firestore = getFirestore(app)

export{firestore}