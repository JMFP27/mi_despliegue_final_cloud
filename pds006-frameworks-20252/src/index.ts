import { ElysiaApiAdapter } from "./adapter/api/elysia";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

// 1. DETERMINACIÓN DEL PUERTO
// En Azure, process.env.PORT es '8080'. En local, es undefined, por lo que usa '3000'.
const SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Base URL para llamadas internas. Debe usar el puerto detectado (8080 en Azure, 3000 en local).
const API_BASE_URL = `http://localhost:${SERVER_PORT}/api`; 

const deviceRepository = new InMemoryDeviceRepository()
const photoRepository = new FileSystemPhotoRepository()

const computerService = new ComputerService(
    deviceRepository, 
    photoRepository, 
    // CORRECCIÓN CLAVE: Usar la URL dinámica con el SERVER_PORT determinado
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
app.run(SERVER_PORT) 

// Mensaje de confirmación del puerto
console.log(`El servidor esta corriendo en el puerto ${SERVER_PORT}.`);
// En Azure, debe mostrar 8080. Si sigue mostrando 3000, el conflicto es el problema.
