import { getAllAlerts, updateAlert, subscribeAlerts } from "./crudAlertas.js";
import { getAllAlarmas, updateAlarma } from "./crudAlarmas.js";

// Variables globales
let grupoMarcadores = null;
let alarmaMasCercana = null;
let alarmaMasCercanaId = null;
let map;
let marker;
let intervaloAlertas = null; // Variable para controlar el intervalo

// Función para mostrar alertas
async function mostrarAlertas() {
  try {
    const alertitas = await getAllAlerts();
    return alertitas;
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    document.getElementById('alertsOutput').textContent = 'Error al obtener alertas.';
    return [];
  }
}

// Función para manejar la actualización de alertas
async function handleAlertUpdate() {
  const alertaId = document.getElementById("alerta-id2").textContent;

  if (!alertaId) {
    console.error("No se encontró el ID de la alerta.");
    alert("Error: No se encontró el ID de la alerta.");
    return;
  }

  console.log("ID de la alerta:", alertaId);

  const updates = {
    estado: false
  };

  console.log("Datos a actualizar:", updates);

  const result = await updateAlert(alertaId, updates);

  if (result) {
    console.log(`La alerta  ${alertaId} Ha sido atendida.`);
    alert(`La alerta ha sido atendida.`);
  } else {
    console.log(`Error al actualizar la alerta con ID ${alertaId}`);
    alert(`Error al atender la alerta ${alertaId}`);
  }

  if (alarmaMasCercanaId) {
    const resAlarma = await updateAlarma(alarmaMasCercanaId, { estado: false });
    if (resAlarma) {
      console.log(`Alarma más cercana (ID: ${alarmaMasCercanaId}) desactivada.`);
    } else {
      console.error(`No se pudo desactivar la alarma con ID ${alarmaMasCercanaId}.`);
    }
  } else {
    console.warn("No hay alarma más cercana para actualizar.");
  }
  location.reload();
}

// Función para cargar alertas
async function cargarAlertas() {
  const alertData = await getAllAlerts();
  const alertas = [];

  for (const id in alertData) {
    if (alertData.hasOwnProperty(id)) {
      const alerta = alertData[id];
      alertas.push({
        id: `#${alerta.id}`,
        fecha: `${alerta.date}, ${alerta.time}`,
        ubicacion: alerta.address,
        lat: alerta.latitude.toString(),
        lng: alerta.longitude.toString(),
        contacto: "Desconocido",
        telefono: "N/A"
      });
    }
  }

  // Borra contenido anterior
  const contenedor = document.getElementById("contenedor-alertas");
  contenedor.innerHTML = "";

  // Añade nuevas alertas
  alertas.forEach(alerta => {
    const tarjeta = crearTarjetaAlerta(alerta);
    contenedor.appendChild(tarjeta);
  });

  // Crea marcador solo con la primera alerta
  if (alertas.length > 0) {
    createDefaultMarker(alertas[0]);
  }
}

// Función para inicializar el mapa
function initMap(center, zoom) {
  map = L.map('map').setView(center, zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);
}

// Función para crear marcador por defecto
function createDefaultMarker(alerta) {
  const lat = parseFloat(alerta.lat);
  const lng = parseFloat(alerta.lng);
  const radarIcon = L.icon({
    iconUrl: '../assets/img/ubicacion.png',
    iconSize: [50, 50],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  mostrarAlarmas();

  if (marker) {
    marker.setLatLng([lat, lng])
      .setIcon(radarIcon)
      .setPopupContent(`Alerta ${alerta.id}<br>${alerta.ubicacion}`)
      .openPopup();
  } else {
    marker = L.marker([lat, lng], { icon: radarIcon })
      .addTo(map)
      .bindPopup(`Alerta ${alerta.id}<br>${alerta.ubicacion}`)
      .openPopup();
  }

  mostrarAlarmaMasCercana(lat, lng);
  activarAlarmaMasCercana();
}

// Función para crear tarjeta de alerta
function crearTarjetaAlerta(alerta) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "alerta";

  tarjeta.innerHTML = `
    <div class="info-card">
      <ul style="font-size:0.95em; color:#333; list-style:none; padding:0;">
        <li><b>Evento:</b>${alerta.id}</li>
        <br>
        <li><b>Fecha:</b>${alerta.fecha}</li>
        <li><b>Ubicación:</b>${alerta.ubicacion}</li>
        <div style="display:flex; justify-content:flex-end; align-items:right; gap:8px; margin-bottom:8px;">
          <button class="estado" title="Ver Evento" style="background:none; border:none; cursor:pointer; font-size:1.3em; padding:4px;">
            <svg height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </button>
        </div>
      </ul>
    </div>
  `;

  tarjeta.querySelector(".estado").addEventListener("click", () => {
    mostrarDetalle(alerta);
    pausarIntervaloPorUnMinuto(); // Pausar el intervalo cuando se hace clic
  });

  return tarjeta;
}

// Función para mostrar detalle de alerta
function mostrarDetalle(alerta) {
  document.getElementById("alerta-id2").textContent = alerta.id;
  document.getElementById("alerta-hora").textContent = alerta.fecha;
  document.getElementById("alerta-direccion").textContent = alerta.ubicacion;
  document.getElementById("alerta-coordenadas").textContent = alerta.lat + ", " + alerta.lng;
  document.getElementById("alerta-contacto").textContent = alerta.contacto;
  document.getElementById("alerta-telefono").textContent = alerta.telefono;

  const lat = parseFloat(alerta.lat);
  const lng = parseFloat(alerta.lng);

  const radarIcon = L.icon({
    iconUrl: '../assets/img/ubicacion.png',
    iconSize: [40, 40],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  map.setView([lat, lng], 18);
  marker.setLatLng([lat, lng])
    .setIcon(radarIcon)
    .setPopupContent(`Alerta ${alerta.id}<br>${alerta.ubicacion}`)
    .openPopup();

  mostrarAlarmaMasCercana(lat, lng);
}

// Función para mostrar las alarmas por consola
async function mostrarAlarmas() {
  const alarmas = await getAllAlarmas();
  console.log("Alarmas obtenidas:", alarmas);
}

// Función para calcular distancia
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Función para mostrar la alarma más cercana
async function mostrarAlarmaMasCercana(latReferencia, lonReferencia) {
  const alarmas = await getAllAlarmas();
  let distanciaMinima = Infinity;

  for (const alarma of alarmas) {
    const lat = parseFloat(alarma.lat);
    const lng = parseFloat(alarma.lng);

    if (lat !== 0 && lng !== 0) {
      const distancia = calcularDistancia(
        latReferencia,
        lonReferencia,
        lat,
        lng
      );

      if (distancia <= 10000 && distancia < distanciaMinima) {
        distanciaMinima = distancia;
        alarmaMasCercana = { ...alarma, lat, lng };
      }
    }
  }

  if (alarmaMasCercana) {
    console.log(`Alarma más cercana (ID: ${alarmaMasCercana.id}) a ${distanciaMinima.toFixed(2)} m`);
    const marcadorIcono = L.icon({
      iconUrl: '../assets/img/alarma.png',
      iconSize: [50, 50],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
      iconColor: 'red'
    });
    L.marker([alarmaMasCercana.lat, alarmaMasCercana.lng], { icon: marcadorIcono })
      .addTo(map)
      .bindPopup(`Alarma más cercana<br>Name: ${alarmaMasCercana.name}<br>${alarmaMasCercana.ubicacion}`)
      .openPopup();

    // Mostrar todas las ubicaciones excepto la alarma más cercana
    mostrarUbicacionesEnMapa(alarmaMasCercana.lat, alarmaMasCercana.lng);
  } else {
    console.log("No hay alarmas dentro de un radio de 10 km.");
    // Si no hay alarma cercana, mostrar todas las ubicaciones
    mostrarUbicacionesEnMapa();
  }
  if (!alarmaMasCercana) return;
  alarmaMasCercanaId = alarmaMasCercana.id;
}

// Función para obtener y mostrar las ubicaciones en el mapa
function mostrarUbicacionesEnMapa(latExcluida = null, lngExcluida = null) {
  getAllAlarmas().then(alarmas => {
    if (!map) return;

    grupoMarcadores = alarmas
      .filter(alarma => {
        // Verificar que la alarma tenga coordenadas válidas
        if (!alarma.lat || !alarma.lng) return false;

        // Si se pasan coordenadas para excluir, filtrar esa ubicación
        if (latExcluida !== null && lngExcluida !== null) {
          return !(parseFloat(alarma.lat) === latExcluida && parseFloat(alarma.lng) === lngExcluida);
        }

        // Si no se pasan coordenadas para excluir, mostrar todas las ubicaciones
        return true;
      })
      .map(alarma => ({
        lat: alarma.lat,
        lng: alarma.lng,
        name: alarma.name || '',
        description: alarma.description || ''
      }));

    console.log('Ubicaciones usadas en el mapa:', grupoMarcadores);

    if (map._grupoMarcadoresLayer) {
      map.removeLayer(map._grupoMarcadoresLayer);
    }

    const layerGroup = L.layerGroup();

    grupoMarcadores.forEach(ubi => {
      const marker = L.marker([parseFloat(ubi.lat), parseFloat(ubi.lng)])
        .bindPopup(`<b>${ubi.name}</b><br>${ubi.description}`);
      layerGroup.addLayer(marker);
    });

    layerGroup.addTo(map);
    map._grupoMarcadoresLayer = layerGroup;
  });
}

// Función para mostrar historial en tabla
function mostrarHistorialEnTabla() {
  const tbody = document.querySelector('#modal_historial table tbody');

  subscribeAlerts((data) => {
    tbody.innerHTML = '';

    if (!data || Object.keys(data).length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No hay datos disponibles</td></tr>';
      return;
    }

    Object.values(data).forEach((alerta) => {
      const fila = document.createElement('tr');
      const fechaHora = `${alerta.date ?? 'Sin fecha'} ${alerta.time ?? ''}`;
      const direccion = alerta.address || 'N/A';
      const coordenadas = `${alerta.latitude ?? 'N/A'}°, ${alerta.longitude ?? 'N/A'}°`;
      const contacto = alerta.contact || 'Desconocido';
      const telefono = alerta.phone || 'Desconocido';

      fila.innerHTML = `
        <td>${fechaHora}</td>
        <td>${direccion}</td>
        <td>${coordenadas}</td>
        <td>${contacto}</td>
        <td>${telefono}</td>
      `;

      tbody.appendChild(fila);
    });
  });
}

// Función para activar alarma más cercana
async function activarAlarmaMasCercana() {
  if (!alarmaMasCercanaId) {
    console.warn("No hay una alarma cercana definida.");
    return false;
  }

  const actualizacionExitosa = await updateAlarma(alarmaMasCercanaId, {
    estado: true
  });

  if (actualizacionExitosa) {
    console.log(`Alarma con ID ${alarmaMasCercanaId} activada correctamente.`);
  } else {
    console.error(`No se pudo activar la alarma con ID ${alarmaMasCercanaId}.`);
  }

  return actualizacionExitosa;
}

// Función para pausar el intervalo por un minuto
function pausarIntervaloPorUnMinuto() {
  // Limpiar el intervalo actual si existe
  if (intervaloAlertas) {
    clearInterval(intervaloAlertas);
    intervaloAlertas = null;
    console.log("Intervalo de alertas pausado por 1 minuto");
  }

  // Mostrar mensaje al usuario (opcional)
  const mensaje = document.createElement('div');
  mensaje.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff6b6b;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    z-index: 1000;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  mensaje.textContent = 'Actualización pausada por 1 minuto';
  document.body.appendChild(mensaje);

  // Remover el mensaje después de 3 segundos
  setTimeout(() => {
    if (mensaje.parentNode) {
      mensaje.parentNode.removeChild(mensaje);
    }
  }, 3000);

  // Reactivar el intervalo después de 1 minuto (60000 ms)
  setTimeout(() => {
    if (!intervaloAlertas) {
      intervaloAlertas = setInterval(cargarAlertas, 2000);
      console.log("Intervalo de alertas reactivado");

      // Mostrar mensaje de reactivación
      const mensajeReactivacion = document.createElement('div');
      mensajeReactivacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #51cf66;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      `;
      mensajeReactivacion.textContent = 'Actualización reactivada';
      document.body.appendChild(mensajeReactivacion);

      // Remover el mensaje después de 3 segundos
      setTimeout(() => {
        if (mensajeReactivacion.parentNode) {
          mensajeReactivacion.parentNode.removeChild(mensajeReactivacion);
        }
      }, 3000);
    }
  }, 60000);
}

// Función para configurar eventos del modal
function configurarModal() {
  const boton = document.getElementById("boton_historial");
  const modal = document.getElementById("modal_historial");
  const cerrar = document.getElementById("cerrar_modal");

  boton.addEventListener("click", () => {
    modal.style.display = "block";
    mostrarHistorialEnTabla();
  });

  cerrar.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

// Función para configurar eventos de alertas
function configurarEventosAlertas() {
  const alertaButton = document.getElementById("alerta-button");
  alertaButton.addEventListener("click", handleAlertUpdate);
}

// Función para cargar la barra de navegación
function cargarNavegacion() {
  fetch('Nav.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('nav-container').innerHTML = html;

      const btnCerrarSesion = document.getElementById('btnCerrarSesion');
      if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', () => {
          localStorage.removeItem("usuario911");
          window.location.href = "../../index.html";
        });
      }
    });
}

// Función principal de inicialización
function inicializarAplicacion() {
  // Cargar navegación
  cargarNavegacion();

  // Configurar eventos
  configurarEventosAlertas();
  configurarModal();

  // Inicializar mapa
  initMap([0.04103, -78.14636], 14);

  // Mostrar todas las alarmas al cargar la página
  mostrarUbicacionesEnMapa();

  // Cargar alertas iniciales
  cargarAlertas();

  // Configurar intervalo para recargar alertas
  intervaloAlertas = setInterval(cargarAlertas, 2000);
}

// Único event listener para DOMContentLoaded
document.addEventListener("DOMContentLoaded", inicializarAplicacion);
