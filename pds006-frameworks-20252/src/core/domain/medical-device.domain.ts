import { DeviceBrand, DeviceId, DeviceModel, DeviceOwner } from "./shared.domain"

export type MedicalDeviceSerial = string

export type MedicalDevice = {
  id: DeviceId
  brand: DeviceBrand
  model: DeviceModel
  photoURL: URL
  owner: DeviceOwner
  checkinAt?: Date
  checkoutAt?: Date
  serial: MedicalDeviceSerial
  // Field created for sorting device history
  updatedAt: Date
}
