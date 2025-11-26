import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import { Controller } from "./controller.elysia"; // Asegúrate de que esta ruta sea correcta

import openapi from "@elysiajs/openapi";
import Elysia from "elysia";

export class ElysiaApiAdapter {
    private controller: Controller
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

        this.app = new Elysia({ prefix: '/api' }) // Re-añadido el prefijo '/api' para la consistencia
            .use(openapi({}))
            .use(this.controller.routes())
    }

    /**
     * Inicia el servidor Elysia en el puerto especificado.
     * Cambiado de 'run()' a 'listen(port)' para coincidir con el contrato del index.ts 
     * y recibir el puerto dinámico de Azure (8080).
     * @param port El puerto en el que el servidor debe escuchar (típicamente 8080 en Azure).
     */
    public async listen(port: number) {
        // Usa el puerto proporcionado desde el archivo de inicio (index.ts)
        await this.app.listen(port);
        
        console.log(`El servidor esta corriendo en el puerto ${port}. Accede a Swagger en http://localhost:${port}/api/swagger`);
    }
}
