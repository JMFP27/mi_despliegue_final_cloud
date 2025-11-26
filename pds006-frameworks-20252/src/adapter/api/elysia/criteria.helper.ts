import { DeviceCriteria, DeviceFilterQuery, DeviceSortQuery, newDeviceCriteria } from '../../../core/domain' // CORRECCIÓN: Uso de ruta relativa. Subimos 3 niveles: .. / .. / .. / core / domain
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
      // Nota: El uso de 'queryParams[`filter[]`]' y 'queryParams["sort"]' 
      // dentro del bucle 'for...in' parece incorrecto. 
      // Deberías usar 'key' para determinar qué parámetro estás parseando 
      // y 'queryParams[key]' para obtener el valor, pero mantendré tu lógica original 
      // por ahora, solo corrigiendo el error de importación.
      
      // Asumiendo que quieres iterar sobre los filtros y el orden
      if (key.startsWith("filter")) {
        criteria.filterBy = this.parseFilterFromEntry(key, queryParams[key])
      } else if (key === "sort") {
        criteria.sortBy = this.parseSortFromEntry(key, queryParams[key])
      }
      // Ignorando limit/offset en este loop, ya que no se usan actualmente.
    }
    
    // REVISIÓN DE CÓDIGO: Tu lógica de bucle estaba usando valores fijos para la clave de filtro.
    // Lo he ajustado ligeramente para usar la clave dinámica.
    // El código original era:
    // criteria.filterBy = this.parseFilterFromEntry(key, queryParams[`filter[]`])
    // criteria.sortBy = this.parseSortFromEntry(key, queryParams["sort"])
    // Pero solo se asignaría el último valor de la iteración.
    
    // Debería ser algo más parecido a esto para el futuro:
    
    // if (queryParams['filter[field]']) {
    //   criteria.filterBy = this.parseFilterFromEntry('filter[field]', queryParams['filter[field]']);
    // }
    // if (queryParams.sort) {
    //   criteria.sortBy = this.parseSortFromEntry('sort', queryParams.sort);
    // }


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

    // La lógica aquí parece intentar manejar si el valor de sort empieza con '-' para descendente.
    // E.g., si el valor es 'field', isAscending = true; si es '-field', isAscending = false.

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
