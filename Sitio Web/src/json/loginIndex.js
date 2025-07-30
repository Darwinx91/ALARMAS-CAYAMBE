import { Login } from './crudLogin.js';

// Función para manejar el login
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

      if (!correo || !contrasena) {
        alert("Por favor, complete todos los campos.");
        return;
      }

      try {
        const usuario = await Login(correo, contrasena);

        if (usuario) {
          localStorage.setItem("usuario911", JSON.stringify(usuario));
          window.location.href = "src/html/vistaInsidencias.html";
        } else {
          alert("Correo o contraseña incorrectos.");
        }
      } catch (error) {
        console.error("Error en el login:", error);
        alert("Error al intentar iniciar sesión. Por favor, intente nuevamente.");
      }
    });
  });
}

// Llamar a la función
Loginform(); 