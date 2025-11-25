import { Computer, DeviceCriteria, DeviceId, EnteredDevice, FrequentComputer, MedicalDevice } from "@core/domain"

export interface DeviceRepository {
  registerFrequentComputer(computer: FrequentComputer): Promise<FrequentComputer>

  getMedicalDevices(criteria: DeviceCriteria): Promise<MedicalDevice[]>

  getComputers(criteria: DeviceCriteria): Promise<Computer[]>

  getFrequentComputers(criteria: DeviceCriteria): Promise<FrequentComputer[]>

  getEnteredDevices(criteria: DeviceCriteria): Promise<EnteredDevice[]>

  checkinComputer(computer: Computer): Promise<Computer>

  checkinMedicalDevice(device: MedicalDevice): Promise<MedicalDevice>

  checkinFrequentComputer(id: DeviceId, datetime: Date): Promise<FrequentComputer>

  checkoutDevice(id: DeviceId, datetime: Date): Promise<void>

  isDeviceEntered(id: DeviceId): Promise<boolean>

  isFrequentComputerRegistered(id: DeviceId): Promise<boolean>
}
