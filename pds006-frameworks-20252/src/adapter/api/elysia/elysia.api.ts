import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import { Controller } from "./controller.elysia";
// import openapi from "@elysiajs/openapi"; // <--- ESTA LÍNEA DEBE SER ELIMINADA
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
            // .use(openapi({})) // Ya fue eliminado del constructor
            .use(this.controller.routes())
    }
}
