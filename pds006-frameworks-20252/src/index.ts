// 1. CORRECCIÓN DE IMPORTACIÓN: Se agrega '.ts' a la ruta para cumplir con el estándar ES Modules
import { ElysiaApiAdapter } from "./adapter/api/elysia.ts"; 
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
const app: ElysiaApiAdapter = new ElysiaApiAdapter(
    computerService,
    deviceService,
    medicalDeviceService
)

// 2. INICIAR LA APLICACIÓN
// FIX 1: Corregido el error de método de 'app.run(SERVER_PORT)' a 'app.listen(SERVER_PORT)'
// FIX 2: La llamada a app.listen es ahora asíncrona, aunque 'ts-node' lo maneja.
app.listen(SERVER_PORT);

// El código se ha limpiado de cualquier console.log() para evitar la doble inicialización 
// en el log de Azure (puertos 3000 y 8080).
