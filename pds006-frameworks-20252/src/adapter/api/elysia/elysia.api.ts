import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import Controller from "./controller.elysia";
import openapi from "@elysiajs/openapi";
import Elysia from "elysia";

export class ElysiaApiAdapter {
    private controller: Controller;
    public app: Elysia;

    constructor(
        computerService: ComputerService,
        deviceService: DeviceService,
        medicalDeviceService: MedicalDeviceService
    ) {
        this.controller = new Controller(
            computerService,
            deviceService,
            medicalDeviceService
        );

        // Paso 1: crea la app base
        const app = new Elysia();

        // Paso 2: agrega OpenAPI
        app.use(openapi({}));

        // Paso 3: agrega las rutas (sin .group si no es necesario, o con .group pero sin encadenar tipos complejos)
        const router = this.controller.routes(); // esto devuelve una instancia de Elysia
        app.use(router); // ts-node + Elysia v1+ maneja esto bien

        this.app = app;
    }
}
