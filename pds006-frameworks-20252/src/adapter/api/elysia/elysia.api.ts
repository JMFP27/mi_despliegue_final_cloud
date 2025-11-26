import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
// CORRECCIÓN CLAVE: Importamos 'ElysiaApiAdapter' (el nombre real exportado) 
// y le damos un alias local de 'RoutesController' para evitar el error TS2305.
import { ElysiaApiAdapter as RoutesController } from "./controller.elysia";
import openapi from "@elysiajs/openapi";
import Elysia from "elysia";

export class ElysiaApiAdapter {
    // Usamos el nuevo nombre de tipo
    private controller: RoutesController;
    public app: Elysia;

    constructor(
        computerService: ComputerService,
        deviceService: DeviceService,
        medicalDeviceService: MedicalDeviceService
    ) {
        // Usamos el nuevo nombre para la instanciación
        this.controller = new RoutesController(
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
