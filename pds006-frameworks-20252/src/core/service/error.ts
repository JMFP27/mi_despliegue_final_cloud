import { ErrorBase } from "../../utils"; // Alias corregido: sube un nivel de 'service' a 'core' y entra a 'utils'

type ServiceErrorName =
  | 'DEVICE_NOT_FOUND'

export class ServiceError extends ErrorBase<ServiceErrorName> {}

export const SERVICE_ERRORS = {
  DeviceNotFound: new ServiceError('DEVICE_NOT_FOUND', "Dispositivo no encontrado")
}
