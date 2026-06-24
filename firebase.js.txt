import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAdNNEoLtJUHayFl7Idb7jGeTM5wJTnUGI",
  authDomain: "contratos-sgi.firebaseapp.com",
  projectId: "contratos-sgi",
  storageBucket: "contratos-sgi.firebasestorage.app",
  messagingSenderId: "138901908863",
  appId: "1:138901908863:web:a5ee4a985a63d80d943e4a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);