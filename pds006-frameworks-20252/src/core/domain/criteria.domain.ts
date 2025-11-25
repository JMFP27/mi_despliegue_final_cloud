import { DEFAULT_PAGINATION_LIMIT } from "@core/constants"

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
