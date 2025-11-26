import 'elysia/adapter/node';

import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api"; 
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

const SERVER_PORT: number = process.env.PORT ? Number(process.env.PORT) : 8080;

const deviceRepository = new InMemoryDeviceRepository();
const photoRepository = new FileSystemPhotoRepository();

const computerService = new ComputerService(
    deviceRepository, 
    photoRepository, 
    new URL(`http://localhost:${SERVER_PORT}/api`)
);

const deviceService = new DeviceService(deviceRepository);
const medicalDeviceService = new MedicalDeviceService(deviceRepository, photoRepository);

const adapter = new ElysiaApiAdapter(computerService, deviceService, medicalDeviceService);

// ✅ Ahora sí puedes usar .listen()
adapter.app.listen(SERVER_PORT, () => {
    console.log(`🦊 Elysia is running on port ${SERVER_PORT}`);
});
