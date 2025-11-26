import { DeviceId, MedicalDevice } from '../domain' // CORRECCIÓN: @core/domain cambiado a ruta relativa
import { VALIDATION_SCHEMAS } from '../utils' // CORRECCIÓN: @core/utils cambiado a ruta relativa
import * as z from 'zod'

export const MED_DEVICE_REQUEST_SCHEMA = z.object({
  brand: z.string().min(2).max(50),
  model: z.string().min(1).max(50),
  ownerName: z.string().min(5).max(150),
  ownerId: z.string().min(5).max(20),
  photo: VALIDATION_SCHEMAS.Image,
  serial: z.string().min(6).max(30)
})

export type MedDeviceRequest = z.infer<typeof MED_DEVICE_REQUEST_SCHEMA>

export function mapRequestToMedicalDevice(
  request: MedDeviceRequest,
  deviceId: DeviceId,
  photoURL: URL,
): MedicalDevice {
  return {
      id: deviceId,
      brand: request.brand,
      model: request.model,
      owner: {
        name: request.ownerName,
        id:request.ownerId
      },
      serial: request.serial,
      updatedAt: new Date(),
      photoURL,
  }
}
