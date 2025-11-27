import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import Elysia from "elysia";
import { Controller } from "./controller.elysia"; 

export class ElysiaApiAdapter {
    private controller: Controller
    // El tipo de 'app' es ahora la instancia de Elysia con las rutas
    // Eliminamos el prefijo del constructor del adaptador.
    public app: Elysia 

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
        
        // CORRECCIÓN: Inicializamos la aplicación Elysia y le aplicamos las rutas del controlador,
        // PERO SIN aplicar el prefijo '/api' aquí. Esto devuelve una Elysia<"", ...>
        this.app = new Elysia()
            .use(this.controller.routes())
    }
}
