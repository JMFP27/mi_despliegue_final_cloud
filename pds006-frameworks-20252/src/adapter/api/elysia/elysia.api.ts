import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import { Controller } from "./controller.elysia"; // FIX CRÍTICO: Eliminado el '.ts' para resolver el error TS5097.

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

        // Solución para el error TS2322 (conflicto de tipos de Elysia/OpenAPI):
        // Inicializamos la aplicación sin prefijo, aplicamos el plugin openapi,
        // y luego usamos .group('/api', ...) para definir el prefijo.
        this.app = new Elysia()
            .use(openapi({}))
            // Agrupamos las rutas de los controladores bajo el prefijo '/api'
            .group('/api', (app) =>
                app.use(this.controller.routes())
            )
    }

    // El método 'listen' se delega al index.ts para el inicio correcto.
}
