import { ComputerService, DeviceService, MedicalDeviceService } from "../../../core/service";
import Elysia from "elysia";
import { CRITERIA_QUERY_PARAMS_SCHEMA, CriteriaHelper, CriteriaQueryParams } from "./criteria.helper";
import { COMPUTER_REQUEST_SCHEMA, ComputerRequest, MED_DEVICE_REQUEST_SCHEMA, MedDeviceRequest } from "../../../core/dto";
import z from "zod";
import { Computer, EnteredDevice, FrequentComputer, MedicalDevice } from "../../../core/domain";

// Clase Controller que maneja las rutas y delega en los servicios.
// Utiliza 'export default' para coincidir con la importación en el adaptador y solucionar TS1192.
export default class Controller {
    constructor(
        private computerService: ComputerService,
        private deviceService: DeviceService,
        private medicalDeviceService: MedicalDeviceService
    ) {}

    public routes() {
        // Se elimina el 'prefix: "/api"' de aquí, ya que se aplica en el adaptador.
        return new Elysia()
            .guard({
                query: CRITERIA_QUERY_PARAMS_SCHEMA
            })
            .post(
                "/computers/checkin",
                ({ body }) => this.checkinComputer(body),
                {
                    type: "multipart/form-data",
                    body: COMPUTER_REQUEST_SCHEMA
                }
            )
            .post(
                "/medicaldevices/checkin",
                ({ body }) => this.checkinMedicalDevice(body),
                {
                    body: MED_DEVICE_REQUEST_SCHEMA
                }
            )
            .post(
                "/computers/frequent",
                ({ body }) => this.registerFrequentComputer(body),
                {
                    type: "multipart/form-data",
                    body: COMPUTER_REQUEST_SCHEMA
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
                params: z.object({
                    id: z.uuid()
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
