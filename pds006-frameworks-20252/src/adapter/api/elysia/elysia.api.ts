import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import { Controller } from "./controller.elysia"; // Asegúrate de que esta ruta sea correcta

import openapi from "@elysiajs/openapi";
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
            .use(openapi({}))
            .use(this.controller.routes())
    }

    // ELIMINAMOS el método 'listen(port)' del adaptador, ya que estaba causando
    // el error "WebStandard does not support listen".
    // Ahora, llamaremos directamente a 'adapter.app.listen(port)' desde index.ts
}
