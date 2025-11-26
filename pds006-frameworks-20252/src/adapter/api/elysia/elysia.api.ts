import { ComputerService, DeviceService, MedicalDeviceService } from "../../../core/service"; // CORRECCIÓN: Uso de rutas relativas en lugar de alias para resolver 'Cannot find module' en tiempo de ejecución (ts-node).
import { ElysiaApiAdapter as RoutesController } from "./controller.elysia";
import openapi from "@elysiajs/openapi";
import Elysia from "elysia";

// Definimos un tipo genérico para simplificar el casting y evitar el error TS2322.
// Usamos 'any' para decirle a TypeScript que no se preocupe por la complejidad del estado interno.
type BaseElysia = Elysia<any, any, any, any, any, any, any>;

export class ElysiaApiAdapter {
    private controller: RoutesController;
    public app: Elysia;

    constructor(
        computerService: ComputerService,
        deviceService: DeviceService,
        medicalDeviceService: MedicalDeviceService
    ) {
        this.controller = new RoutesController(
            computerService,
            deviceService,
            medicalDeviceService
        );

        // CORRECCIÓN TS2322: Romper la cadena de .use() y usar casting
        // para evitar que TypeScript se confunda al intentar fusionar los tipos
        // complejos de openapi y el sub-router.
        let app = new Elysia();

        // 1. Aplicar openapi
        app = app.use(openapi({}));

        // 2. Aplicar las rutas del controlador, usando un cast (as BaseElysia)
        // Esto le indica a TypeScript que trate el sub-router como una instancia genérica de Elysia,
        // resolviendo el error de incompatibilidad de 'onStart'.
        app = app.use(this.controller.routes() as BaseElysia);
        
        this.app = app;
    }

    async run(port: number = 3000) {
        await this.app.listen(port);
        console.log(`📡 El servidor está corriendo en el puerto ${port}`);
    }
}
