globalThis.Bun = undefined;
globalThis.Deno = undefined;

import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

const deviceRepository = new InMemoryDeviceRepository();
const photoRepository = new FileSystemPhotoRepository();

const computerService = new ComputerService(
  deviceRepository,
  photoRepository,
  new URL(`http://localhost:${PORT}/api`)
);

const deviceService = new DeviceService(deviceRepository);
const medicalDeviceService = new MedicalDeviceService(deviceRepository, photoRepository);

const adapter = new ElysiaApiAdapter(computerService, deviceService, medicalDeviceService);


adapter.app.listen(PORT, () => {
  console.log(`🦊 Elysia corriendo en el puerto ${PORT}`);
});
