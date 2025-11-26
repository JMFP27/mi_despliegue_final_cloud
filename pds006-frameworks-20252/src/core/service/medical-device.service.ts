import { mapRequestToMedicalDevice, MED_DEVICE_REQUEST_SCHEMA, MedDeviceRequest } from "../dto"; // Alias corregido
import { DevicePhotoRepository, DeviceRepository } from "../repository"; // Alias corregido
import { DeviceCriteria, MedicalDevice } from "../domain"; // Alias corregido
import { Helper } from "./helper";

export class MedicalDeviceService {
  constructor(
    private repository: DeviceRepository,
    private photoRepository: DevicePhotoRepository
  ) {}

  async getMedicalDevices(criteria: DeviceCriteria): Promise<MedicalDevice[]> {
    return this.repository.getMedicalDevices(criteria)
  }
  
  async checkinMedicalDevice(request: MedDeviceRequest): Promise<MedicalDevice> {
    MED_DEVICE_REQUEST_SCHEMA.parse(request)

    const deviceId = Helper.generateDeviceId()

    const photoURL = await this.photoRepository.savePhoto(request.photo, deviceId)

    const device = mapRequestToMedicalDevice(request, deviceId, photoURL)

    device.checkinAt = new Date()

    return await this.repository.checkinMedicalDevice(device)
  }
}
