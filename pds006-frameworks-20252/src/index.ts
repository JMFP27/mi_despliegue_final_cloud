import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";
import Elysia from "elysia";
// IMPORTACIÓN REQUERIDA PARA EJECUTAR ELYSIA EN NODE.JS
import * as http from 'http'; 

// 1. DETERMINACIÓN DEL PUERTO
// Se fija el puerto a 8080, ya que es el puerto obligatorio para Azure App Service.
const DEFAULT_AZURE_PORT = 8080;
const SERVER_PORT: number = process.env.PORT ? Number(process.env.PORT) : DEFAULT_AZURE_PORT;

// Base URL para llamadas internas.
const API_BASE_URL = `http://localhost:${SERVER_PORT}/api`;

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

// 2. CONSTRUIR Y APLICAR EL PREFIJO FINAL
// Creamos la aplicación final de Elysia y aplicamos el prefijo al módulo de rutas base.
const app = new Elysia()
    .group('/api', (group) => group.use(adapter.app)) // Aplicamos el prefijo '/api' al grupo de rutas

// 3. INICIAR LA APLICACIÓN DE FORMA COMPATIBLE CON NODE.JS
const server = http.createServer((req, res) => {
    // Usamos app.fetch para delegar la petición y la respuesta a Elysia
    app.fetch(req, {
        request: req,
        server: server,
        // Eliminamos el log de inicio de app.listen ya que Node.js lo maneja.
    }).then(response => {
        // Transferir los encabezados de respuesta
        response.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });
        
        // Escribir el código de estado y el cuerpo de la respuesta
        res.writeHead(response.status);
        if (response.body) {
            response.body.pipeTo(new WritableStream({
                write(chunk) {
                    res.write(chunk);
                },
                close() {
                    res.end();
                },
                abort(err) {
                    console.error('Stream aborted', err);
                    res.end();
                }
            })).catch(err => {
                console.error("Error piping response body:", err);
                res.end();
            });
        } else {
            res.end();
        }
    }).catch(err => {
        console.error("Error processing request:", err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    });
});


server.listen(SERVER_PORT, () => {
    // Añadimos logs para confirmar el inicio.
    console.log(`[Elysia] 🦊 Running compatible on Node.js at http://localhost:${SERVER_PORT}`)
    console.log(`[App] Server listening on port ${SERVER_PORT}`);
});
