import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

// ** AJUSTE 1: FIX TS7017 (NECESARIO PARA COMPILAR SIN ERRORES EN NODE) **
// Declaramos las variables globales de Bun y Deno para que TypeScript lo sepa.
declare global {
  var Bun: unknown;
  var Deno: unknown;
}

// ** AJUSTE 2: FORZAR EL MODO NODE.JS (CRÍTICO) **
// Al establecer Bun y Deno en `undefined` antes de cualquier importación de Elysia,
// forzamos a Elysia a usar su adaptador de Node.js.
globalThis.Bun = undefined;
globalThis.Deno = undefined;

// ** AJUSTE 3: CORRECCIÓN DEL IMPORT DEL ADAPTADOR DE NODE.JS (CRÍTICO) **
// La ruta 'elysia/adapter/node' causa un error ERR_PACKAGE_PATH_NOT_EXPORTED
// cuando se compila a CommonJS y se ejecuta en Node.js.
// Usamos la ruta CJS explícita para evitar el error de "subpath not exported".
import 'elysia/dist/cjs/adapter/node';

// Usamos el puerto estándar 8080 (Azure lo inyecta aquí)
const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const API_URL = `http://localhost:${PORT}/api`;

// 1. Inicialización de Repositorios
const deviceRepository = new InMemoryDeviceRepository();
const photoRepository = new FileSystemPhotoRepository();

// 2. Inicialización de Servicios
const computerService = new ComputerService(
  deviceRepository,
  photoRepository,
  new URL(API_URL) // Usamos la URL construida para los servicios
);

const deviceService = new DeviceService(deviceRepository);
const medicalDeviceService = new MedicalDeviceService(deviceRepository, photoRepository);

// 3. Inicialización del Adaptador de API (que contiene la instancia de Elysia)
const adapter = new ElysiaApiAdapter(computerService, deviceService, medicalDeviceService);

// 4. Modo de Ejecución (Node.js) - INICIAR EL SERVIDOR
// La llamada a .listen() es obligatoria en Node.js para que el proceso se mantenga
// vivo y responda a las peticiones HTTP.
adapter.app.listen(PORT, ({ hostname, port }) => {
  // Cuando Azure lo inicie, el hostname será '0.0.0.0' o similar.
  console.log(`[SUCCESS] 🦊 Elysia Server is running at http://${hostname}:${port}`);
  console.log(`[INFO] 🚀 API Base URL: ${API_URL}`);
});

// Nota: Ya no exportamos la aplicación por defecto. La llamada a .listen() es el punto de entrada.
