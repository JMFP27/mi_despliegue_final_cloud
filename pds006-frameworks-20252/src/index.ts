import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";
import Elysia from "elysia";

// 1. DETERMINACIÓN DEL PUERTO (El puerto sigue siendo útil para construir la URL interna,
// aunque no se usará en .listen()).
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

// 3. CAMBIO CRÍTICO: MODO WEB STANDARD CON KEEP-ALIVE
// Azure espera que exportemos el objeto de la aplicación (Web-Standard/fetch API).
// Esto hace que el proceso de Node.js se cierre inmediatamente después de la exportación.
// Para evitar el cierre del proceso (y el 504), inicializamos un temporizador de "Keep-Alive".
console.log(`[App] Running in Azure WebStandard mode. Keeping process alive with setInterval.`);

// Este temporizador evita que el proceso Node.js muera, ya que Elysia no ha usado .listen().
// Se ejecutará cada 10 minutos (600,000 ms) para evitar problemas de optimización.
setInterval(() => {
    // Si necesitas un chequeo de salud interno, agrégalo aquí.
    // console.log("[App] Keep-Alive tick.");
}, 600000); 

// Exportamos el objeto de la aplicación, como lo exige el mensaje de error anterior.
export default app;
