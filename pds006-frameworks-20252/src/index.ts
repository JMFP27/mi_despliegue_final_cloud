import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

// ** Hemos eliminado todos los hacks de compatibilidad (globalThis.Bun/Deno y el import de 'elysia/adapter/node') **
// Ahora, Elysia debería configurarse por defecto como un handler de fetch, que es lo que Azure espera.

// Usamos el puerto estándar 8080 si no está definido (aunque no usaremos .listen())
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

// 1. Inicialización de Repositorios
const deviceRepository = new InMemoryDeviceRepository();
const photoRepository = new FileSystemPhotoRepository();

// 2. Inicialización de Servicios
const computerService = new ComputerService(
  deviceRepository,
  photoRepository,
  new URL(`http://localhost:${PORT}/api`)
);

const deviceService = new DeviceService(deviceRepository);
const medicalDeviceService = new MedicalDeviceService(deviceRepository, photoRepository);

// 3. Inicialización del Adaptador de API (que contiene la instancia de Elysia)
const adapter = new ElysiaApiAdapter(computerService, deviceService, medicalDeviceService);

// 4. Modo de Despliegue (Web Standard)
// NO usamos .listen(), que es lo que causa el error.
console.log(`[INFO] 🦊 Elysia inicializada. Exportando la app para que el runtime de Azure la escuche en el puerto ${PORT}.`);

// Exportar la aplicación por defecto (la recomendación del error)
export default adapter.app;
