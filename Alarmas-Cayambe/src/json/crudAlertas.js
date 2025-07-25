// src/services/alertsService.js

import { ref, push, set, onValue, update, remove, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { db } from "./firebaseConfig.js";

// Ruta base para alerts
const alertsRef = ref(db, 'alerts');

/**
 * Crear una nueva alerta
 * @param {Object} alertData 
 * @returns {Promise<string|null>}
 */
export async function createAlert(alertData) {
  try {
    const newAlertRef = push(alertsRef);
    await set(newAlertRef, alertData);
    console.log("Alerta creada con ID:", newAlertRef.key);
    return newAlertRef.key;
  } catch (error) {
    console.error("Error creando alerta:", error);
    return null;
  }
}

export async function getAllAlerts() {
  try {
    const snapshot = await get(alertsRef);
    if (snapshot.exists()) {
      const alerts = snapshot.val();

      // Convertir a array con id y datos
      const alertsWithId = Object.entries(alerts)
        .map(([id, alerta]) => ({
          id: id,
          ...alerta
        }))
        // Filtrar las alertas donde estado no sea false
        .filter(alerta => alerta.estado !== false);

      // Invertir el orden
      const invertedAlerts = alertsWithId.reverse();

      console.log("Alertas obtenidas (filtradas e invertidas):", JSON.stringify(invertedAlerts, null, 2));

      return invertedAlerts;
    } else {
      console.log("No hay alertas disponibles");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo alertas:", error);
    return null;
  }
}


export async function getLatest10Alerts() {
  try {
    const snapshot = await get(alertsRef);
    if (snapshot.exists()) {
      const alertsObj = snapshot.val();
      
      const alertsArray = Object.entries(alertsObj).map(([id, alert]) => ({
        id,
        ...alert,
      }));
      
      alertsArray.sort((a, b) => b.timestamp - a.timestamp);
      
      const latest10 = alertsArray.slice(0, 10);
      
      console.log("Últimas 10 alertas:", latest10);
      return latest10;
    } else {
      console.log("No hay alertas disponibles");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo alertas:", error);
    return null;
  }
}


/**
 * Escuchar cambios en todas las alertas (leer en tiempo real)
 * @param {function(Object):void} callback
 */
export function subscribeAlerts(callback) {
  try {
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Datos de alertas actualizados:", data);
      callback(data);
    });
  } catch (error) {
    console.error("Error suscribiendo a alertas:", error);
  }
}

/**
 * Actualizar el estado de una alerta
 * @param {string} alertId
 * @param {Object} updates
 * @returns {Promise<boolean>}
 */
// Elimina solo el numeral (#) inicial si existe
function limpiarIdFirebase(id) {
  return id.replace(/^#/, '');
}

export async function updateAlert(alertId, updates) {
  try {
    const idLimpio = limpiarIdFirebase(alertId); // solo quita el #
    const alertToUpdateRef = ref(db, `alerts/${idLimpio}`);

    const updateData = {
      estado: updates.estado !== undefined ? updates.estado : false
    };

    await update(alertToUpdateRef, updateData);

    console.log(`Alerta ${idLimpio} actualizada con estado:`, updates.estado);
    return true;
  } catch (error) {
    console.error(`Error actualizando alerta ${alertId}:`, error);
    return false;
  }
}

/**
 * Eliminar una alerta
 * @param {string} alertId 
 * @returns {Promise<boolean>}
 */
export async function deleteAlert(alertId) {
  try {
    const idLimpio = limpiarIdFirebase(alertId);
    const alertToDeleteRef = ref(db, `alerts/${idLimpio}`);
    await remove(alertToDeleteRef);
    console.log(`Alerta ${alertId} eliminada`);
    return true;
  } catch (error) {
    console.error(`Error eliminando alerta ${alertId}:`, error);
    return false;
  }
}
