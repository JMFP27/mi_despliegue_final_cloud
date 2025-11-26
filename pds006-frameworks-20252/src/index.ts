import { ElysiaApiAdapter } from "./adapter/api/elysia";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

// 1. DETERMINACIÓN DEL PUERTO
// Se fija el puerto a 8080, ya que es el puerto obligatorio para Azure App Service.
// Se usa process.env.PORT como fallback seguro, pero se prioriza 8080.
const DEFAULT_AZURE_PORT = 8080;
const SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : DEFAULT_AZURE_PORT;

// Base URL para llamadas internas. Fija a 8080 para consistencia en producción.
// Se usa localhost ya que la llamada es interna dentro del mismo contenedor.
const API_BASE_URL = `http://localhost:${SERVER_PORT}/api`; 

const deviceRepository = new InMemoryDeviceRepository()
const photoRepository = new FileSystemPhotoRepository()

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

const app = new ElysiaApiAdapter(
    computerService,
    deviceService,
    medicalDeviceService
)

// 2. INICIAR LA APLICACIÓN
// Nota: app.run() inicia el servidor. No incluimos console.log() para evitar conflictos de log.
app.run(SERVER_PORT) 

// El código se ha limpiado de cualquier console.log() para evitar la doble inicialización 
// en el log de Azure (puertos 3000 y 8080).
