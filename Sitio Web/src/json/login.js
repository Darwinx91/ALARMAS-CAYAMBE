import { createUsuario, Login } from './crudLogin.js';

const registroBtn = document.getElementById("Registro");
const registroContainer = document.getElementById("registroContainer");
const cerrarRegistro = document.getElementById("cerrarRegistro");

// Función para Mostrar el Modal de Registro
registroBtn.addEventListener("click", () => {
  if (registroContainer.style.display === "none" || registroContainer.style.display === "") {
    registroContainer.style.display = "block";
  } else {
    registroContainer.style.display = "none";
  }
});

cerrarRegistro.addEventListener("click", () => {
    registroContainer.style.display = "none";
});

//Funciones para crear un usuario
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registroForm");
    
    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const data = tomarDatosFormulario();
        
        if (data.contrasena !== data.confirmar) {
            alert("Las contraseñas no coinciden.");
            return;
        }
        delete data.confirmar;

        const userId = await createUsuario(data);

        if (userId) {
            alert("Usuario creado con éxito. ID: " + userId);
            form.reset();
        } else {
            alert("Ocurrió un error al crear el usuario.");
        }
    });
});

//Funcion para tomar los datos del formulario
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

function Loginform(formId = "loginForm") {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById(formId);

    if (!form) {
      console.error(`Formulario con ID "${formId}" no encontrado.`);
      return;
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const correo = document.getElementById("email").value.trim();
      const contrasena = document.getElementById("password").value;

      const usuario = await Login(correo, contrasena);

      if (usuario) {
        localStorage.setItem("usuario911", JSON.stringify(usuario));
        window.location.href = "src/html/vistaInsidencias.html";
      } else {
        alert("Correo o contraseña incorrectos.");
      }
    });
  });
}

// Llamar a la función
Loginform();

