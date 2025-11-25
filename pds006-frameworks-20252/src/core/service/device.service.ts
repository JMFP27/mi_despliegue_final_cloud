import { DeviceRepository } from "@core/repository";
import { DeviceCriteria, DeviceId, EnteredDevice } from "@core/domain";
import { SERVICE_ERRORS } from "./error";

export class DeviceService {
  constructor(
    private repository: DeviceRepository
  ) {}

  async checkoutDevice(id: DeviceId): Promise<void> {
    const isDeviceEntered = await this.repository.isDeviceEntered(id)

    if (!isDeviceEntered) {
      throw SERVICE_ERRORS.DeviceNotFound
    }

    await this.repository.checkoutDevice(id, new Date())
  }

  async getEnteredDevices(criteria: DeviceCriteria): Promise<EnteredDevice[]> {
    return this.repository.getEnteredDevices(criteria)
  }
}
