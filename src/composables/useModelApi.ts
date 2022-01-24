import { ApiError, PostgrestError } from '@supabase/supabase-js'
import { StandardError, useApi } from './useApi'
import { InstanceOf, Item, Model } from '@vuex-orm/core'
import { Ref } from 'vue-demi'
import { useClient } from './useClient'
import QueryBuilder from '../query/QueryBuilder'

export interface UseModelApiReturn<M extends typeof Model> {
  create: (form: Partial<any>) => Promise<void>
  find: (id: string | number) => Promise<void>
  update: (id: string | number, form: Partial<any>) => Promise<void>
  remove: (id: string | number) => Promise<void>
  index: () => Promise<void>
  query: QueryBuilder
  data: Ref<Item<InstanceOf<M>>>
  error: Ref<ApiError | PostgrestError | StandardError | null>
  userId: Ref<string | number | null>
  indexing: Ref<boolean>
  creating: Ref<boolean>
  finding: Ref<boolean>
  updating: Ref<boolean>
  removing: Ref<boolean>
  loading: Ref<boolean>
}

export function useModelApi<M extends typeof Model> (
  ModelClass: typeof Model
): UseModelApiReturn<M> {
  const supabase = useClient()
  const apiService = useApi<Item<InstanceOf<M>>>(ModelClass.entity, supabase.auth.user()?.id)

  async function create (form = {}) {
    await apiService.create(form)

    if(apiService.data.value) {
      ModelClass.insert({
        data: apiService.data.value
      })
    }
  }

  async function find (id: string | number) {
    await apiService.find(id)

    if(apiService.data.value) {
      ModelClass.insert({
        data: apiService.data.value
      })
    }
  }

  async function update (id: string | number, form: Partial<any>) {
    await apiService.update(id, form)

    if(apiService.data.value) {
      ModelClass.insert({
        data: apiService.data.value
      })
    }
  }

  async function remove (id: string | number) {
    await apiService.remove(id)

    ModelClass.delete(id)
  }

  async function index () {
    await apiService.index()

    if(apiService.data.value) {
      ModelClass.insert({
        data: apiService.data.value
      })
    }
  }

  return {
    create,
    find,
    update,
    remove,
    index,
    query: apiService.query,
    data: apiService.data,
    error: apiService.error,
    userId: apiService.userId,
    indexing: apiService.indexing,
    creating: apiService.creating,
    finding: apiService.finding,
    updating: apiService.updating,
    removing: apiService.removing,
    loading: apiService.loading
  }
}
