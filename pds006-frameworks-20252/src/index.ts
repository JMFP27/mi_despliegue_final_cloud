import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";
import Elysia from "elysia";

// 1. DETERMINACIÓN DEL PUERTO
const DEFAULT_AZURE_PORT = 8080;
const SERVER_PORT: number = process.env.PORT ? Number(process.env.PORT) : DEFAULT_AZURE_PORT;
const API_BASE_URL = `http://127.0.0.1:${SERVER_PORT}/api`;

const deviceRepository = new InMemoryDeviceRepository()
const photoRepository = new FileSystemPhotoRepository()

// Inyección de dependencias para los servicios
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

// Inicializamos el adaptador que solo contiene las rutas sin prefijo
const adapter = new ElysiaApiAdapter(
    computerService,
    deviceService,
    medicalDeviceService
)

// 2. CONSTRUIR LA APLICACIÓN
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

// 3. SOLUCIÓN FINAL: EXPORTAR EL HANDLER DE FETCH EXPLÍCITAMENTE
// Azure espera una función de manejo (handler) compatible con la API de Fetch, 
// no la instancia de Elysia directamente. Esto debería resolver el problema de 
// inicialización y el 504.
console.log(`[App] Exporting explicit fetch handler for Azure compatibility.`);

export default {
    fetch: app.fetch
}
