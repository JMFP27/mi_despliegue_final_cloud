import { ElysiaApiAdapter } from "./adapter/api/elysia/elysia.api";
import { FileSystemPhotoRepository } from "./adapter/photo/filesystem";
import { InMemoryDeviceRepository } from "./adapter/repository/inmemory";
import { ComputerService, DeviceService, MedicalDeviceService } from "./core/service";
import Elysia from "elysia";
import * as http from 'http'; // Módulo nativo de Node.js
import { Readable } from 'stream'; // Módulo nativo de Node.js para streams

// 1. DETERMINACIÓN DEL PUERTO
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
const app = new Elysia()
    .group('/api', (group) => group.use(adapter.app))

// Función de utilidad para convertir un stream de Node.js a un Buffer
function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(chunk as Buffer));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

// 3. INICIAR LA APLICACIÓN DE FORMA COMPATIBLE CON NODE.JS (V3: FIX DE TIPADO)
const server = http.createServer(async (req, res) => {
    try {
        // Corrección de un posible error si req.headers.host no existe
        const host = req.headers.host || `localhost:${SERVER_PORT}`;
        const fullUrl = `http://${host}${req.url}`;
        
        // 1. Manejo del Body (solo si es necesario)
        const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
        let body: Buffer | undefined;

        if (hasBody) {
            body = await streamToBuffer(req);
        }

        // 2. Crear el objeto Request de la Web API
        // FIX TS2353: Casteamos la configuración completa a 'any' para permitir la propiedad 'duplex',
        // que es necesaria para la compatibilidad con streams de Node.js en el constructor de Request,
        // pero que no está en las definiciones de RequestInit estándar de TypeScript.
        const request = new Request(fullUrl, {
            method: req.method,
            // Las cabeceras de Node.js se pueden pasar directamente al constructor de Headers
            headers: new Headers(req.headers as Record<string, string>), 
            // FIX TS2322 (previa): Casteamos el body a 'any' para evitar conflictos de tipado con Buffer
            body: body ? (body as any) : undefined, 
            // Parámetro requerido por Elysia en algunos contextos de Node.js
            duplex: 'half', 
        } as any); // <--- CORRECCIÓN APLICADA AQUÍ

        // 3. Obtener la respuesta de Elysia
        // Usamos await para resolver la Promise y obtenemos el objeto Response (Web API)
        const response: Response = await app.fetch(request);

        // APLICAR FIX: Clonamos la respuesta inmediatamente para asegurarnos de que el cuerpo
        // no haya sido consumido por librerías externas (como Application Insights/instrumentación)
        // antes de que intentemos leerlo.
        const clonedResponse = response.clone();


        // 4. Transferir respuesta al objeto de respuesta de Node.js
        clonedResponse.headers.forEach((value: string, key: string) => {
            res.setHeader(key, value);
        });
        
        res.writeHead(clonedResponse.status);

        // 5. Enviar el cuerpo
        if (clonedResponse.body) {
            // Convertimos el ReadableStream de la Web API a un Buffer para Node.js
            const buffer = await clonedResponse.arrayBuffer();
            res.end(Buffer.from(buffer));
        } else {
            res.end();
        }

    } catch (error) {
        // Corrección del error TS7006: se tipa 'error' como 'any' para evitar conflicto
        const err = error as any; 
        console.error("Error processing request:", err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    }
});


server.listen(SERVER_PORT, () => {
    // Añadimos logs para confirmar el inicio.
    console.log(`[Elysia] 🦊 Running compatible on Node.js at http://localhost:${SERVER_PORT}`)
    console.log(`[App] Server listening on port ${SERVER_PORT}`);
});
