import { DeviceCriteria, DeviceFilterQuery, DeviceSortQuery, newDeviceCriteria } from '../../../core/domain' // Uso de ruta relativa.
import { Type, Static } from '@sinclair/typebox' // Importar Type y Static de TypeBox

// --- Definición del Esquema con TypeBox ---

// Para manejar "filter[campo]", TypeBox no tiene un equivalente directo a
// z.templateLiteral para validación. Usaremos Type.Record<Type.String, Type.Unknown>
// para permitir cualquier clave de cadena con un valor desconocido, y delegamos
// la lógica de separación de la clave (filter[campo]) al método parseFromQuery.
// Para el contexto de Elysia, una validación simple de la estructura del objeto
// de consulta (Type.Object) es suficiente, ya que el motor de TypeBox se encarga
// de la validación.

// Definimos las claves permitidas explícitamente, pero el esquema de `CRITERIA_QUERY_PARAMS_SCHEMA`
// debe ser más flexible para manejar la naturaleza de los query params.

// Definimos un esquema que acepta claves variables de cadena con valores desconocidos
// ya que los query params no se ajustan a un Type.Object estricto debido a los filtros.
export const CRITERIA_QUERY_PARAMS_SCHEMA = Type.Record(Type.String(), Type.Unknown())

export type CriteriaQueryParams = Static<typeof CRITERIA_QUERY_PARAMS_SCHEMA>

// --- Lógica de Parsing ---

const filterKeyRegex = /^filter\[(.+?)\]$/

export class CriteriaHelper {
  /**
   * Parsea los parámetros de consulta HTTP en un objeto DeviceCriteria.
   * La lógica de validación de claves `filter[campo]` se maneja aquí.
   * @param queryParams El objeto de parámetros de consulta de Elysia.
   * @returns Un objeto DeviceCriteria.
   */
  static parseFromQuery(queryParams: CriteriaQueryParams): DeviceCriteria {
    const criteria = newDeviceCriteria()

    for (const key in queryParams) {
      // Obtenemos el valor del parámetro
      const paramValue = queryParams[key as keyof CriteriaQueryParams];
      
      // Manejar el caso de 'limit' y 'offset' si estuvieran implementados (actualmente no lo están,
      // pero esta estructura es robusta)
      // if (key === "limit" && typeof paramValue === 'string') {
      //   criteria.limit = parseInt(paramValue)
      // } else if (key === "offset" && typeof paramValue === 'string') {
      //   criteria.offset = parseInt(paramValue)
      // }
      
      if (key.startsWith("filter")) {
        // Asume que solo habrá una cláusula de filtro para simplificar
        criteria.filterBy = this.parseFilterFromEntry(key, paramValue)
      } else if (key === "sort") {
        criteria.sortBy = this.parseSortFromEntry(key, paramValue)
      }
    }

    return criteria
  }

  /**
   * Extrae el campo y el valor de una clave de filtro (e.g., "filter[name]=test").
   */
  private static parseFilterFromEntry(
    key: string,
    value: unknown
  ): DeviceFilterQuery | undefined {
    const separatedKey = key.match(filterKeyRegex)
    if (!separatedKey) return undefined // No es una clave 'filter[...]' válida

    const field = separatedKey[1] // El primer grupo capturado es el nombre del campo

    return {
      field,
      value
    }
  }

  /**
   * Extrae el campo de ordenamiento y la dirección (asc/desc) de una clave de ordenamiento (e.g., "sort=name" o "sort=-name").
   */
  private static parseSortFromEntry(
    key: string,
    value: unknown
  ): DeviceSortQuery | undefined {
    if (key !== "sort") return undefined
    // El valor de 'sort' debe ser una cadena (e.g., 'name', '-name')
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
