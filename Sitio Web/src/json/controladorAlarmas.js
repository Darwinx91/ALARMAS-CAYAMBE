import { createAlarma, subscribeAlarmas, getAlarmaById, updateAlarma, getAllAlarmas, deleteAlarma } from "./crudAlarmas.js";
let map;
let markerAlarma = null; 
let grupoMarcadores = null;
let modoSeleccionUbicacion = false; // Variable para controlar el modo de selección
let marcadorSeleccion = null; // Marcador temporal para mostrar la ubicación seleccionada

//Verificar si esta registrado antes de ingresar a la pagina
document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario911"));
  
    if (!usuario) {
      window.location.href = "../../index.html";
    }
  });
  

// Inicializar el mapa
function initMap() {
    //Ubicacion ecuador CAYAMBE
    const ecuadorLat = 0.04103;
    const ecuadorLng = -78.14636;

    // Definir capas base
    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       
    });
    const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
       
    });

    const baseLayers = {
        "OpenStreetMap": openStreetMap,
        "Satélite Esri": esriSat
    };

    map = L.map('map', { zoomControl: false, layers: [openStreetMap] }).setView([ecuadorLat, ecuadorLng], 7);

    L.control.layers(baseLayers).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    map.doubleClickZoom.disable();
    map.touchZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();

    // Agregar evento de clic para selección de ubicación
    map.on('click', function(e) {
        if (modoSeleccionUbicacion) {
            seleccionarUbicacionEnMapa(e.latlng.lat, e.latlng.lng);
        }
    });

    document.getElementById('loading').style.display = 'none';
}


window.addEventListener('load', () => {
    initMap();
    cargarYRenderizarAlarmas();
});
window.addEventListener('resize', function () {
    if (map) {
        map.invalidateSize();
    }
});



// Función para suscribirse y renderizar alarmas
function cargarYRenderizarAlarmas() {
    subscribeAlarmas(renderizarAlarmas);
}

//Funciones para el Modal de agregar ubicaciones
function openLocationModal() {
    // En lugar de abrir el modal inmediatamente, activar modo de selección
    modoSeleccionUbicacion = true; // Habilitar modo de selección
    document.body.style.cursor = 'crosshair'; // Cambiar cursor para indicar modo de selección
    // Mostrar mensaje informativo
    mostrarMensajeSeleccion();
}
window.openLocationModal = openLocationModal;

function closeLocationModal() {
    document.getElementById("locationModal").style.display = "none";
    modoSeleccionUbicacion = false; // Deshabilitar modo de selección
    document.body.style.cursor = 'default'; // Restaurar cursor
    // Limpiar marcador de selección
    if (marcadorSeleccion) {
        map.removeLayer(marcadorSeleccion);
        marcadorSeleccion = null;
    }
    // Ocultar mensaje informativo
    ocultarMensajeSeleccion();
}
window.closeLocationModal = closeLocationModal;

// Función para seleccionar ubicación en el mapa
function seleccionarUbicacionEnMapa(lat, lng) {
    // Limpiar marcador anterior si existe
    if (marcadorSeleccion) {
        map.removeLayer(marcadorSeleccion);
    }
    
    // Crear nuevo marcador en la ubicación seleccionada
    marcadorSeleccion = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'marcador-seleccion',
            html: '<div style="background-color: #ff4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    }).addTo(map);
    
    // Mostrar mensaje de confirmación
    mostrarConfirmacionSeleccion(lat, lng);
    
    // Abrir el modal después de seleccionar la ubicación
    setTimeout(() => {
        document.getElementById("locationModal").style.display = "block";
        // Llenar los campos del formulario
        document.getElementById('locationLat').value = lat.toFixed(6);
        document.getElementById('locationLng').value = lng.toFixed(6);
        // Deshabilitar modo de selección
        modoSeleccionUbicacion = false;
        document.body.style.cursor = 'default';
        ocultarMensajeSeleccion();
    }, 1000); // Pequeño delay para que el usuario vea la confirmación
}

// Función para mostrar mensaje de instrucciones
function mostrarMensajeSeleccion() {
    // Crear elemento de mensaje si no existe
    if (!document.getElementById('mensaje-seleccion')) {
        const mensaje = document.createElement('div');
        mensaje.id = 'mensaje-seleccion';
        mensaje.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #2196F3;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        mensaje.textContent = '🖱️ Haz clic en el mapa para seleccionar la ubicación y abrir el formulario';
        document.body.appendChild(mensaje);
    }
}

// Función para ocultar mensaje de instrucciones
function ocultarMensajeSeleccion() {
    const mensaje = document.getElementById('mensaje-seleccion');
    if (mensaje) {
        mensaje.remove();
    }
}

// Función para mostrar confirmación de selección
function mostrarConfirmacionSeleccion(lat, lng) {
    // Crear elemento de confirmación si no existe
    if (!document.getElementById('confirmacion-seleccion')) {
        const confirmacion = document.createElement('div');
        confirmacion.id = 'confirmacion-seleccion';
        confirmacion.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(confirmacion);
    }
    
    const confirmacion = document.getElementById('confirmacion-seleccion');
    confirmacion.textContent = `✅ Ubicación seleccionada: ${lat.toFixed(6)}, ${lng.toFixed(6)} - Abriendo formulario...`;
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
        if (confirmacion) {
            confirmacion.remove();
        }
    }, 3000);
}

function capturarDatosForm(event){
    event.preventDefault();
    const form = document.getElementById("locationForm");
    const data = new FormData(form);
    const alarma = {};
    for (let [key, value] of data.entries()) {
        alarma[key] = value;
    }
    alarma.timestamp = new Date().toISOString();
    alarma.estado = false;

    function handleAlarmaResponse(success, action) {
    const message = success 
        ? (action === 'edit' ? 'Ubicación actualizada correctamente' : 'Ubicación guardada correctamente') 
        : (action === 'edit' ? 'Error al actualizar la ubicación' : 'Error al guardar la ubicación');
    
    alert(message);
    closeLocationModal();
    form.reset();
    // Limpiar marcador de selección después de guardar
    if (marcadorSeleccion) {
        map.removeLayer(marcadorSeleccion);
        marcadorSeleccion = null;
    }
}

if (window.idAlarmaEditar) {
    // EDITAR
    updateAlarma(window.idAlarmaEditar, alarma).then((ok) => {
        handleAlarmaResponse(ok, 'edit');
        if (ok) window.idAlarmaEditar = null;
    });
} else {
    // CREAR
    createAlarma(alarma).then((id) => {
        handleAlarmaResponse(id, 'create');
    });
}

}

window.capturarDatosForm = capturarDatosForm;

// Importar Nav.html en el contenedor correspondiente
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

// Función para renderizar tarjetas de alarmas en el contenedor
function renderizarAlarmas(alarmasObj) {
    // Función para mostrar un punto en el mapa
    function mostrarPuntoEnMapa(lat, lng, popupHtml = null) {
        if (!map) return;
        if (map._grupoMarcadoresLayer) {
            map.removeLayer(map._grupoMarcadoresLayer);
        }
        if (markerAlarma) {
            map.removeLayer(markerAlarma);
        }
        markerAlarma = L.marker([lat, lng]).addTo(map);
        if (popupHtml) {
            markerAlarma.bindPopup(popupHtml).openPopup();
        }
        map.setView([lat, lng], 15);
    }

    window.abrirModalEditar = async function(id) {
        // Para editar, abrir el modal directamente sin modo de selección
        document.getElementById("locationModal").style.display = "block";
        modoSeleccionUbicacion = false; // Deshabilitar modo de selección para edición
        document.body.style.cursor = 'default';
        ocultarMensajeSeleccion();
        
        // Limpiar marcador de selección al editar
        if (marcadorSeleccion) {
            map.removeLayer(marcadorSeleccion);
            marcadorSeleccion = null;
        }
        if (typeof getAlarmaById === 'function') {
            const alarma = await getAlarmaById(id);
            if (alarma) {
                document.getElementById('locationName').value = alarma.name || '';
                document.getElementById('locationDescription').value = alarma.description || '';
                document.getElementById('locationIp').value = alarma.ip || '';
                document.getElementById('locationLat').value = alarma.lat || '';
                document.getElementById('locationLng').value = alarma.lng || '';
                window.idAlarmaEditar = id;
                console.log("ID de la alarma a editar:", id);
            }
        } else {
            console.error('No se pudo cargar la alarma');
        }
    }
// funcion para eliminar la alarma
    window.eliminarAlarma = async function(id) {
        const confirmacion = confirm("¿Estás seguro de que quieres eliminar esta alarma?");
        
        if (confirmacion) {
            if (typeof deleteAlarma === 'function') {
                try {
                    const resultado = await deleteAlarma(id);
                    if (resultado) {
                        alert("Alarma eliminada exitosamente.");
                        const alarmaElemento = document.getElementById(id);
                        if (alarmaElemento) {
                            alarmaElemento.remove(); 
                        }
                        location.reload(); 
                    } else {
                        alert("Hubo un problema al eliminar la alarma.");
                    }
                } catch (error) {
                    console.error("Error eliminando alarma:", error);
                    alert("Hubo un error al intentar eliminar la alarma.");
                }
            } else {
                console.error("La función deleteAlarma no está disponible.");
                alert("No se pudo eliminar la alarma.");
            }
        } else {
            console.log("Eliminación cancelada.");
        }
    };
    
    
    const contenedor = document.getElementById('contenedor-alarmas');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    if (!alarmasObj) return;
    Object.entries(alarmasObj).forEach(([id, alarma]) => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'info-card';
        tarjeta.innerHTML = `
            <ul style="font-size:0.95em; color:#333; list-style:none; padding:0;">
                <li><b>Nombre:</b> ${alarma.name || ''}</li>
                <li><b>Info:</b> ${alarma.description || ''}</li>
                <li><b>IP:</b> ${alarma.ip || ''}</li>
                <li><b>Fecha:</b> ${alarma.timestamp ? new Date(alarma.timestamp).toLocaleString() : ''}</li>
            </ul>
            <div style="display:flex; justify-content:flex-end; align-items:right; gap:8px; margin-bottom:8px;">
                <button title="Ver ubicación" style="background:none; border:none; cursor:pointer; font-size:1.3em; padding:4px;">
                    <svg height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" />
                    </svg>
                </button>
                <button title="Editar" style="background:none; border:none; cursor:pointer; font-size:1.3em; padding:4px;" onclick="abrirModalEditar('${id}')">
                    <svg height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                </button>
                <button title="Borrar" style="background:none; border:none; cursor:pointer; font-size:1.3em; padding:4px;" onclick="eliminarAlarma('${id}')">
                    <svg height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6v-1a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
                        <path d="M5 6h14l1 14H4L5 6z" />
                        <path d="M9 10v6" />
                        <path d="M15 10v6" />
                    </svg>
                </button>

            </div>
        `;
        // Botón "Ver ubicación"
        const verUbicacionBtn = tarjeta.querySelector('button[title="Ver ubicación"]');
        if (verUbicacionBtn) {
            verUbicacionBtn.addEventListener('click', () => {
                if (alarma.lat && alarma.lng) {
                    mostrarPuntoEnMapa(parseFloat(alarma.lat), parseFloat(alarma.lng), `<b>${alarma.name || ''}</b><br>${alarma.description || ''}`);
                } else {
                    alert('No hay coordenadas para esta alarma');
                }
            });
        }
        contenedor.appendChild(tarjeta);
    });
    
}

//Crea una funcion usando getAllAlarmas para mostrar las ubicaciones en el mapa al cargar el documento
window.addEventListener('load', () => {
    getAllAlarmas().then(alarmas => {
        if (!map) return;
        // Guardar las ubicaciones en la variable global grupoMarcadores
        grupoMarcadores = alarmas
            .filter(alarma => alarma.lat && alarma.lng)
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
});
  