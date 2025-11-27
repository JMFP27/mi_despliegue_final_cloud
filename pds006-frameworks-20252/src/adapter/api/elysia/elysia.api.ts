// elysia.api.ts
import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import Elysia from "elysia";
import openapi from "@elysiajs/openapi"; // 👈 Importa openapi
import { Controller } from "./controller.elysia";

export class ElysiaApiAdapter {
    private controller: Controller;
    public app: any; 

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

        this.app = new Elysia()
            .use(openapi({
                documentation: {
                    info: {
                        title: 'PDS006 API',
                        version: '1.0.0',
                        description: 'API para gestión de dispositivos en San Rafael'
                    }
                }
            }))
            .use(this.controller.routes());
    }
}
