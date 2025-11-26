import { DeviceCriteria, DeviceFilterQuery, DeviceSortQuery, newDeviceCriteria } from '../../../core/domain' // 🎯 CORRECCIÓN 1: Ruta relativa para resolver el error de alias (@/).
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
      // 🎯 CORRECCIÓN 2: Aserción de tipo para resolver TS7053.
      const paramValue = queryParams[key as keyof CriteriaQueryParams];
      
      // Asumiendo que quieres iterar sobre los filtros y el orden
      if (key.startsWith("filter")) {
        criteria.filterBy = this.parseFilterFromEntry(key, paramValue)
      } else if (key === "sort") {
        criteria.sortBy = this.parseSortFromEntry(key, paramValue)
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
```eof
