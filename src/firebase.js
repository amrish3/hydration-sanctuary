import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    // PASTE YOUR CONFIG FROM FIREBASE CONSOLE HERE
    apiKey: "AIzaSyCHa8b8LJ82vIYxLl_9eF3idwaAPLfIJ0o",
    authDomain: "oursanctuary-88488.firebaseapp.com",
    projectId: "oursanctuary-88488",
    storageBucket: "oursanctuary-88488.firebasestorage.app",
    messagingSenderId: "1082931873007",
    appId: "1:1082931873007:web:e627de479da019f306c71a",
    measurementId: "G-G69XXRFVVY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);