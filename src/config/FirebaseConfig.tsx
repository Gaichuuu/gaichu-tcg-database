import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyChfidRS9qQudo5LREZBonMOmFW2N6ZSlc",
    authDomain: "gaichu-fe55f.firebaseapp.com",
    projectId: "gaichu-fe55f",
    storageBucket: "gaichu-fe55f.firebasestorage.app",
    messagingSenderId: "527301771802",
    appId: "1:527301771802:web:5d43720b6b0bb3377e07a3",
    measurementId: "G-555RBQRWB1"
};

const app = initializeApp(firebaseConfig);

const database = getFirestore(app);

export { database };
