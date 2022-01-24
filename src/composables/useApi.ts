import { ApiError, PostgrestError } from '@supabase/supabase-js'
import { ref, Ref } from 'vue-demi'
import QueryBuilder from '../query/QueryBuilder'
import { useClient } from './useClient'

export interface UseApiReturn<ResponseShape> {
  index: () => Promise<void>
  create: (form: Partial<any>) => Promise<void>
  remove: (id: string | number) => Promise<void>
  find: (id: string | number) => Promise<void>
  update: (id: string | number, form: Partial<any>) => Promise<void>
  query: QueryBuilder
  error: Ref<ApiError | PostgrestError | StandardError | null>
  data: Ref<ResponseShape>
  include: Ref<string[]>
  userId: Ref<string | number | null>
  loading: Ref<boolean>
  indexing: Ref<boolean>
  creating: Ref<boolean>
  finding: Ref<boolean>
  updating: Ref<boolean>
  removing: Ref<boolean>
}

export interface StandardError {
  message: string
}

export function useApi<ResponseShape> (
  entity: string,
  defaultUserId: string | null = null
): UseApiReturn<ResponseShape> {
  const supabase = useClient()

  const error = ref<ApiError | PostgrestError | StandardError | null>(null)
  const data = ref()
  const loading = ref(false)
  const userId = ref(defaultUserId)

  const include = ref([])

  const indexing = ref(false)
  const creating = ref(false)
  const finding = ref(false)
  const updating = ref(false)
  const removing = ref(false)

  // const includeQuery = computed<string | undefined>(() => {
  //   if(!include.value.length) {
  //     return undefined
  //   }
  //   return include.value.join('(*),') + '(*)'
  // })

  let builder = new QueryBuilder()

  function resetBuilder () {
    builder = new QueryBuilder()
  }

  async function index () {
    error.value = null
    loading.value = true
    indexing.value = true

    const supabaseQueryBuilder = supabase
      .from(entity)

    const query = builder.runWith(supabaseQueryBuilder)

    const {
      data: responseData,
      error: err
    } = await query

    resetBuilder()

    loading.value = false
    indexing.value = false

    if (err) {
      error.value = err
      return
    }
    if (responseData) {
      data.value = responseData
    }
  }

  async function create (form: Partial<any>) {
    error.value = null
    if (userId.value) {
      form.user_id = userId.value
    }
    loading.value = true
    creating.value = true

    const { data: responseData, error: err } = await supabase
      .from(entity)
      .insert([form])

    loading.value = false
    creating.value = false

    if (err) {
      error.value = err
      return
    }
    if (responseData) {
      data.value = responseData?.[0]
    }
  }

  async function find (id: string | number) {
    loading.value = true
    finding.value = true
    if(typeof id === 'number') {
      id = id.toString()
    }

    const supabaseQueryBuilder = supabase
      .from(entity)

    builder.where('id', id)

    const query = builder.runWith(supabaseQueryBuilder)

    const {
      data: responseData,
      error: err
    } = await query

    resetBuilder()

    loading.value = false
    finding.value = false

    if (err) {
      error.value = err
      return
    }
    if (Array.isArray(responseData) && !responseData.length) {
      error.value = { message: `${entity} with id ${id} not found` }
    }
    if (responseData) {
      data.value = responseData?.[0]
    }
  }

  async function update (id: string | number, form: Partial<any>) {
    if (userId.value) {
      form.user_id = userId.value
    }
    loading.value = true
    updating.value = true

    const { data: responseData, error: err } = await supabase
      .from(entity)
      .update(form)
      .match({ id })

    loading.value = false
    updating.value = false

    if (err) {
      error.value = err
      return
    }
    if (responseData) {
      data.value = responseData?.[0]
    }
  }

  async function remove (id: string | number) {
    loading.value = true
    removing.value = true

    const { data: responseData, error: err } = await supabase
      .from(entity)
      .delete()
      .match({ id })

    loading.value = false
    removing.value = false

    if (err) {
      error.value = err
      return
    }
    if (responseData) {
      data.value = responseData?.[0]
    }
  }

  return {
    index,
    create,
    remove,
    find,
    update,
    query: builder,
    error,
    data,
    include,
    userId,
    loading,
    indexing,
    creating,
    finding,
    updating,
    removing
  }
}
