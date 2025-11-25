import { Computer, DeviceId } from '@core/domain';
import { VALIDATION_SCHEMAS } from '@core/utils';
import * as z from 'zod'

export const COMPUTER_REQUEST_SCHEMA = z.object({
  brand: z.string().min(2).max(50),
  model: z.string().min(1).max(50),
  color: z.string().min(3).max(50).optional(),
  ownerName: z.string().min(5).max(150),
  ownerId: z.string().min(5).max(20),
  photo: VALIDATION_SCHEMAS.Image
})

export type ComputerRequest = z.infer<typeof COMPUTER_REQUEST_SCHEMA>

export function mapRequestToComputer(
  request: ComputerRequest,
  deviceId: DeviceId,
  photoURL: URL,
): Computer {
  return {
      id: deviceId,
      brand: request.brand,
      model: request.model,
      color: request.color,
      owner: {
        name: request.ownerName,
        id:request.ownerId
      },
      updatedAt: new Date(),
      photoURL,
  }
}
