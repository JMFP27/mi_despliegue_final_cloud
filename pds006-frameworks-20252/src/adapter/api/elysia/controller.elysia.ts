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
            // CORRECCIÓN 1: Usamos t.Object para la query, forzando la compatibilidad de tipo.
            // Si CRITERIA_QUERY_PARAMS_SCHEMA es un ZodObject, la forma más compatible es usar t.Any(ZodObject)
            // o redefinir con t.Object. Probaremos con t.Any, que es el wrapper oficial de Elysia para esquemas.
            .guard({
                // Si CRITERIA_QUERY_PARAMS_SCHEMA está definido como Zod.object, debemos usar t.Any()
                query: t.Any(CRITERIA_QUERY_PARAMS_SCHEMA) 
            })
            // RUTA POST: checkin de Computadora
            .post(
                "/computers/checkin",
                // El body ya está tipado por Elysia, usamos 'as' para asegurar la llamada al servicio.
                ({ body }) => this.checkinComputer(body as ComputerRequest), 
                {
                    type: "multipart/form-data",
                    // CORRECCIÓN 2: Volvemos a t.Any, ya que "as const" falló.
                    body: t.Any(COMPUTER_REQUEST_SCHEMA) 
                }
            )
            // RUTA POST: checkin de Dispositivo Médico
            .post(
                "/medicaldevices/checkin",
                ({ body }) => this.checkinMedicalDevice(body as MedDeviceRequest),
                {
                    type: "multipart/form-data", // Asumo que maneja archivos
                    // CORRECCIÓN 3: Volvemos a t.Any
                    body: t.Any(MED_DEVICE_REQUEST_SCHEMA) 
                }
            )
            // RUTA POST: Registro de Computadora Frecuente
            .post(
                "/computers/frequent",
                ({ body }) => this.registerFrequentComputer(body as ComputerRequest),
                {
                    type: "multipart/form-data",
                    // CORRECCIÓN 4: Volvemos a t.Any
                    body: t.Any(COMPUTER_REQUEST_SCHEMA)
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
                // CORRECCIÓN 5: Usamos t.Object con t.String para el parámetro, compatible con el guard de Elysia.
                params: t.Object({
                    id: t.String({ format: 'uuid' }) 
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
