import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";
// Importamos Context y ErrorContext para un tipado estricto en los handlers.
import Elysia, { Context, ErrorContext } from "elysia"; 
// Importamos los módulos HTTP nativo y Stream de Node.js, necesarios para la compatibilidad con Azure.
import { IncomingMessage, ServerResponse, createServer } from 'node:http';
import { Readable } from 'node:stream'; // Necesario para adaptar streams

// 1. DETERMINACIÓN DEL PUERTO (CRÍTICO para Azure)
const DEFAULT_AZURE_PORT = 8080;
const SERVER_PORT: number = process.env.PORT ? Number(process.env.PORT) : DEFAULT_AZURE_PORT;
const API_BASE_URL = `http://127.0.0.1:${SERVER_PORT}/api`;

const deviceRepository = new InMemoryDeviceRepository()
const photoRepository = new FileSystemPhotoRepository()

// Inyección de dependencias para los servicios
const computerService = new ComputerService(
    deviceRepository,
    photoRepository,
    new URL(API_BASE_URL)
)

const deviceService = new DeviceService(deviceRepository)

const medicalDeviceService = new MedicalDeviceService(
    deviceRepository,
    photoRepository
)

// Inicializamos el adaptador que solo contiene las rutas sin prefijo
const adapter = new ElysiaApiAdapter(
    computerService,
    deviceService,
    medicalDeviceService
)

// 2. CONSTRUIR LA APLICACIÓN ELYSIA
// Usamos Elysia<any> para simplificar el tipo general y permitir el uso de app.fetch en el adaptador HTTP.
const app = new Elysia<any>()

    // *** 2A. MANEJADORES DE ERRORES GLOBALES (Colocados ANTES de las rutas) ***

    // Manejador de errores interno (e.g., errores de código 500)
    // FIX TS2339: Usamos type assertion (as ErrorContext) en el parámetro para forzar el tipado.
    .onError((context) => {
        const { error, set } = context as ErrorContext;
        set.status = 500;
        
        // Cast a Error para acceder a name/message/stack
        const err = error as unknown as Error; 

        console.error("ELYISA RUNTIME ERROR (500):", err.name, err.message, err.stack);
        
        return {
            error: true,
            message: `Internal Server Error: ${err.name}`,
            trace: err.message
        };
    })

    // Manejador explícito de rutas no encontradas (404)
    // FIX TS2339: Usamos type assertion (as Context) en el parámetro para forzar el tipado.
    .notFound((context) => { 
        const { set } = context as Context;
        set.status = 404;
        console.log("NOT_FOUND (404): Route requested does not exist.");
        return {
            error: true,
            message: "Route Not Found",
        };
    })
    
    // *** 2B. DEFINICIÓN DE RUTAS ***

    // Ruta de health check.
    .get('/', () => 'PDS006 San Rafael API running OK.')
    
    // FIX TS7006: Tipamos explícitamente el parámetro 'group'.
    .group('/api', (group: Elysia<any>) => group.use(adapter.app))


// 3. ADAPTADOR: Función para convertir la API de Node.js (req, res) a la API Web Standard (Request, Response).
const createWebFetchHandler = (elysiaApp: Elysia<any>) => {
    return async (req: IncomingMessage, res: ServerResponse) => {
        try {
            // 3.1 Convertir Node.js Request a Web Standard Request
            // Se utiliza req.headers.host para obtener el host, que puede incluir el puerto.
            const hostname = req.headers.host ? req.headers.host : `localhost:${SERVER_PORT}`;
            const url = new URL(req.url || '/', `http://${hostname}`);
            
            // Determinar el cuerpo de la solicitud: solo si no es GET/HEAD.
            const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
            // Convertir el stream de Node.js a un stream Web para el cuerpo de la solicitud.
            const body = hasBody ? Readable.toWeb(req) : null; 

            // Convertir Node.js headers a Web Headers
            const headers = new Headers();
            for (const [key, value] of Object.entries(req.headers)) {
                if (value) {
                    if (Array.isArray(value)) {
                        value.forEach(v => headers.append(key, v));
                    } else {
                        headers.append(key, value);
                    }
                }
            }

            // Construir el objeto Web Request. 'duplex' es necesario para Node.js fetch compatibility.
            const webRequest = new Request(url, {
                method: req.method,
                headers: headers,
                body: body as any, 
                // @ts-ignore: 'duplex: "half"' es un requisito de Node.js para el fetch con cuerpo.
                duplex: 'half' 
            });

            // 3.2 Invocar al handler de Elysia (app.fetch)
            const webResponse = await elysiaApp.fetch(webRequest);

            // 3.3 Convertir Web Standard Response a Node.js Response
            res.statusCode = webResponse.status;
            webResponse.headers.forEach((value, key) => {
                res.setHeader(key, value);
            });

            if (webResponse.body) {
                // Leer el cuerpo del Web Stream y canalizarlo al Node.js Response
                await Readable.fromWeb(webResponse.body as any).pipe(res);
            } else {
                res.end();
            }

        } catch (error) {
            console.error("Error en el adaptador HTTP/Web Standard (500):", error);
            if (!res.headersSent) {
                res.statusCode = 500;
                res.end("Internal Server Error (Adapter Failure)");
            }
        }
    };
}


// 4. Iniciar el servidor HTTP de Node.js usando el adaptador.
const server = createServer(createWebFetchHandler(app as Elysia<any>))

// 5. Forzar al servidor a escuchar el puerto requerido por Azure.
server.listen(SERVER_PORT, () => {
    console.log(`[App] Node.js HTTP Server: PDS006 API listening on port ${SERVER_PORT}.`);
})
