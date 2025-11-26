import { ComputerService, DeviceService, MedicalDeviceService } from "../../../core/service";
import Elysia from "elysia";
import { CRITERIA_QUERY_PARAMS_SCHEMA, CriteriaHelper, CriteriaQueryParams } from "./criteria.helper";
import { COMPUTER_REQUEST_SCHEMA, ComputerRequest, MED_DEVICE_REQUEST_SCHEMA, MedDeviceRequest } from "../../../core/dto";
import z from "zod";
import { Computer, EnteredDevice, FrequentComputer, MedicalDevice } from "../../../core/domain";

export default class Controller {
    constructor(
        private computerService: ComputerService,
        private deviceService: DeviceService,
        private medicalDeviceService: MedicalDeviceService
    ) {}

    public routes() {
        return new Elysia()
            // Rutas con validación de query params
            .get("/computers", ({ query }) => {
                const parsed = CRITERIA_QUERY_PARAMS_SCHEMA.parse(query);
                return this.getComputers(parsed);
            })
            .get("/medicaldevices", ({ query }) => {
                const parsed = CRITERIA_QUERY_PARAMS_SCHEMA.parse(query);
                return this.getMedicalDevices(parsed);
            })
            .get("/computers/frequent", ({ query }) => {
                const parsed = CRITERIA_QUERY_PARAMS_SCHEMA.parse(query);
                return this.getFrequentComputers(parsed);
            })
            .get("/devices/entered", ({ query }) => {
                const parsed = CRITERIA_QUERY_PARAMS_SCHEMA.parse(query);
                return this.getEnteredDevices(parsed);
            })

            // Rutas con body
            .post("/computers/checkin", ({ body }) => this.checkinComputer(body), {
                type: "multipart/form-data",
                body: COMPUTER_REQUEST_SCHEMA
            })
            .post("/medicaldevices/checkin", ({ body }) => this.checkinMedicalDevice(body), {
                body: MED_DEVICE_REQUEST_SCHEMA
            })
            .post("/computers/frequent", ({ body }) => this.registerFrequentComputer(body), {
                type: "multipart/form-data",
                body: COMPUTER_REQUEST_SCHEMA
            })

            // Rutas con parámetros
            .patch("/computers/frequent/checkin/:id", ({ params: { id } }) => {
                const uuid = z.string().uuid().parse(id);
                return this.checkinFrequentComputer(uuid);
            })
            .patch("/devices/checkout/:id", ({ params: { id } }) => {
                const uuid = z.string().uuid().parse(id);
                return this.checkoutDevice(uuid);
            });
    }

    // --- MÉTODOS DEL CONTROLADOR (sin cambios) ---
    async checkinComputer(request: ComputerRequest): Promise<Computer> {
        return this.computerService.checkinComputer(request);
    }

    async checkinFrequentComputer(id: string): Promise<FrequentComputer> {
        return this.computerService.checkinFrequentComputer(id);
    }

    async checkinMedicalDevice(request: MedDeviceRequest): Promise<MedicalDevice> {
        return this.medicalDeviceService.checkinMedicalDevice(request);
    }

    async registerFrequentComputer(request: ComputerRequest): Promise<FrequentComputer> {
        return this.computerService.registerFrequentComputer(request);
    }

    async getComputers(queryParams: CriteriaQueryParams): Promise<Computer[]> {
        const criteria = CriteriaHelper.parseFromQuery(queryParams);
        return this.computerService.getComputers(criteria);
    }

    async getMedicalDevices(queryParams: CriteriaQueryParams): Promise<MedicalDevice[]> {
        const criteria = CriteriaHelper.parseFromQuery(queryParams);
        return this.medicalDeviceService.getMedicalDevices(criteria);
    }

    async getFrequentComputers(queryParams: CriteriaQueryParams): Promise<FrequentComputer[]> {
        const criteria = CriteriaHelper.parseFromQuery(queryParams);
        return this.computerService.getFrequentComputers(criteria);
    }

    async getEnteredDevices(queryParams: CriteriaQueryParams): Promise<EnteredDevice[]> {
        const criteria = CriteriaHelper.parseFromQuery(queryParams);
        return this.deviceService.getEnteredDevices(criteria);
    }

    async checkoutDevice(id: string): Promise<void> {
        return this.deviceService.checkoutDevice(id);
    }
}
