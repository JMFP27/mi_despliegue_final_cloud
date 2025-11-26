// 1. CORRECCIÓN DE IMPORTACIÓN FINAL: Cambiamos la extensión a .ts para que ts-node resuelva correctamente el archivo fuente.
// La ruta es: "./adapter/api/elysia/elysia.api.ts"
import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api"; 
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

// 1. DETERMINACIÓN DEL PUERTO
// Se fija el puerto a 8080, ya que es el puerto obligatorio para Azure App Service.
// Se usa process.env.PORT como fallback seguro, pero se prioriza 8080.
const DEFAULT_AZURE_PORT = 8080;
// Se asegura que SERVER_PORT sea un número
const SERVER_PORT: number = process.env.PORT ? Number(process.env.PORT) : DEFAULT_AZURE_PORT;

// Base URL para llamadas internas. Fija a 8080 para consistencia en producción.
// Se usa localhost ya que la llamada es interna dentro del mismo contenedor.
const API_BASE_URL = `http://localhost:${SERVER_PORT}/api`; 

const deviceRepository = new InMemoryDeviceRepository()
const photoRepository = new FileSystemPhotoRepository()

// Inyección de dependencias para los servicios
const computerService = new ComputerService(
    deviceRepository, 
    photoRepository, 
    // Usar la URL dinámica con el SERVER_PORT determinado
    new URL(API_BASE_URL)
)

const deviceService = new DeviceService(deviceRepository)

const medicalDeviceService = new MedicalDeviceService(
    deviceRepository,
    photoRepository
)

// Añadimos el tipado explícito para forzar al compilador a usar la definición correcta
// FIX: Se renombra a 'adapter' y se usa el patrón correcto para iniciar Elysia.
const adapter: ElysiaApiAdapter = new ElysiaApiAdapter(
    computerService,
    deviceService,
    medicalDeviceService
)

// 2. INICIAR LA APLICACIÓN
// FIX: Cambiamos 'app.run(SERVER_PORT)' a 'adapter.app.listen(SERVER_PORT)'.
// Esto evita el error TS2339 y el error de tiempo de ejecución de WebStandard.
adapter.app.listen(SERVER_PORT, () => {
    // Añadimos logs para confirmar el inicio.
    console.log(`[Elysia] 🦊 Running at ${adapter.app.server?.hostname}:${adapter.app.server?.port}`)
    console.log(`[App] Server listening on port ${SERVER_PORT}`);
});

// El código se ha limpiado de cualquier console.log() para evitar la doble inicialización 
// en el log de Azure (puertos 3000 y 8080).
