// Modelo para recibir datos de alarma desde Firebase
class Alarma {
    constructor({ description, ip, lat, lng, name, estado, timestamp }) {
        this.description = description;
        this.name = name;
        this.ip = ip;
        this.lat = lat;
        this.lng = lng;
        this.estado = estado;
        this.timestamp = timestamp;
    }

    // Método para crear una instancia desde un objeto Firebase
    static fromFirebase(data) {
        return new Alarma({
            description: data.description || '',
            ip: data.ip || '',
            lat: typeof data.lat === 'number' ? data.lat : 0,
            lng: typeof data.lng === 'number' ? data.lng : 0,
            name: data.name || '',
            estado: typeof data.estado === 'number' ? data.estado : 0,
            timestamp: data.timestamp || ''
        });
    }
}

//Inicia el crud para las ubicaciones de las alarmas 
import { db } from "./firebaseConfig.js";
import { ref, push, set, get, update, remove, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";


// Crear una nueva alarma
export async function createAlarma(data) {
    try {
        const newAlarmaRef = push(ref(db, 'ubicaciones'));
        await set(newAlarmaRef, data);
        return newAlarmaRef.key;
    } catch (error) {
        console.error("Error creando alarma:", error);
        return null;
    }
}

// Obtener todas las alarmas
export async function getAllAlarmas() {
    try {
        const snapshot = await get(ref(db, 'ubicaciones'));
        if (snapshot.exists()) {
            const alarmasObj = snapshot.val();
            return Object.entries(alarmasObj).map(([id, alarma]) => ({ id, ...alarma }));
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error obteniendo alarmas:", error);
        return [];
    }
}


// Obtener una alarma por ID
export async function getAlarmaById(id) {
    try {
        const alarmaRef = ref(db, `ubicaciones/${id}`);
        const snapshot = await get(alarmaRef);
        if (snapshot.exists()) {
            return { id, ...snapshot.val() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error obteniendo alarma por ID:", error);
        return null;
    }
}

// Actualizar una alarma
export async function updateAlarma(id, updates) {
    try {
        const alarmaRef = ref(db, `ubicaciones/${id}`);
        await update(alarmaRef, updates);
        return true;
    } catch (error) {
        console.error("Error actualizando alarma:", error);
        return false;
    }
}

// Eliminar una alarma
export async function deleteAlarma(id) {
    try {
        const alarmaRef = ref(db, `ubicaciones/${id}`);
        await remove(alarmaRef);
        return true;
    } catch (error) {
        console.error("Error eliminando alarma:", error);
        return false;
    }
}

// Suscribirse a cambios en alarmas
export function subscribeAlarmas(callback) {
    const alarmasRef = ref(db, 'ubicaciones');
    onValue(alarmasRef, (snapshot) => {
        callback(snapshot.val());
    });
}


