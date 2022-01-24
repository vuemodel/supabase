import { SupabaseQueryBuilder } from '@supabase/supabase-js/dist/main/lib/SupabaseQueryBuilder'
import buildSelect from './buildSelect'

type Filters = '=' |
  '!=' |
  '>' |
  '<' |
  '<=' |
  'like' |
  'ilike' |
  'is' |
  'in' |
  'contains' |
  'containedBy' |
  'rangeLt' |
  'rangeGt' |
  'rangeGte' |
  'rangeLte' |
  'rangeAdjacent' |
  'overlaps' |
  'textSearch'

type TextSearchOptions = { config?: string; type?: 'plain' | 'phrase' | 'websearch' | null }

type FilterParamsTuple = [string, string, unknown, TextSearchOptions | null]

const supabaseFilterMethodsMap: Record<Filters, string> = {
  '=': 'eq',
  '!=': 'neq',
  '>': 'gt',
  '<': 'lt',
  '<=': 'lte',
  like: 'like',
  ilike: 'ilike',
  is: 'is',
  in: 'in',
  contains: 'contains',
  containedBy: 'containedBy',
  rangeLt: 'rangeLt',
  rangeGt: 'rangeGt',
  rangeGte: 'rangeGte',
  rangeLte: 'rangeLte',
  rangeAdjacent: 'rangeAdjacent',
  overlaps: 'overlaps',
  textSearch: 'textSearch'
}

interface OrderOptions {
  ascending?: boolean
  nullsFirst?: boolean
  foreignTable?: string
}

export default class QueryBuilder {
  #filters: FilterParamsTuple[] = []
  #limit: number | null = null
  #order: [never, { ascending?: boolean; nullsFirst?: boolean; foreignTable?: string }] | null = null
  #range: [number, number] | null = null
  #with: string[] = []

  async runWith (
    queryBuilder: SupabaseQueryBuilder<Record<string, unknown>>
  ) {
    // Select
    const filterBuilder = queryBuilder.select(buildSelect(this.#with))

    // Filters
    this.#filters.forEach(filter => {
      const field = filter[0]
      const value = filter[2] ?? filter[1]
      const operator: Filters = (filter[2] ? filter[1] : '=') as Filters
      const options: TextSearchOptions = filter[3] ?? {}

      const supabaseFilter = supabaseFilterMethodsMap[operator]

      switch (supabaseFilter) {
        case '=': filterBuilder.eq(field, value); break;
        case '!=': filterBuilder.neq(field, value); break;
        case '>': filterBuilder.gt(field, value); break;
        case '<': filterBuilder.lt(field, value); break;
        case '<=': filterBuilder.lte(field, value); break;
        case 'like': () => {
          if(value !== 'string') {
            throw new Error(`'like' filter must be a string. '${typeof value}' given.`)
          }
          filterBuilder.like(field, value)
        }; break;
        case 'ilike': () => {
          if(value !== 'string') {
            throw new Error(`'like' filter must be a string. '${typeof value}' given.`)
          }
          filterBuilder.ilike(field, value)
        }; break;
        case 'is': () => {
          if(value !== null && typeof value !== 'boolean') {
            throw new Error(`'is' filter must be a boolean or null. '${typeof value}' given.`)
          }
          filterBuilder.is(field, value)
        }; break;
        case 'in': () => {
          if(!Array.isArray(value)) {
            throw new Error(`'in' filter must be an array. '${typeof value}' given.`)
          }
          filterBuilder.in(field, value)
        }; break;
        case 'contains': () => {
          if((!Array.isArray(value) && typeof value !== 'string' && typeof value !== 'object') || value === null) {
            throw new Error(`'contains' filter must be an array, string or object. '${typeof value}' given.`)
          }
          filterBuilder.contains(field, value)
        }; break;
        case 'containedBy': () => {
          if((!Array.isArray(value) && typeof value !== 'string' && typeof value !== 'object') || value === null) {
            throw new Error(`'containedBy' filter must be an array, string or object. '${typeof value}' given.`)
          }
          filterBuilder.containedBy(field, value)
        }; break;
        case 'rangeLt': () => {
          if(value !== 'string') {
            throw new Error(`'rangeLt' filter must be a string. '${typeof value}' given.`)
          }
          filterBuilder.rangeLt(field, value)
        }; break;
        case 'rangeGt': () => {
          if(value !== 'string') {
            throw new Error(`'rangeGt' filter must be a string. '${typeof value}' given.`)
          }
          filterBuilder.rangeGt(field, value)
        }; break;
        case 'rangeGte': () => {
          if(value !== 'string') {
            throw new Error(`'rangeGte' filter must be a string. '${typeof value}' given.`)
          }
          filterBuilder.rangeGte(field, value)
        }; break;
        case 'rangeLte': () => {
          if(value !== 'string') {
            throw new Error(`'rangeLte' filter must be a string. '${typeof value}' given.`)
          }
          filterBuilder.rangeLte(field, value)
        }; break;
        case 'rangeAdjacent': () => {
          if(value !== 'string') {
            throw new Error(`'rangeAdjacent' filter must be a string. '${typeof value}' given.`)
          }
          filterBuilder.rangeAdjacent(field, value)
        }; break;
        case 'overlaps': () => {
          if(value !== 'string' && !Array.isArray(value)) {
            throw new Error(`'overlaps' filter must be a string. '${typeof value}' given.`)
          }
          filterBuilder.overlaps(field, value)
        }; break;
        case 'textSearch': () => {
          if(value !== 'string') {
            throw new Error(`'textSearch' filter must be a string. '${typeof value}' given.`)
          }
          filterBuilder.textSearch(field, value, options)
        }; break;
        default: break;
      }

      // if (config) {
      //   const func = filterBuilder[supabaseFilter] as (field: string, value: unknown, config: OrderOptions)
      //   func(field, value, config)
      // } else {
      //   filterBuilder[supabaseFilter](field, value)
      // }
    })

    // Modifiers
    if (this.#limit) {
      filterBuilder.limit(this.#limit)
    }
    if (this.#order) {
      filterBuilder.order(...this.#order)
    }
    if (this.#range) {
      filterBuilder.range(...this.#range)
    }

    return filterBuilder
  }

  where (field: string, secondParam: Filters | string, thirdParam: unknown = null, options: TextSearchOptions | null = null) {
    this.#filters.push([field, secondParam, thirdParam, options])

    return this
  }

  limit (limit: number) {
    this.#limit = limit
    return this
  }

  orderBy (field: never, direction = 'asc', foreignTable: string | undefined) {
    const config: OrderOptions = {
      ascending: direction === 'asc'
    }
    if (foreignTable) {
      config.foreignTable = foreignTable
    }
    this.#order = [field, config]
    return this
  }

  range (from: number, to: number) {
    this.#range = [from, to]
    return this
  }

  with (relations: string[] | string) {
    if (typeof relations === 'string') {
      this.#with.push(relations)
    }
    if (Array.isArray(relations)) {
      this.#with.push(...relations)
    }
    return this
  }
}
