// elysia.api.ts
export class ElysiaApiAdapter {
    private controller: Controller;
    public app: any; // 👈 Seguimos usando 'any' para evitar TS2322

    constructor(
        computerService: ComputerService,
        deviceService: DeviceService,
        medicalDeviceService: MedicalDeviceService
    ) {
        this.controller = new Controller(
            computerService,
            deviceService,
            medicalDeviceService
        );

        // Configura OpenAPI con información básica
        const app = new Elysia()
            .use(openapi({
                documentation: {
                    info: {
                        title: 'PDS006 API',
                        version: '1.0.0'
                    }
                }
            }))
            .use(this.controller.routes());

        this.app = app;
    }
}
