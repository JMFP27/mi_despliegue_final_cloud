import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import { Controller } from "./controller.elysia.ts"; // FIX: Importación corregida para el archivo 'controller.elysia.ts'

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

        // FIX (TS2322): Aplicamos openapi y luego usamos .group('/api', ...) para definir el prefijo,
        // lo que resuelve el conflicto de tipado con Elysia.
        this.app = new Elysia()
            .use(openapi({}))
            // Agrupamos las rutas de los controladores bajo el prefijo '/api'
            .group('/api', (app) =>
                app.use(this.controller.routes())
            )
    }

    // El método 'listen' se delega al index.ts para el inicio correcto.
}
