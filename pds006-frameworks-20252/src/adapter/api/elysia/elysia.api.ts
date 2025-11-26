import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import { Controller } from "./controller.elysia";
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

        this.app = new Elysia()
            .use(openapi({}))
            .use(this.controller.routes());
    }

    // ✅ Corrección: aceptar puerto como parámetro
    async run(port: number = 3000) {
        await this.app.listen(port); // ← await opcional, pero recomendado
        console.log(`📡 El servidor está corriendo en el puerto ${port}`);
    }
}
