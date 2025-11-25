import { DeviceId } from "@/core/domain";
import { DevicePhotoRepository } from "@/core/repository";
import { Server } from "bun";

const MEDIA_PORT = Bun.env.MEDIA_PORT || 8080
const BASE_PATH = "./public"
const BASE_URL = `http://localhost:${MEDIA_PORT}/photo/`

export class FileSystemPhotoRepository implements DevicePhotoRepository {
  public server: Server

  constructor() {
    this.server = Bun.serve({
      port: MEDIA_PORT,
      routes: {
        "/photo/:filename": req => new Response(Bun.file(`${BASE_PATH}/${req.params.filename}`))
      },
      error() {
        return new Response(null, { status: 404 })
      }
    });
  }

  async savePhoto(file: File, id: DeviceId): Promise<URL> {
    const extension = this.getFileExtension(file)
    if (!extension) return Promise.reject()

    const filename = `${id}.${extension}`

    const path = `${BASE_PATH}/${filename}`

    await Bun.write(path, file)

    return new URL(filename, BASE_URL)
  }

  getFileExtension(file: File): string | undefined {
    const parts = file.name.split('.');

    if (parts.length > 1) {
      return parts.pop();
    }

    return undefined;
  }
}
