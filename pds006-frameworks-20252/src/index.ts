import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api"; 
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";

// 1. DETERMINACIÓN DEL PUERTO (obligatorio en Azure)
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

// 2. INICIAR EL SERVIDOR (¡esto es obligatorio en Azure!)
adapter.app.listen(SERVER_PORT, () => {
    console.log(`[Elysia] 🦊 Running at http://localhost:${SERVER_PORT}`);
    console.log(`[App] Server listening on port ${SERVER_PORT}`);
});
