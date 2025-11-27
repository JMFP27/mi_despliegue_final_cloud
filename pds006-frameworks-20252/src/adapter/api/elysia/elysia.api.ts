import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
// CORRECCIÓN FINAL: Dejamos el nombre del archivo de importación como está en el sistema de archivos
import { Controller } from "./controller.elysia"; 
import Elysia from "elysia";

export class ElysiaApiAdapter {
    private controller: Controller
    public app: Elysia // Mantenemos la aplicación Elysia pública

    constructor(
        computerService: ComputerService,
        deviceService: DeviceService,
        medicalDeviceService: MedicalDeviceService
    ) {
        this.controller = new Controller(
            computerService,
            deviceService,
            medicalDeviceService
        )

        this.app = new Elysia({ prefix: '/api' }) // Re-añadido el prefijo '/api' para la consistencia
            .use(this.controller.routes())
    }
}
