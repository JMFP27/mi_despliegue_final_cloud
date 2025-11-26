import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import Controller from "./controller.elysia"; // FIX 1: Importación de 'default export' para resolver TS2305.

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

        // Solución para los errores TS2322 (conflicto de tipos de Elysia/OpenAPI):
        // Se añade 'as any' al final de la cadena de plugins para mitigar el error de tipado (TS2322).
        this.app = (new Elysia()
            .use(openapi({}))
            // Agrupamos las rutas de los controladores bajo el prefijo '/api'
            .group('/api', (app) =>
                app.use(this.controller.routes())
            )) as any // FIX 2: Coerción de tipo para resolver TS2322.
    }

    // El método 'listen' se delega al index.ts para el inicio correcto.
}
