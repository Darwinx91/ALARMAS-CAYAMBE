import { createUsuario } from './crudLogin.js';

// Función para manejar el registro de usuarios
function RegistroForm(formId = "registroForm") {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById(formId);

    if (!form) {
      console.error(`Formulario con ID "${formId}" no encontrado.`);
      return;
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const data = tomarDatosFormulario();
      
      // Validaciones
      if (!validarDatos(data)) {
        return;
      }

      if (data.contrasena !== data.confirmar) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      // Eliminar el campo confirmar antes de enviar
      delete data.confirmar;

      try {
        const userId = await createUsuario(data);

        if (userId) {
          alert("Usuario creado con éxito. ID: " + userId);
          form.reset();
          // Redirigir al login después del registro exitoso
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1500);
        } else {
          alert("Ocurrió un error al crear el usuario.");
        }
      } catch (error) {
        console.error("Error en el registro:", error);
        alert("Error al intentar registrar el usuario. Por favor, intente nuevamente.");
      }
    });
  });
}

// Función para tomar los datos del formulario
function tomarDatosFormulario() {
  return {
    nombre: document.getElementById("nombre").value.trim(),
    cedula: document.getElementById("cedula").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    correo: document.getElementById("correo").value.trim(),
    contrasena: document.getElementById("contrasena").value,
    confirmar: document.getElementById("confirmar").value,
    rol: document.getElementById("rol").value
  };
}

// Función para validar los datos del formulario
function validarDatos(data) {
  if (!data.nombre || data.nombre.length < 2) {
    alert("El nombre debe tener al menos 2 caracteres.");
    return false;
  }

  if (!data.cedula || data.cedula.length !== 10) {
    alert("La cédula debe tener exactamente 10 dígitos.");
    return false;
  }

  if (!data.telefono || data.telefono.length !== 10) {
    alert("El teléfono debe tener exactamente 10 dígitos.");
    return false;
  }

  if (!data.correo || !isValidEmail(data.correo)) {
    alert("Por favor, ingrese un correo electrónico válido.");
    return false;
  }

  if (!data.contrasena || data.contrasena.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return false;
  }

  if (!data.rol) {
    alert("Por favor, seleccione un rol.");
    return false;
  }

  return true;
}

// Función para validar formato de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Llamar a la función
RegistroForm(); 