import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import Elysia from "elysia";
import { Controller } from "./controller.elysia";
import openapi from "@elysiajs/openapi"; // Importamos openapi de nuevo

export class ElysiaApiAdapter {
    private controller: Controller
    // Usamos 'any' para evitar conflictos de tipado complejos con .use()
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
        
        // 1. Inicialización de la aplicación Elysia y estructura de rutas.
        this.app = new Elysia()
            
            // Ruta de Salud (Root)
            .get('/', () => "PDS006 San Rafael API running OK.")
            
            // Ruta de Documentación (Swagger)
            // Esto servirá la interfaz de Swagger en /swagger
            // CORRECCIÓN: Se ajusta la configuración de openapi para ser compatible con el tipado
            // de la versión actual, usando `docs` para la ruta del UI y `swagger.path` para el JSON.
            // Para algunas versiones, se usa `path` para el JSON y `swagger.path` para el UI.
            // Adoptamos la estructura más segura para evitar el error TS2353.
            .use(
                openapi({
                    // Ruta donde se genera el JSON de la especificación OpenAPI
                    path: '/swagger.json', 
                    // Configuración para la interfaz de usuario de Swagger
                    docs: {
                        path: '/swagger', // La ruta donde se accede al Swagger UI
                        // title: 'San Rafael API Documentation', // Opcional
                    }
                })
            )
            
            // 2. Agrupamos las rutas funcionales de la API bajo el prefijo '/api'.
            // Todas las rutas dentro del controlador ahora se acceden como /api/...
            .group('/api', (group) => group
                .use(this.controller.routes())
            )

            // 3. Catch-All para 404 (Debe ser el último en el montaje)
            .all('*', ({ set }) => {
                set.status = 404
                return { error: true, message: 'Route Not Found (via Catch-All)' }
            })
    }
}
