import { DeviceRepository } from "../repository"; // Alias corregido
import { DeviceCriteria, DeviceId, EnteredDevice } from "../domain"; // Alias corregido
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
