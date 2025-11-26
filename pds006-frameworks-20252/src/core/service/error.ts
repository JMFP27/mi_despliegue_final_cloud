import { ErrorBase } from "../utils"; // Corregido: La ruta relativa correcta desde 'src/core/service' a 'src/core/utils' es '../utils'.

type ServiceErrorName =
  | 'DEVICE_NOT_FOUND'

// Se añade el constructor explícito para resolver el error TS2554 ("Expected 0 arguments, but got 2").
// Esto permite que la clase ServiceError (que extiende ErrorBase) acepte los argumentos 'name' y 'message'.
export class ServiceError extends ErrorBase<ServiceErrorName> {
  constructor(name: ServiceErrorName, message: string) {
    super(name, message);
  }
}

export const SERVICE_ERRORS = {
  DeviceNotFound: new ServiceError('DEVICE_NOT_FOUND', "Dispositivo no encontrado")
}
