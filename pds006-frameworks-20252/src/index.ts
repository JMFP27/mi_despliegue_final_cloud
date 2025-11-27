// src/index.ts

// 👇 Fuerza Node.js antes de importar Elysia
if (typeof Bun === 'undefined') {
  globalThis.Bun = undefined;
}
if (typeof Deno === 'undefined') {
  globalThis.Deno = undefined;
}

import { Elysia } from "elysia";
import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const API_BASE_URL = `http://127.0.0.1:${PORT}/api`;

const deviceRepository = new InMemoryDeviceRepository();
const photoRepository = new FileSystemPhotoRepository();

const computerService = new ComputerService(deviceRepository, photoRepository, new URL(API_BASE_URL));
const deviceService = new DeviceService(deviceRepository);
const medicalDeviceService = new MedicalDeviceService(deviceRepository, photoRepository);

const adapter = new ElysiaApiAdapter(computerService, deviceService, medicalDeviceService);

const app = new Elysia()
  .onError(({ error, set }) => {
    set.status = 500;
    const err = error as Error;
    console.error("ELYISA RUNTIME ERROR:", err.name, err.message, err.stack);
    return {
      error: true,
      message: `Internal Server Error: ${err.name}`,
      trace: err.message,
    };
  })
  .get("/", () => "PDS006 San Rafael API running OK.")
  .group("/api", (group) => group.use(adapter.app));

// ✅ ¡Escucha en el puerto! Esto es obligatorio en Azure.
app.listen(PORT, () => {
  console.log(`🦊 Elysia corriendo en el puerto ${PORT}`);
});
