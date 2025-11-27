import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";
import Elysia from "elysia";

// 1. DETERMINACIÓN DEL PUERTO
const DEFAULT_AZURE_PORT = 8080;
const SERVER_PORT: number = process.env.PORT ? Number(process.env.PORT) : DEFAULT_AZURE_PORT;
// Utilizamos la dirección 0.0.0.0 para que el servidor escuche en todas las interfaces,
// lo cual es estándar para el despliegue en entornos cloud como Azure.
const SERVER_HOST = '0.0.0.0'; 

// Base URL para llamadas internas. Usamos 127.0.0.1 como loopback explícito en lugar de localhost.
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
    // AÑADIDO: Manejador de errores para depuración. Captura errores de runtime y los registra.
    .onError(({ error, set }) => {
        set.status = 500
        console.error("ELYISA RUNTIME ERROR:", error.name, error.message, error.stack)
        
        // El error de App Insights a menudo causa esto. Devolvemos un 500 amigable.
        return {
            error: true,
            message: `Internal Server Error: ${error.name}`,
            trace: error.message
        }
    })
    // FIX CLAVE: Añadir una ruta raíz (/) para el health check y el puerto de entrada.
    // Esto asegura que Azure reciba un 200 OK y no interprete el 404 como un fallo de servidor.
    .get('/', () => 'PDS006 San Rafael API running OK.')
    .group('/api', (group) => group.use(adapter.app))

// 3. INICIAR LA APLICACIÓN DE FORMA ESTÁNDAR CON ELYSIA Y NODE.JS

app.listen({ 
    port: SERVER_PORT,
    hostname: SERVER_HOST 
}, () => {
    // Añadimos logs para confirmar el inicio.
    console.log(`[Elysia] 🦊 Running compatible on Node.js at http://${SERVER_HOST}:${SERVER_PORT}`)
    console.log(`[App] Server listening on port ${SERVER_PORT}`);
});
