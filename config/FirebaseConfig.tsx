import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { IS_USE_STAGING_DATA } from "../src/services/Constants";

const firebaseConfig =
  IS_USE_STAGING_DATA == true
    ? // Use staging configuration
      {
        apiKey: "AIzaSyBZ_a-XOCAHVRFlCuXwnk4k15wA3zcSkL8",
        authDomain: "gaichu-stage.firebaseapp.com",
        projectId: "gaichu-stage",
        storageBucket: "gaichu-stage.firebasestorage.app",
        messagingSenderId: "355777836356",
        appId: "1:355777836356:web:253f39774b413603629311",
        measurementId: "G-XJDY6EG7PL",
      }
    : // Use production configuration
      {
        apiKey: "AIzaSyChfidRS9qQudo5LREZBonMOmFW2N6ZSlc",
        authDomain: "gaichu-fe55f.firebaseapp.com",
        projectId: "gaichu-fe55f",
        storageBucket: "gaichu-fe55f.firebasestorage.app",
        messagingSenderId: "527301771802",
        appId: "1:527301771802:web:5d43720b6b0bb3377e07a3",
        measurementId: "G-555RBQRWB1",
      };

const app = initializeApp(firebaseConfig);

const database = getFirestore(app);

export { database };
