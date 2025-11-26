import { DeviceId } from "../../../core/domain"; // Alias corregido
import { DevicePhotoRepository } from "../../../core/repository"; // Alias corregido
import * as fs from 'fs/promises'; // Módulo nativo de Node.js para manejo de archivos asíncrono
import * as path from 'path'; // Módulo nativo de Node.js para manejo de rutas

// Variables de configuración de almacenamiento y acceso público
const MEDIA_PORT = process.env.MEDIA_PORT || '8080' // Acceso a variables de entorno en Node.js
const BASE_PATH = path.join(process.cwd(), "public", "photos"); // Ruta absoluta para almacenamiento, asegurando que se crea en la raíz del proyecto
const BASE_URL = `http://localhost:${MEDIA_PORT}/photos/` // URL base asumida para servir los archivos

// Esta implementación usa las APIs estándar de Node.js (fs/promises)
export class FileSystemPhotoRepository implements DevicePhotoRepository {

  constructor() {
    // Aseguramos que el directorio de almacenamiento exista al inicializar el repositorio
    // El flag { recursive: true } permite crear directorios anidados si no existen.
    fs.mkdir(BASE_PATH, { recursive: true }).catch(err => {
      console.error("Failed to create photo storage directory:", err);
    });
  }

  async savePhoto(file: File, id: DeviceId): Promise<URL> {
    const extension = this.getFileExtension(file)
    if (!extension) {
      throw new Error("Invalid file extension: cannot save photo.");
    }

    const filename = `${id}.${extension}`
    const filePath = path.join(BASE_PATH, filename) // Construye la ruta de guardado completa

    // Convertimos el objeto File (web standard) a un Buffer de Node.js
    const buffer = Buffer.from(await file.arrayBuffer());

    // Usamos fs.writeFile de Node.js para guardar el Buffer en el disco
    await fs.writeFile(filePath, buffer)

    // Devolvemos la URL pública donde se puede acceder al archivo
    return new URL(filename, BASE_URL)
  }

  getFileExtension(file: File): string | undefined {
    const parts = file.name.split('.');

    if (parts.length > 1) {
      return parts.pop();
    }

    return undefined;
  }
}
