import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { firebaseConfig } from "/json/firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export function guardarUbicacionESP32({ ip, name, lat, lng }) {
  const nombreKey = name.replace(/\s+/g, "_"); // limpia espacios
  return set(ref(db, "dispositivos/" + nombreKey), {
    ip,
    name,
    lat,
    lng,
    timestamp: Date.now()
  });
}
