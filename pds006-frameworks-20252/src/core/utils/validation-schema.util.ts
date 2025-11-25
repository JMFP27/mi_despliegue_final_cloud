import * as z from 'zod'

const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

export const VALIDATION_SCHEMAS = {
  DeviceOwner: z.object({
    name: z.string().min(5).max(150),
    id: z.string().min(5).max(20)
  }),
  Image: z.instanceof(File)
  .refine((file) => [
    "image/png",
    "image/jpeg",
    "image/jpg",
  ].includes(file.type), {
    message: "Invalid image file type"
  }).refine((file) => file.size <= IMAGE_SIZE_LIMIT, {
    message: "File size should not exceed 5MB"
  })
}
