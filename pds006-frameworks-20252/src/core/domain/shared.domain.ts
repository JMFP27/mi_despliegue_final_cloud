export type DeviceId = string
export type DeviceBrand = string
export type DeviceModel = string
export type DeviceColor = string

export type DeviceOwner = {
  name: string
  id: string
}

// Used when repository needs to return both computer and medical devices
export type EnteredDevice = {
  id: DeviceId
  brand: DeviceBrand
  model: DeviceModel
  owner: DeviceOwner
  checkinAt?: Date
  checkoutAt?: Date
  updatedAt: Date
  type: "computer" | "frequent-computer" | "medical-device"
}
