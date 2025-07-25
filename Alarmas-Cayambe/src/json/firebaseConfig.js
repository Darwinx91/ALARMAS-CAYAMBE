// src/json/firebaseConfig.js

// Importar Firebase desde la CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAsG8KqXW8-kyEgKfoFmHRD9SLcsplXXEg",
  authDomain: "alarmasmart-204e2.firebaseapp.com",
  databaseURL: "https://alarmasmart-204e2-default-rtdb.firebaseio.com",
  projectId: "alarmasmart-204e2",
  storageBucket: "alarmasmart-204e2.firebasestorage.app",
  messagingSenderId: "949843163488",
  appId: "1:949843163488:web:331c275413ad01250dc605",
  measurementId: "G-3F4M51TM9H"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

export { app, analytics, auth, db };
