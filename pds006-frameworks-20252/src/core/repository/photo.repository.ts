import { DeviceId } from "@core/domain";

export interface DevicePhotoRepository {
  savePhoto(file: File, id: DeviceId): Promise<URL>
}
