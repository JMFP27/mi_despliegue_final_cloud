import { DeviceBrand, DeviceColor, DeviceId, DeviceModel, DeviceOwner } from "./shared.domain"

export type Computer = {
  id: DeviceId
  brand: DeviceBrand
  model: DeviceModel
  color?: DeviceColor
  photoURL: URL
  owner: DeviceOwner
  checkinAt?: Date
  checkoutAt?: Date
  // Field created for sorting device history
  updatedAt: Date
}

export type FrequentComputer = {
  device: Computer
  checkinURL: URL
  checkoutURL: URL
}
