import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";
import Elysia from "elysia";

// Determinación del puerto para la URL base (necesario para ComputerService),
// pero ya NO se usa para la función .listen().
const DEFAULT_AZURE_PORT = 8080;
const SERVER_PORT: number = process.env.PORT ? Number(process.env.PORT) : DEFAULT_AZURE_PORT;

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

// CONSTRUIR Y APLICAR EL PREFIJO FINAL
const app = new Elysia()
    // Manejador de errores para depuración. Captura errores de runtime y los registra.
    .onError(({ error, set }) => {
        set.status = 500
        
        // Asersión de tipo para resolver errores de TypeScript (TS2339).
        const err = error as Error;

        console.error("ELYISA RUNTIME ERROR:", err.name, err.message, err.stack)
        
        // Devolvemos un 500 amigable.
        return {
            error: true,
            message: `Internal Server Error: ${err.name}`,
            trace: err.message
        }
    })
    // Añadir una ruta raíz (/) para el health check y el puerto de entrada.
    .get('/', () => 'PDS006 San Rafael API running OK.')
    .group('/api', (group) => group.use(adapter.app))

// CAMBIO CRÍTICO: Exportar el objeto de la aplicación directamente.
// Esto utiliza el adaptador Web-Standard (fetch API) de Elysia, que es el
// método sugerido por el error de despliegue ("export default Elysia.fetch").
// El host de Azure ahora tomará este handler y lo escuchará en el puerto configurado.
export default app;
