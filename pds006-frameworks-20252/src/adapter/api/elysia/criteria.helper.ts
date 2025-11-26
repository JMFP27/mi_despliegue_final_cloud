import { DeviceCriteria, DeviceFilterQuery, DeviceSortQuery, newDeviceCriteria } from '../../../core/domain' // CORRECCIÓN: Uso de ruta relativa.
import * as z from 'zod'

const QUERY_PARAM_KEYS_SCHEMA = z.union([
  z.templateLiteral([ "filter[", z.string(), "]"]),
  z.literal("sort"),
  z.literal("limit"),
  z.literal("offset")
])

export const CRITERIA_QUERY_PARAMS_SCHEMA = z.record(QUERY_PARAM_KEYS_SCHEMA, z.unknown())

export type CriteriaQueryParams = z.infer<typeof CRITERIA_QUERY_PARAMS_SCHEMA>

const filterKeyRegex = /^filter\[(.+?)\]$/

export class CriteriaHelper {
  static parseFromQuery(queryParams: CriteriaQueryParams): DeviceCriteria {
    const criteria = newDeviceCriteria()

    for (const key in queryParams) {
      // CORRECCIÓN TS7053: Aserción de tipo para indexar correctamente el objeto queryParams.
      const paramValue = queryParams[key as keyof CriteriaQueryParams];
      
      if (key.startsWith("filter")) {
        criteria.filterBy = this.parseFilterFromEntry(key, paramValue)
      } else if (key === "sort") {
        criteria.sortBy = this.parseSortFromEntry(key, paramValue)
      }
    }

    return criteria
  }

  private static parseFilterFromEntry(
    key: string,
    value: unknown
  ): DeviceFilterQuery | undefined {
    const separatedKey = key.match(filterKeyRegex)
    if (!separatedKey) return undefined

    const field = separatedKey[1]

    return {
      field,
      value
    }
  }

  private static parseSortFromEntry(
    key: string,
    value: unknown
  ): DeviceSortQuery | undefined {
    if (key !== "sort") return undefined
    if (typeof value !== "string") return undefined

    // Comprobamos si el primer carácter es '-' (indicando descendente)
    const isAscending = value.substring(0, 1) !== "-"

    // Si es ascendente, el campo es el valor completo. Si es descendente, quitamos el '-'.
    const field = isAscending ? value : value.substring(1)

    return {
      field,
      isAscending,
    }
  }
}
