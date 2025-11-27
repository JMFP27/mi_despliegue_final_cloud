import { ComputerService, DeviceService, MedicalDeviceService } from "../../../core/service";
import Elysia, { t } from "elysia"; // Importamos 't' (el constructor de tipos de Elysia)
import { CRITERIA_QUERY_PARAMS_SCHEMA, CriteriaHelper, CriteriaQueryParams } from "./criteria.helper";
// Corregido a rutas relativas correctas
import { COMPUTER_REQUEST_SCHEMA, ComputerRequest, MED_DEVICE_REQUEST_SCHEMA, MedDeviceRequest } from "../../../core/dto";
import * as z from "zod";
import { Computer, EnteredDevice, FrequentComputer, MedicalDevice } from "../../../core/domain";

// Aseguramos que la clase Controller sea exportada correctamente.
export class Controller {
    constructor(
        private computerService: ComputerService,
        private deviceService: DeviceService,
        private medicalDeviceService: MedicalDeviceService
    ) {}

    public routes() {
        return new Elysia()
            // Se elimina el guard genérico de query aquí, ya que causaba conflicto con t.Any,
            // lo dejamos para las rutas GET donde se usará, o lo aplicamos con t.Object.
            .guard({
                // Usaremos t.Object para envolver el esquema Zod y cumplir con la expectativa de Elysia/TypeScript.
                query: t.Object({
                    sortBy: t.Optional(t.String()),
                    filterBy: t.Optional(t.String()),
                    limit: t.Optional(t.String()),
                    offset: t.Optional(t.String()),
                }, { 
                    // Esto permite que el esquema Zod subyacente funcione para la lógica de parseo,
                    // mientras que Elysia tiene un TObject para el tipado.
                    // Si el error persiste, probaremos a pasar CRITERIA_QUERY_PARAMS_SCHEMA directamente sin t.Any() ni t.Object()
                    // o usar `as const` en la definición de CRITERIA_QUERY_PARAMS_SCHEMA.
                })
            })
            // RUTA POST: checkin de Computadora
            .post(
                "/computers/checkin",
                ({ body }) => this.checkinComputer(body as ComputerRequest), 
                {
                    type: "multipart/form-data",
                    // CORRECCIÓN 2: Usamos "as const" para ayudar a TypeScript a inferir el tipo estricto, 
                    // resolviendo el conflicto con TAny/TSchema.
                    body: COMPUTER_REQUEST_SCHEMA as const
                }
            )
            // RUTA POST: checkin de Dispositivo Médico
            .post(
                "/medicaldevices/checkin",
                ({ body }) => this.checkinMedicalDevice(body as MedDeviceRequest),
                {
                    type: "multipart/form-data",
                    // CORRECCIÓN 3: Usamos "as const"
                    body: MED_DEVICE_REQUEST_SCHEMA as const
                }
            )
            // RUTA POST: Registro de Computadora Frecuente
            .post(
                "/computers/frequent",
                ({ body }) => this.registerFrequentComputer(body as ComputerRequest),
                {
                    type: "multipart/form-data",
                    // CORRECCIÓN 4: Usamos "as const"
                    body: COMPUTER_REQUEST_SCHEMA as const
                }
            )
            .get(
                "/computers",
                ({ query }) => this.getComputers(query as CriteriaQueryParams)
            )
            .get(
                "/medicaldevices",
                ({ query }) => this.getMedicalDevices(query as CriteriaQueryParams)
            )
            .get(
                "/computers/frequent",
                ({ query }) => this.getFrequentComputers(query as CriteriaQueryParams)
            )
            .get(
                "/devices/entered",
                ({ query }) => this.getEnteredDevices(query as CriteriaQueryParams)
            )
            .guard({
                // CORRECCIÓN 5: Usamos t.Object con t.String para el parámetro, lo que es compatible con la sintaxis de `guard` de Elysia.
                params: t.Object({
                    id: t.String({ format: 'uuid' }) // Usamos t.String de Elysia y aplicamos formato UUID
                })
            })
            .patch(
                "/computers/frequent/checkin/:id",
                ({ params: { id }}) => this.checkinFrequentComputer(id)
            )
            .patch(
                "/devices/checkout/:id",
                ({ params: { id }}) => this.checkoutDevice(id)
            )
    }

    // --- MÉTODOS DEL CONTROLADOR ---

    async checkinComputer(request: ComputerRequest): Promise<Computer> {
        return this.computerService.checkinComputer(request)
    }

    async checkinFrequentComputer(id: string): Promise<FrequentComputer> {
        return this.computerService.checkinFrequentComputer(id)
    }

    async checkinMedicalDevice(request: MedDeviceRequest): Promise<MedicalDevice> {
        return this.medicalDeviceService.checkinMedicalDevice(request)
    }

    async registerFrequentComputer(request: ComputerRequest): Promise<FrequentComputer> {
        return this.computerService.registerFrequentComputer(request)
    }

    async getComputers(queryParams: CriteriaQueryParams): Promise<Computer[]> {
        const criteria = CriteriaHelper.parseFromQuery(queryParams)
        return this.computerService.getComputers(criteria)
    }

    async getMedicalDevices(queryParams: CriteriaQueryParams): Promise<MedicalDevice[]> {
        const criteria = CriteriaHelper.parseFromQuery(queryParams)
        return this.medicalDeviceService.getMedicalDevices(criteria)
    }

    async getFrequentComputers(queryParams: CriteriaQueryParams): Promise<FrequentComputer[]> {
        const criteria = CriteriaHelper.parseFromQuery(queryParams)
        return this.computerService.getFrequentComputers(criteria)
    }

    async getEnteredDevices(queryParams: CriteriaQueryParams): Promise<EnteredDevice[]> {
        const criteria = CriteriaHelper.parseFromQuery(queryParams)
        return this.deviceService.getEnteredDevices(criteria)
    }

    async checkoutDevice(id: string): Promise<void> {
        return this.deviceService.checkoutDevice(id)
    }
}
