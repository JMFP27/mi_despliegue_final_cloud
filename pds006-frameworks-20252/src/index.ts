import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api"; 
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

// 1. DETERMINACIÓN DEL PUERTO
// Se fija el puerto a 8080, ya que es el puerto obligatorio para Azure App Service.
const SERVER_PORT: number = process.env.PORT ? Number(process.env.PORT) : 8080;

// Base URL para llamadas internas. Fija a 8080 para consistencia.
const API_BASE_URL = `http://localhost:${SERVER_PORT}/api`; 

const deviceRepository = new InMemoryDeviceRepository()
const photoRepository = new new FileSystemPhotoRepository()

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

// Creación del adaptador, el cual contiene la instancia de Elysia (adapter.app)
const adapter = new ElysiaApiAdapter(
    computerService,
    deviceService,
    medicalDeviceService
)

// 2. INICIAR LA APLICACIÓN / EXPORTAR
// Para solucionar el error "WebStandard does not support listen",
// exportamos la instancia de Elysia para que el entorno de ejecución
// de Node.js pueda iniciar el servidor correctamente (usando el adaptador de Node.js).

// La aplicación se configura para escuchar el puerto 8080 antes de la exportación.
adapter.app.listen(SERVER_PORT, () => {
    // Este log de callback se sigue ejecutando una vez que el servidor se ha iniciado.
    console.log(`[Elysia] 🦊 Running at ${adapter.app.server?.hostname}:${adapter.app.server?.port}`)
    console.log(`[App] Server listening on port ${SERVER_PORT}`);
});


// Exportación final del objeto Elysia (aunque ya esté escuchando, algunos runtimes lo requieren)
// export default adapter.app;

// Nota: Dado que estás en Node.js (v22.20.0), la llamada a listen() DEBERÍA ser suficiente.
// Si el error persiste, la solución más robusta en Elysia es exportar el fetch handler:

// Desactivamos temporalmente el listen() y probamos la exportación fetch estándar de Elysia,
// que es lo que el mensaje de error sugiere: "you might want to export default Elysia.fetch instead".
export default { 
    fetch: adapter.app.fetch,
    port: SERVER_PORT
}
