import { DEFAULT_PAGINATION_LIMIT } from "../constants" // CORRECCIÓN: Alias @core/constants cambiado a ruta relativa

export type DeviceCriteria = {
  sortBy?: DeviceSortQuery
  filterBy?: DeviceFilterQuery
  limit?: number
  offset?: number
}

export type DeviceSortQuery = {
  field: string
  isAscending: boolean
}

export type DeviceFilterQuery = {
  field: string
  value: unknown
}

export function newDeviceCriteria(): DeviceCriteria {
  return {
    limit: DEFAULT_PAGINATION_LIMIT,
    offset: 0
  }
}
