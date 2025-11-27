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
        // CORRECCIÓN 1: Eliminamos el guard de query genérico que causaba el error TS2322.
        return new Elysia()
            // RUTA POST: checkin de Computadora
            .post(
                "/computers/checkin",
                // El body ya está tipado por Elysia, usamos 'as' para asegurar la llamada al servicio.
                ({ body }) => this.checkinComputer(body as ComputerRequest), 
                {
                    type: "multipart/form-data",
                    // Mantener t.Any() para el body, es la forma correcta de envolver Zod para body
                    body: t.Any(COMPUTER_REQUEST_SCHEMA) 
                }
            )
            // RUTA POST: checkin de Dispositivo Médico
            .post(
                "/medicaldevices/checkin",
                ({ body }) => this.checkinMedicalDevice(body as MedDeviceRequest),
                {
                    type: "multipart/form-data", 
                    body: t.Any(MED_DEVICE_REQUEST_SCHEMA) 
                }
            )
            // RUTA POST: Registro de Computadora Frecuente
            .post(
                "/computers/frequent",
                ({ body }) => this.registerFrequentComputer(body as ComputerRequest),
                {
                    type: "multipart/form-data",
                    body: t.Any(COMPUTER_REQUEST_SCHEMA)
                }
            )
            .get(
                "/computers",
                // La validación de query se deja a la lógica interna de CriteriaHelper
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
            // Mantenemos el guard de params, ya que está correctamente definido con t.Object
            .guard({
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
