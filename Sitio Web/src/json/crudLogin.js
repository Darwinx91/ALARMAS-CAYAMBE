// Importaciones Firebase
import { db } from "../json/firebaseConfig.js";
import {
    ref,
    push,
    set,
    get,
    update,
    remove,
    onValue
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// 📦 MODELO DE USUARIO
class Usuario {
    constructor({ nombre, cedula, telefono, correo, contrasena, rol }) {
        this.nombre = nombre;
        this.cedula = cedula;
        this.telefono = telefono;
        this.correo = correo;
        this.contrasena = contrasena;
        this.rol = rol;
    }

    // Crea una instancia desde un objeto obtenido de Firebase
    static fromFirebase(data) {
        return new Usuario({
            nombre: data.nombre || '',
            cedula: data.cedula || '',
            telefono: data.telefono || '',
            correo: data.correo || '',
            contrasena: data.contrasena || '',
            rol: data.rol || ''
        });
    }
}

// Referencia a la colección
const usuariosRef = ref(db, 'usuario911');


// ➕ Crear un nuevo usuario
export async function createUsuario(data) {
    try {
        const newUsuario = new Usuario(data);
        const newRef = push(usuariosRef);
        await set(newRef, newUsuario);
        return newRef.key;
    } catch (error) {
        console.error("Error creando usuario:", error);
        return null;
    }
}

// 📥 Obtener todos los usuarios
export async function getAllUsuarios() {
    try {
        const snapshot = await get(usuariosRef);
        if (snapshot.exists()) {
            const usuariosObj = snapshot.val();
            return Object.entries(usuariosObj).map(([id, usuario]) => ({
                id,
                ...Usuario.fromFirebase(usuario)
            }));
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error obteniendo usuarios:", error);
        return [];
    }
}

// 🔍 Obtener un usuario por ID
export async function getUsuarioById(id) {
    try {
        const usuarioRef = ref(db, `usuario911/${id}`);
        const snapshot = await get(usuarioRef);
        if (snapshot.exists()) {
            return {
                id,
                ...Usuario.fromFirebase(snapshot.val())
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error obteniendo usuario:", error);
        return null;
    }
}

// ✏️ Actualizar usuario
export async function updateUsuario(id, updates) {
    try {
        const usuarioRef = ref(db, `usuario911/${id}`);
        await update(usuarioRef, updates);
        return true;
    } catch (error) {
        console.error("Error actualizando usuario:", error);
        return false;
    }
}

// 🗑️ Eliminar usuario
export async function deleteUsuario(id) {
    try {
        const usuarioRef = ref(db, `usuario911/${id}`);
        await remove(usuarioRef);
        return true;
    } catch (error) {
        console.error("Error eliminando usuario:", error);
        return false;
    }
}

// 📡 Escuchar cambios en tiempo real
export function subscribeUsuarios(callback) {
    onValue(usuariosRef, (snapshot) => {
        const data = snapshot.val() || {};
        const usuarios = Object.entries(data).map(([id, usuario]) => ({
            id,
            ...Usuario.fromFirebase(usuario)
        }));
        callback(usuarios);
    });
}

export async function Login(correo, contrasena) {
    try {
        const usuariosRef = ref(db, "usuario911");
        const snapshot = await get(usuariosRef);

        if (!snapshot.exists()) {
            return null;
        }

        const usuarios = snapshot.val();

        for (const id in usuarios) {
            const user = Usuario.fromFirebase(usuarios[id]);
            if (user.correo === correo && user.contrasena === contrasena) {
                return {
                    id,
                    ...user
                };
            }
        }

        return null; // No se encontró coincidencia
    } catch (error) {
        console.error("Error buscando usuario por credenciales:", error);
        return null;
    }
}

export { Usuario };
