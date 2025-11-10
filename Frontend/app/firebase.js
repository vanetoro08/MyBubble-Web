// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3vI_Y9mYzdpW6hpR_GsBKv1b7i3ZZ8wg",
  authDomain: "mybubble-63b28.firebaseapp.com",
  projectId: "mybubble-63b28",
  storageBucket: "mybubble-63b28.firebasestorage.app",
  messagingSenderId: "465041790497",
  appId: "1:465041790497:web:e60646eafa2b9ddf80b560"
};

// Initialize Firebaseñ
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app);

console.log('firestore:',db);

