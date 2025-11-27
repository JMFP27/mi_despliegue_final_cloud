import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";
import Elysia from "elysia";

// 1. DETERMINACIÓN DEL PUERTO
const DEFAULT_AZURE_PORT = 8080;
const SERVER_PORT: number = process.env.PORT ? Number(process.env.PORT) : DEFAULT_AZURE_PORT;
// Usamos la dirección 0.0.0.0 para escuchar en todas las interfaces, estándar en la nube.
const SERVER_HOST = '0.0.0.0'; 

// Base URL para llamadas internas. Usamos 127.0.0.1 como loopback explícito.
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

// 2. CONSTRUIR Y APLICAR EL PREFIJO FINAL
const app = new Elysia()
    // Manejador de errores para depuración (con el fix de TS).
    .onError(({ error, set }) => {
        set.status = 500
        
        // Asersión de tipo para resolver errores de TypeScript (TS2339).
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

// 3. INICIAR LA APLICACIÓN DE FORMA ESTÁNDAR (Node.js mode) usando .listen()
// Esto garantiza que el proceso del servidor se mantenga activo en el puerto.
app.listen({ 
    port: SERVER_PORT,
    hostname: SERVER_HOST 
}, () => {
    // Logs para confirmar el inicio.
    console.log(`[Elysia] 🦊 Running compatible on Node.js at http://${SERVER_HOST}:${SERVER_PORT}`)
    console.log(`[App] Server listening on port ${SERVER_PORT}`);
});
