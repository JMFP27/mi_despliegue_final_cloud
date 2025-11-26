import { ElysiaApiAdapter } from "./adapter/api/elysia";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

// 1. LECTURA DEL PUERTO DE AZURE
// Azure App Service requiere que la aplicación escuche en el puerto definido por la variable de entorno PORT (8080).
// CORRECCIÓN CLAVE: Cambiamos el puerto de reserva (fallback) de 3000 a 8080.
// Si la variable PORT existe (como en Azure), se usa. Si no existe, usamos 8080.
const SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

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

// 2. INICIAR LA APLICACIÓN USANDO EL PUERTO CORREGIDO
// Se pasa el puerto como argumento al método run.
app.run(SERVER_PORT) 

// Mensaje de confirmación del puerto
console.log(`El servidor esta corriendo en el puerto ${SERVER_PORT}.`);
// Después de este cambio y un nuevo despliegue, el log DEBERÍA mostrar:
// "El servidor esta corriendo en el puerto 8080."
