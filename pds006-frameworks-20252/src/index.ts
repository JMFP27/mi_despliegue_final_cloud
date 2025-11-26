import { ElysiaApiAdapter } from "./adapter/api/elysia";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

// 1. LECTURA DEL PUERTO DE AZURE
// Azure App Service requiere que la aplicación escuche en el puerto definido por la variable de entorno PORT (8080).
// Fallback Revertido: Usaremos 3000 como puerto de reserva (fallback) para el desarrollo local.
const SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const deviceRepository = new InMemoryDeviceRepository()
const photoRepository = new FileSystemPhotoRepository()

const computerService = new ComputerService(
    deviceRepository, 
    photoRepository, 
    // NOTA: Esta URL de localhost podría necesitar ajustarse a una variable de entorno (API_BASE_URL)
    // si esta es una llamada real a otro servicio, pero por ahora se mantiene.
    new URL("http://localhost:3000/api")
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

// 2. INICIAR LA APLICACIÓN USANDO EL PUERTO LEÍDO.
// Se pasa el puerto como argumento al método run.
app.run(SERVER_PORT) 

// Mensaje de confirmación del puerto
console.log(`El servidor esta corriendo en el puerto ${SERVER_PORT}.`);
// Después de este cambio y un nuevo despliegue, el log en Azure DEBERÍA mostrar:
// "El servidor esta corriendo en el puerto 8080." (porque process.env.PORT es 8080)
