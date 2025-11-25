import { DeviceId } from "@core/domain";

export class Helper {
  static generateDeviceId(): DeviceId {
    return crypto.randomUUID()
  }

  static getFrequentCheckinURL(deviceId: DeviceId, baseURL: URL): URL {
    return new URL(`/api/computers/frequent/checkin/${deviceId}`, baseURL)
  }

  static getFrequentCheckoutURL(deviceId: DeviceId, baseURL: URL): URL {
    return new URL(`/api/devices/checkout/${deviceId}`, baseURL)
  }
}

