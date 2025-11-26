import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

// ** AJUSTE CRÍTICO PARA FORZAR EL MODO NODE.JS **
// Al establecer Bun y Deno en `undefined` antes de cualquier importación de Elysia,
// forzamos a Elysia a usar su adaptador de Node.js, permitiendo el uso de `.listen()`.
globalThis.Bun = undefined;
globalThis.Deno = undefined;

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

// 1. Inicialización de Repositorios
const deviceRepository = new InMemoryDeviceRepository();
const photoRepository = new FileSystemPhotoRepository();

// 2. Inicialización de Servicios
// Nota: La URL base para las fotos debe construirse dinámicamente o ser una variable de entorno.
const computerService = new ComputerService(
  deviceRepository,
  photoRepository,
  // Usamos la variable PORT ya convertida a número
  new URL(`http://localhost:${PORT}/api`)
);

const deviceService = new DeviceService(deviceRepository);
const medicalDeviceService = new MedicalDeviceService(deviceRepository, photoRepository);

// 3. Inicialización del Adaptador de API (que contiene la instancia de Elysia)
const adapter = new ElysiaApiAdapter(computerService, deviceService, medicalDeviceService);

// 4. ✅ Escucha en el puerto — esto es obligatorio en Azure
// Si los pasos anteriores funcionaron, esta línea ya no debería lanzar el error "WebStandard does not support listen".
adapter.app.listen(PORT, () => {
  console.log(`[INFO] 🦊 Elysia corriendo en el puerto ${PORT}`);
});

// En este caso, no necesitamos exportar el servidor, ya que usamos el método listen
// (a menos que el motor de Azure lo requiera, pero probemos sin el export por ahora).
