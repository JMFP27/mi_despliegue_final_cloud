import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";
import Elysia from "elysia";

// 1. Configuración de URL y Puerto
// En este patrón, Elysia no usa la variable PORT directamente en listen,
// pero la usaremos para construir la URL base de la API.
const DEFAULT_AZURE_PORT = 8080;
const SERVER_PORT: number = process.env.PORT ? Number(process.env.PORT) : DEFAULT_AZURE_PORT;
const API_BASE_URL = `http://127.0.0.1:${SERVER_PORT}/api`;

// 2. Repositorios y Servicios (Inyección de Dependencias)
const deviceRepository = new InMemoryDeviceRepository()
const photoRepository = new FileSystemPhotoRepository()

const computerService = new ComputerService(
    deviceRepository,
    photoRepository,
    new URL(API_BASE_URL)
)

const deviceService = new DeviceService(deviceRepository)

const medicalDeviceService = new MedicalDeviceService(
    deviceRepository,
    photoRepository
)

// 3. Inicializar el Adaptador
const adapter = new ElysiaApiAdapter(
    computerService,
    deviceService,
    medicalDeviceService
)

// 4. Construir la Aplicación Elysia
const app = new Elysia()
    // Manejador de errores para depuración.
    .onError(({ error, set }) => {
        set.status = 500
        
        const err = error as Error;

        console.error("ELYISA RUNTIME ERROR:", err.name, err.message, err.stack)
        
        return {
            error: true,
            message: `Internal Server Error: ${err.name}`,
            trace: err.message
        }
    })
    // Ruta de health check.
    .get('/', () => 'PDS006 San Rafael API running OK.')
    .group('/api', (group) => group.use(adapter.app))


// 5. Patrón de Exportación Web Standard (Provoca el 504 en Azure)
// Este es el export que utiliza Vercel o Bun de forma nativa.
// Azure espera que el proceso Node.js escuche el puerto, no solo que exporte un fetch handler.
export default app
