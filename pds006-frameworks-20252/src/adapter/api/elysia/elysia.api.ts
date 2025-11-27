import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import Elysia from "elysia";
import { Controller } from "./controller.elysia"; // RUTA CORREGIDA

export class ElysiaApiAdapter {
    private controller: Controller
    // CORRECCIÓN: Cambiamos el tipo explícito 'Elysia' por 'any' para evitar el conflicto de tipado TS2322
    // con la compleja inferencia de tipos que produce .use(this.controller.routes()).
    public app: any 

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
        // PERO SIN aplicar el prefijo '/api' aquí.
        this.app = new Elysia()
            .use(this.controller.routes())
    }
}
